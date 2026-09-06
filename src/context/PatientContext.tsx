import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Patient,
  PatientDemographics,
  SymptomRecord,
  TriageRecord,
  DoctorReview,
  AyushAssessment,
  Prescription,
  Referral,
  OPDToken,
  Appointment,
  AuditEvent,
  NotificationItem,
  AIAnalysis,
} from '../types';
import { useAuth } from './AuthContext';

interface PatientContextType {
  patients: Patient[];
  activePatient: Patient | null;
  setActivePatient: (p: Patient | null) => void;
  selectPatientById: (id: string) => void;
  opdTokens: OPDToken[];
  appointments: Appointment[];
  prescriptions: Prescription[];
  referrals: Referral[];
  auditTrail: AuditEvent[];
  auditLogs: AuditEvent[];
  notifications: NotificationItem[];
  analytics: any;
  loading: boolean;
  realtimeStatus: 'connected' | 'reconnecting' | 'offline';
  refreshData: () => Promise<void>;
  reloadPatients: () => Promise<void>;
  registerPatient: (demographics: PatientDemographics) => Promise<Patient>;
  updatePatientDemographics: (patientId: string, demographics: Partial<PatientDemographics>) => Promise<Patient>;
  updatePatientIntake: (patientId: string, intake: SymptomRecord) => Promise<Patient>;
  recordTriage: (patientId: string, triage: TriageRecord) => Promise<Patient>;
  runAiSummarization: (patientId: string) => Promise<AIAnalysis>;
  approveDoctorReview: (patientId: string, review: DoctorReview) => Promise<Patient>;
  saveAyushAssessment: (patientId: string, assessment: AyushAssessment) => Promise<Patient>;
  createPrescription: (prescriptionData: any) => Promise<Prescription>;
  createReferral: (referralData: any) => Promise<Referral>;
  seedScenario: (scenarioIndex: number) => Promise<Patient>;
  resetDemoData: () => Promise<void>;
  callNextQueuePatient: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  updateQueueStatus: (tokenIdOrNumber: string, status: 'Waiting' | 'In Triage' | 'Waiting for Doctor' | 'In Consultation' | 'Completed') => Promise<void>;
  completeConsultation: (patientId: string, clinicalNotes?: string, diagnosis?: string) => Promise<Patient>;
  updateCaseStatus: (patientId: string, status: Patient['status']) => Promise<Patient>;
  acknowledgeSafetyAlert: (patientId: string, alertId: string) => Promise<Patient>;
  liveAlertToast: { id: string; message: string; patientId?: string; token?: string; timestamp: string } | null;
  clearLiveAlertToast: () => void;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export const PatientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [activePatient, setActivePatient] = useState<Patient | null>(null);
  const [opdTokens, setOpdTokens] = useState<OPDToken[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [auditTrail, setAuditTrail] = useState<AuditEvent[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [realtimeStatus, setRealtimeStatus] = useState<'connected' | 'reconnecting' | 'offline'>('reconnecting');

  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      const [pRes, qRes, aRes, rxRes, refRes, audRes, notRes, anaRes] = await Promise.all([
        fetch('/api/patients'),
        fetch('/api/queue'),
        fetch('/api/appointments'),
        fetch('/api/prescriptions'),
        fetch('/api/referrals'),
        fetch('/api/audit'),
        fetch('/api/notifications'),
        fetch('/api/analytics'),
      ]);

      const [pData, qData, aData, rxData, refData, audData, notData, anaData] = await Promise.all([
        pRes.json(),
        qRes.json(),
        aRes.json(),
        rxRes.json(),
        refRes.json(),
        audRes.json(),
        notRes.json(),
        anaRes.json(),
      ]);

      if (pData.success) {
        setPatients(pData.patients);
        // keep active patient synchronized
        setActivePatient((prev) => {
          if (!prev) return pData.patients[0] || null;
          const matched = pData.patients.find((p: Patient) => p.id === prev.id);
          return matched || pData.patients[0] || null;
        });
      }
      if (qData.success) setOpdTokens(qData.tokens);
      if (aData.success) setAppointments(aData.appointments);
      if (rxData.success) setPrescriptions(rxData.prescriptions);
      if (refData.success) setReferrals(refData.referrals);
      if (audData.success) setAuditTrail(audData.events);
      if (notData.success) setNotifications(notData.notifications);
      if (anaData.success) setAnalytics(anaData);
    } catch (err) {
      console.error('Error fetching clinical kiosk data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const [liveAlertToast, setLiveAlertToast] = useState<{ id: string; message: string; patientId?: string; token?: string; timestamp: string } | null>(null);

  const clearLiveAlertToast = () => setLiveAlertToast(null);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof EventSource === 'undefined') {
      setRealtimeStatus('offline');
      return;
    }
    const source = new EventSource('/api/realtime');
    
    const refreshFromEvent = (evt: MessageEvent) => {
      setRealtimeStatus('connected');
      void refreshData();
      try {
        if (evt.data) {
          const parsed = JSON.parse(evt.data);
          if (evt.type === 'patient.created' || parsed.type === 'patient.created') {
            const patientName = parsed.patientName || parsed.payload?.fullName || 'New Patient';
            const token = parsed.tokenNumber || parsed.payload?.token || '';
            setLiveAlertToast({
              id: `toast-${Date.now()}`,
              message: `New patient registration received: ${patientName}${token ? ` (${token})` : ''}`,
              patientId: parsed.patientId || parsed.payload?.id,
              token,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            });
          }
        }
      } catch {
        // Safe json parse ignore
      }
    };

    source.onopen = () => {
      setRealtimeStatus('connected');
      void refreshData();
    };
    source.onerror = () => setRealtimeStatus('reconnecting');

    const sseEventTypes = [
      'patient.created',
      'patient.updated',
      'case.created',
      'case.updated',
      'case.answer.updated',
      'case.status.changed',
      'triage.updated',
      'safety_flag.created',
      'safety_flag.acknowledged',
      'document.uploaded',
      'queue.updated',
      'queue.token.created',
      'appointment.created',
      'doctor.note.updated',
      'patient.completed',
    ];

    sseEventTypes.forEach((eventName) => {
      source.addEventListener(eventName, refreshFromEvent as EventListener);
    });

    return () => source.close();
  }, [refreshData]);

  const selectPatientById = (id: string) => {
    const found = patients.find((p) => p.id === id);
    if (found) {
      setActivePatient(found);
    }
  };

  const registerPatient = async (demographics: PatientDemographics): Promise<Patient> => {
    const res = await fetch('/api/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        demographics,
        user: currentUser.name,
        role: currentUser.role,
      }),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || 'Registration failed');
    }
    await refreshData();
    setActivePatient(data.patient);
    return data.patient;
  };

  const updatePatientDemographics = async (patientId: string, demographics: Partial<PatientDemographics>): Promise<Patient> => {
    const res = await fetch(`/api/patients/${patientId}/demographics`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        demographics,
        user: currentUser.name,
        role: currentUser.role,
      }),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || 'Update failed');
    }
    await refreshData();
    setActivePatient(data.patient);
    return data.patient;
  };

  const updatePatientIntake = async (patientId: string, intake: SymptomRecord): Promise<Patient> => {
    const res = await fetch(`/api/patients/${patientId}/intake`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intake,
        user: currentUser.name,
        role: currentUser.role,
      }),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || 'Intake save failed');
    }
    await refreshData();
    setActivePatient(data.patient);
    return data.patient;
  };

  const recordTriage = async (patientId: string, triage: TriageRecord): Promise<Patient> => {
    const res = await fetch(`/api/patients/${patientId}/triage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        triage,
        user: currentUser.name,
        role: currentUser.role,
      }),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || 'Triage save failed');
    }
    await refreshData();
    setActivePatient(data.patient);
    return data.patient;
  };

  const runAiSummarization = async (patientId: string): Promise<AIAnalysis> => {
    const res = await fetch('/api/ai/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientId,
        user: currentUser.name,
        role: currentUser.role,
      }),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || 'AI analysis failed');
    }
    await refreshData();
    return data.summary;
  };

  const approveDoctorReview = async (patientId: string, review: DoctorReview): Promise<Patient> => {
    const res = await fetch(`/api/patients/${patientId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        review,
        user: currentUser.name,
        role: currentUser.role,
      }),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || 'Doctor approval failed');
    }
    await refreshData();
    setActivePatient(data.patient);
    return data.patient;
  };

  const saveAyushAssessment = async (patientId: string, assessment: AyushAssessment): Promise<Patient> => {
    const res = await fetch(`/api/patients/${patientId}/ayush-review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assessment,
        user: currentUser.name,
        role: currentUser.role,
      }),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || 'AYUSH assessment save failed');
    }
    await refreshData();
    setActivePatient(data.patient);
    return data.patient;
  };

  const createPrescription = async (prescriptionData: any): Promise<Prescription> => {
    const res = await fetch('/api/prescriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prescription: prescriptionData,
        user: currentUser.name,
        role: currentUser.role,
      }),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || 'Prescription creation failed');
    }
    await refreshData();
    return data.prescription;
  };

  const createReferral = async (referralData: any): Promise<Referral> => {
    const res = await fetch('/api/referrals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        referral: referralData,
        user: currentUser.name,
        role: currentUser.role,
      }),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || 'Referral failed');
    }
    await refreshData();
    return data.referral;
  };

  const seedScenario = async (scenarioIndex: number): Promise<Patient> => {
    const res = await fetch('/api/demo/seed-scenario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenarioIndex }),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to seed scenario');
    }
    await refreshData();
    setActivePatient(data.patient);
    return data.patient;
  };

  const resetDemoData = async (): Promise<void> => {
    await fetch('/api/demo/reset', { method: 'POST' });
    await refreshData();
  };

  const callNextQueuePatient = async (): Promise<void> => {
    const res = await fetch('/api/queue/call-next', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doctorName: currentUser.name }),
    });
    const data = await res.json();
    if (data.success && data.token) {
      await refreshData();
      selectPatientById(data.token.patientId);
    }
  };

  const markNotificationRead = async (id: string): Promise<void> => {
    await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const updateQueueStatus = async (
    tokenIdOrNumber: string,
    status: 'Waiting' | 'In Triage' | 'Waiting for Doctor' | 'In Consultation' | 'Completed'
  ): Promise<void> => {
    await fetch(`/api/queue/${tokenIdOrNumber}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, doctorName: currentUser.name }),
    });
    await refreshData();
  };

  const completeConsultation = async (
    patientId: string,
    clinicalNotes?: string,
    diagnosis?: string
  ): Promise<Patient> => {
    const res = await fetch(`/api/patients/${patientId}/complete-consultation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user: currentUser.name,
        role: currentUser.role,
        clinicalNotes,
        diagnosis,
      }),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to complete consultation');
    }
    await refreshData();
    if (data.patient) {
      setActivePatient(data.patient);
    }
    return data.patient;
  };

  const updateCaseStatus = async (patientId: string, status: Patient['status']): Promise<Patient> => {
    const res = await fetch(`/api/cases/${patientId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status,
        user: currentUser.name,
        role: currentUser.role,
      }),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to update case status');
    }
    await refreshData();
    if (data.case) {
      setActivePatient(data.case);
      return data.case;
    }
    return activePatient!;
  };

  const acknowledgeSafetyAlert = async (patientId: string, alertId: string): Promise<Patient> => {
    const res = await fetch(`/api/patients/${patientId}/safety-alert/${alertId}/ack`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user: currentUser.name,
        role: currentUser.role,
      }),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to acknowledge safety alert');
    }
    await refreshData();
    if (data.patient) {
      setActivePatient(data.patient);
      return data.patient;
    }
    return activePatient!;
  };

  return (
    <PatientContext.Provider
      value={{
        patients,
        activePatient,
        setActivePatient,
        selectPatientById,
        opdTokens,
        appointments,
        prescriptions,
        referrals,
        auditTrail,
        auditLogs: auditTrail,
        notifications,
        analytics,
        loading,
        realtimeStatus,
        refreshData,
        reloadPatients: refreshData,
        registerPatient,
        updatePatientDemographics,
        updatePatientIntake,
        recordTriage,
        runAiSummarization,
        approveDoctorReview,
        saveAyushAssessment,
        createPrescription,
        createReferral,
        seedScenario,
        resetDemoData,
        callNextQueuePatient,
        markNotificationRead,
        updateQueueStatus,
        completeConsultation,
        updateCaseStatus,
        acknowledgeSafetyAlert,
        liveAlertToast,
        clearLiveAlertToast,
      }}
    >
      {children}
    </PatientContext.Provider>
  );
};

export const usePatients = () => {
  const context = useContext(PatientContext);
  if (!context) throw new Error('usePatients must be used within PatientProvider');
  return context;
};
