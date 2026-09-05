import {
  User,
  Patient,
  PatientDemographics,
  VitalSigns,
  SymptomRecord,
  TriageRecord,
  SafetyAlert,
  AIAnalysis,
  Prescription,
  Referral,
  AyushAssessment,
  DoctorReview,
  OPDToken,
  Appointment,
  AuditEvent,
  NotificationItem,
} from './types.js';
import { runClinicalSafetyChecks } from './safetyEngine.js';

class InMemoryDatabase {
  users: User[] = [];
  patients: Patient[] = [];
  appointments: Appointment[] = [];
  opdTokens: OPDToken[] = [];
  prescriptions: Prescription[] = [];
  referrals: Referral[] = [];
  auditTrail: AuditEvent[] = [];
  notifications: NotificationItem[] = [];

  constructor() {
    this.seedInitialData();
  }

  seedInitialData() {
    // 1. Staff Users
    this.users = [
      {
        id: 'usr-doc-01',
        name: 'Dr. Arvind Mehta',
        email: 'arvind.mehta@medikiosk.in',
        role: 'Doctor',
        department: 'General Medicine',
        avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
      },
      {
        id: 'usr-nurse-01',
        name: 'Sister Meena Pillai',
        email: 'meena.pillai@medikiosk.in',
        role: 'Nurse',
        department: 'Emergency & Triage Unit',
        avatar: 'https://images.unsplash.com/photo-1594824813633-442805232822?w=150&auto=format&fit=crop&q=80',
      },
      {
        id: 'usr-ayush-01',
        name: 'Vaidya Devraj Joshi',
        email: 'devraj.joshi@medikiosk.in',
        role: 'AYUSH Vaidya',
        department: 'Ayurveda & Integrative Medicine',
        avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
      },
      {
        id: 'usr-admin-01',
        name: 'Suman Rao',
        email: 'suman.rao@medikiosk.in',
        role: 'Admin',
        department: 'Health Informatics & Hospital Operations',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      },
    ];

    // 2. Realistic Demo Patients
    this.patients = [
      {
        id: 'pat-101',
        opdToken: 'OPD-T76',
        status: 'Doctor Review',
        demographics: {
          fullName: 'Rajesh Sharma',
          dob: '1984-06-12',
          age: 42,
          gender: 'Male',
          phone: '+91 98201 44521',
          email: 'rajesh.sharma.demo@example.com',
          address: 'Flat 402, Shiv Krupa Apts, Station Road, Thane West, MH',
          emergencyContact: {
            name: 'Sunita Sharma',
            relationship: 'Spouse',
            phone: '+91 98201 44522',
          },
          preferredLanguage: 'Hindi',
          abhaId: '91-4829-1029-4820',
          registrationNumber: 'MK-2026-00781',
        },
        symptoms: {
          chiefComplaint: 'High grade fever with shivering and generalized body ache',
          symptoms: ['Fever', 'Chills', 'Retro-orbital pain', 'Severe Myalgia', 'Fatigue'],
          duration: '3 days',
          severity: 'Moderate',
          medicalHistory: ['Mild Hypertension (well controlled)'],
          medicationHistory: ['Amlodipine 5mg OD'],
          knownAllergies: ['Penicillin (develops urticaria and facial puffiness)'],
          lifestyle: {
            smoking: false,
            alcohol: false,
            diet: 'Vegetarian',
            physicalActivity: 'Moderate',
          },
          previousTreatment: 'Took Paracetamol 650mg SOS at home with temporary relief',
          intakeNotes: 'Patient traveled to Konkan coastal belt last week. Water accumulation in neighborhood.',
          inputMethod: 'Text',
          languageUsed: 'Hindi',
          recordedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        },
        triage: {
          priority: 'YELLOW',
          vitalSigns: {
            temperatureF: 102.4,
            pulseBpm: 98,
            respiratoryRate: 20,
            bloodPressureSystolic: 130,
            bloodPressureDiastolic: 84,
            spO2Percent: 97,
            weightKg: 74,
            heightCm: 172,
            bmi: 25.0,
            recordedAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
            recordedBy: 'Sister Meena Pillai',
          },
          nurseNotes: 'Patient looks flushed and uncomfortable. Warm extremities. Hydrated orally. No active rash seen on exposed skin.',
          mobilityStatus: 'Ambulatory',
          consciousLevel: 'Alert',
          triageTime: new Date(Date.now() - 3600000 * 1.5).toISOString(),
          triagedBy: 'Sister Meena Pillai',
        },
        aiAnalysis: {
          chiefComplaintSummary: '42-year-old male with 3-day acute febrile episode (temp 102.4°F) accompanied by chills, retro-orbital ache, and severe myalgias.',
          keySymptoms: ['High fever', 'Chills', 'Retro-orbital pain', 'Myalgia', 'Fatigue'],
          relevantHistorySummary: 'Hypertension on Amlodipine. CRITICAL ALLERGY: Documented Penicillin allergy. Recent endemic travel history.',
          vitalsInterpretation: 'Pyrexia (102.4°F) with borderline tachycardia (98 bpm). SpO2 and blood pressure within safe limits.',
          potentialRiskIndicators: ['Acute vector-borne illness profile (Dengue/Malaria)', 'Dehydration risk secondary to high fever'],
          possibleDifferentialConsiderations: [
            'Dengue Fever / Acute Flavivirus infection',
            'Malaria (Plasmodium vivax/falciparum)',
            'Viral syndrome with reactive myositis',
            'Urinary Tract Infection prodrome',
          ],
          suggestedQuestionsForDoctor: [
            'Any spontaneous gum bleeding, petechiae, or dark/tarry stools?',
            'Has there been persistent vomiting or abdominal tenderness?',
            'Has the patient been taking any NSAIDs like Diclofenac or Brufen?',
          ],
          potentialRedFlags: [
            'Monitor for Dengue warning signs: abdominal pain, mucosal bleed, platelet drop below 100k',
            'Strictly avoid Penicillin class and NSAIDs',
          ],
          recommendedNextReviewSteps: [
            'STAT Dengue Duo (NS1 Ag + IgM/IgG)',
            'Complete Blood Count (CBC) with hematocrit and platelet baseline',
            'Rapid Diagnostic Test (RDT) for Malaria & Peripheral blood smear',
          ],
          disclaimer: 'AI-generated decision support — clinician verification required. This case summary provides structured differential considerations and does not constitute a final diagnosis.',
          generatedAt: new Date(Date.now() - 3600000 * 1.2).toISOString(),
          modelUsed: 'gemini-3.8-flash (Decision Support Engine)',
        },
        safetyAlerts: [
          {
            id: 'alert-101-1',
            level: 'CRITICAL',
            title: 'Documented Drug Allergy: Penicillin',
            reason: 'Patient has severe hypersensitivity reaction (urticaria/puffiness) to penicillin group.',
            detectedValue: 'Allergic to: Penicillin',
            actionRequired: 'Avoid all Beta-lactams, Amoxicillin, Augmentin, Ampicillin. Highlight on physical prescription.',
            timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
            acknowledged: true,
          },
          {
            id: 'alert-101-2',
            level: 'URGENT',
            title: 'Hyperpyrexia Detected',
            reason: 'Body temperature 102.4°F requires oral antipyresis and hydration assessment.',
            detectedValue: '102.4°F',
            actionRequired: 'Ensure oral hydration; cool sponging if temp rises; administer Paracetamol under doctor order.',
            timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
            acknowledged: true,
          },
        ],
        createdAt: new Date(Date.now() - 3600000 * 2.5).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'pat-102',
        opdToken: 'OPD-T77',
        status: 'In Triage',
        demographics: {
          fullName: 'Sunita Devi',
          dob: '1968-03-24',
          age: 58,
          gender: 'Female',
          phone: '+91 94220 88192',
          email: 'sunita.devi.demo@example.com',
          address: 'B-12, Panchavati Nagar, Pune Solapur Highway, Pune, MH',
          emergencyContact: {
            name: 'Mahesh Devi',
            relationship: 'Son',
            phone: '+91 94220 88193',
          },
          preferredLanguage: 'Marathi',
          abhaId: '91-3921-9940-1123',
          registrationNumber: 'MK-2026-00782',
        },
        symptoms: {
          chiefComplaint: 'Substernal chest heaviness, profuse cold sweating and shortness of breath',
          symptoms: ['Chest Pain', 'Shortness of Breath', 'Diaphoresis', 'Left Shoulder Radiation', 'Nausea'],
          duration: '45 minutes',
          severity: 'Critical',
          medicalHistory: ['Type 2 Diabetes (12 yrs)', 'Dyslipidemia', 'Hypertension'],
          medicationHistory: ['Metformin 500mg BD', 'Telmisartan 40mg OD', 'Atorvastatin 10mg HS'],
          knownAllergies: ['Sulfa drugs'],
          lifestyle: {
            smoking: false,
            alcohol: false,
            diet: 'Vegetarian',
            physicalActivity: 'Sedentary',
          },
          previousTreatment: 'None taken. Rushed immediately to Kiosk.',
          intakeNotes: 'Diabetic female presenting with acute retrosternal squeezing pain radiating to left arm. Cold clammy skin.',
          inputMethod: 'Assisted',
          languageUsed: 'Marathi',
          recordedAt: new Date(Date.now() - 1800000).toISOString(),
        },
        triage: {
          priority: 'RED',
          vitalSigns: {
            temperatureF: 98.2,
            pulseBpm: 114,
            respiratoryRate: 28,
            bloodPressureSystolic: 178,
            bloodPressureDiastolic: 104,
            spO2Percent: 91,
            weightKg: 68,
            heightCm: 156,
            bmi: 27.9,
            recordedAt: new Date(Date.now() - 1200000).toISOString(),
            recordedBy: 'Sister Meena Pillai',
          },
          nurseNotes: 'PATIENT IN ACUTE DISTRESS. Placed on nasal cannula oxygen @ 4L/min. STAT 12-lead ECG underway. Notified Emergency Medical Officer.',
          mobilityStatus: 'Wheelchair',
          consciousLevel: 'Alert',
          triageTime: new Date(Date.now() - 1200000).toISOString(),
          triagedBy: 'Sister Meena Pillai',
        },
        safetyAlerts: [
          {
            id: 'alert-102-1',
            level: 'CRITICAL',
            title: 'POTENTIAL ACUTE CORONARY SYNDROME / MI',
            reason: 'Diabetic female with acute crushing chest pain, diaphoresis, SpO2 91%, and severe hypertension.',
            detectedValue: 'Chest pain + SpO2 91% + BP 178/104',
            actionRequired: 'IMMEDIATE RED TRIAGE. STAT ECG, IV access, Aspirin chewable 300mg, Cardiology on-call.',
            timestamp: new Date(Date.now() - 1200000).toISOString(),
            acknowledged: false,
          },
          {
            id: 'alert-102-2',
            level: 'CRITICAL',
            title: 'Moderate Hypoxia Alert',
            reason: 'SpO2 91% on room air.',
            detectedValue: 'SpO2: 91%',
            actionRequired: 'Maintain supplemental oxygen to target SpO2 >= 95%.',
            timestamp: new Date(Date.now() - 1200000).toISOString(),
            acknowledged: false,
          },
        ],
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'pat-103',
        opdToken: 'OPD-T78',
        status: 'Waiting for Doctor',
        demographics: {
          fullName: 'Aarav Patel',
          dob: '2019-08-14',
          age: 7,
          gender: 'Male',
          phone: '+91 97140 22319',
          email: 'patel.family.demo@example.com',
          address: 'House 5, Navrangpura Society, Ahmedabad, GJ',
          emergencyContact: {
            name: 'Ketan Patel',
            relationship: 'Father',
            phone: '+91 97140 22319',
          },
          preferredLanguage: 'English',
          registrationNumber: 'MK-2026-00783',
        },
        symptoms: {
          chiefComplaint: 'Earache (Right), irritability, and fever in 7-year-old child',
          symptoms: ['Right Ear Pain', 'Fever', 'Poor Appetite', 'Rhinorrhea'],
          duration: '2 days',
          severity: 'Moderate',
          medicalHistory: ['Recurrent tonsillitis as toddler'],
          medicationHistory: ['None currently'],
          knownAllergies: [],
          lifestyle: {
            smoking: false,
            alcohol: false,
            diet: 'Vegetarian',
            physicalActivity: 'Active',
          },
          previousTreatment: 'Warm compress on ear',
          intakeNotes: 'Child tugging right ear, cried throughout night. Mild clear nasal discharge.',
          inputMethod: 'Text',
          languageUsed: 'English',
          recordedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
        },
        triage: {
          priority: 'ORANGE',
          vitalSigns: {
            temperatureF: 101.8,
            pulseBpm: 108,
            respiratoryRate: 24,
            bloodPressureSystolic: 96,
            bloodPressureDiastolic: 62,
            spO2Percent: 99,
            weightKg: 22,
            heightCm: 118,
            bmi: 15.8,
            recordedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
            recordedBy: 'Sister Meena Pillai',
          },
          nurseNotes: 'Child responsive, clinging to father. Right pinna mildly tender. Otoscopic examination required.',
          mobilityStatus: 'Ambulatory',
          consciousLevel: 'Alert',
          triageTime: new Date(Date.now() - 3600000 * 2).toISOString(),
          triagedBy: 'Sister Meena Pillai',
        },
        aiAnalysis: {
          chiefComplaintSummary: '7-year-old pediatric male presenting with 2-day right otalgia, fever (101.8°F), and upper respiratory symptoms.',
          keySymptoms: ['Right earache', 'Fever', 'Rhinorrhea', 'Irritability'],
          relevantHistorySummary: 'Pediatric patient. Weight 22kg. No known drug allergies. History of recurrent tonsillitis.',
          vitalsInterpretation: 'Elevated pediatric heart rate (108 bpm) and temperature (101.8°F) consistent with acute infectious or inflammatory episode.',
          potentialRiskIndicators: ['Pediatric dosing safety strictly applies', 'Risk of tympanic membrane perforation or mastoiditis if untreated'],
          possibleDifferentialConsiderations: [
            'Acute Otitis Media (Right ear)',
            'Otitis Externa',
            'Viral Upper Respiratory Tract Infection with Eustachian tube dysfunction',
            'Referred pain from Pharyngitis / Dental eruption',
          ],
          suggestedQuestionsForDoctor: [
            'Has there been any pus or bloody discharge from the ear canal?',
            'Did the child go swimming or have water trapped in the ear recently?',
            'Has the child experienced any dizziness or balance problems?',
          ],
          potentialRedFlags: [
            'Post-auricular swelling, erythema, or tenderness (signs of mastoiditis)',
            'Facial nerve weakness or persistent lethargy',
          ],
          recommendedNextReviewSteps: [
            'Pneumatic otoscopic inspection of right tympanic membrane (erythema/bulging/fluid level)',
            'Oral cavity and tonsillar pillar inspection',
            'Weight-based antipyretic dosing (Paracetamol 15mg/kg)',
          ],
          disclaimer: 'AI-generated decision support — clinician verification required.',
          generatedAt: new Date(Date.now() - 3600000 * 1.8).toISOString(),
          modelUsed: 'gemini-3.8-flash (Decision Support Engine)',
        },
        safetyAlerts: [
          {
            id: 'alert-103-1',
            level: 'WARNING',
            title: 'Pediatric Dosing Caution',
            reason: 'Patient is 7 years old (weight 22kg). All pharmacotherapy must be strictly calibrated per kg body weight.',
            detectedValue: 'Weight: 22 kg',
            actionRequired: 'Calculate mg/kg dosage; verify pediatric oral suspension concentration.',
            timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
            acknowledged: true,
          },
        ],
        createdAt: new Date(Date.now() - 3600000 * 3.5).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'pat-104',
        opdToken: 'OPD-T79',
        status: 'Doctor Approved',
        demographics: {
          fullName: 'Ramesh Kulkarni',
          dob: '1962-11-04',
          age: 64,
          gender: 'Male',
          phone: '+91 98812 33410',
          email: 'ramesh.kulkarni.demo@example.com',
          address: 'Plot 18, Sahakar Nagar No 2, Pune, MH',
          emergencyContact: {
            name: 'Pooja Kulkarni',
            relationship: 'Daughter',
            phone: '+91 98812 33411',
          },
          preferredLanguage: 'Marathi',
          abhaId: '91-1102-3392-8819',
          registrationNumber: 'MK-2026-00784',
        },
        symptoms: {
          chiefComplaint: 'Routine 3-month follow-up for Diabetes and Hypertension; complaints of bilateral heel numbness',
          symptoms: ['Bilateral Peripheral Numbness', 'Occasional Dizziness on standing', 'Mild Polyuria'],
          duration: '1 month',
          severity: 'Mild',
          medicalHistory: ['Type 2 Diabetes Mellitus (15 yrs)', 'Essential Hypertension (10 yrs)', 'Mild Diabetic Retinopathy'],
          medicationHistory: ['Glimepiride 1mg OD', 'Metformin 1000mg BD', 'Telmisartan 40mg OD'],
          knownAllergies: ['None known'],
          lifestyle: {
            smoking: false,
            alcohol: false,
            diet: 'Vegetarian',
            physicalActivity: 'Sedentary',
          },
          previousTreatment: 'Regular medications from district pharmacy',
          intakeNotes: 'Reports fasting blood sugar 168 mg/dL checked at home last Sunday. Feels tingling "pins and needles" in feet at night.',
          inputMethod: 'Text',
          languageUsed: 'Marathi',
          recordedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        },
        triage: {
          priority: 'GREEN',
          vitalSigns: {
            temperatureF: 98.4,
            pulseBpm: 72,
            respiratoryRate: 16,
            bloodPressureSystolic: 138,
            bloodPressureDiastolic: 86,
            spO2Percent: 98,
            weightKg: 78,
            heightCm: 168,
            bmi: 27.6,
            recordedAt: new Date(Date.now() - 3600000 * 3.5).toISOString(),
            recordedBy: 'Sister Meena Pillai',
          },
          nurseNotes: 'Stable hemodynamics. Feet inspected: dry skin, no active ulcers or calluses. Monofilament test shows reduced sensation at bilateral hallux.',
          mobilityStatus: 'Ambulatory',
          consciousLevel: 'Alert',
          triageTime: new Date(Date.now() - 3600000 * 3.5).toISOString(),
          triagedBy: 'Sister Meena Pillai',
        },
        aiAnalysis: {
          chiefComplaintSummary: '64-year-old male with chronic T2DM and HTN presenting for quarterly follow-up with emerging bilateral distal sensory neuropathy symptoms.',
          keySymptoms: ['Peripheral paresthesia', 'Orthostatic lightheadedness', 'Hyperglycemia'],
          relevantHistorySummary: '15-year T2DM on Glimepiride + Metformin. Monofilament exam confirms sensory reduction.',
          vitalsInterpretation: 'Normotensive on Telmisartan. Vitals stable.',
          potentialRiskIndicators: ['Diabetic peripheral neuropathy progression', 'Risk of diabetic foot ulceration', 'Hypoglycemia vulnerability with Glimepiride'],
          possibleDifferentialConsiderations: [
            'Diabetic Distal Symmetric Sensorimotor Polyneuropathy',
            'Vitamin B12 deficiency (Metformin-induced vs nutritional)',
            'Radiculopathy (Lumbosacral)',
          ],
          suggestedQuestionsForDoctor: [
            'How often do you experience hypoglycemia episodes (shakiness, cold sweat)?',
            'Do you have any difficulty feeling water temperature while bathing?',
          ],
          potentialRedFlags: ['Check for non-healing foot fissures or blisters', 'Assess for Charcot neuroarthropathy signs'],
          recommendedNextReviewSteps: ['HbA1c & Serum Creatinine + eGFR', 'Serum Vitamin B12 level', 'Comprehensive foot sensory and vascular grading'],
          disclaimer: 'AI-generated decision support — clinician verification required.',
          generatedAt: new Date(Date.now() - 3600000 * 3.2).toISOString(),
          modelUsed: 'gemini-3.8-flash (Decision Support Engine)',
        },
        doctorReview: {
          verified: true,
          approved: true,
          clinicalNotes: 'Well controlled BP. Peripheral sensory reduction noted. Advised diabetic foot care. Titrated therapy.',
          primaryDiagnosis: 'Type 2 Diabetes Mellitus with early Peripheral Neuropathy',
          secondaryDiagnoses: ['Essential Hypertension', 'Overweight BMI 27.6'],
          investigationsRequested: ['HbA1c', 'Serum Creatinine', 'Urine Microalbumin', 'Serum Vitamin B12'],
          treatmentPlan: 'Continue Telmisartan. Added Methylcobalamin & Pregabalin for neuropathic paresthesias. Lifestyle counseling.',
          reviewedBy: 'Dr. Arvind Mehta',
          reviewedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
        },
        prescription: {
          id: 'rx-2026-0041',
          patientId: 'pat-104',
          patientName: 'Ramesh Kulkarni',
          doctorName: 'Dr. Arvind Mehta',
          doctorRegNo: 'MCI-2008-04912',
          diagnosis: 'T2DM with early Diabetic Neuropathy + Essential Hypertension',
          items: [
            {
              id: 'item-1',
              medicineName: 'Metformin Hydrochloride 500mg (Sustained Release)',
              dosage: '500mg',
              frequency: '1-0-1 (Twice Daily)',
              duration: '90 Days',
              route: 'Oral',
              instructions: 'After meals',
            },
            {
              id: 'item-2',
              medicineName: 'Telmisartan Tablets IP 40mg',
              dosage: '40mg',
              frequency: '1-0-0 (Morning)',
              duration: '90 Days',
              route: 'Oral',
              instructions: 'After breakfast',
            },
            {
              id: 'item-3',
              medicineName: 'Pregabalin 75mg + Methylcobalamin 750mcg',
              dosage: '75mg/750mcg',
              frequency: '0-0-1 (Night)',
              duration: '30 Days',
              route: 'Oral',
              instructions: 'At bedtime with warm water',
            },
          ],
          generalAdvice: 'Daily inspection of feet with mirror. Never walk barefoot. 30 mins brisk walking daily. Reduce salt and refined carbohydrates.',
          followUpDate: '2026-10-05',
          createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
        },
        safetyAlerts: [],
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'pat-105',
        opdToken: 'OPD-T80',
        status: 'AYUSH Consultation',
        demographics: {
          fullName: 'Ananya Iyer',
          dob: '1997-01-18',
          age: 29,
          gender: 'Female',
          phone: '+91 99203 11894',
          email: 'ananya.iyer.demo@example.com',
          address: 'A-304, Green Meadows, Chembur, Mumbai, MH',
          emergencyContact: {
            name: 'Karthik Iyer',
            relationship: 'Brother',
            phone: '+91 99203 11895',
          },
          preferredLanguage: 'English',
          registrationNumber: 'MK-2026-00785',
        },
        symptoms: {
          chiefComplaint: 'Chronic morning stiffness, indigestion (Agnimandya), and persistent fatigue',
          symptoms: ['Morning Joint Stiffness', 'Bloating after meals', 'Sluggish Digestion', 'Sleep disturbance', 'Mild anxiety'],
          duration: '6 months',
          severity: 'Moderate',
          medicalHistory: ['Irritable bowel tendencies', 'Chronic allergic rhinitis'],
          medicationHistory: ['Occasional Antihistamines SOS'],
          knownAllergies: ['Dust mites', 'Sulfa compounds'],
          lifestyle: {
            smoking: false,
            alcohol: false,
            diet: 'Vegetarian',
            physicalActivity: 'Sedentary',
          },
          previousTreatment: 'Allopathic NSAIDs caused gastric irritation; sought integrative Ayurvedic evaluation.',
          intakeNotes: 'Patient works long hours in IT sector. Irregular meal timings, high screen time, disturbed sleep cycles.',
          inputMethod: 'Text',
          languageUsed: 'English',
          recordedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        },
        triage: {
          priority: 'YELLOW',
          vitalSigns: {
            temperatureF: 98.6,
            pulseBpm: 76,
            respiratoryRate: 16,
            bloodPressureSystolic: 118,
            bloodPressureDiastolic: 76,
            spO2Percent: 99,
            weightKg: 58,
            heightCm: 163,
            bmi: 21.8,
            recordedAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
            recordedBy: 'Sister Meena Pillai',
          },
          nurseNotes: 'Patient appears anxious and tired. Vitals entirely stable. Tongue shows white coating (Ama indicator). Directed to AYUSH Integrative Clinic.',
          mobilityStatus: 'Ambulatory',
          consciousLevel: 'Alert',
          triageTime: new Date(Date.now() - 3600000 * 1.5).toISOString(),
          triagedBy: 'Sister Meena Pillai',
        },
        aiAnalysis: {
          chiefComplaintSummary: '29-year-old female presenting with 6-month history of morning stiffness, post-prandial bloating, and fatigue exacerbated by sedentary work routine.',
          keySymptoms: ['Morning joint stiffness', 'Bloating/Dyspepsia', 'Fatigue', 'Sleep disruption'],
          relevantHistorySummary: 'History of NSAID gastropathy and sulfa allergy. Seeking integrative AYUSH regimen.',
          vitalsInterpretation: 'Normal hemodynamic indicators.',
          potentialRiskIndicators: ['Inflammatory arthropathy screen indicated if stiffness > 1 hr', 'Dyspeptic ulceration risk with NSAIDs'],
          possibleDifferentialConsiderations: [
            'Ama-vata (Ayurvedic rheumatological spectrum / Early reactive arthropathy)',
            'Functional Dyspepsia (Agnimandya / Grahani roga)',
            'Fibromyalgia / Work-related postural strain syndrome',
          ],
          suggestedQuestionsForDoctor: [
            'Does the joint stiffness last longer than 60 minutes after waking?',
            'Any swelling or warmth over small joints of the hands?',
          ],
          potentialRedFlags: ['Rule out early systemic autoimmune arthritis (RA/SLE) if constitutional symptoms emerge'],
          recommendedNextReviewSteps: ['Serum Rheumatoid Factor (RF) and ESR/CRP baseline', 'Ayurvedic Prakriti & Dhatu Agni assessment'],
          disclaimer: 'AI-generated decision support — clinician verification required.',
          generatedAt: new Date(Date.now() - 3600000 * 1.2).toISOString(),
          modelUsed: 'gemini-3.8-flash (Decision Support Engine)',
        },
        ayushAssessment: {
          prakritiType: 'Vata-Pitta',
          doshaImbalance: ['Vata Vriddhi (causing joint stiffness and anxiety)', 'Pitta-Kapha Dushti with Ama (causing gastrointestinal sluggishness)'],
          ayurvedicNotes: 'Tongue coated with Sama lakshana. Agni is Vishama (irregular). Joint stiffness worse in cold mornings. Deepana-Pachana therapy indicated first before brimhana.',
          lifestyleGuidance: [
            'Dinacharya: Wake up at Brahma Muhurta (6:00 AM); perform 10 mins Nadi Shodhana Pranayama',
            'Abhyanga: Gentle self-massage with warm Dhanwantaram Tailam followed by warm shower',
            'Avoid daytime sleeping (Divaswapna) and late-night digital exposure',
          ],
          dietaryRecommendations: [
            'Warm freshly cooked Satvik meals; avoid stale, fermented, or ice-cold food items',
            'Sip lukewarm ginger-coriander water throughout working hours',
            'Include Cow Ghee, Moong dal khichdi, and cumin-spiced buttermilk (Takra)',
          ],
          herbalFormulations: [
            'Shunthi + Ajwain churna 3g before meals with warm water (Deepana-Pachana)',
            'Yograj Guggulu 1 tab BD after meals (for Vata vyadhi / Joint stiffness)',
            'Ashwagandha Tablet 500mg at bedtime with warm milk (for sleep & Ojas preservation)',
          ],
          referralToDoctorRecommended: false,
          assessedBy: 'Vaidya Devraj Joshi',
          assessedAt: new Date(Date.now() - 3600000 * 0.5).toISOString(),
        },
        safetyAlerts: [
          {
            id: 'alert-105-1',
            level: 'INFO',
            title: 'AYUSH Integrative Care Note',
            reason: 'Patient receiving non-pharmacological Ayurvedic lifestyle & herbal guidance. Regular follow-up advised.',
            actionRequired: 'If joint swelling or inflammatory markers rise, cross-refer to Allopathic Rheumatology.',
            timestamp: new Date(Date.now() - 3600000 * 0.5).toISOString(),
            acknowledged: true,
          },
        ],
        createdAt: new Date(Date.now() - 3600000 * 2.5).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'pat-106',
        opdToken: 'OPD-T81',
        status: 'Waiting for Doctor',
        demographics: {
          fullName: 'Mohammed Farhan',
          dob: '1991-04-10',
          age: 35,
          gender: 'Male',
          phone: '+91 98450 77621',
          email: 'm.farhan.demo@example.com',
          address: 'No 45, Commercial Street, Shivaji Nagar, Bengaluru, KA',
          emergencyContact: {
            name: 'Amina Farhan',
            relationship: 'Spouse',
            phone: '+91 98450 77622',
          },
          preferredLanguage: 'English',
          registrationNumber: 'MK-2026-00786',
        },
        symptoms: {
          chiefComplaint: 'Acute right lower quadrant abdominal pain progressing over 8 hours',
          symptoms: ['Right Iliac Fossa Pain', 'Anorexia', 'Low grade fever', 'Nausea with 1 episode vomiting'],
          duration: '8 hours',
          severity: 'Severe',
          medicalHistory: ['Nil prior surgical history'],
          medicationHistory: ['Took antacid gel with no relief'],
          knownAllergies: [],
          lifestyle: {
            smoking: false,
            alcohol: false,
            diet: 'Non-Vegetarian',
            physicalActivity: 'Moderate',
          },
          previousTreatment: 'None effective',
          intakeNotes: 'Pain started periumbilically and shifted to right lower abdomen. Exacerbated by coughing and walking.',
          inputMethod: 'Text',
          languageUsed: 'English',
          recordedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
        },
        triage: {
          priority: 'ORANGE',
          vitalSigns: {
            temperatureF: 100.4,
            pulseBpm: 102,
            respiratoryRate: 22,
            bloodPressureSystolic: 126,
            bloodPressureDiastolic: 82,
            spO2Percent: 98,
            weightKg: 72,
            heightCm: 175,
            bmi: 23.5,
            recordedAt: new Date(Date.now() - 2700000).toISOString(),
            recordedBy: 'Sister Meena Pillai',
          },
          nurseNotes: 'Positive McBurney sign tenderness on palpation. Guarding noted in RIF. Patient keeping right hip flexed for comfort. Fasting (NPO) advised.',
          mobilityStatus: 'Ambulatory',
          consciousLevel: 'Alert',
          triageTime: new Date(Date.now() - 2700000).toISOString(),
          triagedBy: 'Sister Meena Pillai',
        },
        safetyAlerts: [
          {
            id: 'alert-106-1',
            level: 'URGENT',
            title: 'Suspected Acute Appendicitis',
            reason: 'Migratory right iliac fossa pain, low grade fever, anorexia, and localized tenderness.',
            detectedValue: 'RIF Guarding + Tachycardia (102 bpm)',
            actionRequired: 'Keep Nil Per Os (NPO). STAT Surgical Consultation and Ultrasound Abdomen.',
            timestamp: new Date(Date.now() - 2700000).toISOString(),
            acknowledged: false,
          },
        ],
        createdAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    // 3. OPD Queue Tokens
    this.opdTokens = [
      {
        id: 'tok-76',
        tokenNumber: 'OPD-T76',
        patientId: 'pat-101',
        patientName: 'Rajesh Sharma',
        department: 'General Medicine',
        priority: 'YELLOW',
        status: 'In Consultation',
        assignedDoctor: 'Dr. Arvind Mehta',
        issueTime: '08:45 AM',
        estimatedWaitMinutes: 0,
      },
      {
        id: 'tok-77',
        tokenNumber: 'OPD-T77',
        patientId: 'pat-102',
        patientName: 'Sunita Devi',
        department: 'Emergency & Triage',
        priority: 'RED',
        status: 'In Triage',
        assignedDoctor: 'Dr. Arvind Mehta',
        issueTime: '09:10 AM',
        estimatedWaitMinutes: 2,
      },
      {
        id: 'tok-78',
        tokenNumber: 'OPD-T78',
        patientId: 'pat-103',
        patientName: 'Aarav Patel',
        department: 'Pediatrics',
        priority: 'ORANGE',
        status: 'Waiting for Doctor',
        assignedDoctor: 'Dr. Arvind Mehta',
        issueTime: '09:15 AM',
        estimatedWaitMinutes: 8,
      },
      {
        id: 'tok-79',
        tokenNumber: 'OPD-T79',
        patientId: 'pat-104',
        patientName: 'Ramesh Kulkarni',
        department: 'General Medicine',
        priority: 'GREEN',
        status: 'Completed',
        assignedDoctor: 'Dr. Arvind Mehta',
        issueTime: '08:15 AM',
        estimatedWaitMinutes: 0,
      },
      {
        id: 'tok-80',
        tokenNumber: 'OPD-T80',
        patientId: 'pat-105',
        patientName: 'Ananya Iyer',
        department: 'AYUSH Integrative Care',
        priority: 'YELLOW',
        status: 'In Consultation',
        assignedDoctor: 'Vaidya Devraj Joshi',
        issueTime: '09:25 AM',
        estimatedWaitMinutes: 5,
      },
      {
        id: 'tok-81',
        tokenNumber: 'OPD-T81',
        patientId: 'pat-106',
        patientName: 'Mohammed Farhan',
        department: 'General Surgery / Emergency',
        priority: 'ORANGE',
        status: 'Waiting for Doctor',
        assignedDoctor: 'Dr. Arvind Mehta',
        issueTime: '09:40 AM',
        estimatedWaitMinutes: 12,
      },
    ];

    // 4. Appointments
    this.appointments = [
      {
        id: 'apt-01',
        patientId: 'pat-101',
        patientName: 'Rajesh Sharma',
        phone: '+91 98201 44521',
        department: 'General Medicine',
        doctorName: 'Dr. Arvind Mehta',
        date: '2026-09-03',
        timeSlot: '09:00 AM',
        status: 'In Consultation',
        reason: 'Acute Fever & Chills',
        tokenNumber: 'OPD-T76',
      },
      {
        id: 'apt-02',
        patientId: 'pat-103',
        patientName: 'Aarav Patel',
        phone: '+91 97140 22319',
        department: 'Pediatrics',
        doctorName: 'Dr. Arvind Mehta',
        date: '2026-09-03',
        timeSlot: '09:30 AM',
        status: 'Checked In',
        reason: 'Otalgia & Fever',
        tokenNumber: 'OPD-T78',
      },
      {
        id: 'apt-03',
        patientId: 'pat-105',
        patientName: 'Ananya Iyer',
        phone: '+91 99203 11894',
        department: 'AYUSH Integrative Care',
        doctorName: 'Vaidya Devraj Joshi',
        date: '2026-09-03',
        timeSlot: '10:00 AM',
        status: 'In Consultation',
        reason: 'Ayurvedic evaluation for joint stiffness & gut health',
        tokenNumber: 'OPD-T80',
      },
      {
        id: 'apt-04',
        patientId: 'pat-104',
        patientName: 'Ramesh Kulkarni',
        phone: '+91 98812 33410',
        department: 'General Medicine',
        doctorName: 'Dr. Arvind Mehta',
        date: '2026-09-03',
        timeSlot: '08:30 AM',
        status: 'Completed',
        reason: 'Routine Diabetes & HTN Follow-up',
        tokenNumber: 'OPD-T79',
      },
    ];

    // 5. Prescriptions
    if (this.patients[3].prescription) {
      this.prescriptions.push(this.patients[3].prescription);
    }

    // 6. Referrals
    this.referrals = [
      {
        id: 'ref-01',
        patientId: 'pat-102',
        patientName: 'Sunita Devi',
        referredBy: 'Dr. Arvind Mehta',
        referredByRole: 'Doctor',
        referralReason: 'Urgent Coronary Angiography and CCU Admission for ACS',
        targetDepartment: 'Cardiology (Cath Lab)',
        suggestedFacility: 'District Multi-Specialty Tertiary Hospital',
        priority: 'Emergency',
        notes: 'Patient on supplemental oxygen. ECG shows hyperacute T waves. Aspirin 300mg given.',
        status: 'Accepted',
        createdAt: new Date(Date.now() - 900000).toISOString(),
      },
    ];

    // 7. Initial Immutable Audit Events
    this.auditTrail = [
      {
        id: 'aud-001',
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        user: 'Sister Meena Pillai',
        role: 'Nurse',
        action: 'PATIENT_REGISTERED',
        entity: 'Patient',
        entityId: 'pat-104',
        newValue: 'Ramesh Kulkarni (OPD-T79)',
        details: 'Patient registered at intake kiosk.',
      },
      {
        id: 'aud-002',
        timestamp: new Date(Date.now() - 3600000 * 4.5).toISOString(),
        user: 'Sister Meena Pillai',
        role: 'Nurse',
        action: 'TRIAGE_COMPLETED',
        entity: 'TriageRecord',
        entityId: 'pat-104',
        newValue: 'Priority GREEN (BP 138/86, SpO2 98%)',
        details: 'Vitals and neurological monofilament check recorded.',
      },
      {
        id: 'aud-003',
        timestamp: new Date(Date.now() - 3600000 * 3.5).toISOString(),
        user: 'System AI Engine',
        role: 'Doctor',
        action: 'AI_SUMMARY_GENERATED',
        entity: 'AIAnalysis',
        entityId: 'pat-104',
        newValue: 'Model: gemini-3.8-flash',
        details: 'Clinical decision-support generated with differential considerations.',
      },
      {
        id: 'aud-004',
        timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
        user: 'Dr. Arvind Mehta',
        role: 'Doctor',
        action: 'DOCTOR_APPROVED_CASE',
        entity: 'DoctorReview',
        entityId: 'pat-104',
        newValue: 'T2DM with early Neuropathy confirmed',
        details: 'Doctor reviewed intake, vitals, AI support, and approved treatment plan.',
      },
      {
        id: 'aud-005',
        timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
        user: 'Dr. Arvind Mehta',
        role: 'Doctor',
        action: 'PRESCRIPTION_CREATED',
        entity: 'Prescription',
        entityId: 'rx-2026-0041',
        newValue: '3 items prescribed (Metformin, Telmisartan, Pregabalin)',
        details: 'Drug allergy check verified: Clean.',
      },
    ];

    // 8. Notifications
    this.notifications = [
      {
        id: 'notif-01',
        title: 'CRITICAL TRIAGE: Sunita Devi (OPD-T77)',
        message: 'Patient in Room 2 presenting with acute chest discomfort and SpO2 91%. Immediate physician attention required.',
        priority: 'urgent',
        timestamp: new Date(Date.now() - 1200000).toISOString(),
        read: false,
        link: '/doctor',
        patientId: 'pat-102',
      },
      {
        id: 'notif-02',
        title: 'New Patient Intake: Rajesh Sharma (OPD-T76)',
        message: 'Triage complete (Priority YELLOW). Waiting for doctor review.',
        priority: 'medium',
        timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
        read: true,
        link: '/doctor',
        patientId: 'pat-101',
      },
      {
        id: 'notif-03',
        title: 'Referral Request Accepted',
        message: 'District Hospital CCU has confirmed bed availability for Sunita Devi.',
        priority: 'high',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        read: false,
        link: '/patients/pat-102',
        patientId: 'pat-102',
      },
    ];
  }

  // Helper: Log Audit Event
  logAudit(
    user: string,
    role: any,
    action: string,
    entity: string,
    entityId: string,
    changedFields?: string[],
    previousValue?: string,
    newValue?: string,
    details?: string
  ) {
    const event: AuditEvent = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      user,
      role,
      action,
      entity,
      entityId,
      changedFields,
      previousValue,
      newValue,
      details,
    };
    this.auditTrail.unshift(event);
    return event;
  }

  // Duplicate Check
  checkForDuplicates(phone: string, abhaId?: string, fullName?: string, dob?: string): Patient | null {
    const cleanPhone = phone.replace(/\D/g, '');
    for (const p of this.patients) {
      const existingPhone = p.demographics.phone.replace(/\D/g, '');
      if (cleanPhone.length >= 10 && existingPhone.length >= 10 && cleanPhone.slice(-10) === existingPhone.slice(-10)) {
        return p;
      }
      if (abhaId && p.demographics.abhaId && p.demographics.abhaId.trim().toLowerCase() === abhaId.trim().toLowerCase()) {
        return p;
      }
      if (fullName && dob && p.demographics.fullName.trim().toLowerCase() === fullName.trim().toLowerCase() && p.demographics.dob === dob) {
        return p;
      }
    }
    return null;
  }

  // Patient Registration
  registerPatient(demographics: PatientDemographics, user = 'Kiosk Staff', role: any = 'Nurse'): Patient {
    const duplicate = this.checkForDuplicates(demographics.phone, demographics.abhaId, demographics.fullName, demographics.dob);
    if (duplicate) {
      throw new Error(`Duplicate patient record detected. Existing patient found: ${duplicate.demographics.fullName} (${duplicate.opdToken}).`);
    }

    const nextNumber = this.patients.length + 76;
    const opdToken = `OPD-T${nextNumber}`;
    const patientId = `pat-${Date.now()}`;
    const now = new Date().toISOString();

    const newPatient: Patient = {
      id: patientId,
      opdToken,
      status: 'Registered',
      demographics: {
        ...demographics,
        registrationNumber: demographics.registrationNumber || `MK-2026-${String(nextNumber).padStart(5, '0')}`,
      },
      safetyAlerts: runClinicalSafetyChecks(undefined, demographics.knownAllergies || [], [], [], demographics.age),
      createdAt: now,
      updatedAt: now,
    };

    this.patients.unshift(newPatient);

    // Create OPD Token
    const tokenItem: OPDToken = {
      id: `tok-${Date.now()}`,
      tokenNumber: opdToken,
      patientId: newPatient.id,
      patientName: demographics.fullName,
      department: 'General Triage',
      priority: 'GREEN',
      status: 'Waiting',
      issueTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      estimatedWaitMinutes: 15,
    };
    this.opdTokens.push(tokenItem);

    // Audit Log
    this.logAudit(user, role, 'PATIENT_REGISTERED', 'Patient', patientId, undefined, undefined, `${demographics.fullName} (${opdToken})`, 'New patient registered via Kiosk');

    // Add Notification
    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      title: `New Patient Registered: ${demographics.fullName}`,
      message: `Token ${opdToken} assigned. Awaiting intake and triage.`,
      priority: 'low',
      timestamp: now,
      read: false,
      link: `/patients/${patientId}`,
      patientId,
    });

    return newPatient;
  }

  // Strict Demographics Edit (Separated from Clinical Records!)
  updatePatientDemographics(
    patientId: string,
    updatedDemographics: Partial<PatientDemographics>,
    user = 'Dr. Arvind Mehta',
    role: any = 'Doctor'
  ): Patient {
    const patient = this.patients.find((p) => p.id === patientId);
    if (!patient) throw new Error('Patient not found');

    const changedFields: string[] = [];
    const prevSnapshot = JSON.stringify(patient.demographics);

    for (const key of Object.keys(updatedDemographics) as (keyof PatientDemographics)[]) {
      if (updatedDemographics[key] !== undefined && JSON.stringify(patient.demographics[key]) !== JSON.stringify(updatedDemographics[key])) {
        changedFields.push(key);
      }
    }

    if (changedFields.length > 0) {
      patient.demographics = {
        ...patient.demographics,
        ...updatedDemographics,
      };
      patient.updatedAt = new Date().toISOString();

      // Re-run safety checks on updated allergies or age without touching clinical records
      const existingPrescriptions = patient.prescription ? patient.prescription.items : [];
      patient.safetyAlerts = runClinicalSafetyChecks(
        patient.triage?.vitalSigns,
        patient.demographics.knownAllergies || [],
        existingPrescriptions,
        patient.symptoms?.symptoms || [],
        patient.demographics.age
      );

      // Audit Log
      this.logAudit(
        user,
        role,
        'PATIENT_DETAILS_UPDATED',
        'PatientDemographics',
        patientId,
        changedFields,
        `Fields modified: ${changedFields.join(', ')}`,
        `Updated demographic profile`,
        `Demographic fields edited by ${user} (${role}). Clinical records remained protected.`
      );
    }

    return patient;
  }

  // Update Intake
  updatePatientIntake(patientId: string, intake: SymptomRecord, user = 'Sister Meena Pillai', role: any = 'Nurse'): Patient {
    const patient = this.patients.find((p) => p.id === patientId);
    if (!patient) throw new Error('Patient not found');

    patient.symptoms = intake;
    if (patient.status === 'Registered') {
      patient.status = 'Intake Completed';
    }
    patient.updatedAt = new Date().toISOString();

    // Re-run safety checks
    patient.safetyAlerts = runClinicalSafetyChecks(
      patient.triage?.vitalSigns,
      patient.demographics.knownAllergies || [],
      patient.prescription?.items || [],
      intake.symptoms || [],
      patient.demographics.age
    );

    this.logAudit(user, role, 'INTAKE_RECORDED', 'SymptomRecord', patientId, undefined, undefined, intake.chiefComplaint, 'Patient symptoms and clinical history logged');

    return patient;
  }

  // Record Triage & Vitals
  recordTriage(patientId: string, triage: TriageRecord, user = 'Sister Meena Pillai', role: any = 'Nurse'): Patient {
    const patient = this.patients.find((p) => p.id === patientId);
    if (!patient) throw new Error('Patient not found');

    patient.triage = triage;
    patient.status = 'Triage Completed';
    patient.updatedAt = new Date().toISOString();

    // Update OPD token priority & status
    const token = this.opdTokens.find((t) => t.patientId === patientId);
    if (token) {
      token.priority = triage.priority;
      token.status = 'Waiting for Doctor';
    }

    // Safety checks
    patient.safetyAlerts = runClinicalSafetyChecks(
      triage.vitalSigns,
      patient.demographics.knownAllergies || [],
      patient.prescription?.items || [],
      patient.symptoms?.symptoms || [],
      patient.demographics.age
    );

    // Audit Log
    this.logAudit(
      user,
      role,
      'TRIAGE_COMPLETED',
      'TriageRecord',
      patientId,
      undefined,
      undefined,
      `Priority: ${triage.priority}`,
      `Nurse triage completed with vitals (SpO2: ${triage.vitalSigns.spO2Percent}%, BP: ${triage.vitalSigns.bloodPressureSystolic}/${triage.vitalSigns.bloodPressureDiastolic})`
    );

    // Urgent notification if RED or ORANGE
    if (triage.priority === 'RED' || triage.priority === 'ORANGE') {
      this.notifications.unshift({
        id: `notif-${Date.now()}`,
        title: `URGENT TRIAGE [${triage.priority}]: ${patient.demographics.fullName}`,
        message: `High risk vitals recorded. Requires immediate clinical attention.`,
        priority: triage.priority === 'RED' ? 'urgent' : 'high',
        timestamp: new Date().toISOString(),
        read: false,
        link: `/doctor`,
        patientId,
      });
    }

    return patient;
  }

  // Save AI Analysis
  saveAIAnalysis(patientId: string, analysis: AIAnalysis, user = 'Gemini Decision Engine', role: any = 'Doctor'): Patient {
    const patient = this.patients.find((p) => p.id === patientId);
    if (!patient) throw new Error('Patient not found');

    patient.aiAnalysis = analysis;
    patient.updatedAt = new Date().toISOString();

    this.logAudit(
      user,
      role,
      'AI_SUMMARY_GENERATED',
      'AIAnalysis',
      patientId,
      undefined,
      undefined,
      analysis.modelUsed,
      'Structured case summary and differential considerations generated'
    );

    return patient;
  }

  // Doctor Review and Approval
  approveDoctorReview(patientId: string, review: DoctorReview, user = 'Dr. Arvind Mehta', role: any = 'Doctor'): Patient {
    const patient = this.patients.find((p) => p.id === patientId);
    if (!patient) throw new Error('Patient not found');

    patient.doctorReview = review;
    patient.status = 'Doctor Approved';
    patient.updatedAt = new Date().toISOString();

    const token = this.opdTokens.find((t) => t.patientId === patientId);
    if (token) {
      token.status = 'In Consultation';
    }

    this.logAudit(
      user,
      role,
      'DOCTOR_APPROVED_CASE',
      'DoctorReview',
      patientId,
      undefined,
      undefined,
      `Diagnosis: ${review.primaryDiagnosis}`,
      `Case verified and approved by ${user}`
    );

    return patient;
  }

  // AYUSH Assessment
  saveAyushAssessment(patientId: string, assessment: AyushAssessment, user = 'Vaidya Devraj Joshi', role: any = 'AYUSH Vaidya'): Patient {
    const patient = this.patients.find((p) => p.id === patientId);
    if (!patient) throw new Error('Patient not found');

    patient.ayushAssessment = assessment;
    patient.status = 'AYUSH Consultation';
    patient.updatedAt = new Date().toISOString();

    this.logAudit(
      user,
      role,
      'AYUSH_ASSESSMENT_RECORDED',
      'AyushAssessment',
      patientId,
      undefined,
      undefined,
      `Prakriti: ${assessment.prakritiType}`,
      `Ayurvedic assessment and holistic lifestyle plan logged by ${user}`
    );

    return patient;
  }

  // Create Prescription
  createPrescription(prescriptionData: Omit<Prescription, 'id' | 'createdAt'>, user = 'Dr. Arvind Mehta', role: any = 'Doctor'): Prescription {
    const id = `rx-2026-${String(this.prescriptions.length + 42).padStart(4, '0')}`;
    const prescription: Prescription = {
      ...prescriptionData,
      id,
      createdAt: new Date().toISOString(),
    };

    this.prescriptions.unshift(prescription);

    // Link to patient
    const patient = this.patients.find((p) => p.id === prescriptionData.patientId);
    if (patient) {
      patient.prescription = prescription;
      patient.status = 'Prescription Issued';
      patient.updatedAt = new Date().toISOString();

      // Check for safety / allergy conflicts
      patient.safetyAlerts = runClinicalSafetyChecks(
        patient.triage?.vitalSigns,
        patient.demographics.knownAllergies || [],
        prescription.items,
        patient.symptoms?.symptoms || [],
        patient.demographics.age
      );
    }

    this.logAudit(
      user,
      role,
      'PRESCRIPTION_CREATED',
      'Prescription',
      id,
      undefined,
      undefined,
      `${prescription.items.length} medications`,
      `Prescription issued for ${prescription.patientName}`
    );

    return prescription;
  }

  // Create Referral
  createReferral(referralData: Omit<Referral, 'id' | 'createdAt' | 'status'>, user = 'Dr. Arvind Mehta', role: any = 'Doctor'): Referral {
    const id = `ref-${Date.now()}`;
    const referral: Referral = {
      ...referralData,
      id,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    this.referrals.unshift(referral);

    const patient = this.patients.find((p) => p.id === referralData.patientId);
    if (patient) {
      patient.referral = referral;
      patient.status = 'Referred';
      patient.updatedAt = new Date().toISOString();
    }

    this.logAudit(
      user,
      role,
      'REFERRAL_CREATED',
      'Referral',
      id,
      undefined,
      undefined,
      `${referral.targetDepartment} (${referral.suggestedFacility})`,
      `Referral generated for ${referral.patientName}`
    );

    return referral;
  }

  // Complete Doctor Consultation
  completeConsultation(
    patientId: string,
    user = 'Dr. Arvind Mehta',
    role: any = 'Doctor',
    clinicalNotes?: string,
    diagnosis?: string
  ): Patient {
    const patient = this.patients.find((p) => p.id === patientId);
    if (!patient) throw new Error('Patient not found');

    patient.status = 'Case Closed';
    patient.updatedAt = new Date().toISOString();

    // Create completed visit entry
    const newVisit = {
      id: `vis-${Date.now()}`,
      visitNumber: `VIS-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      tokenNumber: patient.opdToken,
      date: new Date().toISOString(),
      department: 'General Medicine',
      doctorName: user,
      chiefComplaint: patient.symptoms?.chiefComplaint || 'Consultation Completed',
      status: 'Completed' as const,
      vitals: patient.triage?.vitalSigns,
      clinicalNotes: clinicalNotes || patient.doctorReview?.clinicalNotes,
      diagnosis: diagnosis || patient.doctorReview?.primaryDiagnosis || 'Clinical Review Completed',
      prescription: patient.prescription,
      followUpDate: patient.prescription?.followUpDate,
    };

    patient.visits = [newVisit, ...(patient.visits || [])];

    // Mark OPD token completed
    const token = this.opdTokens.find((t) => t.patientId === patientId || t.tokenNumber === patient.opdToken);
    if (token) {
      token.status = 'Completed';
    }

    this.logAudit(
      user,
      role,
      'CONSULTATION_COMPLETED',
      'Patient',
      patientId,
      undefined,
      undefined,
      `Diagnosis: ${newVisit.diagnosis}`,
      `Consultation completed for ${patient.demographics.fullName} (${patient.opdToken})`
    );

    return patient;
  }

  updateQueueStatus(
    tokenIdOrNumber: string,
    status: 'Waiting' | 'In Triage' | 'Waiting for Doctor' | 'In Consultation' | 'Completed',
    doctorName?: string
  ) {
    const token = this.opdTokens.find((t) => t.id === tokenIdOrNumber || t.tokenNumber === tokenIdOrNumber);
    if (!token) throw new Error('Token not found');

    token.status = status;
    if (doctorName) token.assignedDoctor = doctorName;

    // Also sync patient status if applicable
    const patient = this.patients.find((p) => p.id === token.patientId || p.opdToken === token.tokenNumber);
    if (patient) {
      if (status === 'In Consultation') {
        patient.status = 'Doctor Review';
      } else if (status === 'Completed') {
        patient.status = 'Case Closed';
      }
      patient.updatedAt = new Date().toISOString();
    }

    return token;
  }

  // Seed Scenario for Demo Hub
  seedDemoScenario(scenarioIndex: number): Patient {
    const scenarios = [
      {
        name: 'Routine Acute Fever',
        demographics: {
          fullName: 'Kunal Deshmukh',
          dob: '1995-03-15',
          age: 31,
          gender: 'Male' as const,
          phone: '+91 98111 22334',
          email: 'kunal.demo@example.com',
          address: 'Shanti Nagar, Sector 4, Thane, MH',
          emergencyContact: { name: 'Pooja Deshmukh', relationship: 'Spouse', phone: '+91 98111 22335' },
          preferredLanguage: 'English' as const,
          registrationNumber: `MK-DEMO-001`,
        },
        symptoms: {
          chiefComplaint: 'Acute onset moderate fever and headache for 2 days',
          symptoms: ['Fever', 'Mild headache', 'Loss of appetite'],
          duration: '2 days',
          severity: 'Moderate' as const,
          medicalHistory: [],
          medicationHistory: [],
          knownAllergies: ['None known'],
          lifestyle: { smoking: false, alcohol: false, diet: 'Vegetarian' as const, physicalActivity: 'Moderate' as const },
          recordedAt: new Date().toISOString(),
        },
        triage: {
          priority: 'YELLOW' as const,
          vitalSigns: {
            temperatureF: 101.2,
            pulseBpm: 88,
            respiratoryRate: 18,
            bloodPressureSystolic: 122,
            bloodPressureDiastolic: 78,
            spO2Percent: 98,
            weightKg: 68,
            heightCm: 172,
            recordedAt: new Date().toISOString(),
            recordedBy: 'Sister Meena Pillai',
          },
          nurseNotes: 'Patient stable, alert, hydrated.',
          mobilityStatus: 'Ambulatory' as const,
          consciousLevel: 'Alert' as const,
          triageTime: new Date().toISOString(),
          triagedBy: 'Sister Meena Pillai',
        },
      },
      {
        name: 'High-Risk Acute Coronary Syndrome',
        demographics: {
          fullName: 'Harishankar Verma',
          dob: '1961-07-22',
          age: 65,
          gender: 'Male' as const,
          phone: '+91 98222 33445',
          email: 'harishankar.demo@example.com',
          address: 'Civil Lines, Nagpur, MH',
          emergencyContact: { name: 'Vandana Verma', relationship: 'Wife', phone: '+91 98222 33446' },
          preferredLanguage: 'Hindi' as const,
          registrationNumber: `MK-DEMO-002`,
        },
        symptoms: {
          chiefComplaint: 'Crushing chest tightness with diaphoresis and left arm numbness',
          symptoms: ['Chest Pain', 'Shortness of Breath', 'Cold Sweats', 'Arm Radiation'],
          duration: '1 hour',
          severity: 'Critical' as const,
          medicalHistory: ['Hypertension', 'Dyslipidemia', 'Smoker (20 pack-yrs)'],
          medicationHistory: ['Amlodipine 5mg OD'],
          knownAllergies: ['Sulfa drugs'],
          lifestyle: { smoking: true, alcohol: false, diet: 'Non-Vegetarian' as const, physicalActivity: 'Sedentary' as const },
          recordedAt: new Date().toISOString(),
        },
        triage: {
          priority: 'RED' as const,
          vitalSigns: {
            temperatureF: 98.4,
            pulseBpm: 118,
            respiratoryRate: 26,
            bloodPressureSystolic: 182,
            bloodPressureDiastolic: 108,
            spO2Percent: 92,
            weightKg: 82,
            heightCm: 168,
            recordedAt: new Date().toISOString(),
            recordedBy: 'Sister Meena Pillai',
          },
          nurseNotes: 'CRITICAL EMERGENCY: Oxygen started @ 4L/min, IV access secured, Doctor alerted.',
          mobilityStatus: 'Wheelchair' as const,
          consciousLevel: 'Alert' as const,
          triageTime: new Date().toISOString(),
          triagedBy: 'Sister Meena Pillai',
        },
      },
      {
        name: 'Pediatric Case (Acute Otitis Media)',
        demographics: {
          fullName: 'Diya Sharma',
          dob: '2021-11-09',
          age: 5,
          gender: 'Female' as const,
          phone: '+91 98333 44556',
          email: 'sharma.peds@example.com',
          address: 'Goregaon East, Mumbai, MH',
          emergencyContact: { name: 'Rohit Sharma', relationship: 'Father', phone: '+91 98333 44556' },
          preferredLanguage: 'Hindi' as const,
          registrationNumber: `MK-DEMO-003`,
        },
        symptoms: {
          chiefComplaint: 'Right ear pulling, high fever, and incessant crying',
          symptoms: ['Right Ear Pain', 'Fever', 'Crying', 'Poor Feeding'],
          duration: '24 hours',
          severity: 'Severe' as const,
          medicalHistory: ['Born full term'],
          medicationHistory: ['None'],
          knownAllergies: ['None known'],
          lifestyle: { smoking: false, alcohol: false, diet: 'Vegetarian' as const, physicalActivity: 'Active' as const },
          recordedAt: new Date().toISOString(),
        },
        triage: {
          priority: 'ORANGE' as const,
          vitalSigns: {
            temperatureF: 102.6,
            pulseBpm: 124,
            respiratoryRate: 28,
            bloodPressureSystolic: 92,
            bloodPressureDiastolic: 58,
            spO2Percent: 99,
            weightKg: 17,
            heightCm: 104,
            recordedAt: new Date().toISOString(),
            recordedBy: 'Sister Meena Pillai',
          },
          nurseNotes: 'Pediatric caution. Right ear canal tender. Father present.',
          mobilityStatus: 'Ambulatory' as const,
          consciousLevel: 'Alert' as const,
          triageTime: new Date().toISOString(),
          triagedBy: 'Sister Meena Pillai',
        },
      },
      {
        name: 'Chronic Disease Follow-up (T2DM & HTN)',
        demographics: {
          fullName: 'Balwant Singh',
          dob: '1960-05-19',
          age: 66,
          gender: 'Male' as const,
          phone: '+91 98444 55667',
          email: 'balwant.demo@example.com',
          address: 'Model Town, Jalandhar, PB',
          emergencyContact: { name: 'Gurpreet Singh', relationship: 'Son', phone: '+91 98444 55668' },
          preferredLanguage: 'English' as const,
          registrationNumber: `MK-DEMO-004`,
        },
        symptoms: {
          chiefComplaint: 'Quarterly review of blood glucose and hypertensive control; mild leg fatigue',
          symptoms: ['Fatigue', 'Mild bilateral leg tiredness'],
          duration: '3 months',
          severity: 'Mild' as const,
          medicalHistory: ['Type 2 Diabetes (8 yrs)', 'Hypertension (6 yrs)'],
          medicationHistory: ['Metformin 500mg BD', 'Amlodipine 5mg OD'],
          knownAllergies: ['None known'],
          lifestyle: { smoking: false, alcohol: false, diet: 'Vegetarian' as const, physicalActivity: 'Moderate' as const },
          recordedAt: new Date().toISOString(),
        },
        triage: {
          priority: 'GREEN' as const,
          vitalSigns: {
            temperatureF: 98.2,
            pulseBpm: 70,
            respiratoryRate: 16,
            bloodPressureSystolic: 134,
            bloodPressureDiastolic: 82,
            spO2Percent: 98,
            weightKg: 75,
            heightCm: 170,
            recordedAt: new Date().toISOString(),
            recordedBy: 'Sister Meena Pillai',
          },
          nurseNotes: 'Routine geriatric check. Hemodynamics stable. Fasting blood sugar 142 mg/dL.',
          mobilityStatus: 'Ambulatory' as const,
          consciousLevel: 'Alert' as const,
          triageTime: new Date().toISOString(),
          triagedBy: 'Sister Meena Pillai',
        },
      },
      {
        name: 'Emergency Triage (Suspected Appendicitis)',
        demographics: {
          fullName: 'Nitin Sawant',
          dob: '1998-09-12',
          age: 28,
          gender: 'Male' as const,
          phone: '+91 98555 66778',
          email: 'nitin.demo@example.com',
          address: 'Dadar West, Mumbai, MH',
          emergencyContact: { name: 'Archana Sawant', relationship: 'Mother', phone: '+91 98555 66779' },
          preferredLanguage: 'Marathi' as const,
          registrationNumber: `MK-DEMO-005`,
        },
        symptoms: {
          chiefComplaint: 'Sharp agonizing right lower abdominal pain shifting from belly button with nausea',
          symptoms: ['Severe Right Lower Quadrant Pain', 'Anorexia', 'Vomiting (1x)', 'Low grade fever'],
          duration: '6 hours',
          severity: 'Severe' as const,
          medicalHistory: [],
          medicationHistory: [],
          knownAllergies: ['Penicillin'],
          lifestyle: { smoking: false, alcohol: false, diet: 'Non-Vegetarian' as const, physicalActivity: 'Moderate' as const },
          recordedAt: new Date().toISOString(),
        },
        triage: {
          priority: 'ORANGE' as const,
          vitalSigns: {
            temperatureF: 100.8,
            pulseBpm: 104,
            respiratoryRate: 22,
            bloodPressureSystolic: 128,
            bloodPressureDiastolic: 80,
            spO2Percent: 98,
            weightKg: 69,
            heightCm: 174,
            recordedAt: new Date().toISOString(),
            recordedBy: 'Sister Meena Pillai',
          },
          nurseNotes: 'Rebound tenderness at McBurney point. NPO initiated. Immediate surgical consult scheduled.',
          mobilityStatus: 'Ambulatory' as const,
          consciousLevel: 'Alert' as const,
          triageTime: new Date().toISOString(),
          triagedBy: 'Sister Meena Pillai',
        },
      },
    ];

    const selected = scenarios[scenarioIndex] || scenarios[0];
    const registered = this.registerPatient(selected.demographics as any, 'Demo Hub Automator', 'Admin');
    this.updatePatientIntake(registered.id, selected.symptoms as any, 'Demo Hub Automator', 'Nurse');
    this.recordTriage(registered.id, selected.triage as any, 'Demo Hub Automator', 'Nurse');

    this.logAudit(
      'Demo Hub Automator',
      'Admin',
      'DEMO_SCENARIO_SEEDED',
      'Patient',
      registered.id,
      undefined,
      undefined,
      selected.name,
      `Pre-configured demo case "${selected.name}" populated for end-to-end hackathon demonstration`
    );

    return registered;
  }
}

export const db = new InMemoryDatabase();
