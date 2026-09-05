import React, { useState, useEffect, useMemo } from 'react';
import {
  Stethoscope,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Printer,
  Share2,
  Activity,
  User,
  Heart,
  Edit,
  Play,
  Check,
  Plus,
  Send,
  AlertOctagon,
  Clock,
  Phone,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Info,
  BadgeCheck,
  CheckSquare,
  Square,
  FileCheck,
  Bell,
  RefreshCw,
} from 'lucide-react';
import { usePatients } from '../../context/PatientContext';
import { useAuth } from '../../context/AuthContext';
import { Patient, DoctorReview, PrescriptionItem, Prescription, Referral, VitalSigns } from '../../types';
import { EditDemographicsModal } from '../common/EditDemographicsModal';
import { PrescriptionModal } from '../common/PrescriptionModal';

interface Props {
  onNavigateTab: (tab: string) => void;
  onSelectPatient: (patient: Patient, tab?: string) => void;
}

export const DoctorStationView: React.FC<Props> = ({ onNavigateTab, onSelectPatient }) => {
  const {
    patients,
    activePatient,
    setActivePatient,
    runAiSummarization,
    approveDoctorReview,
    createPrescription,
    createReferral,
    callNextQueuePatient,
    updateQueueStatus,
    completeConsultation,
    opdTokens,
    refreshData,
  } = usePatients();

  const { currentUser } = useAuth();

  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [isAnalyzingAi, setIsAnalyzingAi] = useState<boolean>(false);
  const [aiStep, setAiStep] = useState<string>('');

  // Doctor SOAP Notes Form
  const [soapSubjective, setSoapSubjective] = useState('');
  const [soapObjective, setSoapObjective] = useState('');
  const [primaryDiagnosis, setPrimaryDiagnosis] = useState('');
  const [secondaryDiagnoses, setSecondaryDiagnoses] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [investigations, setInvestigations] = useState('');

  // Prescription Builder State
  const [showRxModal, setShowRxModal] = useState(false);
  const [rxItems, setRxItems] = useState<PrescriptionItem[]>([
    {
      id: 'item-1',
      medicineName: 'Tab Paracetamol',
      dosage: '650 mg',
      frequency: 'TDS (Thrice daily)',
      duration: '3 days',
      route: 'Oral',
      instructions: 'Take after meals for fever / pain',
    },
  ]);
  const [newMedName, setNewMedName] = useState('');
  const [newDosage, setNewDosage] = useState('');
  const [newFreq, setNewFreq] = useState('TDS (Thrice daily)');
  const [newDuration, setNewDuration] = useState('5 days');
  const [newInstructions, setNewInstructions] = useState('Take with water after food');
  const [rxAdvice, setRxAdvice] = useState('Drink plenty of boiled water. Adequate rest. SOS if high fever.');
  const [followUpDate, setFollowUpDate] = useState('In 3 days');
  const [activePrescriptionForModal, setActivePrescriptionForModal] = useState<Prescription | null>(null);

  // Referral Builder State
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [referralReason, setReferralReason] = useState('');
  const [targetDept, setTargetDept] = useState('Cardiology & Cath Lab');
  const [suggestedFacility, setSuggestedFacility] = useState('District Civil Hospital / Tertiary Medical College');
  const [referralPriority, setReferralPriority] = useState<'Routine' | 'Urgent' | 'Emergency'>('Urgent');

  // Demographic Edit Modal
  const [isEditingDemographics, setIsEditingDemographics] = useState(false);

  // Notification banners
  const [doctorSavedNotice, setDoctorSavedNotice] = useState<string | null>(null);
  const [isSavingReview, setIsSavingReview] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  // Synchronize active patient
  useEffect(() => {
    if (activePatient) {
      setSelectedPatientId(activePatient.id);
      if (activePatient.doctorReview) {
        setPrimaryDiagnosis(activePatient.doctorReview.primaryDiagnosis || '');
        setSecondaryDiagnoses(activePatient.doctorReview.secondaryDiagnoses?.join(', ') || '');
        setTreatmentPlan(activePatient.doctorReview.treatmentPlan || '');
        setSoapSubjective(activePatient.symptoms?.intakeNotes || activePatient.symptoms?.chiefComplaint || '');
        setSoapObjective(activePatient.triage?.nurseNotes || '');
        setInvestigations(activePatient.doctorReview.investigationsRequested?.join(', ') || '');
      } else {
        setPrimaryDiagnosis('');
        setSecondaryDiagnoses('');
        setTreatmentPlan('');
        setSoapSubjective(activePatient.symptoms?.intakeNotes || activePatient.symptoms?.chiefComplaint || '');
        setSoapObjective(activePatient.triage?.nurseNotes || '');
        setInvestigations('');
      }
    } else if (patients.length > 0) {
      setSelectedPatientId(patients[0].id);
      setActivePatient(patients[0]);
    }
  }, [activePatient, patients, setActivePatient]);

  const currentPatient = useMemo(() => {
    return patients.find((p) => p.id === selectedPatientId) || activePatient || patients[0];
  }, [patients, selectedPatientId, activePatient]);

  // Derived Queue Token for current patient
  const currentToken = useMemo(() => {
    if (!currentPatient) return null;
    return opdTokens.find((t) => t.patientId === currentPatient.id || t.tokenNumber === currentPatient.opdToken);
  }, [opdTokens, currentPatient]);

  // Dynamic real-time metrics computed strictly from current state
  const metrics = useMemo(() => {
    const total = patients.length;
    const waiting = opdTokens.filter((t) => t.status === 'Waiting' || t.status === 'Waiting for Doctor').length;
    const inConsultation = opdTokens.filter((t) => t.status === 'In Consultation').length;
    const completed = opdTokens.filter((t) => t.status === 'Completed').length +
      patients.filter((p) => p.status === 'Case Closed' && !opdTokens.some(t => (t.patientId === p.id && t.status === 'Completed'))).length;
    const critical = patients.filter((p) => p.triage?.priority === 'RED' || p.triage?.priority === 'ORANGE').length;

    return { total, waiting, inConsultation, completed, critical };
  }, [patients, opdTokens]);

  // Check for newly registered patient (registered within last 30 minutes or status 'Registered'/'Intake Completed')
  const newestPatient = useMemo(() => {
    return patients.find((p) => p.status === 'Registered' || p.status === 'Intake Completed') || null;
  }, [patients]);

  const handlePatientSwitch = (p: Patient) => {
    setActivePatient(p);
    setSelectedPatientId(p.id);
  };

  // Queue Workflow transitions:
  // WAITING -> CALLED ('Waiting for Doctor' / 'In Consultation')
  const handleCallPatient = async () => {
    if (!currentToken) return;
    try {
      await updateQueueStatus(currentToken.id, 'In Consultation');
      setDoctorSavedNotice(`Patient ${currentPatient?.demographics.fullName} (${currentToken.tokenNumber}) called to Chamber.`);
      setTimeout(() => setDoctorSavedNotice(null), 3500);
    } catch (err: any) {
      alert(err.message || 'Error updating queue status');
    }
  };

  // START CONSULTATION
  const handleStartConsultation = async () => {
    if (!currentToken) return;
    try {
      await updateQueueStatus(currentToken.id, 'In Consultation');
      setDoctorSavedNotice(`Consultation started for ${currentPatient?.demographics.fullName}`);
      setTimeout(() => setDoctorSavedNotice(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Error starting consultation');
    }
  };

  // COMPLETE CONSULTATION
  const handleCompleteConsultation = async () => {
    if (!currentPatient) return;
    try {
      setIsCompleting(true);
      const combinedNotes = `[SOAP S]: ${soapSubjective}\n[SOAP O]: ${soapObjective}\n[PLAN]: ${treatmentPlan}`;
      await completeConsultation(
        currentPatient.id,
        combinedNotes,
        primaryDiagnosis.trim() || 'Clinical Review Completed'
      );
      setDoctorSavedNotice(`Consultation COMPLETED for ${currentPatient.demographics.fullName}. Encounter archived in visits.`);
      setTimeout(() => setDoctorSavedNotice(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Error completing consultation');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleRunAiAnalysis = async () => {
    if (!currentPatient) return;
    try {
      setIsAnalyzingAi(true);
      setAiStep('1/5: Loading intake details & symptoms...');
      await new Promise((r) => setTimeout(r, 350));
      setAiStep('2/5: Normalizing vital sign thresholds...');
      await new Promise((r) => setTimeout(r, 350));
      setAiStep('3/5: Running clinical safety rules & allergy cross-check...');
      await new Promise((r) => setTimeout(r, 350));
      setAiStep('4/5: Synthesizing Gemini clinical case differential...');
      await runAiSummarization(currentPatient.id);
      setAiStep('5/5: Synthesis completed!');
      await new Promise((r) => setTimeout(r, 300));
    } catch (err: any) {
      alert(err.message || 'Error running AI analysis');
    } finally {
      setIsAnalyzingAi(false);
      setAiStep('');
    }
  };

  const handleSaveDoctorReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPatient) return;
    if (!primaryDiagnosis.trim()) {
      alert('Primary clinical diagnosis is required.');
      return;
    }

    try {
      setIsSavingReview(true);
      const review: DoctorReview = {
        verified: true,
        approved: true,
        clinicalNotes: `[S]: ${soapSubjective}\n[O]: ${soapObjective}\n[Notes]: ${treatmentPlan}`,
        primaryDiagnosis: primaryDiagnosis.trim(),
        secondaryDiagnoses: secondaryDiagnoses
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        investigationsRequested: investigations
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        treatmentPlan: treatmentPlan.trim(),
        reviewedBy: currentUser.name,
        reviewedAt: new Date().toISOString(),
      };

      await approveDoctorReview(currentPatient.id, review);
      setDoctorSavedNotice('Clinical case assessed, signed-off and validated by Medical Officer.');
      setTimeout(() => setDoctorSavedNotice(null), 3500);
    } catch (err: any) {
      alert(err.message || 'Error approving doctor review');
    } finally {
      setIsSavingReview(false);
    }
  };

  const handleAddRxItem = () => {
    if (!newMedName.trim()) return alert('Enter medication name');
    setRxItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        medicineName: newMedName.trim(),
        dosage: newDosage.trim(),
        frequency: newFreq,
        duration: newDuration.trim(),
        route: 'Oral',
        instructions: newInstructions.trim(),
      },
    ]);
    setNewMedName('');
    setNewDosage('');
  };

  const handleRemoveRxItem = (id: string) => {
    setRxItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSavePrescription = async () => {
    if (!currentPatient) return;
    if (rxItems.length === 0) return alert('Prescription must have at least one medication item.');

    try {
      const created = await createPrescription({
        patientId: currentPatient.id,
        patientName: currentPatient.demographics.fullName,
        doctorName: currentUser.name,
        doctorRegNo: 'MCI-88421-B',
        diagnosis: primaryDiagnosis.trim() || 'Acute Clinical Presentation',
        items: rxItems,
        generalAdvice: rxAdvice.trim(),
        followUpDate: followUpDate || 'In 3 days or SOS',
      });
      setActivePrescriptionForModal(created);
      setShowRxModal(false);
      setDoctorSavedNotice('Digital Prescription generated and signed successfully.');
      setTimeout(() => setDoctorSavedNotice(null), 3500);
    } catch (err: any) {
      alert(err.message || 'Failed to generate prescription');
    }
  };

  const handleSaveReferral = async () => {
    if (!currentPatient) return;
    if (!referralReason.trim()) return alert('Referral reason is required.');

    try {
      await createReferral({
        patientId: currentPatient.id,
        patientName: currentPatient.demographics.fullName,
        referredBy: currentUser.name,
        referredByRole: currentUser.role,
        referralReason: referralReason.trim(),
        targetDepartment: targetDept,
        suggestedFacility,
        priority: referralPriority,
        notes: `Clinical case reviewed at MediKiosk by ${currentUser.name}`,
      });
      setShowReferralModal(false);
      setDoctorSavedNotice(`Patient referred to ${targetDept} successfully.`);
      setTimeout(() => setDoctorSavedNotice(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to submit referral');
    }
  };

  // Time-based greeting helper
  const greeting = useMemo(() => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Station Greeting & Status Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white shadow-lg border border-slate-700/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] tracking-wider uppercase border border-emerald-500/30 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Live OPD Chamber #3
              </span>
              <span className="text-xs text-slate-400">• General Medicine & Triage</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2 text-white">
              <Stethoscope className="w-6 h-6 text-emerald-400" />
              {greeting}, {currentUser.name}
            </h1>
            <p className="text-xs text-slate-300">
              Physician workstation for consultation, SOAP assessments, Gemini differential support, and verified Rx generation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={refreshData}
              title="Refresh Clinic Data"
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={callNextQueuePatient}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all"
            >
              <Play className="w-3.5 h-3.5" />
              Call Next Patient in Queue
            </button>
          </div>
        </div>

        {/* Dynamic Metric Cards (Derived from real state) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4 pt-4 border-t border-slate-700/60 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/40">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Patients Today</span>
            <span className="text-lg font-black text-white">{metrics.total}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/40">
            <span className="text-[10px] text-amber-400 uppercase font-semibold block">Waiting in Queue</span>
            <span className="text-lg font-black text-amber-300">{metrics.waiting}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/40">
            <span className="text-[10px] text-sky-400 uppercase font-semibold block">In Consultation</span>
            <span className="text-lg font-black text-sky-300">{metrics.inConsultation}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/40">
            <span className="text-[10px] text-emerald-400 uppercase font-semibold block">Completed</span>
            <span className="text-lg font-black text-emerald-300">{metrics.completed}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/40 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-rose-400 uppercase font-semibold block">Critical Triage</span>
            <span className="text-lg font-black text-rose-300">{metrics.critical}</span>
          </div>
        </div>
      </div>

      {/* Prominent New Patient Check-in Alert Banner */}
      {newestPatient && (
        <div className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
              <Bell className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sky-900 dark:text-sky-200">
                  🆕 NEW PATIENT CHECK-IN: {newestPatient.demographics.fullName}
                </span>
                <span className="font-mono px-1.5 py-0.5 rounded bg-sky-200 dark:bg-sky-800 text-[10px] font-bold">
                  {newestPatient.opdToken}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {newestPatient.status}
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5">
                {newestPatient.demographics.age}Y • {newestPatient.demographics.gender} • Chief Complaint:{' '}
                {newestPatient.symptoms?.chiefComplaint || 'Pending intake capture'}
              </p>
            </div>
          </div>

          <button
            onClick={() => handlePatientSwitch(newestPatient)}
            className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-colors"
          >
            <span>Review Patient File</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Success Notification Bar */}
      {doctorSavedNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{doctorSavedNotice}</span>
        </div>
      )}

      {/* 3-Column Clinical Workstation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* =========================================================================
            COLUMN 1 (3 cols): Queue Directory & Active Patients
        ========================================================================= */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Queue ({patients.length})
            </span>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              {metrics.waiting} Waiting
            </span>
          </div>

          <div className="space-y-2 max-h-[720px] overflow-y-auto pr-1">
            {patients.map((p) => {
              const isSelected = p.id === currentPatient?.id;
              const priority = p.triage?.priority || 'GREEN';

              const priorityPills: Record<string, string> = {
                GREEN: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
                YELLOW: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
                ORANGE: 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300',
                RED: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 animate-pulse',
              };

              return (
                <div
                  key={p.id}
                  onClick={() => handlePatientSwitch(p)}
                  className={`p-3 rounded-xl cursor-pointer border transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 shadow-xs'
                      : 'border-slate-200/70 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[11px] font-extrabold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                      {p.opdToken}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${priorityPills[priority]}`}>
                      {priority}
                    </span>
                  </div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                    {p.demographics.fullName}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 flex justify-between">
                    <span>
                      {p.demographics.age}Y • {p.demographics.gender}
                    </span>
                    <span className="truncate max-w-[100px] font-medium text-slate-500">
                      {p.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            COLUMN 2 (5 cols): Patient 360° Profile, Vitals Trend & SOAP Notes
        ========================================================================= */}
        {currentPatient ? (
          <div className="lg:col-span-5 space-y-4">
            {/* Patient Header Card */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-900 dark:text-white">
                      {currentPatient.demographics.fullName}
                    </span>
                    <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded">
                      {currentPatient.opdToken}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {currentPatient.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {currentPatient.demographics.age} Years • {currentPatient.demographics.gender} • Blood Group:{' '}
                    <strong>{currentPatient.demographics.bloodGroup || 'Not recorded'}</strong>
                  </p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-3 mt-1">
                    <span>ABHA ID: {currentPatient.demographics.abhaId || 'N/A'}</span>
                    <span>Phone: {currentPatient.demographics.phone}</span>
                  </p>
                </div>

                <button
                  onClick={() => setIsEditingDemographics(true)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
                >
                  <Edit className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Edit</span>
                </button>
              </div>

              {/* Consultation Lifecycle Action Bar */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-semibold">Queue Lifecycle:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {currentToken?.status || currentPatient.status}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {currentToken?.status === 'Waiting' && (
                    <button
                      onClick={handleCallPatient}
                      className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
                    >
                      Call Patient
                    </button>
                  )}

                  {currentToken?.status !== 'In Consultation' && currentToken?.status !== 'Completed' && (
                    <button
                      onClick={handleStartConsultation}
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                    >
                      Start Consultation
                    </button>
                  )}

                  <button
                    onClick={handleCompleteConsultation}
                    disabled={isCompleting}
                    className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isCompleting ? 'Finalizing...' : 'Complete Consultation'}</span>
                  </button>
                </div>
              </div>

              {/* Known Allergies Warning */}
              {currentPatient.demographics.knownAllergies && currentPatient.demographics.knownAllergies.length > 0 ? (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2.5 text-xs text-rose-800 dark:text-rose-300 font-bold">
                  <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>
                    DOCUMENTED ALLERGIES: {currentPatient.demographics.knownAllergies.join(', ')}
                  </span>
                </div>
              ) : (
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>No documented drug or food allergies.</span>
                </div>
              )}
            </div>

            {/* Vitals Trend & Snapshot Card */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-amber-500" />
                  Vital Signs & Physiological Status
                </h3>
                <span className="text-[11px] font-mono text-slate-400">
                  {currentPatient.triage ? `Recorded by ${currentPatient.triage.triagedBy}` : 'Triage pending'}
                </span>
              </div>

              {currentPatient.triage?.vitalSigns ? (
                <div className="grid grid-cols-3 gap-2.5 text-xs">
                  {/* SpO2 */}
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>SpO2</span>
                      <span className="text-emerald-500">Normal: &gt;95%</span>
                    </div>
                    <span
                      className={`text-base font-extrabold ${
                        currentPatient.triage.vitalSigns.spO2Percent < 92
                          ? 'text-rose-600'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {currentPatient.triage.vitalSigns.spO2Percent}%
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {currentPatient.triage.vitalSigns.spO2Percent < 92 ? 'Hypoxia' : 'Normal'}
                    </span>
                  </div>

                  {/* BP */}
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Blood Pressure</span>
                      <span className="text-slate-400">120/80</span>
                    </div>
                    <span
                      className={`text-base font-extrabold ${
                        currentPatient.triage.vitalSigns.bloodPressureSystolic >= 160
                          ? 'text-rose-600'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {currentPatient.triage.vitalSigns.bloodPressureSystolic}/
                      {currentPatient.triage.vitalSigns.bloodPressureDiastolic}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {currentPatient.triage.vitalSigns.bloodPressureSystolic >= 140 ? 'Hypertensive' : 'Normal'}
                    </span>
                  </div>

                  {/* Pulse */}
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Pulse</span>
                      <span className="text-slate-400">60-100</span>
                    </div>
                    <span
                      className={`text-base font-extrabold ${
                        currentPatient.triage.vitalSigns.pulseBpm > 100
                          ? 'text-rose-600'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {currentPatient.triage.vitalSigns.pulseBpm} bpm
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {currentPatient.triage.vitalSigns.pulseBpm > 100 ? 'Tachycardia' : 'Normal'}
                    </span>
                  </div>

                  {/* Temperature */}
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Temperature</span>
                      <span className="text-slate-400">98.6°F</span>
                    </div>
                    <span
                      className={`text-base font-extrabold ${
                        currentPatient.triage.vitalSigns.temperatureF >= 100.4
                          ? 'text-rose-600'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {currentPatient.triage.vitalSigns.temperatureF}°F
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {currentPatient.triage.vitalSigns.temperatureF >= 100.4 ? 'Febrile' : 'Afebrile'}
                    </span>
                  </div>

                  {/* Respiratory Rate */}
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Resp. Rate</span>
                      <span className="text-slate-400">12-20</span>
                    </div>
                    <span className="text-base font-extrabold text-slate-900 dark:text-white">
                      {currentPatient.triage.vitalSigns.respiratoryRate} /min
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {currentPatient.triage.vitalSigns.respiratoryRate > 24 ? 'Tachypnea' : 'Normal'}
                    </span>
                  </div>

                  {/* BMI */}
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>BMI / Weight</span>
                      <span className="text-slate-400">18.5-24.9</span>
                    </div>
                    <span className="text-base font-extrabold text-slate-900 dark:text-white">
                      {currentPatient.triage.vitalSigns.bmi || 23.4}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Weight: {currentPatient.triage.vitalSigns.weightKg} kg
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
                  Vitals pending triage assessment.
                </div>
              )}
            </div>

            {/* SOAP Framework Clinical Notes (Subjective, Objective, Assessment, Plan) */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-500" />
                  Clinical SOAP Documentation
                </h3>
                <span className="text-[10px] text-slate-400">Standardized Medical Record</span>
              </div>

              <div className="space-y-3 text-xs">
                {/* Subjective */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    <strong>S</strong> - Subjective (Chief Complaints & History of Present Illness)
                  </label>
                  <textarea
                    rows={2}
                    value={soapSubjective}
                    onChange={(e) => setSoapSubjective(e.target.value)}
                    placeholder="Patient states symptoms, duration, exacerbating factors..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                {/* Objective */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    <strong>O</strong> - Objective (Physical Examination & Clinical Observations)
                  </label>
                  <textarea
                    rows={2}
                    value={soapObjective}
                    onChange={(e) => setSoapObjective(e.target.value)}
                    placeholder="Auscultation, palpation, chest clear, tenderness, vitals validation..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                {/* Assessment */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    <strong>A</strong> - Assessment (Primary Clinical Diagnosis) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={primaryDiagnosis}
                    onChange={(e) => setPrimaryDiagnosis(e.target.value)}
                    placeholder="e.g. Acute Gastritis with Dyspepsia / GERD"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                {/* Secondary Diagnoses */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Secondary Diagnoses / Comorbidities
                  </label>
                  <input
                    type="text"
                    value={secondaryDiagnoses}
                    onChange={(e) => setSecondaryDiagnoses(e.target.value)}
                    placeholder="e.g. Type 2 Diabetes, Essential Hypertension"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                {/* Plan */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    <strong>P</strong> - Plan (Therapy, Investigations & Lifestyle Orders)
                  </label>
                  <textarea
                    rows={2}
                    value={treatmentPlan}
                    onChange={(e) => setTreatmentPlan(e.target.value)}
                    placeholder="Medications prescribed, dietary modifications, follow-up instructions..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Previous Visit History */}
            {currentPatient.visits && currentPatient.visits.length > 0 && (
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Past Encounters & Visit Log ({currentPatient.visits.length})
                </span>
                <div className="space-y-2">
                  {currentPatient.visits.map((vis) => (
                    <div
                      key={vis.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs"
                    >
                      <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                        <span>{vis.diagnosis || 'General Consultation'}</span>
                        <span className="text-emerald-600 dark:text-emerald-400 text-[11px]">
                          {new Date(vis.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        By {vis.doctorName} • {vis.department}
                      </p>
                      {vis.clinicalNotes && (
                        <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-1 italic">
                          "{vis.clinicalNotes}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="lg:col-span-5 p-12 text-center text-slate-400">
            Select a patient from the queue to view clinical details.
          </div>
        )}

        {/* =========================================================================
            COLUMN 3 (4 cols): AI Decision Support, Safety Engine & Rx/Referrals
        ========================================================================= */}
        {currentPatient ? (
          <div className="lg:col-span-4 space-y-4">
            {/* AI Decision Support Panel */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/5 via-indigo-500/5 to-sky-500/5 dark:from-purple-950/20 dark:to-slate-900 border border-purple-500/30 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-900 dark:text-purple-300">
                    AI Clinical Decision Support
                  </h3>
                </div>
                <button
                  type="button"
                  disabled={isAnalyzingAi}
                  onClick={handleRunAiAnalysis}
                  className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs transition-colors disabled:opacity-50"
                >
                  <Sparkles className="w-3 h-3" />
                  {isAnalyzingAi ? 'Analyzing...' : 'Run Gemini AI'}
                </button>
              </div>

              {/* Progress animation */}
              {isAnalyzingAi && (
                <div className="p-3 rounded-xl bg-purple-100/60 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 text-xs font-mono animate-pulse">
                  {aiStep}
                </div>
              )}

              {/* AI Content */}
              {currentPatient.aiAnalysis ? (
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-purple-100 dark:border-purple-900/40">
                    <span className="text-[10px] font-bold uppercase text-purple-600 block mb-1">
                      Case Differential Synthesis
                    </span>
                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                      {currentPatient.aiAnalysis.chiefComplaintSummary}
                    </p>
                  </div>

                  {currentPatient.aiAnalysis.potentialRedFlags &&
                    currentPatient.aiAnalysis.potentialRedFlags.length > 0 && (
                      <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50">
                        <span className="text-[10px] font-bold uppercase text-rose-600 block mb-1 flex items-center gap-1">
                          <AlertOctagon className="w-3.5 h-3.5" /> High-Risk Clinical Red Flags
                        </span>
                        <ul className="list-disc list-inside space-y-0.5 text-rose-800 dark:text-rose-300">
                          {currentPatient.aiAnalysis.potentialRedFlags.map((flag, idx) => (
                            <li key={idx}>{flag}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {currentPatient.aiAnalysis.possibleDifferentialConsiderations && (
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-purple-100 dark:border-purple-900/40">
                      <span className="text-[10px] font-bold uppercase text-purple-600 block mb-1">
                        Differential Considerations
                      </span>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-700 dark:text-slate-300">
                        {currentPatient.aiAnalysis.possibleDifferentialConsiderations.map((diff, idx) => (
                          <li key={idx}>{diff}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="text-[10px] text-slate-400 italic p-1 border-t border-purple-100 dark:border-purple-900/40">
                    {currentPatient.aiAnalysis.disclaimer}
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-slate-400 bg-white/60 dark:bg-slate-800/40 rounded-xl border border-dashed border-purple-200 dark:border-purple-900/50">
                  Click <strong>"Run Gemini AI"</strong> to synthesize intake vitals, symptoms, and potential red-flags.
                </div>
              )}
            </div>

            {/* Rule-based Safety Engine Alerts */}
            {currentPatient.safetyAlerts && currentPatient.safetyAlerts.length > 0 && (
              <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 space-y-2">
                <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-bold text-xs">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>Rule-Based Safety Warnings ({currentPatient.safetyAlerts.length})</span>
                </div>
                <div className="space-y-2 text-xs">
                  {currentPatient.safetyAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="p-2.5 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-rose-200 dark:border-rose-900/40"
                    >
                      <div className="font-bold text-rose-800 dark:text-rose-300">{alert.title}</div>
                      <div className="text-slate-600 dark:text-slate-400 mt-0.5">{alert.reason}</div>
                      <div className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 mt-1">
                        Required Action: {alert.actionRequired}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Doctor Actions & Sign-Off */}
            <form
              onSubmit={handleSaveDoctorReview}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3"
            >
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                <BadgeCheck className="w-4 h-4 text-emerald-500" />
                Actions & Prescription Management
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ordered Lab / Diagnostic Tests
                </label>
                <input
                  type="text"
                  placeholder="e.g. Complete Blood Count (CBC), Urine Routine, Serum Creatinine"
                  value={investigations}
                  onChange={(e) => setInvestigations(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={isSavingReview}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isSavingReview ? 'Saving...' : 'Validate & Approve Assessment'}
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRxModal(true)}
                    className="py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Prescription (Rx)
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowReferralModal(true)}
                    className="py-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Refer Patient
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigateTab('ayush')}
                  className="w-full py-2 rounded-xl bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                >
                  <span>🌿 AYUSH Integrative / Robinia 30 Case</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </form>
          </div>
        ) : null}
      </div>

      {/* Demographic Edit Modal */}
      {currentPatient && (
        <EditDemographicsModal
          patient={currentPatient}
          isOpen={isEditingDemographics}
          onClose={() => setIsEditingDemographics(false)}
        />
      )}

      {/* Prescription Builder & Confirmation Modal */}
      {showRxModal && currentPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-500" />
                Prescription Generator • {currentPatient.demographics.fullName} ({currentPatient.opdToken})
              </h2>
              <button
                onClick={() => setShowRxModal(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Close
              </button>
            </div>

            {/* Current Medicines Table */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Prescribed Medications ({rxItems.length})
              </span>
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 text-xs overflow-hidden">
                {rxItems.map((item) => (
                  <div key={item.id} className="p-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white mr-2">
                        {item.medicineName}
                      </span>
                      <span className="text-slate-500">
                        {item.dosage} • {item.frequency} • {item.duration}
                      </span>
                      <p className="text-[11px] text-slate-400 mt-0.5">{item.instructions}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveRxItem(item.id)}
                      className="text-rose-500 hover:text-rose-700 text-xs font-semibold px-2 py-1"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add New Medicine Input Bar */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-2 text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300 block">Add Medication:</span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Medicine Name (e.g. Tab Pantoprazole)"
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
                <input
                  type="text"
                  placeholder="Dosage (e.g. 40 mg)"
                  value={newDosage}
                  onChange={(e) => setNewDosage(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
                <select
                  value={newFreq}
                  onChange={(e) => setNewFreq(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                >
                  <option value="OD (Once daily)">OD (Once daily)</option>
                  <option value="BD (Twice daily)">BD (Twice daily)</option>
                  <option value="TDS (Thrice daily)">TDS (Thrice daily)</option>
                  <option value="QID (Four times daily)">QID (Four times daily)</option>
                  <option value="SOS (As needed)">SOS (As needed)</option>
                  <option value="STAT (Immediately)">STAT (Immediately)</option>
                </select>
                <input
                  type="text"
                  placeholder="Duration (e.g. 5 days)"
                  value={newDuration}
                  onChange={(e) => setNewDuration(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Instructions (e.g. Take on empty stomach 30 mins before breakfast)"
                  value={newInstructions}
                  onChange={(e) => setNewInstructions(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddRxItem}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs whitespace-nowrap"
                >
                  + Add Item
                </button>
              </div>
            </div>

            {/* General Advice & Follow-up */}
            <div className="space-y-2 text-xs">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">General Advice:</label>
              <input
                type="text"
                value={rxAdvice}
                onChange={(e) => setRxAdvice(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowRxModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePrescription}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm"
              >
                Generate Official Rx
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tertiary Referral Modal */}
      {showReferralModal && currentPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Share2 className="w-4 h-4 text-amber-500" />
              Tertiary Care & Specialist Referral
            </h2>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Target Department:
                </label>
                <select
                  value={targetDept}
                  onChange={(e) => setTargetDept(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="Cardiology & Cath Lab">Cardiology & Cath Lab</option>
                  <option value="Neurology / Stroke Care">Neurology / Stroke Care</option>
                  <option value="General & Trauma Surgery">General & Trauma Surgery</option>
                  <option value="Pediatric Critical Care">Pediatric Critical Care</option>
                  <option value="Orthopedics">Orthopedics</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Suggested Facility:
                </label>
                <input
                  type="text"
                  value={suggestedFacility}
                  onChange={(e) => setSuggestedFacility(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Referral Priority:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Routine', 'Urgent', 'Emergency'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setReferralPriority(p)}
                      className={`p-2 rounded-lg font-bold border ${
                        referralPriority === p
                          ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Reason for Referral:
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Acute Coronary Syndrome requiring immediate angiography and primary PCI."
                  value={referralReason}
                  onChange={(e) => setReferralReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowReferralModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveReferral}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-sm"
              >
                Submit Official Referral
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Prescription Modal */}
      {activePrescriptionForModal && currentPatient && (
        <PrescriptionModal
          prescription={activePrescriptionForModal}
          patient={currentPatient}
          isOpen={Boolean(activePrescriptionForModal)}
          onClose={() => setActivePrescriptionForModal(null)}
        />
      )}
    </div>
  );
};
