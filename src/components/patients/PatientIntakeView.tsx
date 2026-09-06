import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  Mic,
  Save,
  ArrowRight,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  User,
  Heart,
  Calendar,
  Globe,
  Plus,
  X,
} from 'lucide-react';
import { usePatients } from '../../context/PatientContext';
import { Patient, SymptomRecord } from '../../types';
import { VoiceInputButton } from '../common/VoiceInputButton';
import { useLanguage } from '../../context/LanguageContext';

interface Props {
  onNavigateTab: (tab: string) => void;
  onSelectPatient: (patient: Patient, tab?: string) => void;
}

const COMMON_SYMPTOMS = [
  'Chest Pain',
  'Shortness of Breath (Dyspnea)',
  'Fever with Chills',
  'Dry Cough',
  'Productive Cough',
  'Headache',
  'Dizziness / Vertigo',
  'Nausea & Vomiting',
  'Abdominal Pain',
  'Diarrhea',
  'Joint Pain',
  'Body Ache / Myalgia',
  'Skin Rash / Pruritus',
  'Generalized Fatigue',
];

export const PatientIntakeView: React.FC<Props> = ({ onNavigateTab, onSelectPatient }) => {
  const { patients, activePatient, setActivePatient, updatePatientIntake } = usePatients();
  const { languageName, setLanguage } = useLanguage();

  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [customSymptom, setCustomSymptom] = useState('');
  const [duration, setDuration] = useState('2 days');
  const [severity, setSeverity] = useState<'Mild' | 'Moderate' | 'Severe' | 'Critical'>('Moderate');
  const [intakeNotes, setIntakeNotes] = useState('');
  const language = languageName;
  const [smoking, setSmoking] = useState(false);
  const [alcohol, setAlcohol] = useState(false);
  const [diet, setDiet] = useState<'Vegetarian' | 'Non-Vegetarian' | 'Vegan' | 'Other'>('Vegetarian');
  const [activity, setActivity] = useState<'Sedentary' | 'Moderate' | 'Active'>('Moderate');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (activePatient) {
      setSelectedPatientId(activePatient.id);
      if (activePatient.symptoms) {
        const s = activePatient.symptoms;
        setChiefComplaint(s.chiefComplaint || '');
        setSymptoms(s.symptoms || []);
        setDuration(s.duration || '2 days');
        setSeverity(s.severity || 'Moderate');
        setIntakeNotes(s.intakeNotes || '');
        if (s.lifestyle) {
          setSmoking(Boolean(s.lifestyle.smoking));
          setAlcohol(Boolean(s.lifestyle.alcohol));
          setDiet(s.lifestyle.diet || 'Vegetarian');
          setActivity(s.lifestyle.physicalActivity || 'Moderate');
        }
      }
    } else if (patients.length > 0) {
      setSelectedPatientId(patients[0].id);
      setActivePatient(patients[0]);
    }
  }, [activePatient, patients, setActivePatient]);

  const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedPatientId(id);
    const found = patients.find((p) => p.id === id);
    if (found) {
      setActivePatient(found);
      if (found.symptoms) {
        setChiefComplaint(found.symptoms.chiefComplaint || '');
        setSymptoms(found.symptoms.symptoms || []);
        setDuration(found.symptoms.duration || '2 days');
        setSeverity(found.symptoms.severity || 'Moderate');
        setIntakeNotes(found.symptoms.intakeNotes || '');
      } else {
        setChiefComplaint('');
        setSymptoms([]);
        setIntakeNotes('');
      }
    }
  };

  const toggleSymptom = (sym: string) => {
    setSymptoms((prev) => (prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]));
  };

  const addCustomSymptom = () => {
    if (customSymptom.trim() && !symptoms.includes(customSymptom.trim())) {
      setSymptoms((prev) => [...prev, customSymptom.trim()]);
      setCustomSymptom('');
    }
  };

  const handleVoiceChiefComplaint = (transcript: string) => {
    setChiefComplaint((prev) => (prev ? `${prev}. ${transcript}` : transcript));
  };

  const handleVoiceNotes = (transcript: string) => {
    setIntakeNotes((prev) => (prev ? `${prev}\n${transcript}` : transcript));
  };

  const handleSaveIntake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) return alert('Select a patient');
    if (!chiefComplaint.trim()) return alert('Chief complaint is required');

    try {
      setIsSaving(true);
      const currentPatient = patients.find((p) => p.id === selectedPatientId);
      const intakeRecord: SymptomRecord = {
        chiefComplaint: chiefComplaint.trim(),
        symptoms,
        duration,
        severity,
        medicalHistory: currentPatient?.demographics.existingConditions || [],
        medicationHistory: currentPatient?.demographics.currentMedications || [],
        knownAllergies: currentPatient?.demographics.knownAllergies || [],
        lifestyle: {
          smoking,
          alcohol,
          diet,
          physicalActivity: activity,
        },
        intakeNotes: intakeNotes.trim(),
        inputMethod: 'Assisted',
        languageUsed: language,
        recordedAt: new Date().toISOString(),
      };

      const updated = await updatePatientIntake(selectedPatientId, intakeRecord);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Error saving intake');
    } finally {
      setIsSaving(false);
    }
  };

  const currentPatient = patients.find((p) => p.id === selectedPatientId);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-sky-600" />
            Patient Clinical Intake & Symptoms Capture
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Voice-enabled multi-lingual case intake for kiosk and health worker assistance
          </p>
        </div>

        {/* Patient Selection Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 whitespace-nowrap">Active Patient:</label>
          <select
            value={selectedPatientId}
            onChange={handlePatientChange}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.opdToken} - {p.demographics.fullName} ({p.demographics.age}Y)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Patient Header Banner */}
      {currentPatient && (
        <div className="p-4 rounded-2xl bg-sky-50/70 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/50 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold">
              {currentPatient.demographics.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {currentPatient.demographics.fullName}
                </span>
                <span className="font-mono text-xs font-bold text-sky-700 dark:text-sky-300">
                  {currentPatient.opdToken}
                </span>
              </div>
              <div className="text-slate-500 dark:text-slate-400">
                {currentPatient.demographics.age} Y • {currentPatient.demographics.gender} • Ph: {currentPatient.demographics.phone}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentPatient.demographics.knownAllergies?.length > 0 && (
              <div className="px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-semibold text-[11px]">
                Allergies: {currentPatient.demographics.knownAllergies.join(', ')}
              </div>
            )}
            <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
              Status: {currentPatient.status}
            </span>
          </div>
        </div>
      )}

      {/* Intake Form */}
      <form onSubmit={handleSaveIntake} className="space-y-6">
        {/* Language selector & Voice Bar */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            <Globe className="w-4 h-4 text-sky-500" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">Intake Language:</span>
            <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 text-xs">
              {(['English', 'Hindi', 'Marathi'] as const).map((l) => (
                <button
                  type="button"
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                    language === l
                      ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {l === 'Hindi' ? 'हिंदी' : l === 'Marathi' ? 'मराठी' : 'English'}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span>Voice dictation enabled</span>
          </div>
        </div>

        {/* Chief Complaint */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Chief Complaint <span className="text-rose-500">*</span>
            </label>
            <VoiceInputButton
              language={language}
              label="Dictate Chief Complaint"
              onTranscript={handleVoiceChiefComplaint}
            />
          </div>

          <textarea
            rows={2}
            required
            placeholder="e.g. Severe chest pain with sweating radiating to left arm for past 2 hours"
            value={chiefComplaint}
            onChange={(e) => setChiefComplaint(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Duration of Current Problem
              </label>
              <input
                type="text"
                placeholder="e.g. 2 hours, 3 days, 1 week"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Perceived Severity
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500"
              >
                <option value="Mild">Mild</option>
                <option value="Moderate">Moderate</option>
                <option value="Severe">Severe</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Symptoms Multi-Selector */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">
              Associated Key Symptoms
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select all reported symptoms to assist triage prioritization and differential analysis
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {COMMON_SYMPTOMS.map((sym) => {
              const isSelected = symptoms.includes(sym);
              return (
                <button
                  key={sym}
                  type="button"
                  onClick={() => toggleSymptom(sym)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    isSelected
                      ? 'bg-sky-500 text-white border-sky-500 shadow-xs font-semibold'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-sky-300'
                  }`}
                >
                  {sym}
                </button>
              );
            })}
          </div>

          {/* Add custom symptom */}
          <div className="flex items-center gap-2 max-w-sm pt-2">
            <input
              type="text"
              placeholder="Add other symptom..."
              value={customSymptom}
              onChange={(e) => setCustomSymptom(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCustomSymptom();
                }
              }}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <button
              type="button"
              onClick={addCustomSymptom}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200"
            >
              Add
            </button>
          </div>
        </div>

        {/* Lifestyle & Clinical Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Lifestyle */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500" />
              Lifestyle & Habits
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-700 dark:text-slate-300">Tobacco / Smoking:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSmoking(true)}
                    className={`px-3 py-1 rounded-lg font-semibold ${
                      smoking ? 'bg-rose-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setSmoking(false)}
                    className={`px-3 py-1 rounded-lg font-semibold ${
                      !smoking ? 'bg-slate-300 dark:bg-slate-700 text-slate-900 dark:text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-700 dark:text-slate-300">Alcohol Consumption:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAlcohol(true)}
                    className={`px-3 py-1 rounded-lg font-semibold ${
                      alcohol ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setAlcohol(false)}
                    className={`px-3 py-1 rounded-lg font-semibold ${
                      !alcohol ? 'bg-slate-300 dark:bg-slate-700 text-slate-900 dark:text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-700 dark:text-slate-300">Dietary Pattern:</span>
                <select
                  value={diet}
                  onChange={(e) => setDiet(e.target.value as any)}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                >
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Non-Vegetarian">Non-Vegetarian</option>
                  <option value="Vegan">Vegan</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-700 dark:text-slate-300">Physical Activity:</span>
                <select
                  value={activity}
                  onChange={(e) => setActivity(e.target.value as any)}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                >
                  <option value="Sedentary">Sedentary</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Active">Active</option>
                </select>
              </div>
            </div>
          </div>

          {/* Additional Notes & Dictation */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Intake Narrative & Context
              </label>
              <VoiceInputButton
                language={language}
                label="Dictate Details"
                onTranscript={handleVoiceNotes}
              />
            </div>

            <textarea
              rows={5}
              placeholder="Additional patient observations, previous self-medications, family history..."
              value={intakeNotes}
              onChange={(e) => setIntakeNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Submit Bar */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div>
            {savedSuccess && (
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" /> Intake saved to case profile and audit trail!
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving Intake...' : 'Save Case Intake'}
            </button>

            {currentPatient && (
              <button
                type="button"
                onClick={() => onNavigateTab('triage')}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
              >
                <span>Proceed to Nurse Triage</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
