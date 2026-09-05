import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.js';
import { generateClinicalCaseSummary } from './server/geminiService.js';
import { runClinicalSafetyChecks } from './server/safetyEngine.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Request logger in dev
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.path}`);
    }
    next();
  });

  // ==========================================
  // API ROUTES
  // ==========================================

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'MediKiosk Clinical Core',
      version: '1.0.0',
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
      timestamp: new Date().toISOString(),
    });
  });

  // Authentication & Users
  app.get('/api/users', (req, res) => {
    res.json({ success: true, users: db.users });
  });

  app.post('/api/auth/login', (req, res) => {
    const { role, userId } = req.body;
    let user = db.users.find((u) => u.id === userId);
    if (!user && role) {
      user = db.users.find((u) => u.role === role);
    }
    if (!user) {
      user = db.users[0]; // fallback to Doctor
    }

    db.logAudit(user.name, user.role, 'USER_LOGIN', 'User', user.id, undefined, undefined, user.role, 'User signed into workstation');

    res.json({
      success: true,
      token: `medikiosk_jwt_${user.id}_${Date.now()}`,
      user,
    });
  });

  // Patients: List & Search
  app.get('/api/patients', (req, res) => {
    const { search, status, priority, limit } = req.query;
    let list = [...db.patients];

    if (search && typeof search === 'string') {
      const q = search.trim().toLowerCase();
      list = list.filter((p) => {
        return (
          p.demographics.fullName.toLowerCase().includes(q) ||
          p.opdToken.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.demographics.phone.includes(q) ||
          p.demographics.registrationNumber.toLowerCase().includes(q) ||
          (p.demographics.abhaId && p.demographics.abhaId.toLowerCase().includes(q))
        );
      });
    }

    if (status && typeof status === 'string') {
      list = list.filter((p) => p.status === status);
    }

    if (priority && typeof priority === 'string') {
      list = list.filter((p) => p.triage?.priority === priority);
    }

    if (limit) {
      list = list.slice(0, Number(limit));
    }

    res.json({
      success: true,
      total: list.length,
      patients: list,
    });
  });

  // Patients: Get Single
  app.get('/api/patients/:id', (req, res) => {
    const patient = db.patients.find((p) => p.id === req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    res.json({ success: true, patient });
  });

  // Patients: Register (with duplicate detection)
  app.post('/api/patients', (req, res) => {
    try {
      const { demographics, user, role } = req.body;
      if (!demographics || !demographics.fullName || !demographics.phone) {
        return res.status(400).json({ success: false, message: 'Full name and phone number are required.' });
      }

      const patient = db.registerPatient(demographics, user || 'Kiosk Staff', role || 'Nurse');
      res.status(201).json({ success: true, patient, message: 'Patient registered successfully.' });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Error registering patient' });
    }
  });

  // Patients: Update Demographics (CRITICAL: Strictly separate from clinical records!)
  app.patch('/api/patients/:id/demographics', (req, res) => {
    try {
      const { demographics, user, role } = req.body;
      if (!demographics) {
        return res.status(400).json({ success: false, message: 'Demographics payload is required.' });
      }

      const updated = db.updatePatientDemographics(req.params.id, demographics, user || 'Staff Member', role || 'Doctor');
      res.json({
        success: true,
        patient: updated,
        message: 'Patient details updated successfully.',
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Error updating demographics' });
    }
  });

  // Patients: Record Intake
  app.post('/api/patients/:id/intake', (req, res) => {
    try {
      const { intake, user, role } = req.body;
      if (!intake || !intake.chiefComplaint) {
        return res.status(400).json({ success: false, message: 'Chief complaint is required.' });
      }

      const updated = db.updatePatientIntake(req.params.id, intake, user || 'Sister Meena Pillai', role || 'Nurse');
      res.json({ success: true, patient: updated, message: 'Patient intake recorded successfully.' });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Error recording intake' });
    }
  });

  // Patients: Record Triage & Vitals
  app.post('/api/patients/:id/triage', (req, res) => {
    try {
      const { triage, user, role } = req.body;
      if (!triage || !triage.priority || !triage.vitalSigns) {
        return res.status(400).json({ success: false, message: 'Triage priority and vital signs are required.' });
      }

      const updated = db.recordTriage(req.params.id, triage, user || 'Sister Meena Pillai', role || 'Nurse');
      res.json({ success: true, patient: updated, message: 'Triage and vitals saved successfully.' });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Error recording triage' });
    }
  });

  // AI Summarization & Differential Support
  const handleAiSummarize = async (req: express.Request, res: express.Response) => {
    try {
      const patientId = req.params.id || req.body.patientId;
      const { patientName, age, gender, symptoms, triage, vitals, user, role } = req.body;

      let pName = patientName;
      let pAge = age;
      let pGender = gender;
      let pSymptoms = symptoms;
      let pTriage = triage;
      let pVitals = vitals;

      if (patientId) {
        const found = db.patients.find((p) => p.id === patientId);
        if (found) {
          pName = found.demographics.fullName;
          pAge = found.demographics.age;
          pGender = found.demographics.gender;
          pSymptoms = pSymptoms || found.symptoms;
          pTriage = pTriage || found.triage;
          pVitals = pVitals || found.triage?.vitalSigns;
        }
      }

      const summary = await generateClinicalCaseSummary(pName || 'Patient', pAge || 35, pGender || 'Not Specified', pSymptoms, pTriage, pVitals);

      // Persist to patient if patientId supplied
      if (patientId) {
        db.saveAIAnalysis(patientId, summary, user || 'Gemini Decision Engine', role || 'Doctor');
      }

      res.json({
        success: true,
        summary,
      });
    } catch (err: any) {
      console.error('AI Summarize endpoint error:', err);
      res.status(500).json({
        success: false,
        message: 'Clinical AI analysis could not be completed at this time.',
      });
    }
  };

  app.post('/api/ai/summarize', handleAiSummarize);
  app.post('/api/patients/:id/ai-summarize', handleAiSummarize);

  // Clinical Safety Rule Check
  app.post('/api/safety/check', (req, res) => {
    try {
      const { vitals, knownAllergies, prescriptionItems, symptoms, patientAge } = req.body;
      const alerts = runClinicalSafetyChecks(vitals, knownAllergies || [], prescriptionItems || [], symptoms || [], patientAge || 30);
      res.json({ success: true, alerts });
    } catch (err: any) {
      res.status(400).json({ success: false, message: 'Safety check calculation error' });
    }
  });

  // Doctor Review & Approval
  app.post('/api/patients/:id/review', (req, res) => {
    try {
      const { review, user, role } = req.body;
      if (!review || !review.primaryDiagnosis) {
        return res.status(400).json({ success: false, message: 'Primary diagnosis is required for doctor review.' });
      }

      const updated = db.approveDoctorReview(req.params.id, review, user || 'Dr. Arvind Mehta', role || 'Doctor');
      res.json({ success: true, patient: updated, message: 'Doctor review and case approval registered.' });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Error processing doctor review' });
    }
  });

  // AYUSH Vaidya Assessment
  app.post('/api/patients/:id/ayush-review', (req, res) => {
    try {
      const { assessment, user, role } = req.body;
      if (!assessment || !assessment.prakritiType) {
        return res.status(400).json({ success: false, message: 'Prakriti type and Ayurvedic notes are required.' });
      }

      const updated = db.saveAyushAssessment(req.params.id, assessment, user || 'Vaidya Devraj Joshi', role || 'AYUSH Vaidya');
      res.json({ success: true, patient: updated, message: 'Ayurvedic clinical assessment recorded successfully.' });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Error saving AYUSH assessment' });
    }
  });

  // OPD Queue
  app.get('/api/queue', (req, res) => {
    res.json({
      success: true,
      tokens: db.opdTokens,
      summary: {
        totalWaiting: db.opdTokens.filter((t) => t.status === 'Waiting').length,
        inTriage: db.opdTokens.filter((t) => t.status === 'In Triage').length,
        waitingForDoctor: db.opdTokens.filter((t) => t.status === 'Waiting for Doctor').length,
        inConsultation: db.opdTokens.filter((t) => t.status === 'In Consultation').length,
        completed: db.opdTokens.filter((t) => t.status === 'Completed').length,
      },
    });
  });

  app.post('/api/queue/call-next', (req, res) => {
    const { department, doctorName } = req.body;
    const nextToken = db.opdTokens.find((t) => t.status === 'Waiting for Doctor' || t.status === 'Waiting');

    if (nextToken) {
      nextToken.status = 'In Consultation';
      if (doctorName) nextToken.assignedDoctor = doctorName;
      db.logAudit(
        doctorName || 'Dr. Arvind Mehta',
        'Doctor',
        'PATIENT_CALLED_IN_QUEUE',
        'OPDToken',
        nextToken.id,
        undefined,
        undefined,
        nextToken.tokenNumber,
        `Token ${nextToken.tokenNumber} called to doctor consultation chamber`
      );
      return res.json({ success: true, token: nextToken, message: `Calling ${nextToken.tokenNumber} (${nextToken.patientName})` });
    }

    res.json({ success: false, message: 'No waiting patients in queue.' });
  });

  app.patch('/api/queue/:id', (req, res) => {
    const token = db.opdTokens.find((t) => t.id === req.params.id || t.tokenNumber === req.params.id);
    if (!token) return res.status(404).json({ success: false, message: 'Token not found' });

    const { status, assignedDoctor, priority } = req.body;
    if (status) token.status = status;
    if (assignedDoctor) token.assignedDoctor = assignedDoctor;
    if (priority) token.priority = priority;

    res.json({ success: true, token });
  });

  app.post('/api/queue/:id/status', (req, res) => {
    try {
      const { status, doctorName } = req.body;
      const token = db.updateQueueStatus(req.params.id, status, doctorName);
      res.json({ success: true, token });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Error updating queue status' });
    }
  });

  // Complete Doctor Consultation
  app.post('/api/patients/:id/complete-consultation', (req, res) => {
    try {
      const { user, role, clinicalNotes, diagnosis } = req.body;
      const patient = db.completeConsultation(req.params.id, user, role, clinicalNotes, diagnosis);
      res.json({ success: true, patient, message: 'Consultation marked as completed and stored in patient history.' });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Error completing consultation' });
    }
  });

  // Prescriptions
  app.get('/api/prescriptions', (req, res) => {
    res.json({ success: true, prescriptions: db.prescriptions });
  });

  app.post('/api/prescriptions', (req, res) => {
    try {
      const { prescription, user, role } = req.body;
      if (!prescription || !prescription.patientId || !prescription.items || prescription.items.length === 0) {
        return res.status(400).json({ success: false, message: 'Prescription details and items required.' });
      }

      const created = db.createPrescription(prescription, user || 'Dr. Arvind Mehta', role || 'Doctor');
      res.status(201).json({ success: true, prescription: created, message: 'Prescription created successfully.' });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Error generating prescription' });
    }
  });

  // Referrals
  app.get('/api/referrals', (req, res) => {
    res.json({ success: true, referrals: db.referrals });
  });

  app.post('/api/referrals', (req, res) => {
    try {
      const { referral, user, role } = req.body;
      if (!referral || !referral.patientId || !referral.targetDepartment) {
        return res.status(400).json({ success: false, message: 'Referral department and patient details required.' });
      }

      const created = db.createReferral(referral, user || 'Dr. Arvind Mehta', role || 'Doctor');
      res.status(201).json({ success: true, referral: created, message: 'Referral generated successfully.' });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Error generating referral' });
    }
  });

  app.patch('/api/referrals/:id', (req, res) => {
    const ref = db.referrals.find((r) => r.id === req.params.id);
    if (!ref) return res.status(404).json({ success: false, message: 'Referral not found' });

    const { status, notes } = req.body;
    if (status) ref.status = status;
    if (notes) ref.notes = notes;

    res.json({ success: true, referral: ref });
  });

  // Appointments
  app.get('/api/appointments', (req, res) => {
    res.json({ success: true, appointments: db.appointments });
  });

  app.post('/api/appointments', (req, res) => {
    const { appointment, user, role } = req.body;
    const newApt = {
      ...appointment,
      id: `apt-${Date.now()}`,
      status: 'Scheduled',
    };
    db.appointments.push(newApt);
    db.logAudit(user || 'Staff', role || 'Admin', 'APPOINTMENT_SCHEDULED', 'Appointment', newApt.id, undefined, undefined, `${newApt.patientName} on ${newApt.date}`, 'New appointment booked');
    res.status(201).json({ success: true, appointment: newApt });
  });

  app.patch('/api/appointments/:id', (req, res) => {
    const apt = db.appointments.find((a) => a.id === req.params.id);
    if (!apt) return res.status(404).json({ success: false, message: 'Appointment not found' });

    const { status, date, timeSlot } = req.body;
    if (status) apt.status = status;
    if (date) apt.date = date;
    if (timeSlot) apt.timeSlot = timeSlot;

    res.json({ success: true, appointment: apt });
  });

  // Audit Trail (Read-only immutable logs)
  app.get('/api/audit', (req, res) => {
    const { entityId, limit } = req.query;
    let list = db.auditTrail;
    if (entityId && typeof entityId === 'string') {
      list = list.filter((e) => e.entityId === entityId);
    }
    if (limit) {
      list = list.slice(0, Number(limit));
    }
    res.json({ success: true, total: list.length, events: list });
  });

  // Analytics & Command Center Dashboard Stats
  app.get('/api/analytics', (req, res) => {
    const totalPatients = db.patients.length;
    const waitingPatients = db.opdTokens.filter((t) => t.status === 'Waiting').length;
    const inTriage = db.opdTokens.filter((t) => t.status === 'In Triage').length;
    const waitingForDoctor = db.opdTokens.filter((t) => t.status === 'Waiting for Doctor').length;
    const completedCases = db.patients.filter((p) => p.status === 'Case Closed' || p.status === 'Doctor Approved' || p.status === 'Prescription Issued').length;
    const emergencyCases = db.patients.filter((p) => p.triage?.priority === 'RED' || p.triage?.priority === 'ORANGE').length;
    const aiAssistedCases = db.patients.filter((p) => Boolean(p.aiAnalysis)).length;

    const triageDistribution = {
      GREEN: db.patients.filter((p) => p.triage?.priority === 'GREEN').length,
      YELLOW: db.patients.filter((p) => p.triage?.priority === 'YELLOW').length,
      ORANGE: db.patients.filter((p) => p.triage?.priority === 'ORANGE').length,
      RED: db.patients.filter((p) => p.triage?.priority === 'RED').length,
    };

    const departmentWorkload = [
      { department: 'General Medicine', count: 18 },
      { department: 'Pediatrics', count: 8 },
      { department: 'Emergency & Trauma', count: 5 },
      { department: 'AYUSH Integrative', count: 7 },
      { department: 'General Surgery', count: 4 },
    ];

    const hourlyPatientFlow = [
      { hour: '08:00', patients: 4 },
      { hour: '09:00', patients: 11 },
      { hour: '10:00', patients: 14 },
      { hour: '11:00', patients: 9 },
      { hour: '12:00', patients: 6 },
      { hour: '13:00', patients: 3 },
      { hour: '14:00', patients: 8 },
    ];

    res.json({
      success: true,
      stats: {
        totalPatientsToday: totalPatients + 28, // includes realistic morning historical registrations
        activeInClinic: totalPatients,
        waitingPatients,
        inTriage,
        waitingForDoctor,
        completedCases,
        emergencyCases,
        averageWaitingTimeMinutes: 14,
        aiAssistedCases,
        referralRatePercent: 4.8,
      },
      triageDistribution,
      departmentWorkload,
      hourlyPatientFlow,
      systemHealth: {
        geminiStatus: process.env.GEMINI_API_KEY ? 'Active (gemini-3.8-flash)' : 'Fallback Mode Active',
        safetyEngineStatus: 'Active (Deterministic v2.1)',
        kioskNodeStatus: 'Online (PHC Station #1)',
      },
    });
  });

  // Notifications
  app.get('/api/notifications', (req, res) => {
    res.json({ success: true, notifications: db.notifications });
  });

  app.post('/api/notifications/:id/read', (req, res) => {
    const notif = db.notifications.find((n) => n.id === req.params.id);
    if (notif) notif.read = true;
    res.json({ success: true });
  });

  // Demo Hub: Seed 1 of 5 scenarios
  app.post('/api/demo/seed-scenario', (req, res) => {
    try {
      const { scenarioIndex } = req.body;
      const seeded = db.seedDemoScenario(Number(scenarioIndex) || 0);
      res.json({
        success: true,
        patient: seeded,
        message: `Demo scenario populated successfully: ${seeded.demographics.fullName} (${seeded.opdToken})`,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Error seeding demo scenario' });
    }
  });

  // Demo Hub: Reset all data
  app.post('/api/demo/reset', (req, res) => {
    db.seedInitialData();
    res.json({ success: true, message: 'All demo clinic data reset to pristine state.' });
  });

  // ==========================================
  // VITE / STATIC MIDDLEWARE
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MediKiosk server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
