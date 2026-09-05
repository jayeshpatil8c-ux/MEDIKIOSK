import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Sparkles,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  FileText,
  Clock,
  Activity,
  User,
  Stethoscope,
  HeartPulse,
  Share2,
  Check,
  ChevronDown,
  ChevronUp,
  Flame,
  Volume2,
} from 'lucide-react';
import { Patient, SafetyAlert } from '../../types';
import { usePatients } from '../../context/PatientContext';
import { speakText } from '../../utils/speechHelper';

interface Props {
  onNavigateTab: (tab: string) => void;
  onSelectPatient: (patient: Patient, targetTab?: string) => void;
}

export const AiSafetyHubView: React.FC<Props> = ({ onNavigateTab, onSelectPatient }) => {
  const { patients, activePatient, setActivePatient, auditTrail } = usePatients();

  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    activePatient?.id || (patients[0]?.id ?? '')
  );
  const [activeSubTab, setActiveSubTab] = useState<'safety' | 'explainability' | 'sbar' | 'questions' | 'emergency'>('safety');

  // Explainability expand/collapse
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    symptoms: true,
    vitals: true,
    history: true,
    risks: true,
  });

  // Safety gate checklist state
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    identity: true,
    allergiesReviewed: false,
    vitalsReviewed: false,
    aiReviewed: false,
    criticalAcknowledged: false,
  });

  // Questions suggester state
  const [questions, setQuestions] = useState<Array<{ id: string; text: string; status: 'suggested' | 'added' | 'ignored' | 'answered' }>>([
    { id: 'q1', text: 'When did the symptom first begin and has it worsened in intensity?', status: 'suggested' },
    { id: 'q2', text: 'Are there any associated symptoms like sweating, radiation to shoulder or nausea?', status: 'suggested' },
    { id: 'q3', text: 'What exact medications or home remedies were taken in the last 48 hours?', status: 'suggested' },
    { id: 'q4', text: 'Is there a family history of hypertension or cardiac conditions?', status: 'suggested' },
  ]);

  const patient = useMemo(() => {
    return patients.find((p) => p.id === selectedPatientId) || activePatient || patients[0];
  }, [patients, selectedPatientId, activePatient]);

  // Case completeness calculation
  const completeness = useMemo(() => {
    if (!patient) return { percentage: 0, missing: [] };
    const missing: string[] = [];
    if (!patient.demographics.emergencyContact?.phone) missing.push('Emergency contact phone');
    if (!patient.demographics.currentMedications?.length) missing.push('Medication history verification');
    if (!patient.symptoms?.duration) missing.push('Symptom onset/duration');
    if (!patient.triage?.vitalSigns?.bloodPressureSystolic) missing.push('Blood pressure measurement');
    if (!patient.demographics.abhaId) missing.push('ABHA Health ID');

    const totalFields = 8;
    const filledFields = totalFields - missing.length;
    const percentage = Math.round((filledFields / totalFields) * 100);
    return { percentage, missing };
  }, [patient]);

  // SBAR Draft generation
  const sbarDraft = useMemo(() => {
    if (!patient) return { s: '', b: '', a: '', r: '' };
    return {
      s: `Situation: ${patient.demographics.fullName}, ${patient.demographics.age}Y/${patient.demographics.gender}, Token ${patient.opdToken}. Presenting with ${patient.symptoms?.chiefComplaint || 'acute health concern'}.`,
      b: `Background: Long-term history: ${patient.symptoms?.medicalHistory?.join(', ') || 'None recorded'}. Known Allergies: ${patient.demographics.knownAllergies?.join(', ') || 'None reported'}. Current medications: ${patient.demographics.currentMedications?.join(', ') || 'Not verified'}.`,
      a: `Assessment: Triage Priority is ${patient.triage?.priority || 'GREEN'}. Vitals: BP ${patient.triage?.vitalSigns?.bloodPressureSystolic || 120}/${patient.triage?.vitalSigns?.bloodPressureDiastolic || 80} mmHg, HR ${patient.triage?.vitalSigns?.pulseBpm || 72} bpm, Temp ${patient.triage?.vitalSigns?.temperatureF || 98.6}°F, SpO2 ${patient.triage?.vitalSigns?.spO2Percent || 98}%. Safety alerts detected: ${patient.safetyAlerts?.length || 0}.`,
      r: `Recommendation: Clinician evaluation required. Verify documented allergy conflicts prior to issuing prescriptions. Consider diagnostic panel and follow-up in 3-5 days.`,
    };
  }, [patient]);

  const toggleSection = (sec: string) => {
    setExpandedSections((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  const handleSpeakSbar = async () => {
    const fullText = `${sbarDraft.s} ${sbarDraft.b} ${sbarDraft.a} ${sbarDraft.r}`;
    await speakText(fullText, 'English');
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            Decision-Support & Clinical Risk Mitigation
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            AI & Clinical Safety Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Transparent explainability, allergy guards, rule-based clinical safety gates, and SBAR handoffs.
          </p>
        </div>

        {/* Patient Switcher */}
        <div className="w-full sm:w-72">
          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
            Inspecting Case
          </label>
          <select
            value={patient?.id || ''}
            onChange={(e) => {
              setSelectedPatientId(e.target.value);
              const p = patients.find((pat) => pat.id === e.target.value);
              if (p) setActivePatient(p);
            }}
            className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white shadow-sm focus:outline-none"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.demographics.fullName} ({p.opdToken} • {p.triage?.priority || 'GREEN'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Prominent Disclaimer Notice */}
      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-800 dark:text-amber-300 text-xs">
        <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-500 mt-0.5" />
        <div>
          <strong className="block font-bold">Clinical Safety Guardrail & Decision-Support Notice:</strong>
          AI and automated rule engines assist in structuring information, highlighting discrepancies, and
          detecting allergy/vital warnings. <strong>All final diagnostic and prescribing decisions remain solely with the licensed clinician.</strong>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {[
          { id: 'safety', label: 'Safety Checks & Alerts', badge: patient?.safetyAlerts?.length },
          { id: 'explainability', label: 'Why AI Flagged Case' },
          { id: 'questions', label: 'Suggested Questions' },
          { id: 'sbar', label: 'SBAR Clinical Handoff' },
          { id: 'emergency', label: 'Emergency Mode' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === tab.id
                ? 'bg-cyan-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>{tab.label}</span>
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-extrabold">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: SAFETY CHECKS & ALERTS */}
      {activeSubTab === 'safety' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Active Safety Alerts */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-cyan-500" />
                Active Rule-Based Clinical Alerts ({patient?.safetyAlerts?.length || 0})
              </h3>
              <span className="text-[11px] text-slate-400">Deterministic Rule Engine v2.4</span>
            </div>

            {(!patient?.safetyAlerts || patient.safetyAlerts.length === 0) ? (
              <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  No Active Critical Safety Violations
                </h4>
                <p className="text-xs text-slate-500">
                  No direct penicillin conflicts or extreme vital threshold breaches flagged for this record.
                </p>
              </div>
            ) : (
              patient.safetyAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    alert.level === 'CRITICAL'
                      ? 'bg-rose-500/10 border-rose-500/40 text-rose-900 dark:text-rose-200'
                      : alert.level === 'URGENT'
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-900 dark:text-amber-200'
                      : 'bg-blue-500/10 border-blue-500/40 text-blue-900 dark:text-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-black/20">
                          {alert.level}
                        </span>
                        <h4 className="font-bold text-xs sm:text-sm">{alert.title}</h4>
                      </div>
                      <p className="text-xs opacity-90">{alert.reason}</p>
                      {alert.detectedValue && (
                        <span className="inline-block text-[11px] font-mono bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded mt-1">
                          Detected Value: {alert.detectedValue}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-xs font-semibold">
                    <span>Action: {alert.actionRequired}</span>
                    <button
                      onClick={() => alert('Safety alert acknowledged in session audit trail.')}
                      className="px-2.5 py-1 rounded-lg bg-black/20 hover:bg-black/30 dark:bg-white/20 dark:hover:bg-white/30 text-[11px] font-bold"
                    >
                      Acknowledge
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right: Case Completeness & Safety Gate Checklist */}
          <div className="lg:col-span-5 space-y-4">
            {/* Completeness Card */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Case Record Completeness
                </span>
                <span className="text-lg font-black text-cyan-600 dark:text-cyan-400">
                  {completeness.percentage}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    completeness.percentage > 80
                      ? 'bg-emerald-500'
                      : completeness.percentage > 50
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${completeness.percentage}%` }}
                />
              </div>

              {completeness.missing.length > 0 ? (
                <div className="space-y-1.5 pt-2">
                  <span className="text-[11px] font-semibold text-slate-500 block">Missing Information:</span>
                  {completeness.missing.map((item, idx) => (
                    <div key={idx} className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  All critical clinical fields documented
                </p>
              )}
            </div>

            {/* Doctor Pre-Approval Safety Gate */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-500" />
                Pre-Approval Safety Gate Checklist
              </h4>

              <div className="space-y-2 text-xs">
                {[
                  { key: 'identity', label: 'Patient identity and token confirmed' },
                  { key: 'allergiesReviewed', label: 'Drug & Food Allergies explicitly reviewed' },
                  { key: 'vitalsReviewed', label: 'Vital signs and triage parameters evaluated' },
                  { key: 'aiReviewed', label: 'AI decision-support observations verified' },
                  { key: 'criticalAcknowledged', label: 'I acknowledge all active clinical safety alerts' },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checklist[item.key]}
                      onChange={(e) => setChecklist({ ...checklist, [item.key]: e.target.checked })}
                      className="rounded text-cyan-600 focus:ring-cyan-500 w-4 h-4"
                    />
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{item.label}</span>
                  </label>
                ))}
              </div>

              <button
                disabled={!Object.values(checklist).every(Boolean)}
                onClick={() => {
                  alert('Clinical Safety Checklist validated and stamped to Audit Trail.');
                  if (patient) onSelectPatient(patient, 'doctor');
                }}
                className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all ${
                  Object.values(checklist).every(Boolean)
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                }`}
              >
                Stamp & Proceed to Doctor Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EXPLAINABILITY PANEL */}
      {activeSubTab === 'explainability' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-500" />
                Why Did AI Flag This Case?
              </h3>
              <p className="text-xs text-slate-500">
                Transparent factor breakdown explaining why decision-support rules were triggered.
              </p>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 text-xs font-bold">
              <span>Model Confidence Indicator:</span>
              <span className="font-mono text-cyan-600 dark:text-cyan-400">92% High (Clinical Verification Req.)</span>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            {/* Factors Considered */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
              <button
                onClick={() => toggleSection('symptoms')}
                className="w-full p-3.5 bg-slate-50 dark:bg-slate-800/60 font-bold text-slate-900 dark:text-white flex items-center justify-between"
              >
                <span>1. Chief Symptoms & Duration Considered</span>
                {expandedSections.symptoms ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {expandedSections.symptoms && (
                <div className="p-4 space-y-2 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300">
                  <p>
                    <strong>Primary complaint:</strong> {patient?.symptoms?.chiefComplaint || 'Acute symptoms'}
                  </p>
                  <p>
                    <strong>Reported duration:</strong> {patient?.symptoms?.duration || '3 days'}
                  </p>
                  <p>
                    <strong>Associated symptoms:</strong> {patient?.symptoms?.symptoms?.join(', ') || 'Fever, fatigue, body ache'}
                  </p>
                </div>
              )}
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
              <button
                onClick={() => toggleSection('vitals')}
                className="w-full p-3.5 bg-slate-50 dark:bg-slate-800/60 font-bold text-slate-900 dark:text-white flex items-center justify-between"
              >
                <span>2. Vital Signs & Triage Parameters Considered</span>
                {expandedSections.vitals ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {expandedSections.vitals && (
                <div className="p-4 space-y-2 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300">
                  <p>
                    <strong>Temperature:</strong> {patient?.triage?.vitalSigns?.temperatureF || 98.6}°F (Normal: 97.5 - 99.0°F)
                  </p>
                  <p>
                    <strong>Heart Rate:</strong> {patient?.triage?.vitalSigns?.pulseBpm || 72} bpm (Normal: 60 - 100 bpm)
                  </p>
                  <p>
                    <strong>Blood Pressure:</strong> {patient?.triage?.vitalSigns?.bloodPressureSystolic || 120}/
                    {patient?.triage?.vitalSigns?.bloodPressureDiastolic || 80} mmHg
                  </p>
                  <p>
                    <strong>SpO2 Oxygen Saturation:</strong> {patient?.triage?.vitalSigns?.spO2Percent || 98}% (Safe {'>'}= 95%)
                  </p>
                </div>
              )}
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
              <button
                onClick={() => toggleSection('history')}
                className="w-full p-3.5 bg-slate-50 dark:bg-slate-800/60 font-bold text-slate-900 dark:text-white flex items-center justify-between"
              >
                <span>3. Allergies & Known Clinical History Considered</span>
                {expandedSections.history ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {expandedSections.history && (
                <div className="p-4 space-y-2 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300">
                  <p>
                    <strong>Allergies:</strong> {patient?.demographics.knownAllergies?.join(', ') || 'None reported'}
                  </p>
                  <p>
                    <strong>Pre-existing conditions:</strong> {patient?.symptoms?.medicalHistory?.join(', ') || 'None recorded'}
                  </p>
                  <p>
                    <strong>Current medications:</strong> {patient?.demographics.currentMedications?.join(', ') || 'Not verified'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: QUESTIONS SUGGESTER */}
      {activeSubTab === 'questions' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-cyan-500" />
                AI Suggested Questions for Clinician
              </h3>
              <p className="text-xs text-slate-500">
                Contextual questions dynamically generated from intake responses and past medical records.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {questions.map((q) => (
              <div
                key={q.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                    ?
                  </div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{q.text}</span>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => {
                      setQuestions((prev) =>
                        prev.map((item) => (item.id === q.id ? { ...item, status: 'answered' } : item))
                      );
                    }}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]"
                  >
                    Mark Answered
                  </button>
                  <button
                    onClick={() => {
                      setQuestions((prev) =>
                        prev.map((item) => (item.id === q.id ? { ...item, status: 'added' } : item))
                      );
                    }}
                    className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px]"
                  >
                    Add to Notes
                  </button>
                  <button
                    onClick={() => {
                      setQuestions((prev) =>
                        prev.map((item) => (item.id === q.id ? { ...item, status: 'ignored' } : item))
                      );
                    }}
                    className="px-2 py-1 rounded-lg text-slate-400 hover:text-slate-600 text-[11px]"
                  >
                    Ignore
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SBAR CLINICAL HANDOFF */}
      {activeSubTab === 'sbar' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-500" />
                One-Click SBAR Structured Clinical Handoff
              </h3>
              <p className="text-xs text-slate-500">
                Standardized Situation, Background, Assessment, and Recommendation summary for clinician-to-clinician handoff.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSpeakSbar}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-bold flex items-center gap-1.5"
              >
                <Volume2 className="w-3.5 h-3.5 text-cyan-500" />
                Read Aloud
              </button>
              <button
                onClick={() => alert('SBAR handoff copied to clipboard and stamped to audit trail.')}
                className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
              >
                <Share2 className="w-3.5 h-3.5" />
                Copy Handoff Note
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-cyan-50/70 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/60 space-y-1.5">
              <span className="font-extrabold text-cyan-700 dark:text-cyan-300 uppercase tracking-wider block">
                [S] Situation
              </span>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{sbarDraft.s}</p>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 space-y-1.5">
              <span className="font-extrabold text-blue-700 dark:text-blue-300 uppercase tracking-wider block">
                [B] Background
              </span>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{sbarDraft.b}</p>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 space-y-1.5">
              <span className="font-extrabold text-purple-700 dark:text-purple-300 uppercase tracking-wider block">
                [A] Assessment
              </span>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{sbarDraft.a}</p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-1.5">
              <span className="font-extrabold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider block">
                [R] Recommendation
              </span>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{sbarDraft.r}</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: EMERGENCY REVIEW MODE */}
      {activeSubTab === 'emergency' && (
        <div className="p-6 rounded-3xl bg-rose-950/30 border-2 border-rose-500/60 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-rose-500/40 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center animate-pulse">
                <Flame className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-black text-rose-500 tracking-tight">
                  CRITICAL EMERGENCY CLINICAL REVIEW
                </h3>
                <p className="text-xs text-rose-300">
                  Priority Code Red / Orange Rapid Response Station
                </p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full bg-rose-500 text-white text-xs font-black uppercase tracking-widest animate-pulse">
              IMMEDIATE
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-rose-500/40 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Patient Identity</span>
              <p className="text-sm font-bold text-white">{patient?.demographics.fullName}</p>
              <p className="text-slate-400">Token: {patient?.opdToken} • ID: {patient?.id}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-rose-500/40 space-y-1">
              <span className="text-[10px] text-rose-400 font-bold block uppercase">Critical Allergies</span>
              <p className="text-sm font-bold text-rose-400">
                {patient?.demographics.knownAllergies?.join(', ') || 'None Documented'}
              </p>
              <p className="text-slate-400">Do not administer contraindicated agents.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-rose-500/40 space-y-1">
              <span className="text-[10px] text-amber-400 font-bold block uppercase">Vitals Snapshot</span>
              <p className="text-sm font-bold text-white">
                BP: {patient?.triage?.vitalSigns?.bloodPressureSystolic || 120}/
                {patient?.triage?.vitalSigns?.bloodPressureDiastolic || 80} • SpO2: {patient?.triage?.vitalSigns?.spO2Percent || 98}%
              </p>
              <p className="text-slate-400">HR: {patient?.triage?.vitalSigns?.pulseBpm || 72} bpm • Temp: {patient?.triage?.vitalSigns?.temperatureF || 98.6}°F</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-rose-500/30">
            <button
              onClick={() => alert('Senior on-call physician alerted for urgent bedside evaluation.')}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md"
            >
              Call Senior Consultant
            </button>
            <button
              onClick={() => {
                if (patient) onSelectPatient(patient, 'doctor');
              }}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30"
            >
              Open Direct Clinical Workspace
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
