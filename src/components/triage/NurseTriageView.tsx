import React, { useState, useEffect } from 'react';
import {
  Activity,
  Heart,
  Thermometer,
  Wind,
  Gauge,
  Scale,
  Save,
  ShieldAlert,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Flame,
  User,
  Check,
} from 'lucide-react';
import { usePatients } from '../../context/PatientContext';
import { Patient, TriageRecord, TriagePriority, VitalSigns } from '../../types';

interface Props {
  onNavigateTab: (tab: string) => void;
  onSelectPatient: (patient: Patient, tab?: string) => void;
}

export const NurseTriageView: React.FC<Props> = ({ onNavigateTab, onSelectPatient }) => {
  const { patients, activePatient, setActivePatient, recordTriage } = usePatients();

  const [selectedPatientId, setSelectedPatientId] = useState<string>('');

  // Vitals State
  const [temperatureF, setTemperatureF] = useState<number>(98.6);
  const [pulseBpm, setPulseBpm] = useState<number>(76);
  const [respiratoryRate, setRespiratoryRate] = useState<number>(18);
  const [bpSystolic, setBpSystolic] = useState<number>(120);
  const [bpDiastolic, setBpDiastolic] = useState<number>(80);
  const [spO2Percent, setSpO2Percent] = useState<number>(98);
  const [weightKg, setWeightKg] = useState<number>(68);
  const [heightCm, setHeightCm] = useState<number>(170);

  // Triage parameters
  const [priority, setPriority] = useState<TriagePriority>('GREEN');
  const [mobilityStatus, setMobilityStatus] = useState<'Ambulatory' | 'Wheelchair' | 'Stretcher'>('Ambulatory');
  const [consciousLevel, setConsciousLevel] = useState<'Alert' | 'Verbal' | 'Pain' | 'Unresponsive'>('Alert');
  const [nurseNotes, setNurseNotes] = useState<string>('');

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (activePatient) {
      setSelectedPatientId(activePatient.id);
      if (activePatient.triage) {
        const t = activePatient.triage;
        setPriority(t.priority || 'GREEN');
        setMobilityStatus(t.mobilityStatus || 'Ambulatory');
        setConsciousLevel(t.consciousLevel || 'Alert');
        setNurseNotes(t.nurseNotes || '');
        if (t.vitalSigns) {
          setTemperatureF(t.vitalSigns.temperatureF || 98.6);
          setPulseBpm(t.vitalSigns.pulseBpm || 76);
          setRespiratoryRate(t.vitalSigns.respiratoryRate || 18);
          setBpSystolic(t.vitalSigns.bloodPressureSystolic || 120);
          setBpDiastolic(t.vitalSigns.bloodPressureDiastolic || 80);
          setSpO2Percent(t.vitalSigns.spO2Percent || 98);
          setWeightKg(t.vitalSigns.weightKg || 68);
          setHeightCm(t.vitalSigns.heightCm || 170);
        }
      }
    } else if (patients.length > 0) {
      setSelectedPatientId(patients[0].id);
      setActivePatient(patients[0]);
    }
  }, [activePatient, patients, setActivePatient]);

  // Calculate BMI
  const heightM = heightCm > 0 ? heightCm / 100 : 1.7;
  const bmi = weightKg > 0 && heightM > 0 ? parseFloat((weightKg / (heightM * heightM)).toFixed(1)) : 22.0;

  // Real-time suggested triage priority based on vitals
  useEffect(() => {
    if (spO2Percent < 90 || bpSystolic >= 180 || pulseBpm > 135 || temperatureF >= 104) {
      setPriority('RED');
    } else if (spO2Percent < 94 || bpSystolic >= 150 || pulseBpm > 110 || temperatureF >= 102) {
      setPriority((prev) => (prev === 'RED' ? 'RED' : 'ORANGE'));
    } else if (temperatureF > 100.4 || pulseBpm > 95 || bpSystolic >= 140) {
      setPriority((prev) => (prev === 'RED' || prev === 'ORANGE' ? prev : 'YELLOW'));
    }
  }, [spO2Percent, bpSystolic, pulseBpm, temperatureF]);

  const handlePatientSelect = (id: string) => {
    setSelectedPatientId(id);
    const p = patients.find((pat) => pat.id === id);
    if (p) {
      setActivePatient(p);
      if (p.triage) {
        setPriority(p.triage.priority);
        setMobilityStatus(p.triage.mobilityStatus);
        setConsciousLevel(p.triage.consciousLevel);
        setNurseNotes(p.triage.nurseNotes || '');
        if (p.triage.vitalSigns) {
          setTemperatureF(p.triage.vitalSigns.temperatureF);
          setPulseBpm(p.triage.vitalSigns.pulseBpm);
          setRespiratoryRate(p.triage.vitalSigns.respiratoryRate);
          setBpSystolic(p.triage.vitalSigns.bloodPressureSystolic);
          setBpDiastolic(p.triage.vitalSigns.bloodPressureDiastolic);
          setSpO2Percent(p.triage.vitalSigns.spO2Percent);
          setWeightKg(p.triage.vitalSigns.weightKg);
          setHeightCm(p.triage.vitalSigns.heightCm);
        }
      }
    }
  };

  const handleSaveTriage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) return alert('Please select a patient.');

    try {
      setIsSaving(true);
      const triageRecord: TriageRecord = {
        priority,
        vitalSigns: {
          temperatureF: Number(temperatureF),
          pulseBpm: Number(pulseBpm),
          respiratoryRate: Number(respiratoryRate),
          bloodPressureSystolic: Number(bpSystolic),
          bloodPressureDiastolic: Number(bpDiastolic),
          spO2Percent: Number(spO2Percent),
          weightKg: Number(weightKg),
          heightCm: Number(heightCm),
          bmi,
          recordedAt: new Date().toISOString(),
          recordedBy: 'Sister Meena Pillai (Triage Nurse)',
        },
        nurseNotes: nurseNotes.trim(),
        mobilityStatus,
        consciousLevel,
        triageTime: new Date().toISOString(),
        triagedBy: 'Sister Meena Pillai',
      };

      await recordTriage(selectedPatientId, triageRecord);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Error recording triage');
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
            <Activity className="w-5 h-5 text-amber-500" />
            Nurse Triage & Vitals Acquisition Station
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Emergency categorization, physiological parameters, and automatic critical threshold detection
          </p>
        </div>

        {/* Patient Selection Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 whitespace-nowrap">Patient:</label>
          <select
            value={selectedPatientId}
            onChange={(e) => handlePatientSelect(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.opdToken} - {p.demographics.fullName} ({p.triage?.priority || 'Pending'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Patient Header Strip */}
      {currentPatient && (
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-mono font-bold text-sky-600 dark:text-sky-400 mr-2">{currentPatient.opdToken}</span>
            <span className="font-bold text-slate-900 dark:text-white text-sm mr-3">
              {currentPatient.demographics.fullName}
            </span>
            <span className="text-slate-500">
              {currentPatient.demographics.age} Y • {currentPatient.demographics.gender}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Complaint:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {currentPatient.symptoms?.chiefComplaint || 'Pending intake capture'}
            </span>
          </div>
        </div>
      )}

      {/* Triage Priority Color Picker (GREEN, YELLOW, ORANGE, RED) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Triage Priority Classification (MTS / ESI Standard)
          </label>
          <span className="text-xs font-semibold text-slate-400">
            Current Selection: <strong className="text-slate-900 dark:text-white">{priority}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* GREEN */}
          <div
            onClick={() => setPriority('GREEN')}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
              priority === 'GREEN'
                ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 shadow-sm ring-2 ring-emerald-500/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-emerald-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500" />
              {priority === 'GREEN' && <Check className="w-4 h-4 text-emerald-600" />}
            </div>
            <div className="font-extrabold text-sm text-emerald-800 dark:text-emerald-300">GREEN</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Standard / Routine. Normal vitals, stable condition.
            </div>
          </div>

          {/* YELLOW */}
          <div
            onClick={() => setPriority('YELLOW')}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
              priority === 'YELLOW'
                ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 shadow-sm ring-2 ring-amber-500/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-amber-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="w-3.5 h-3.5 rounded-full bg-amber-500" />
              {priority === 'YELLOW' && <Check className="w-4 h-4 text-amber-600" />}
            </div>
            <div className="font-extrabold text-sm text-amber-800 dark:text-amber-300">YELLOW</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Urgent. Moderate distress, elevated temp or vitals.
            </div>
          </div>

          {/* ORANGE */}
          <div
            onClick={() => setPriority('ORANGE')}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
              priority === 'ORANGE'
                ? 'border-orange-500 bg-orange-50/70 dark:bg-orange-950/40 shadow-sm ring-2 ring-orange-500/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-orange-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="w-3.5 h-3.5 rounded-full bg-orange-500" />
              {priority === 'ORANGE' && <Check className="w-4 h-4 text-orange-600" />}
            </div>
            <div className="font-extrabold text-sm text-orange-800 dark:text-orange-300">ORANGE</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Very Urgent. Potential rapid deterioration or hypoxia.
            </div>
          </div>

          {/* RED */}
          <div
            onClick={() => setPriority('RED')}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
              priority === 'RED'
                ? 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/40 shadow-sm ring-2 ring-rose-500/20 animate-pulse'
                : 'border-slate-200 dark:border-slate-800 hover:border-rose-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="w-3.5 h-3.5 rounded-full bg-rose-500" />
              {priority === 'RED' && <Check className="w-4 h-4 text-rose-600" />}
            </div>
            <div className="font-extrabold text-sm text-rose-800 dark:text-rose-300">RED</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Immediate / Resuscitation. Severe ACS, hypoxia, shock.
            </div>
          </div>
        </div>
      </div>

      {/* Vital Signs Grid */}
      <form onSubmit={handleSaveTriage} className="space-y-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-500" />
            Physiological Vital Signs Measurement
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* SpO2 */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-800/40">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5 text-sky-500" /> SpO2 (%)
                </span>
                {spO2Percent < 90 ? (
                  <span className="text-[10px] font-bold text-rose-600">CRITICAL HYPOXIA</span>
                ) : spO2Percent < 95 ? (
                  <span className="text-[10px] font-bold text-amber-600">LOW</span>
                ) : (
                  <span className="text-[10px] font-bold text-emerald-600">NORMAL</span>
                )}
              </div>
              <input
                type="number"
                min="50"
                max="100"
                value={spO2Percent}
                onChange={(e) => setSpO2Percent(Number(e.target.value))}
                className="w-full text-xl font-bold text-slate-900 dark:text-white bg-transparent focus:outline-none"
              />
              <span className="text-[10px] text-slate-400">Target: ≥ 95%</span>
            </div>

            {/* Blood Pressure */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-800/40">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-indigo-500" /> BP (mmHg)
                </span>
                {bpSystolic >= 180 ? (
                  <span className="text-[10px] font-bold text-rose-600">CRISIS</span>
                ) : bpSystolic >= 140 ? (
                  <span className="text-[10px] font-bold text-amber-600">STAGE 2 HTN</span>
                ) : (
                  <span className="text-[10px] font-bold text-emerald-600">NORMAL</span>
                )}
              </div>
              <div className="flex items-center gap-1 text-xl font-bold text-slate-900 dark:text-white">
                <input
                  type="number"
                  min="60"
                  max="260"
                  value={bpSystolic}
                  onChange={(e) => setBpSystolic(Number(e.target.value))}
                  className="w-16 bg-transparent focus:outline-none"
                />
                <span>/</span>
                <input
                  type="number"
                  min="40"
                  max="160"
                  value={bpDiastolic}
                  onChange={(e) => setBpDiastolic(Number(e.target.value))}
                  className="w-16 bg-transparent focus:outline-none"
                />
              </div>
              <span className="text-[10px] text-slate-400">Sys / Dia (Normal: 120/80)</span>
            </div>

            {/* Pulse Rate */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-800/40">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-500" /> Pulse (BPM)
                </span>
                {pulseBpm > 120 ? (
                  <span className="text-[10px] font-bold text-rose-600">TACHYCARDIA</span>
                ) : pulseBpm < 50 ? (
                  <span className="text-[10px] font-bold text-amber-600">BRADYCARDIA</span>
                ) : (
                  <span className="text-[10px] font-bold text-emerald-600">NORMAL</span>
                )}
              </div>
              <input
                type="number"
                min="30"
                max="220"
                value={pulseBpm}
                onChange={(e) => setPulseBpm(Number(e.target.value))}
                className="w-full text-xl font-bold text-slate-900 dark:text-white bg-transparent focus:outline-none"
              />
              <span className="text-[10px] text-slate-400">Normal: 60 - 100 bpm</span>
            </div>

            {/* Temperature */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-800/40">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <Thermometer className="w-3.5 h-3.5 text-amber-500" /> Temp (°F)
                </span>
                {temperatureF >= 102 ? (
                  <span className="text-[10px] font-bold text-rose-600">HIGH FEVER</span>
                ) : temperatureF > 99.5 ? (
                  <span className="text-[10px] font-bold text-amber-600">FEVER</span>
                ) : (
                  <span className="text-[10px] font-bold text-emerald-600">NORMAL</span>
                )}
              </div>
              <input
                type="number"
                step="0.1"
                min="94"
                max="108"
                value={temperatureF}
                onChange={(e) => setTemperatureF(Number(e.target.value))}
                className="w-full text-xl font-bold text-slate-900 dark:text-white bg-transparent focus:outline-none"
              />
              <span className="text-[10px] text-slate-400">Normal: 97.8 - 99.1 °F</span>
            </div>

            {/* Respiratory Rate */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-800/40">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Resp. Rate (/min)
              </span>
              <input
                type="number"
                min="8"
                max="60"
                value={respiratoryRate}
                onChange={(e) => setRespiratoryRate(Number(e.target.value))}
                className="w-full text-xl font-bold text-slate-900 dark:text-white bg-transparent focus:outline-none"
              />
              <span className="text-[10px] text-slate-400">Normal: 12 - 20 /min</span>
            </div>

            {/* Weight */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-800/40">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Weight (kg)
              </span>
              <input
                type="number"
                step="0.5"
                min="2"
                max="250"
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="w-full text-xl font-bold text-slate-900 dark:text-white bg-transparent focus:outline-none"
              />
              <span className="text-[10px] text-slate-400">Weight scale</span>
            </div>

            {/* Height */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-800/40">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Height (cm)
              </span>
              <input
                type="number"
                min="40"
                max="230"
                value={heightCm}
                onChange={(e) => setHeightCm(Number(e.target.value))}
                className="w-full text-xl font-bold text-slate-900 dark:text-white bg-transparent focus:outline-none"
              />
              <span className="text-[10px] text-slate-400">Stadiometer</span>
            </div>

            {/* Calculated BMI */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-800/40">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-emerald-500" /> BMI
                </span>
                <span className="text-[10px] font-bold text-sky-600">AUTO-CALC</span>
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">{bmi}</div>
              <span className="text-[10px] text-slate-400">
                {bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal weight' : bmi < 30 ? 'Overweight' : 'Obesity'}
              </span>
            </div>
          </div>
        </div>

        {/* Glasgow / Mobility / Nurse Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Consciousness & Mobility
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  AVPU Responsiveness:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['Alert', 'Verbal', 'Pain', 'Unresponsive'] as const).map((lvl) => (
                    <button
                      type="button"
                      key={lvl}
                      onClick={() => setConsciousLevel(lvl)}
                      className={`p-2 rounded-xl font-semibold border text-center transition-colors ${
                        consciousLevel === lvl
                          ? 'bg-sky-500 text-white border-sky-500 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Mobility Status:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Ambulatory', 'Wheelchair', 'Stretcher'] as const).map((mob) => (
                    <button
                      type="button"
                      key={mob}
                      onClick={() => setMobilityStatus(mob)}
                      className={`p-2 rounded-xl font-semibold border text-center transition-colors ${
                        mobilityStatus === mob
                          ? 'bg-sky-500 text-white border-sky-500 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {mob}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Triage Nurse Clinical Remarks
            </label>
            <textarea
              rows={4}
              placeholder="e.g. Patient visibly diaphoretic, clutching sternum, immediate ECG recommended..."
              value={nurseNotes}
              onChange={(e) => setNurseNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Actions Bar */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div>
            {savedSuccess && (
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" /> Vitals & Triage recorded! Patient queued for Doctor Consultation.
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving Triage...' : 'Save Triage & Vitals'}
            </button>

            {currentPatient && (
              <button
                type="button"
                onClick={() => onNavigateTab('doctor')}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
              >
                <span>Proceed to Doctor Review</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
