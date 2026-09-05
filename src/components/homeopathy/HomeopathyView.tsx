import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Activity,
  User,
  Heart,
  FileText,
  Save,
  Printer,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  Zap,
  Info,
} from 'lucide-react';
import { usePatients } from '../../context/PatientContext';
import { Patient } from '../../types';

interface Props {
  onSelectPatient: (patient: Patient, tab?: string) => void;
  onNavigateTab: (tab: string) => void;
}

// Repertory Matrix Data
interface RepertoryRubric {
  id: string;
  name: string;
  remedyScores: Record<string, number>; // remedyName -> grade (1, 2, or 3)
}

const REPERTORY_RUBRICS: RepertoryRubric[] = [
  {
    id: 'r1',
    name: 'Stomach - Acidity - Hyperchlorhydria with sour eructations',
    remedyScores: {
      'Robinia Pseud.': 3,
      'Natrum Phos.': 3,
      'Nux Vomica': 2,
      'Iris Vers.': 2,
      'Lycopodium': 2,
      'Carbo Veg.': 1,
      'Arsenicum Alb.': 1,
      'Phosphorus': 2,
      'Pulsatilla': 1,
      'Hydrastis Can.': 2,
    },
  },
  {
    id: 'r2',
    name: 'Stomach - Burning - Epigastrium radiating between scapulae',
    remedyScores: {
      'Robinia Pseud.': 3,
      'Arsenicum Alb.': 3,
      'Phosphorus': 3,
      'Carbo Veg.': 2,
      'Nux Vomica': 2,
      'Iris Vers.': 2,
      'Lycopodium': 1,
      'Natrum Phos.': 1,
      'Pulsatilla': 1,
      'Hydrastis Can.': 1,
    },
  },
  {
    id: 'r3',
    name: 'Stomach - Vomiting - Sour fluids, sets teeth on edge',
    remedyScores: {
      'Robinia Pseud.': 3,
      'Iris Vers.': 3,
      'Natrum Phos.': 2,
      'Nux Vomica': 2,
      'Lycopodium': 1,
      'Arsenicum Alb.': 1,
      'Phosphorus': 2,
      'Carbo Veg.': 1,
      'Pulsatilla': 1,
      'Hydrastis Can.': 1,
    },
  },
  {
    id: 'r4',
    name: 'Generalities - Food - Fat & cabbage aggravate',
    remedyScores: {
      'Robinia Pseud.': 2,
      'Pulsatilla': 3,
      'Carbo Veg.': 3,
      'Lycopodium': 3,
      'Nux Vomica': 2,
      'Arsenicum Alb.': 1,
      'Phosphorus': 1,
      'Natrum Phos.': 1,
      'Iris Vers.': 1,
      'Hydrastis Can.': 1,
    },
  },
  {
    id: 'r5',
    name: 'Head - Pain - Frontal headache with gastric symptoms',
    remedyScores: {
      'Robinia Pseud.': 3,
      'Iris Vers.': 3,
      'Nux Vomica': 3,
      'Natrum Phos.': 2,
      'Lycopodium': 1,
      'Pulsatilla': 2,
      'Phosphorus': 1,
      'Carbo Veg.': 1,
      'Arsenicum Alb.': 1,
      'Hydrastis Can.': 1,
    },
  },
  {
    id: 'r6',
    name: 'Generalities - Time - Aggravation post-midnight (1-3 AM)',
    remedyScores: {
      'Robinia Pseud.': 2,
      'Arsenicum Alb.': 3,
      'Nux Vomica': 2,
      'Lycopodium': 1,
      'Phosphorus': 1,
      'Carbo Veg.': 1,
      'Pulsatilla': 1,
      'Natrum Phos.': 1,
      'Iris Vers.': 1,
      'Hydrastis Can.': 1,
    },
  },
];

const REMEDIES = [
  'Robinia Pseud.',
  'Natrum Phos.',
  'Nux Vomica',
  'Iris Vers.',
  'Arsenicum Alb.',
  'Phosphorus',
  'Lycopodium',
  'Carbo Veg.',
  'Pulsatilla',
  'Hydrastis Can.',
];

export const HomeopathyView: React.FC<Props> = ({ onSelectPatient, onNavigateTab }) => {
  const { patients, activePatient, setActivePatient } = usePatients();

  const currentPatient = activePatient || patients[0] || null;

  const [activeTab, setActiveTab] = useState<'caseTaking' | 'repertory' | 'robiniaProfile' | 'gsrsTracking' | 'prescription'>('repertory');

  // Case Taking Form Fields
  const [chiefComplaints, setChiefComplaints] = useState('Severe epigastric burning, acid reflux, sour regurgitation setting teeth on edge after food.');
  const [thermalState, setThermalState] = useState<'Chilly' | 'Hot' | 'Ambithermal'>('Chilly');
  const [appetite, setAppetite] = useState('Poor due to fear of burning pain');
  const [thirst, setThirst] = useState('Thirst for sips of cold water');
  const [desiresAversions, setDesiresAversions] = useState('Craves sweets; aversion to fats and sour curd');
  const [sleepState, setSleepState] = useState('Disturbed post-midnight by acidic heartburn');
  const [mentalState, setMentalState] = useState('Irritable from discomfort; anxious regarding chronic digestive issues');
  const [miasm, setMiasm] = useState<'Psora' | 'Sycosis' | 'Tubercular' | 'Syphilis'>('Psora');

  // Repertorization Selected Rubrics
  const [selectedRubrics, setSelectedRubrics] = useState<string[]>(['r1', 'r2', 'r3', 'r4', 'r5']);

  // GSRS & VAS Scoring
  const [baselineGsrs, setBaselineGsrs] = useState(14); // 0-21
  const [currentGsrs, setCurrentGsrs] = useState(4);
  const [baselineVas, setBaselineVas] = useState(8); // 0-10
  const [currentVas, setCurrentVas] = useState(2);
  const [aggravationType, setAggravationType] = useState<'None' | 'Homeopathic' | 'Disease'>('Homeopathic');
  const [clinicalImprovement, setClinicalImprovement] = useState<'Marked Improvement' | 'Moderate' | 'Mild' | 'Not Improved'>('Marked Improvement');

  // Prescription
  const [potency, setPotency] = useState('30CH');
  const [dosage, setDosage] = useState('4 pills TDS in half-cup water before meals');
  const [durationDays, setDurationDays] = useState('14 days');
  const [dietaryAdvice, setDietaryAdvice] = useState('Avoid raw onion, garlic, coffee, excessively spicy food, and late night dinners.');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Compute Repertory Scores
  const repertoryResults = useMemo(() => {
    const scores: Record<string, { totalScore: number; rubricCount: number }> = {};
    REMEDIES.forEach((rem) => {
      scores[rem] = { totalScore: 0, rubricCount: 0 };
    });

    selectedRubrics.forEach((rId) => {
      const rubric = REPERTORY_RUBRICS.find((r) => r.id === rId);
      if (rubric) {
        REMEDIES.forEach((rem) => {
          const score = rubric.remedyScores[rem] || 0;
          if (score > 0) {
            scores[rem].totalScore += score;
            scores[rem].rubricCount += 1;
          }
        });
      }
    });

    return Object.entries(scores)
      .map(([remedy, data]) => ({ remedy, ...data }))
      .sort((a, b) => b.totalScore - a.totalScore);
  }, [selectedRubrics]);

  const handleSaveCase = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Academic Study Citation */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-950 border border-teal-500/30 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Post Graduate Homoeopathic Research & Case Series Study
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Homoeopathy Specialty: Robinia 30 & Gastritis Clinic
          </h1>
          <p className="text-xs text-teal-200/80 max-w-3xl mt-1">
            Clinical case taking, Kentian repertorization, and GSRS outcome evaluation based on the clinical study:
            <em> &quot;Effectiveness of Robinia 30 in Management of Gastritis in Age Group 20 Years and Above in Both Genders.&quot;</em>
          </p>
        </div>

        {/* Active Patient Badge */}
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-2.5 rounded-2xl border border-white/20">
          <User className="w-4 h-4 text-teal-300" />
          <div className="text-xs">
            <span className="text-slate-300 block text-[10px]">Active Case:</span>
            <span className="font-bold text-white">
              {currentPatient?.demographics.fullName || 'Rahul Patil'} ({currentPatient?.opdToken || 'OPD-024'})
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        {[
          { id: 'repertory', label: 'Repertorization Grid', icon: Activity },
          { id: 'robiniaProfile', label: 'Robinia 30 Materia Medica Profile', icon: BookOpen },
          { id: 'caseTaking', label: 'Homoeopathic Case Sheet', icon: FileText },
          { id: 'gsrsTracking', label: 'GSRS & VAS Pain Tracker', icon: TrendingDown },
          { id: 'prescription', label: 'Prescription & Regimen', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: REPERTORIZATION GRID */}
      {activeTab === 'repertory' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-teal-500" />
                  Homoeopathic Repertorization Matrix (Totality of Symptoms)
                </h3>
                <p className="text-xs text-slate-500">
                  Select key rubrics from Kent / Boenninghausen repertory to rank leading simillimum remedies.
                </p>
              </div>

              <span className="px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-600 dark:text-teal-400 font-bold text-xs">
                Robinia Pseud. Ranked #1
              </span>
            </div>

            {/* Rubrics Selector */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Active Rubrics in Totality:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {REPERTORY_RUBRICS.map((rubric) => {
                  const isSelected = selectedRubrics.includes(rubric.id);
                  return (
                    <label
                      key={rubric.id}
                      className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-teal-500/10 border-teal-500 text-teal-900 dark:text-teal-200'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          if (isSelected) {
                            setSelectedRubrics(selectedRubrics.filter((id) => id !== rubric.id));
                          } else {
                            setSelectedRubrics([...selectedRubrics, rubric.id]);
                          }
                        }}
                        className="w-4 h-4 rounded text-teal-600 mt-0.5"
                      />
                      <span className="leading-snug">{rubric.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto pt-4">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                  <tr>
                    <th className="p-3 rounded-l-xl">Remedy (Materia Medica)</th>
                    <th className="p-3 text-center">Rubrics Matched</th>
                    <th className="p-3 text-center">Total Grade Points</th>
                    <th className="p-3 text-center">Totality Rank</th>
                    <th className="p-3 rounded-r-xl">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {repertoryResults.map((item, idx) => (
                    <tr
                      key={item.remedy}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                        idx === 0 ? 'bg-teal-500/10 dark:bg-teal-950/30 font-bold' : ''
                      }`}
                    >
                      <td className="p-3 flex items-center gap-2">
                        {idx === 0 && <span className="text-amber-500 font-bold text-sm">★</span>}
                        <span className="text-slate-900 dark:text-white font-bold">{item.remedy}</span>
                        {item.remedy === 'Robinia Pseud.' && (
                          <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-600 dark:text-teal-400 text-[10px]">
                            Study Simillimum
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center text-slate-700 dark:text-slate-300">
                        {item.rubricCount} / {selectedRubrics.length}
                      </td>
                      <td className="p-3 text-center font-extrabold text-teal-600 dark:text-teal-400 text-sm">
                        {item.totalScore}
                      </td>
                      <td className="p-3 text-center font-bold">#{idx + 1}</td>
                      <td className="p-3">
                        <button
                          onClick={() => {
                            setActiveTab('prescription');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold text-[11px]"
                        >
                          Prescribe
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ROBINIA 30 MATERIA MEDICA PROFILE */}
      {activeTab === 'robiniaProfile' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider block">
                Materia Medica Keynote Profile
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Robinia Pseudoacacia (Locust Tree) — 30C
              </h3>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
              Centisimal Potency: 30CH
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="font-bold text-slate-900 dark:text-white block text-sm">
                Core Clinical Action
              </span>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                The keynote of Robinia is excessive <strong>hyperchlorhydria</strong> (hyperacidity) with pronounced
                sour stomach contents. Everything ingested turns violently sour. The gastric juice is so acid that it
                causes eructations that set the teeth on edge and excoriate the pharynx.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="font-bold text-slate-900 dark:text-white block text-sm">
                Gastric Keynotes
              </span>
              <ul className="text-slate-600 dark:text-slate-300 space-y-1 list-disc list-inside">
                <li>Constant dull heavy aching distress in epigastrium.</li>
                <li>Burning pain between the scapulae (interscapular pain) accompanied by acidity.</li>
                <li>Sour fluid vomiting, sour eructations smelling acidic.</li>
                <li>Frontal gastric headache alternating with acid indigestion.</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="font-bold text-rose-600 dark:text-rose-400 block text-sm">
                Aggravating Modalities
              </span>
              <p className="text-slate-600 dark:text-slate-300">
                Fatty rich foods, cabbage, raw salad, post-midnight (1:00 AM - 3:00 AM), lying flat on back.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="font-bold text-emerald-600 dark:text-emerald-400 block text-sm">
                Ameliorating Modalities
              </span>
              <p className="text-slate-600 dark:text-slate-300">
                Standing erect, temporary relief after taking cold milk or bland warm water.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: HOMOEOPATHIC CASE SHEET */}
      {activeTab === 'caseTaking' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Standard Homoeopathic Case Record Sheet
            </h3>
            <button
              onClick={handleSaveCase}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savedSuccess ? 'Saved!' : 'Save Case Record'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Chief Complaint & Totality
              </label>
              <textarea
                rows={2}
                value={chiefComplaints}
                onChange={(e) => setChiefComplaints(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Thermal State
              </label>
              <select
                value={thermalState}
                onChange={(e: any) => setThermalState(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="Chilly">Chilly (Sensitive to cold air)</option>
                <option value="Hot">Hot (Cannot tolerate warmth)</option>
                <option value="Ambithermal">Ambithermal</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Miasmatic Dominance
              </label>
              <select
                value={miasm}
                onChange={(e: any) => setMiasm(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="Psora">Psora (Functional disturbance & hypersensitivity)</option>
                <option value="Sycosis">Sycosis (Incoordination & chronicity)</option>
                <option value="Tubercular">Tubercular</option>
                <option value="Syphilis">Syphilis (Destructive ulceration)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Appetite & Thirst
              </label>
              <input
                type="text"
                value={`${appetite} | ${thirst}`}
                onChange={(e) => setAppetite(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Desires & Aversions
              </label>
              <input
                type="text"
                value={desiresAversions}
                onChange={(e) => setDesiresAversions(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mental State & Emotional Disposition
              </label>
              <input
                type="text"
                value={mentalState}
                onChange={(e) => setMentalState(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: GSRS & VAS PAIN TRACKING */}
      {activeTab === 'gsrsTracking' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Gastrointestinal Symptom Rating Scale (GSRS) & VAS Scoring
              </h3>
              <p className="text-xs text-slate-500">
                Standardized clinical trial outcome measurement for Robinia 30 gastritis research.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
              Outcome: {clinicalImprovement}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* GSRS Comparative Card */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  GSRS Total Score (0-21)
                </span>
                <span className="text-xs text-emerald-500 font-bold flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5" /> 71.4% Reduction
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-slate-500 mb-1">
                    <span>Baseline (Visit 1):</span>
                    <span className="font-bold text-rose-500">{baselineGsrs} / 21</span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: `${(baselineGsrs / 21) * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-500 mb-1">
                    <span>Follow-Up (Post-Robinia 30):</span>
                    <span className="font-bold text-emerald-500">{currentGsrs} / 21</span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(currentGsrs / 21) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* VAS Pain Scale Card */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  VAS Pain Scale (0-10)
                </span>
                <span className="text-xs text-emerald-500 font-bold flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5" /> From 8/10 to 2/10
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-slate-500 mb-1">
                    <span>Baseline Pain:</span>
                    <span className="font-bold text-rose-500">{baselineVas} / 10 (Severe)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: `${(baselineVas / 10) * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-500 mb-1">
                    <span>Current Pain:</span>
                    <span className="font-bold text-emerald-500">{currentVas} / 10 (Mild)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(currentVas / 10) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PRESCRIPTION & REGIMEN */}
      {activeTab === 'prescription' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Official Homoeopathic Prescription & Regimen
            </h3>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Prescription</span>
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-teal-500/30 font-mono text-xs space-y-4">
            <div className="text-center border-b border-dashed border-slate-300 dark:border-slate-700 pb-3">
              <h4 className="font-bold text-sm tracking-wider uppercase font-sans">
                HOMOEOPATHIC CLINICAL PRESCRIPTION
              </h4>
              <p className="text-[11px] text-slate-500 font-sans">
                Post Graduate Medical College & Hospital • OPD Dispensary
              </p>
            </div>

            <div className="flex justify-between text-slate-700 dark:text-slate-300">
              <span>Patient: {currentPatient?.demographics.fullName || 'Rahul Patil'} ({currentPatient?.opdToken || 'OPD-024'})</span>
              <span>Date: {new Date().toLocaleDateString()}</span>
            </div>

            <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-900 dark:text-teal-200 space-y-1">
              <span className="text-sm font-bold block">℞ Robinia Pseudoacacia 30CH</span>
              <p>Dispense: Pills No. 30 (Sugar of milk globules)</p>
              <p>Dosage: 4 pills three times a day (TDS), dissolved on tongue 15 mins before meals.</p>
              <p>Duration: For 14 days, followed by clinical review.</p>
            </div>

            <div className="space-y-1 text-slate-600 dark:text-slate-400">
              <span className="font-bold block text-slate-800 dark:text-slate-200">
                Auxiliary Diet & Regimen (Pathya / Apathya):
              </span>
              <p>• Avoid raw onions, garlic, strong coffee, alcohol, and excessive spices during treatment.</p>
              <p>• Take light frequent meals; avoid heavy late-night dinners.</p>
              <p>• In case of severe aggravation or acute pain, contact the hospital immediately.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
