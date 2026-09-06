import React, { useState } from 'react';
import {
  X,
  User,
  Clock,
  Heart,
  Activity,
  AlertTriangle,
  ShieldAlert,
  Sparkles,
  FileText,
  CheckCircle2,
  AlertOctagon,
  Printer,
  Edit3,
  Save,
  Tag,
  Stethoscope,
  Pill,
  Leaf,
  Layers,
  ChevronDown,
  Phone,
  FileCheck,
  Check,
} from 'lucide-react';
import { Patient, PatientStatus, SafetyAlert } from '../../types';
import { usePatients } from '../../context/PatientContext';
import { useAuth } from '../../context/AuthContext';

interface Props {
  patient: Patient;
  onClose: () => void;
  onOpenPrescriptionBuilder?: () => void;
}

export const ClinicalCaseViewModal: React.FC<Props> = ({
  patient,
  onClose,
  onOpenPrescriptionBuilder,
}) => {
  const { updateCaseStatus, acknowledgeSafetyAlert, completeConsultation, refreshData } = usePatients();
  const { currentUser } = useAuth();

  const [currentStatus, setCurrentStatus] = useState<PatientStatus>(patient.status);
  const [doctorNotes, setDoctorNotes] = useState<string>(
    patient.doctorReview?.clinicalNotes || ''
  );
  const [doctorDiagnosis, setDoctorDiagnosis] = useState<string>(
    patient.doctorReview?.primaryDiagnosis || ''
  );
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState('');

  const CANONICAL_STATUSES: { value: PatientStatus; label: string }[] = [
    { value: 'CREATED', label: '1. Created' },
    { value: 'REGISTRATION', label: '2. Registration In Progress' },
    { value: 'HISTORY_IN_PROGRESS', label: '3. History In Progress' },
    { value: 'DOCUMENT_COLLECTION', label: '4. Document Collection' },
    { value: 'REVIEW_PENDING', label: '5. Review Pending' },
    { value: 'READY_FOR_DOCTOR', label: '6. Ready for Doctor' },
    { value: 'Waiting for Doctor', label: 'Waiting for Doctor' },
    { value: 'IN_CONSULTATION', label: '7. In Consultation' },
    { value: 'Doctor Review', label: 'Doctor Reviewing' },
    { value: 'Doctor Approved', label: 'Doctor Approved' },
    { value: 'COMPLETED', label: '8. Completed' },
    { value: 'Case Closed', label: 'Case Closed' },
    { value: 'CANCELLED', label: '9. Cancelled' },
  ];

  const handleStatusChange = async (newStatus: PatientStatus) => {
    setIsUpdatingStatus(true);
    try {
      await updateCaseStatus(patient.id, newStatus);
      setCurrentStatus(newStatus);
      setSavedSuccessMsg(`Case status updated to "${newStatus}"`);
      setTimeout(() => setSavedSuccessMsg(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await acknowledgeSafetyAlert(patient.id, alertId);
      setSavedSuccessMsg('Safety alert acknowledged.');
      setTimeout(() => setSavedSuccessMsg(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to acknowledge alert');
    }
  };

  const handleSaveObservations = async () => {
    setIsSavingNotes(true);
    try {
      await completeConsultation(patient.id, doctorNotes, doctorDiagnosis);
      setSavedSuccessMsg('Doctor clinical observations saved.');
      setTimeout(() => setSavedSuccessMsg(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to save notes');
    } finally {
      setIsSavingNotes(false);
    }
  };

  const renderSourceBadge = (source: 'PATIENT REPORTED' | 'VOICE CAPTURED' | 'AI STRUCTURED' | 'PRACTITIONER ENTERED' | 'PRACTITIONER OBSERVED' | 'IMPORTED DOCUMENT') => {
    const styles: Record<string, string> = {
      'PATIENT REPORTED': 'bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-300/40',
      'VOICE CAPTURED': 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-300/40',
      'AI STRUCTURED': 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-300/40',
      'PRACTITIONER ENTERED': 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300/40',
      'PRACTITIONER OBSERVED': 'bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-300/40',
      'IMPORTED DOCUMENT': 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300/40',
    };

    return (
      <span className={`inline-flex items-center gap-1 text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full border ${styles[source]}`}>
        <Tag className="w-2.5 h-2.5" />
        {source}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-5xl w-full my-auto shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg">
              {patient.demographics.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  {patient.demographics.fullName}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 text-xs font-mono font-bold">
                  Token: {patient.opdToken || 'OPD-PENDING'}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {patient.demographics.age} yrs • {patient.demographics.gender} • {patient.demographics.preferredLanguage}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Reg No: {patient.demographics.registrationNumber} • Phone: {patient.demographics.phone}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Print Case Record"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Case Status Workflow Bar */}
        <div className="px-6 py-3 bg-slate-100/70 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider text-[11px]">
              Case Status:
            </span>
            <select
              value={currentStatus}
              disabled={isUpdatingStatus}
              onChange={(e) => handleStatusChange(e.target.value as PatientStatus)}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-bold text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500"
            >
              {CANONICAL_STATUSES.map((st) => (
                <option key={st.value} value={st.value}>
                  {st.label}
                </option>
              ))}
            </select>
          </div>

          {savedSuccessMsg && (
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>{savedSuccessMsg}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            {onOpenPrescriptionBuilder && (
              <button
                onClick={onOpenPrescriptionBuilder}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Pill className="w-3.5 h-3.5" />
                <span>Issue Prescription</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Body - Scrollable Sections */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* SECTION 1: CRITICAL SAFETY ALERTS (If any) */}
          {patient.safetyAlerts && patient.safetyAlerts.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
                  <ShieldAlert className="w-5 h-5" />
                  <span>Clinical Safety Alerts ({patient.safetyAlerts.length})</span>
                </div>
                {renderSourceBadge('AI STRUCTURED')}
              </div>

              <div className="space-y-2">
                {patient.safetyAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/40 flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          alert.level === 'CRITICAL'
                            ? 'bg-rose-500 text-white'
                            : 'bg-amber-500 text-white'
                        }`}>
                          {alert.level}
                        </span>
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {alert.title}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                        {alert.reason}
                      </p>
                      {alert.actionRequired && (
                        <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-0.5">
                          Action: {alert.actionRequired}
                        </p>
                      )}
                    </div>

                    <button
                      disabled={alert.acknowledged}
                      onClick={() => handleAcknowledgeAlert(alert.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors ${
                        alert.acknowledged
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-default'
                          : 'bg-rose-600 hover:bg-rose-500 text-white shadow-sm'
                      }`}
                    >
                      {alert.acknowledged ? 'Acknowledged' : 'Acknowledge Alert'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 2: CHIEF COMPLAINT & SYMPTOMS */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-500" />
                Chief Complaint & Intake
              </h3>
              {renderSourceBadge(
                patient.symptoms?.inputMethod === 'Voice' ? 'VOICE CAPTURED' : 'PATIENT REPORTED'
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="sm:col-span-2 space-y-1">
                <span className="text-slate-500 dark:text-slate-400">Primary Complaint</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {patient.symptoms?.chiefComplaint || 'No chief complaint entered'}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 dark:text-slate-400">Duration & Severity</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {patient.symptoms?.duration || '1-3 days'} • Severity: {patient.symptoms?.severity || 'Moderate'}
                </p>
              </div>
            </div>

            {patient.symptoms?.symptoms && patient.symptoms.symptoms.length > 0 && (
              <div className="pt-2">
                <span className="text-slate-500 dark:text-slate-400 text-xs block mb-1.5">
                  Reported Symptoms
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {patient.symptoms.symptoms.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 text-xs font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3: TRIAGE & VITALS */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500" />
                Triage & Measured Vitals
              </h3>
              {renderSourceBadge('PRACTITIONER OBSERVED')}
            </div>

            {patient.triage?.vitalSigns ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block text-[11px]">Blood Pressure</span>
                  <span className="font-black text-sm text-slate-900 dark:text-white">
                    {patient.triage.vitalSigns.bloodPressureSystolic} / {patient.triage.vitalSigns.bloodPressureDiastolic} mmHg
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block text-[11px]">SpO2 Level</span>
                  <span className={`font-black text-sm ${
                    patient.triage.vitalSigns.spO2Percent < 94 ? 'text-rose-600' : 'text-slate-900 dark:text-white'
                  }`}>
                    {patient.triage.vitalSigns.spO2Percent}%
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block text-[11px]">Pulse Rate</span>
                  <span className="font-black text-sm text-slate-900 dark:text-white">
                    {patient.triage.vitalSigns.pulseBpm} bpm
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block text-[11px]">Temperature</span>
                  <span className="font-black text-sm text-slate-900 dark:text-white">
                    {patient.triage.vitalSigns.temperatureF} °F
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                Awaiting nurse vital signs recording.
              </p>
            )}
          </div>

          {/* SECTION 4: MEDICAL HISTORY & ALLERGIES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs uppercase text-slate-700 dark:text-slate-300">
                  Past Medical History
                </span>
                {renderSourceBadge('PATIENT REPORTED')}
              </div>
              <ul className="text-xs text-slate-700 dark:text-slate-300 list-disc pl-4 space-y-1">
                {(patient.symptoms?.medicalHistory || patient.demographics.existingConditions || ['None reported']).map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs uppercase text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Known Allergies
                </span>
                {renderSourceBadge('PATIENT REPORTED')}
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {(patient.demographics.knownAllergies || ['None known']).map((alg, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                    {alg}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 5: AI STRUCTURED CLINICAL SUMMARY (Clearly labelled as draft / decision support) */}
          {patient.aiAnalysis && (
            <div className="p-5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-bold text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Structured Summary & Clinical Decision Support</span>
                </div>
                {renderSourceBadge('AI STRUCTURED')}
              </div>

              <div className="p-3 rounded-xl bg-purple-100/60 dark:bg-purple-900/30 text-[11px] text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-800">
                <strong>Notice:</strong> This draft summary is generated by clinical AI models for physician review. It does not replace medical judgment.
              </div>

              <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-white/70 dark:bg-slate-900/70 p-4 rounded-xl border border-purple-200/60 dark:border-purple-900/40">
                {patient.aiAnalysis.structuredSummary}
              </div>

              {patient.aiAnalysis.differentialConsiderations && patient.aiAnalysis.differentialConsiderations.length > 0 && (
                <div className="pt-2">
                  <span className="text-[11px] font-bold uppercase text-purple-700 dark:text-purple-300 block mb-1.5">
                    Differential Considerations for Physician Review
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {patient.aiAnalysis.differentialConsiderations.map((diff, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-purple-300/60 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-semibold"
                      >
                        {diff}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SECTION 6: DOCTOR OBSERVATIONS & CLINICAL NOTES */}
          <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                <Stethoscope className="w-4 h-4" />
                Doctor Observations & Consultation Notes
              </h3>
              {renderSourceBadge('PRACTITIONER ENTERED')}
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Primary Diagnosis
                </label>
                <input
                  type="text"
                  value={doctorDiagnosis}
                  onChange={(e) => setDoctorDiagnosis(e.target.value)}
                  placeholder="e.g. Acute Upper Respiratory Tract Infection (J06.9)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Doctor Clinical Observations & SOAP Assessment
                </label>
                <textarea
                  rows={4}
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  placeholder="Enter physician examination findings, clinical impression, and advice..."
                  className="w-full p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  disabled={isSavingNotes}
                  onClick={handleSaveObservations}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Clinical Observations</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Attending: <strong>{currentUser.name}</strong> ({currentUser.role})
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            Close Case View
          </button>
        </div>
      </div>
    </div>
  );
};
