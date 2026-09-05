import React, { useState } from 'react';
import {
  Heart,
  AlertTriangle,
  Plus,
  Trash2,
  Clock,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Pill,
  ShieldAlert,
} from 'lucide-react';
import { VoiceLanguage } from '../../../utils/speechHelper';

interface Props {
  chronicConditions: string[];
  setChronicConditions: (conditions: string[]) => void;
  pastSurgery: 'No' | 'Yes';
  setPastSurgery: (val: 'No' | 'Yes') => void;
  pastSurgeryDetails: string;
  setPastSurgeryDetails: (details: string) => void;
  pastSurgeriesList: { procedure: string; year: string }[];
  setPastSurgeriesList: (list: { procedure: string; year: string }[]) => void;
  hasAllergies: 'No' | 'Yes';
  setHasAllergies: (val: 'No' | 'Yes') => void;
  knownAllergies: string;
  setKnownAllergies: (allergies: string) => void;
  allergySeverity: 'Mild' | 'Moderate' | 'Severe / Anaphylaxis';
  setAllergySeverity: (sev: 'Mild' | 'Moderate' | 'Severe / Anaphylaxis') => void;
  currentMedications: string;
  setCurrentMedications: (meds: string) => void;
  familyHistory: string[];
  setFamilyHistory: (fam: string[]) => void;
  selectedLanguage: VoiceLanguage;
  onBack: () => void;
  onContinue: () => void;
}

export const MedicalHistoryStep: React.FC<Props> = ({
  chronicConditions,
  setChronicConditions,
  pastSurgery,
  setPastSurgery,
  pastSurgeryDetails,
  setPastSurgeryDetails,
  pastSurgeriesList,
  setPastSurgeriesList,
  hasAllergies,
  setHasAllergies,
  knownAllergies,
  setKnownAllergies,
  allergySeverity,
  setAllergySeverity,
  currentMedications,
  setCurrentMedications,
  familyHistory,
  setFamilyHistory,
  onBack,
  onContinue,
}) => {
  const [newSurgeryProcedure, setNewSurgeryProcedure] = useState('');
  const [newSurgeryYear, setNewSurgeryYear] = useState('2020');

  const commonConditions = [
    'Type 2 Diabetes',
    'Hypertension',
    'Hypothyroidism',
    'Asthma / Bronchitis',
    'GERD / Acid Reflux',
    'Irritable Bowel Syndrome',
    'Ischemic Heart Disease',
    'Chronic Kidney Disease',
  ];

  const commonAllergies = ['Penicillin', 'Sulfa Drugs', 'NSAIDs / Aspirin', 'Paracetamol', 'Peanuts', 'Lactose / Milk', 'Dust / Pollen'];

  const commonFamilyHistory = ['Diabetes', 'Hypertension', 'Cardiovascular Disease', 'Thyroid Disorder', 'Asthma', 'Cancer'];

  const toggleCondition = (condition: string) => {
    if (chronicConditions.includes(condition)) {
      setChronicConditions(chronicConditions.filter((c) => c !== condition));
    } else {
      setChronicConditions([...chronicConditions, condition]);
    }
  };

  const toggleFamilyHistory = (item: string) => {
    if (familyHistory.includes(item)) {
      setFamilyHistory(familyHistory.filter((f) => f !== item));
    } else {
      setFamilyHistory([...familyHistory, item]);
    }
  };

  const handleAddSurgery = () => {
    if (!newSurgeryProcedure.trim()) return;
    setPastSurgeriesList([...pastSurgeriesList, { procedure: newSurgeryProcedure.trim(), year: newSurgeryYear }]);
    setNewSurgeryProcedure('');
  };

  const handleRemoveSurgery = (index: number) => {
    setPastSurgeriesList(pastSurgeriesList.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Heart className="w-3.5 h-3.5" />
            Step 6 of 10 • Past Medical History & Safety
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Medical History, Allergies & Prescriptions
          </h2>
          <p className="text-xs text-slate-500">
            Helps the clinical team verify drug safety, contraindications, and previous interventions.
          </p>
        </div>
      </div>

      {/* Allergies & Red Flag Alert */}
      <div className="p-5 rounded-3xl bg-rose-500/10 border border-rose-500/30 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-extrabold text-sm text-rose-900 dark:text-rose-300">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>Known Drug & Food Allergies</span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setHasAllergies('No')}
              className={`px-3 py-1 rounded-xl text-xs font-bold ${
                hasAllergies === 'No'
                  ? 'bg-slate-700 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              No Known Allergies
            </button>
            <button
              type="button"
              onClick={() => setHasAllergies('Yes')}
              className={`px-3 py-1 rounded-xl text-xs font-bold ${
                hasAllergies === 'Yes'
                  ? 'bg-rose-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              Yes, I have Allergies
            </button>
          </div>
        </div>

        {hasAllergies === 'Yes' && (
          <div className="space-y-3 pt-2 text-xs">
            <div>
              <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                Select or type known allergenic substances:
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {commonAllergies.map((all) => (
                  <button
                    key={all}
                    type="button"
                    onClick={() => {
                      const list = knownAllergies ? knownAllergies.split(',').map((s) => s.trim()) : [];
                      if (!list.includes(all)) {
                        setKnownAllergies(list.concat(all).join(', '));
                      }
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold hover:border-rose-400"
                  >
                    + {all}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="e.g. Penicillin, NSAIDs, Peanuts"
                value={knownAllergies}
                onChange={(e) => setKnownAllergies(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-rose-300 dark:border-rose-900 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                Allergy Severity
              </label>
              <div className="flex gap-2">
                {(['Mild', 'Moderate', 'Severe / Anaphylaxis'] as const).map((sev) => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setAllergySeverity(sev)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs ${
                      allergySeverity === sev
                        ? 'bg-rose-600 text-white'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chronic Pre-existing Conditions */}
      <div className="space-y-2 text-xs">
        <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Pre-existing Medical Conditions
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {commonConditions.map((cond) => {
            const isSelected = chronicConditions.includes(cond);
            return (
              <button
                key={cond}
                type="button"
                onClick={() => toggleCondition(cond)}
                className={`p-3 rounded-2xl border text-left font-bold text-xs transition-all ${
                  isSelected
                    ? 'border-cyan-500 bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                }`}
              >
                <span>{isSelected ? '✓ ' : '+ '}</span>
                <span>{cond}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Past Surgeries and Interactive Timeline Preview */}
      <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
        <div className="flex items-center justify-between">
          <label className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-500" />
            Past Surgeries & Clinical Timeline
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPastSurgery('No')}
              className={`px-3 py-1 rounded-xl text-xs font-bold ${
                pastSurgery === 'No'
                  ? 'bg-slate-700 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              No Surgeries
            </button>
            <button
              type="button"
              onClick={() => setPastSurgery('Yes')}
              className={`px-3 py-1 rounded-xl text-xs font-bold ${
                pastSurgery === 'Yes'
                  ? 'bg-cyan-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              Yes, Past Surgeries
            </button>
          </div>
        </div>

        {pastSurgery === 'Yes' && (
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="e.g. Laparoscopic Cholecystectomy (Gallbladder)"
                value={newSurgeryProcedure}
                onChange={(e) => setNewSurgeryProcedure(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
              />
              <input
                type="number"
                min="1950"
                max="2026"
                placeholder="Year"
                value={newSurgeryYear}
                onChange={(e) => setNewSurgeryYear(e.target.value)}
                className="w-24 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddSurgery}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center justify-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add Event</span>
              </button>
            </div>

            {/* Interactive Timeline Preview */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Recorded Medical Events Timeline
              </span>
              {pastSurgeriesList.length === 0 ? (
                <p className="text-slate-400 italic">No surgical events added yet.</p>
              ) : (
                <div className="relative pl-6 border-l-2 border-cyan-500/40 space-y-3">
                  {pastSurgeriesList.map((item, idx) => (
                    <div key={idx} className="relative flex items-center justify-between">
                      <div className="absolute -left-[31px] w-3 h-3 rounded-full bg-cyan-500 border-2 border-white dark:border-slate-950" />
                      <div>
                        <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold block">
                          {item.year}
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {item.procedure}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSurgery(idx)}
                        className="text-slate-400 hover:text-rose-500 p-1"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Current Medications & Family History */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
            <Pill className="w-4 h-4 text-cyan-500" />
            Current Medications & Supplements
          </label>
          <textarea
            rows={2}
            value={currentMedications}
            onChange={(e) => setCurrentMedications(e.target.value)}
            placeholder="e.g. Metformin 500mg (OD), Pantoprazole 40mg (Before breakfast)"
            className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
            Family Medical History
          </label>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {commonFamilyHistory.map((fam) => {
              const isSelected = familyHistory.includes(fam);
              return (
                <button
                  key={fam}
                  type="button"
                  onClick={() => toggleFamilyHistory(fam)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {isSelected ? '✓ ' : '+ '}
                  {fam}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Health Questions
        </button>

        <button
          type="button"
          id="btn-history-continue"
          onClick={onContinue}
          className="px-7 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-cyan-600/25 transition-all"
        >
          <span>Continue to Document Scanning & OCR</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
