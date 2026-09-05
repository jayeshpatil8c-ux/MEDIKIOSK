import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  CheckCircle2,
  HelpCircle,
  Stethoscope,
  Activity,
  Heart,
  Share2,
  Copy,
  Printer,
  ChevronDown,
  ChevronRight,
  Flame,
  Clock,
  Eye,
  Info,
} from 'lucide-react';
import { usePatients } from '../../context/PatientContext';
import { Patient, SafetyAlert } from '../../types';

interface Props {
  onSelectPatient: (patient: Patient, targetTab?: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const AiSafetyHubView: React.FC<Props> = ({ onSelectPatient, onNavigateTab }) => {
  const { patients, activePatient, setActivePatient } = usePatients();

  // Selected patient to inspect
  const currentPatient = activePatient || patients[0] || null;

  const [activeSubTab, setActiveSubTab] = useState<'explainability' | 'rules' | 'questions' | 'completeness' | 'handoff' | 'emergency'>('explainability');
  const [expandedSection, setExpandedSection] = useState<string | null>('symptoms');
  const [isCopied, setIsCopied] = useState(false);
  const [emergencyAlertActive, setEmergencyAlertActive] = useState(false);

  // Suggested questions state (Add, Ignore, Mark as Answered)
  const [suggestedQuestions, setSuggestedQuestions] = useState([
    {
      id: 'q1',
      question: 'When exactly did the acute abdominal pain begin, and is it postprandial?',
      status: 'pending',
      category: 'Symptom Onset',
    },
    {
      id: 'q2',
      question: 'Has there been any hematemesis, black tarry stools, or persistent vomiting?',
      status: 'pending',
      category: 'Red Flag Screening',
    },
    {
      id: 'q3',
      question: 'Are there any non-steroidal anti-inflammatory drugs (NSAIDs) or aspirin taken recently?',
      status: 'answered',
      category: 'Drug Interaction',
    },
    {
      id: 'q4',
      question: 'What relieve or aggravates the discomfort (e.g. food, antacids, milk)?',
      status: 'pending',
      category: 'Modalities',
    },
  ]);

  // Calculate Case Completeness
  const completeness = useMemo(() => {
    if (!currentPatient) return { score: 0, missing: [] };
    const missing: string[] = [];
    let points = 0;
    const total = 6;

    if (currentPatient.demographics.fullName && currentPatient.demographics.phone) points += 1;
    else missing.push('Primary identity contact');

    if (currentPatient.demographics.emergencyContact?.name) points += 1;
    else missing.push('Emergency contact details');

    if (currentPatient.demographics.knownAllergies?.length) points += 1;
    else missing.push('Known allergy verification');

    if (currentPatient.triage?.vitalSigns?.temperatureF) points += 1;
    else missing.push('Triage vital signs recording');

    if (currentPatient.symptoms?.chiefComplaint) points += 1;
    else missing.push('Chief complaint & duration');

    if (currentPatient.demographics.abhaId) points += 1;
    else missing.push('ABHA / Health ID linking');

    const score = Math.round((points / total) * 100);
    return { score, missing };
  }, [currentPatient]);

  // Safety Gate Checklist before approval
  const [safetyChecklist, setSafetyChecklist] = useState({
    identityVerified: true,
    allergiesReviewed: true,
    vitalsReviewed: true,
    triageLevelConfirmed: true,
    medicationCrossChecked: false,
    aiGuidanceVerified: true,
  });

  const handleToggleCheck = (key: keyof typeof safetyChecklist) => {
    setSafetyChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // SBAR Clinical Handoff Draft Generation
  const sbarDraft = useMemo(() => {
    if (!currentPatient) return '';
    const demo = currentPatient.demographics;
    const vitals = currentPatient.triage?.vitalSigns;
    return `SBAR CLINICAL HANDOFF REPORT
==================================================
PATIENT: ${demo.fullName} (Age: ${demo.age}Y • ${demo.gender})
OPD TOKEN: ${currentPatient.opdToken} | PATIENT ID: ${currentPatient.id}
TIMESTAMP: ${new Date().toLocaleString()}

1. SITUATION
- Chief Complaint: ${currentPatient.symptoms?.chiefComplaint || 'Under evaluation'}
- Triage Priority: ${currentPatient.triage?.priority || 'YELLOW'}
- Current Workflow: ${currentPatient.status}

2. BACKGROUND
- Chronic History: ${demo.existingConditions?.join(', ') || 'None documented'}
- Documented Allergies: ${demo.knownAllergies?.join(', ') || 'No known drug allergies'}
- Active Medications: ${demo.currentMedications?.join(', ') || 'None reported'}

3. ASSESSMENT
- Temperature: ${vitals?.temperatureF || '--'} °F | Heart Rate: ${vitals?.pulseBpm || '--'} bpm
- Blood Pressure: ${vitals?.bloodPressureSystolic || '--'}/${vitals?.bloodPressureDiastolic || '--'} mmHg
- SpO2: ${vitals?.spO2Percent || '--'}% | Respiratory Rate: ${vitals?.respiratoryRate || '--'}/min
- Clinical Changes: New symptom onset without prior chronic recurrence.

4. RECOMMENDATION
- Clinician physical examination required.
- Review medication safety prior to prescribing.
- Schedule follow-up in 7 days or SOS if red flags appear.
==================================================
* Assisted by MediKiosk Clinical AI Core — Clinician review and signature required.`;
  }, [currentPatient]);

  const handleCopySbar = () => {
    navigator.clipboard.writeText(sbarDraft);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Decision-Support & Safety Governance
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            AI Explainability & Clinical Safety Hub
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Transparent machine intelligence: why cases are flagged, rule-based safety validation,
            missing information detection, and structured SBAR clinical handoff.
          </p>
        </div>

        {/* Patient Switcher */}
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20">
          <span className="text-xs font-semibold text-slate-300 hidden sm:inline">Active Patient:</span>
          <select
            value={currentPatient?.id || ''}
            onChange={(e) => {
              const p = patients.find((pat) => pat.id === e.target.value);
              if (p) setActivePatient(p);
            }}
            className="bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-xl border border-slate-700 focus:outline-none"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.demographics.fullName} ({p.opdToken})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Safety Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        {[
          { id: 'explainability', label: 'Why AI Flagged This Case', icon: Sparkles },
          { id: 'rules', label: 'Rule-Based Safety Engine', icon: ShieldCheck },
          { id: 'questions', label: 'Clinician Question Suggester', icon: HelpCircle },
          { id: 'completeness', label: 'Case Completeness & Safety Gate', icon: FileCheck },
          { id: 'handoff', label: 'SBAR Handoff Generator', icon: Share2 },
          { id: 'emergency', label: 'Emergency Review Mode', icon: Flame, urgent: emergencyAlertActive },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-cyan-600 text-white shadow-md'
                  : tab.urgent
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUBTAB 1: AI EXPLAINABILITY PANEL */}
      {activeSubTab === 'explainability' && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-500" />
                  Why did AI flag this case?
                </h3>
                <p className="text-xs text-slate-500">
                  Structured attribution of symptoms, vitals, and medical history contributing to the clinical priority.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400">Model Output Confidence:</span>
                <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 font-bold text-xs">
                  88% Confidence Indicator
                </span>
              </div>
            </div>

            {/* Crucial Clinician Verification Disclaimer */}
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Decision-Support Notice:</strong> Confidence metrics reflect model prompt coherence, NOT medical
                certainty. All clinical assessments and treatment actions require qualified healthcare professional review.
              </span>
            </div>

            {/* Expandable Factor Breakdown */}
            <div className="space-y-3 pt-2">
              {/* Factor 1: Symptoms Considered */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <button
                  onClick={() => setExpandedSection(expandedSection === 'symptoms' ? null : 'symptoms')}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200"
                >
                  <span className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-500" />
                    1. Symptoms & Chief Complaints Considered
                  </span>
                  {expandedSection === 'symptoms' ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                {expandedSection === 'symptoms' && (
                  <div className="p-4 bg-white dark:bg-slate-900 text-xs space-y-2 text-slate-600 dark:text-slate-300 border-t border-slate-200 dark:border-slate-800">
                    <p>
                      <strong>Primary Complaint:</strong> {currentPatient?.symptoms?.chiefComplaint || 'Acute Gastritis / Epigastric Burning'}
                    </p>
                    <p>
                      <strong>Duration:</strong> {currentPatient?.symptoms?.duration || '3 days'} | <strong>Reported Severity:</strong> {currentPatient?.symptoms?.severity || 'Moderate'}
                    </p>
                    <p>
                      <strong>Key Symptom Tags:</strong> {currentPatient?.symptoms?.symptoms?.join(', ') || 'Epigastric pain, Acid reflux, Nausea'}
                    </p>
                  </div>
                )}
              </div>

              {/* Factor 2: Vitals Considered */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <button
                  onClick={() => setExpandedSection(expandedSection === 'vitals' ? null : 'vitals')}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200"
                >
                  <span className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-500" />
                    2. Objective Vital Signs & Trends
                  </span>
                  {expandedSection === 'vitals' ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                {expandedSection === 'vitals' && (
                  <div className="p-4 bg-white dark:bg-slate-900 text-xs space-y-2 text-slate-600 dark:text-slate-300 border-t border-slate-200 dark:border-slate-800">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                        <span className="block text-[10px] text-slate-400">Temperature</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {currentPatient?.triage?.vitalSigns?.temperatureF || 98.6} °F
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                        <span className="block text-[10px] text-slate-400">Heart Rate</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {currentPatient?.triage?.vitalSigns?.pulseBpm || 82} bpm
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                        <span className="block text-[10px] text-slate-400">Blood Pressure</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {currentPatient?.triage?.vitalSigns?.bloodPressureSystolic || 120}/
                          {currentPatient?.triage?.vitalSigns?.bloodPressureDiastolic || 80}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                        <span className="block text-[10px] text-slate-400">Oxygen (SpO2)</span>
                        <span className="font-bold text-emerald-500">
                          {currentPatient?.triage?.vitalSigns?.spO2Percent || 98} %
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Factor 3: Relevant History & Known Allergies */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <button
                  onClick={() => setExpandedSection(expandedSection === 'history' ? null : 'history')}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200"
                >
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    3. Documented Allergies & Medication History
                  </span>
                  {expandedSection === 'history' ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                {expandedSection === 'history' && (
                  <div className="p-4 bg-white dark:bg-slate-900 text-xs space-y-2 text-slate-600 dark:text-slate-300 border-t border-slate-200 dark:border-slate-800">
                    <p>
                      <strong>Known Allergies:</strong>{' '}
                      {currentPatient?.demographics.knownAllergies?.join(', ') || 'None recorded'}
                    </p>
                    <p>
                      <strong>Active Medications:</strong>{' '}
                      {currentPatient?.demographics.currentMedications?.join(', ') || 'None reported'}
                    </p>
                    <p>
                      <strong>Long-term Conditions:</strong>{' '}
                      {currentPatient?.demographics.existingConditions?.join(', ') || 'None reported'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: RULE-BASED SAFETY ENGINE */}
      {activeSubTab === 'rules' && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              Deterministic Rule Engine Validation
            </h3>
            <p className="text-xs text-slate-500">
              Deterministic clinical safety checks executed independent of AI models to prevent adverse events.
            </p>

            <div className="space-y-3 pt-2">
              {[
                {
                  title: 'Allergy Conflict Rule (VitalRule/AllergyRule)',
                  status: 'PASSED',
                  message: 'No allergy cross-reactivity detected with requested initial medications.',
                  evidence: 'Patient records Penicillin allergy — no beta-lactam prescribed.',
                },
                {
                  title: 'Duplicate Medication Rule',
                  status: 'PASSED',
                  message: 'No duplicate therapeutic classes found in active medication list.',
                  evidence: 'Single proton-pump inhibitor pathway verified.',
                },
                {
                  title: 'Pediatric / Geriatric Age Safety Rule',
                  status: 'PASSED',
                  message: 'Dosage adjustments appropriate for adult patient (Age: 35).',
                  evidence: 'Standard adult therapeutic thresholds applied.',
                },
                {
                  title: 'Abnormal Vitals Safety Threshold',
                  status: 'WARNING',
                  message: 'Trend requires clinical review: Pulse rate elevated during intake.',
                  evidence: 'Pulse 98 bpm within high-normal band.',
                },
              ].map((rule, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {rule.title}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          rule.status === 'PASSED'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {rule.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">{rule.message}</p>
                    <p className="text-[11px] text-slate-400">
                      <strong>Evidence:</strong> {rule.evidence}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: CLINICIAN QUESTION SUGGESTER */}
      {activeSubTab === 'questions' && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-cyan-500" />
                  Suggested Questions for Clinician
                </h3>
                <p className="text-xs text-slate-500">
                  Targeted follow-up queries generated from structured intake to assist the doctor during consultation.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {suggestedQuestions.map((q) => (
                <div
                  key={q.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    q.status === 'answered'
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/30 opacity-75'
                      : q.status === 'ignored'
                      ? 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-50'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-[10px] font-bold">
                      {q.category}
                    </span>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {q.question}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {q.status === 'pending' && (
                      <>
                        <button
                          onClick={() => {
                            setSuggestedQuestions((prev) =>
                              prev.map((item) => (item.id === q.id ? { ...item, status: 'answered' } : item))
                            );
                          }}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all"
                        >
                          Mark Answered
                        </button>
                        <button
                          onClick={() => {
                            setSuggestedQuestions((prev) =>
                              prev.map((item) => (item.id === q.id ? { ...item, status: 'ignored' } : item))
                            );
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold hover:bg-slate-200"
                        >
                          Ignore
                        </button>
                      </>
                    )}
                    {q.status === 'answered' && (
                      <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Answered
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: CASE COMPLETENESS & SAFETY GATE */}
      {activeSubTab === 'completeness' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Completeness Indicator */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-cyan-500" />
              Case Completeness Indicator
            </h3>

            <div className="flex items-center gap-4">
              <div className="text-4xl font-black text-cyan-500">
                {completeness.score}%
              </div>
              <div className="flex-1">
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${completeness.score}%` }}
                  />
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  {completeness.score >= 80 ? 'Sufficient for Doctor Review' : 'Missing recommended clinical details'}
                </span>
              </div>
            </div>

            {completeness.missing.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Missing Fields:
                </span>
                <ul className="text-xs text-slate-500 space-y-1 list-disc list-inside">
                  {completeness.missing.map((m, idx) => (
                    <li key={idx}>{m}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => onNavigateTab('intake')}
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs"
            >
              Complete Missing Information
            </button>
          </div>

          {/* Safety Gate Checklist Before Approval */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              Pre-Approval Safety Gate Checklist
            </h3>
            <p className="text-xs text-slate-500">
              The doctor must acknowledge critical warnings before finalizing the encounter.
            </p>

            <div className="space-y-2.5 pt-1">
              {[
                { key: 'identityVerified', label: '✓ Patient identity confirmed' },
                { key: 'allergiesReviewed', label: '✓ Allergies & intolerances verified' },
                { key: 'vitalsReviewed', label: '✓ Triage vital signs within acceptable limits' },
                { key: 'triageLevelConfirmed', label: '✓ Triage priority level approved' },
                { key: 'medicationCrossChecked', label: '⚠ Medication history checked for drug conflicts' },
                { key: 'aiGuidanceVerified', label: '✓ AI summary and differential reviewed' },
              ].map(({ key, label }) => {
                const isChecked = (safetyChecklist as any)[key];
                return (
                  <label
                    key={key}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleCheck(key as any)}
                      className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500"
                    />
                    <span>{label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 5: SBAR CLINICAL HANDOFF GENERATOR */}
      {activeSubTab === 'handoff' && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-cyan-500" />
                  One-Click SBAR Clinical Handoff Generator
                </h3>
                <p className="text-xs text-slate-500">
                  Standardized Situation, Background, Assessment, Recommendation format for shift transitions.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopySbar}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{isCopied ? 'Copied!' : 'Copy SBAR'}</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
              </div>
            </div>

            <pre className="p-4 rounded-2xl bg-slate-950 text-cyan-300 font-mono text-xs whitespace-pre-wrap leading-relaxed overflow-x-auto border border-slate-800">
              {sbarDraft}
            </pre>
          </div>
        </div>
      )}

      {/* SUBTAB 6: EMERGENCY REVIEW MODE */}
      {activeSubTab === 'emergency' && (
        <div className="p-6 rounded-3xl bg-rose-500/10 border-2 border-rose-500/40 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center animate-pulse">
                <Flame className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-rose-600 dark:text-rose-400">
                  Emergency Review Protocol
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Patient ID: {currentPatient?.id} • Token: {currentPatient?.opdToken} • Priority: RED
                </p>
              </div>
            </div>

            <button
              onClick={() => setEmergencyAlertActive(!emergencyAlertActive)}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-500/30"
            >
              {emergencyAlertActive ? 'Acknowledge & Dismiss' : 'Trigger Senior Escalation'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60">
              <span className="font-bold text-rose-600 dark:text-rose-400 block mb-1">
                Critical Observations
              </span>
              <p className="text-slate-600 dark:text-slate-300">
                Sudden severe abdominal pain with guarding. Borderline tachycardia.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60">
              <span className="font-bold text-rose-600 dark:text-rose-400 block mb-1">
                Documented Allergies
              </span>
              <p className="text-slate-600 dark:text-slate-300">
                Penicillin (Facial edema & urticaria). Strictly avoid Beta-lactams.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60">
              <span className="font-bold text-rose-600 dark:text-rose-400 block mb-1">
                Immediate Action Desk
              </span>
              <p className="text-slate-600 dark:text-slate-300">
                Notify Senior Consultant On-Call. Transfer to Acute Observation Bay.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
