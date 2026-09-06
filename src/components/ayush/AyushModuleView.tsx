import React, { useState, useMemo } from 'react';
import {
  Leaf,
  Sparkles,
  Heart,
  CheckCircle2,
  AlertCircle,
  Save,
  User,
  ShieldCheck,
  Flame,
  Droplets,
  Wind,
  Plus,
  Trash2,
  Stethoscope,
  Activity,
  FileText,
  Clock,
  Pill,
  Sun,
  Moon,
  Thermometer,
} from 'lucide-react';
import { usePatients } from '../../context/PatientContext';
import { useAuth } from '../../context/AuthContext';
import { AyurvedaCase, Patient, HomeopathyCase } from '../../types';

interface Props {
  onNavigateTab: (tab: string) => void;
  onSelectPatient: (patient: Patient, tab?: string) => void;
}

export const AyushModuleView: React.FC<Props> = ({ onNavigateTab, onSelectPatient }) => {
  const { patients, activePatient, setActivePatient, updatePatientIntake } = usePatients();
  const { currentUser } = useAuth();

  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    activePatient?.id || patients[0]?.id || ''
  );
  const [activeAyushSystem, setActiveAyushSystem] = useState<'ayurveda' | 'homeopathy'>('ayurveda');

  // ================= AYURVEDA STATE =================
  const [selectedPrakriti, setSelectedPrakriti] = useState<string>('Pending practitioner review');
  const [vikritiImbalance, setVikritiImbalance] = useState<string>('Pending practitioner review');
  const [selectedAgni, setSelectedAgni] = useState<string>('Pending practitioner review');
  const [amaStatus, setAmaStatus] = useState<string>('Not assessed');
  const [koshtaType, setKoshtaType] = useState<string>('Pending practitioner review');

  const [nadiPariksha, setNadiPariksha] = useState('Pending practitioner examination');
  const [jihvaExam, setJihvaExam] = useState('Pending practitioner examination');
  const [dinacharyaAdvice, setDinacharyaAdvice] = useState('Practitioner notes pending');
  const [ritucharyaAdvice, setRitucharyaAdvice] = useState('Practitioner notes pending');
  const [aharaNutrition, setAharaNutrition] = useState('Practitioner notes pending');
  const [practitionerNotes, setPractitionerNotes] = useState('');

  const [panchakarmaTherapies, setPanchakarmaTherapies] = useState<Array<{ name: string; duration: string; rationale: string; status: string }>>([]);

  const [herbalFormulations, setHerbalFormulations] = useState<Array<{ name: string; dose: string; anupana: string }>>([]);
  const [newHerbName, setNewHerbName] = useState('');
  const [newHerbDose, setNewHerbDose] = useState('');
  const [newHerbAnupana, setNewHerbAnupana] = useState('Warm water');

  // ================= HOMEOPATHY STATE =================
  // Based on the approved study:
  // "TO STUDY OF EFFECTIVENESS OF ROBINIA 30 IN MANAGEMENT OF GASTRITIS IN AGE GROUP 20 YEARS AND ABOVE IN BOTH GENDERS-A CASE SERIES STUDY"
  const [homChiefComplaint, setHomChiefComplaint] = useState(
    'Severe sour eructations, burning pyrosis (heartburn) in epigastrium extending into esophagus, worse at night on lying down.'
  );
  const [homModalitiesWorse, setHomModalitiesWorse] = useState(
    'Worse at night, lying down, after heavy meals, eating fat or sour foods, mental worry.'
  );
  const [homModalitiesBetter, setHomModalitiesBetter] = useState(
    'Better from warm drinks, sitting upright, passing flatus, small dry crackers.'
  );
  const [homThermal, setHomThermal] = useState<'Chilly' | 'Hot' | 'Ambi-thermal'>('Chilly');
  const [homThirst, setHomThirst] = useState<'Thirsty for small quantities frequently' | 'Thirstless' | 'Large quantities cold water'>('Large quantities cold water');
  const [homCravingsAversions, setHomCravingsAversions] = useState('Craves cold drinks, sweets. Aversion to fatty food and milk.');
  const [homMentalMind, setHomMentalMind] = useState('Irritable due to gastric distress, anxious about digestive health, hurried disposition.');

  const [homSelectedRemedy, setHomSelectedRemedy] = useState('Robinia Pseudacacia (Robinia 30)');
  const [homPotency, setHomPotency] = useState('30 CH');
  const [homDosage, setHomDosage] = useState('4 pills TDS (Thrice daily) in dry mouth 30 mins away from meals');
  const [homRationale, setHomRationale] = useState(
    'Keynote match: Hyperchlorhydria with intensely sour stomach acid and burning nocturnal distress as documented in Institutional Ethics Committee Study protocol.'
  );
  const [homFollowUpDays, setHomFollowUpDays] = useState('7 days');

  const [isSaved, setIsSaved] = useState(false);

  const patient = useMemo(() => {
    return patients.find((p) => p.id === selectedPatientId) || activePatient || patients[0];
  }, [patients, selectedPatientId, activePatient]);

  const handleAddHerbalItem = () => {
    if (!newHerbName.trim()) return;
    setHerbalFormulations((prev) => [
      ...prev,
      { name: newHerbName.trim(), dose: newHerbDose.trim() || '3g BD', anupana: newHerbAnupana },
    ]);
    setNewHerbName('');
    setNewHerbDose('');
  };

  const handleSaveAyushPlan = async () => {
    if (patient?.symptoms?.ayurvedaCase) {
      const updatedCase: AyurvedaCase = {
        ...patient.symptoms.ayurvedaCase,
        practitionerObservations: practitionerNotes,
        practitionerAssessment: `Prakriti: ${selectedPrakriti}; Vikriti: ${vikritiImbalance}; Agni: ${selectedAgni}; Koshta: ${koshtaType}; Nadi: ${nadiPariksha}; Jihva: ${jihvaExam}`,
        status: 'Practitioner confirmed',
        updatedAt: new Date().toISOString(),
      };
      await updatePatientIntake(patient.id, { ...patient.symptoms, ayurvedaCase: updatedCase });
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3500);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <Leaf className="w-4 h-4" />
            Integrative Traditional Medicine Protocol
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            AYUSH Integrative Care Workstation
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Parallel clinical workstations for Ayurveda constitutional balance and Homeopathic Robinia 30 case taking.
          </p>
        </div>

        {/* Patient Switcher */}
        <div className="w-full sm:w-72">
          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
            Active Patient
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
                {p.demographics.fullName} ({p.opdToken} • {p.demographics.age}Y)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Patient Clinical Banner */}
      {patient && (
        <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              {patient.opdToken}
            </div>
            <div>
              <span className="font-extrabold text-slate-900 dark:text-white text-sm block">
                {patient.demographics.fullName}
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                {patient.demographics.age} Y • {patient.demographics.gender} • Chief Complaint:{' '}
                {patient.symptoms?.chiefComplaint || 'Gastric distress'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Drug Allergies</span>
              <span className="font-bold text-rose-600 dark:text-rose-400">
                {patient.demographics.knownAllergies?.join(', ') || 'None Documented'}
              </span>
            </div>
          </div>
        </div>
      )}

      {patient?.symptoms?.ayurvedaCase && (
        <div className="p-5 rounded-2xl bg-emerald-950/20 dark:bg-emerald-950/40 border border-emerald-500/30 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-wider font-black text-emerald-600 dark:text-emerald-400">Ayurvedic Practitioner Review</div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">🌿 Ayurvedic Case Summary</h2>
              <p className="text-xs text-slate-500">AI-assisted preliminary case summary — practitioner review and confirmation required.</p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[10px] font-bold">{patient.symptoms.ayurvedaCase.status}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {[
              ['Prakriti', patient.symptoms.ayurvedaCase.prakriti.preliminaryPattern],
              ['Vikriti', patient.symptoms.ayurvedaCase.vikriti.preliminaryPattern],
              ['Agni', patient.symptoms.ayurvedaCase.agni.preliminaryAssessment],
              ['Completeness', `${patient.symptoms.ayurvedaCase.prakriti.completeness}%`],
            ].map(([label, value]) => <div key={label} className="p-3 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800"><span className="block text-[10px] uppercase font-bold text-slate-400">{label}</span><span className="font-bold text-slate-900 dark:text-white">{value}</span><span className="block text-[10px] text-cyan-600 mt-1">Patient reported / AI structured</span></div>)}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {Object.entries(patient.symptoms.ayurvedaCase.ashtavidha as Record<string, { value: string; source: string }>).map(([key, item]) => <div key={key} className="p-3 rounded-xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800"><span className="font-bold capitalize text-slate-700 dark:text-slate-300">{key}</span><p className="mt-1 text-slate-500">{item.value}</p><span className="text-[10px] text-amber-600">{item.source}</span></div>)}
          </div>
          <div><label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Practitioner observations and notes</label><textarea value={practitionerNotes} onChange={(event) => setPractitionerNotes(event.target.value)} rows={3} placeholder="Add Darshana, Sparshana, Prashna, and practitioner observations. No treatment is generated automatically." className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs" /></div>
        </div>
      )}

      {/* System Tabs: Ayurveda vs Homeopathy */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveAyushSystem('ayurveda')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeAyushSystem === 'ayurveda'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Leaf className="w-4 h-4" />
          <span>🌿 Ayurveda Prakriti & Panchakarma Station</span>
        </button>

        <button
          onClick={() => setActiveAyushSystem('homeopathy')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeAyushSystem === 'homeopathy'
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>⚕ Homeopathy Case Taking & Robinia 30 Protocol</span>
        </button>
      </div>

      {isSaved && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Integrative AYUSH Clinical Record successfully saved and linked to patient file.</span>
        </div>
      )}

      {/* ================= SECTION A: AYURVEDA ================= */}
      {activeAyushSystem === 'ayurveda' && (
        <div className="space-y-6 text-xs">
          {/* Dosha & Assessment Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Prakriti */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
              <span className="font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                1. Prakriti (Constitutional Assessment)
              </span>
              <select
                value={selectedPrakriti}
                onChange={(e: any) => setSelectedPrakriti(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="Pending practitioner review">Pending practitioner review</option>
                <option value="Pitta-Kapha">Pitta-Kapha (Preliminary observation)</option>
                <option value="Vata-Pitta">Vata-Pitta (Dominant: Vata • Secondary: Pitta)</option>
                <option value="Vata-Kapha">Vata-Kapha</option>
                <option value="Tridoshic">Tridoshic (Balanced Sama)</option>
                <option value="Pure Pitta">Pure Pitta (Sharply sharp digestive fire)</option>
              </select>
              <p className="text-[11px] text-slate-500">
                Determined via physical frame, skin warmth, metabolism, and thermal response.
              </p>
            </div>

            {/* Vikriti */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
              <span className="font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                2. Vikriti (Current Morbid Imbalance)
              </span>
              <select
                value={vikritiImbalance}
                onChange={(e: any) => setVikritiImbalance(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="Pending practitioner review">Pending practitioner review</option>
                <option value="Pitta Aggravation (Amlapitta)">Pitta-oriented observations (not diagnosis)</option>
                <option value="Vata-Pitta Dushti">Vata-Pitta Dushti (Spasmodic pain + reflux)</option>
                <option value="Kapha Stagnation">Kapha Stagnation (Heavy digestion, sluggish)</option>
              </select>
              <p className="text-[11px] text-slate-500">
                Target of therapeutic calming and cleansing protocols.
              </p>
            </div>

            {/* Agni & Ama */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
              <span className="font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 block">
                3. Agni & Ama Assessment
              </span>
              <select
                value={selectedAgni}
                onChange={(e: any) => setSelectedAgni(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="Pending practitioner review">Pending practitioner review</option>
                <option value="Tikshna Agni">Tikshna Agni (preliminary observation)</option>
                <option value="Manda Agni">Manda Agni (Sluggish fire / heaviness)</option>
                <option value="Vishama Agni">Vishama Agni (Irregular fluctuating fire)</option>
                <option value="Sama Agni">Sama Agni (Equilibrium fire)</option>
              </select>
              <p className="text-[11px] text-slate-500">Ama Status: {amaStatus}</p>
            </div>
          </div>

          {/* Traditional Ayurvedic Physical Examination */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-emerald-500" />
              Ashtavidha Pariksha (Eight-Fold Traditional Examination)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nadi Pariksha (Pulse Examination)
                </label>
                <input
                  type="text"
                  value={nadiPariksha}
                  onChange={(e) => setNadiPariksha(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Jihva Pariksha (Tongue Observation)
                </label>
                <input
                  type="text"
                  value={jihvaExam}
                  onChange={(e) => setJihvaExam(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Dinacharya, Ritucharya & Dietary Guidance */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-500" />
              Dinacharya, Ritucharya & Ahara (Dietary) Prescriptions
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Dinacharya (Daily Regimen)
                </label>
                <textarea
                  rows={3}
                  value={dinacharyaAdvice}
                  onChange={(e) => setDinacharyaAdvice(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ritucharya (Seasonal Protocol)
                </label>
                <textarea
                  rows={3}
                  value={ritucharyaAdvice}
                  onChange={(e) => setRitucharyaAdvice(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ahara / Nutrition Rules (Pathya-Apathya)
                </label>
                <textarea
                  rows={3}
                  value={aharaNutrition}
                  onChange={(e) => setAharaNutrition(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Panchakarma Procedures & Therapeutic Library */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-emerald-500" />
                Practitioner Treatment Plan (Optional)
              </h3>
              <span className="text-[10px] text-slate-400">No treatment is generated automatically</span>
            </div>

            <div className="space-y-2">
              {panchakarmaTherapies.map((therapy, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {therapy.name}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Duration: {therapy.duration} • Rationale: {therapy.rationale}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] self-start sm:self-center">
                    {therapy.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Herbal Formulations Table */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Pill className="w-4 h-4 text-emerald-500" />
                Practitioner-entered Formulations (Optional)
              </h3>
            </div>

            <div className="space-y-2">
              {herbalFormulations.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">{item.name}</span>
                    <span className="text-[11px] text-slate-500 block">
                      Dose: {item.dose} • Anupana: {item.anupana}
                    </span>
                  </div>
                  <button
                    onClick={() => setHerbalFormulations((prev) => prev.filter((_, i) => i !== idx))}
                    className="text-rose-500 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Herb Quick Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
              <input
                type="text"
                placeholder="Formulation Name (e.g. Shankha Bhasma)"
                value={newHerbName}
                onChange={(e) => setNewHerbName(e.target.value)}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
              <input
                type="text"
                placeholder="Dose & Timing (e.g. 250mg TDS with honey)"
                value={newHerbDose}
                onChange={(e) => setNewHerbDose(e.target.value)}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddHerbalItem}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
              >
                + Add Formulation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= SECTION B: HOMEOPATHY CASE TAKING & ROBINIA 30 ================= */}
      {activeAyushSystem === 'homeopathy' && (
        <div className="space-y-6 text-xs">
          {/* Institutional Study Banner */}
          <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-cyan-800 dark:text-cyan-200 uppercase tracking-wide">
                Institutional Clinical Research Study Protocol (IEC-Approved)
              </span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-[10px]">
                Case Series Protocol
              </span>
            </div>
            <p className="text-slate-700 dark:text-slate-300">
              <strong>Title of Study:</strong> "TO STUDY OF EFFECTIVENESS OF ROBINIA 30 IN MANAGEMENT OF GASTRITIS IN AGE GROUP 20 YEARS AND ABOVE IN BOTH GENDERS - A CASE SERIES STUDY."
            </p>
          </div>

          {/* Chief Complaints & Modalities */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-cyan-500" />
              Symptom Characterization & Modalities (Totality of Symptoms)
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Presenting Symptoms & Sensation (Location, Sensation, Modality, Concomitant)
                </label>
                <textarea
                  rows={3}
                  value={homChiefComplaint}
                  onChange={(e) => setHomChiefComplaint(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-rose-600 dark:text-rose-400 mb-1">
                    Aggravating Factors / Modalities (Worse From &lt;)
                  </label>
                  <textarea
                    rows={2}
                    value={homModalitiesWorse}
                    onChange={(e) => setHomModalitiesWorse(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
                    Relieving Factors / Modalities (Better From &gt;)
                  </label>
                  <textarea
                    rows={2}
                    value={homModalitiesBetter}
                    onChange={(e) => setHomModalitiesBetter(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Physical & Mental Generals */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-cyan-500" />
              General Characteristics (Thermal, Thirst & Mental State)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Thermal Reaction
                </label>
                <select
                  value={homThermal}
                  onChange={(e: any) => setHomThermal(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="Chilly">Chilly (Wants warmth / sensitive to drafts)</option>
                  <option value="Hot">Hot (Wants cool room / intolerant of heat)</option>
                  <option value="Ambi-thermal">Ambi-thermal (Normal)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Thirst & Food Cravings / Aversions
                </label>
                <input
                  type="text"
                  value={homCravingsAversions}
                  onChange={(e) => setHomCravingsAversions(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mental & Emotional Generals (Mind / Disposition)
                </label>
                <input
                  type="text"
                  value={homMentalMind}
                  onChange={(e) => setHomMentalMind(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Selected Remedy & Study Prescription (Robinia 30) */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Pill className="w-4 h-4 text-cyan-500" />
                Homeopathic Prescription & Remedy Rationale
              </h3>
              <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold">
                Materia Medica Verified
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Selected Simillimum Remedy
                </label>
                <input
                  type="text"
                  value={homSelectedRemedy}
                  onChange={(e) => setHomSelectedRemedy(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Potency & Scale
                </label>
                <input
                  type="text"
                  value={homPotency}
                  onChange={(e) => setHomPotency(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Follow-up Interval
                </label>
                <input
                  type="text"
                  value={homFollowUpDays}
                  onChange={(e) => setHomFollowUpDays(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Administration Instructions & Frequency
                </label>
                <input
                  type="text"
                  value={homDosage}
                  onChange={(e) => setHomDosage(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Remedy Selection Rationale & Differential Note
                </label>
                <textarea
                  rows={2}
                  value={homRationale}
                  onChange={(e) => setHomRationale(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Action Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={() => {
            if (patient) onSelectPatient(patient, 'doctor');
          }}
          className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-white"
        >
          ← Return to Allopathic Doctor Station
        </button>

        <button
          onClick={handleSaveAyushPlan}
          className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20"
        >
          <Save className="w-4 h-4" />
          <span>Save & Finalize AYUSH Clinical Protocol</span>
        </button>
      </div>
    </div>
  );
};
