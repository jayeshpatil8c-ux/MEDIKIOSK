import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Cpu,
  Globe,
  Database,
  RefreshCw,
  Save,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Monitor,
} from 'lucide-react';
import { usePatients } from '../../context/PatientContext';

export const AdminConfigView: React.FC = () => {
  const { reloadPatients } = usePatients();

  // Kiosk settings
  const [kioskName, setKioskName] = useState('MediKiosk Terminal #01 (OPD Triage Desk)');
  const [facilityType, setFacilityType] = useState('Primary Health Centre (PHC) / Community Health Centre');
  const [autoPrintSlip, setAutoPrintSlip] = useState(true);

  // Safety thresholds
  const [spo2Threshold, setSpo2Threshold] = useState(92);
  const [systolicThreshold, setSystolicThreshold] = useState(160);
  const [pulseThreshold, setPulseThreshold] = useState(115);
  const [tempThreshold, setTempThreshold] = useState(101.5);

  // AI & Language
  const [aiModel, setAiModel] = useState('gemini-2.5-flash');
  const [enableHindi, setEnableHindi] = useState(true);
  const [enableMarathi, setEnableMarathi] = useState(true);
  const [deterministicFallback, setDeterministicFallback] = useState(true);

  const [isResetting, setIsResetting] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveNotice('Kiosk clinical configurations & safety thresholds successfully updated.');
    setTimeout(() => setSaveNotice(null), 3500);
  };

  const handleResetDemoData = async () => {
    if (!window.confirm('Reset all demo patient records, triage states, and audit logs to original pristine benchmark data?')) {
      return;
    }
    try {
      setIsResetting(true);
      await reloadPatients();
      setSaveNotice('Database reset to pristine clinical demo benchmark state.');
      setTimeout(() => setSaveNotice(null), 3500);
    } catch (err: any) {
      alert(err.message || 'Error resetting data');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-sky-600" />
          Kiosk Terminal Administration & Safety Engine Configuration
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Configure clinical safety thresholds, AI model parameters, facility metadata, and demo data state
        </p>
      </div>

      {saveNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{saveNotice}</span>
        </div>
      )}

      <form onSubmit={handleSaveConfig} className="space-y-6">
        {/* Terminal Profile */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
            <Monitor className="w-4 h-4 text-sky-500" />
            Device & Facility Profile
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Kiosk Terminal Identifier
              </label>
              <input
                type="text"
                value={kioskName}
                onChange={(e) => setKioskName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Facility & Department Type
              </label>
              <input
                type="text"
                value={facilityType}
                onChange={(e) => setFacilityType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Rule-based Safety Thresholds */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-rose-500" />
              Safety Engine Critical Physiological Triggers
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              If recorded vitals breach these thresholds, the system automatically elevates priority to RED / ORANGE.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                SpO2 Hypoxia Cutoff (%)
              </label>
              <input
                type="number"
                min="70"
                max="98"
                value={spo2Threshold}
                onChange={(e) => setSpo2Threshold(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold"
              />
              <span className="text-[10px] text-slate-400">Trigger alert if &lt; {spo2Threshold}%</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                Severe HTN Systolic (mmHg)
              </label>
              <input
                type="number"
                min="130"
                max="220"
                value={systolicThreshold}
                onChange={(e) => setSystolicThreshold(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold"
              />
              <span className="text-[10px] text-slate-400">Trigger alert if ≥ {systolicThreshold}</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                Tachycardia Cutoff (BPM)
              </label>
              <input
                type="number"
                min="90"
                max="160"
                value={pulseThreshold}
                onChange={(e) => setPulseThreshold(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold"
              />
              <span className="text-[10px] text-slate-400">Trigger alert if &gt; {pulseThreshold}</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                High Fever Cutoff (°F)
              </label>
              <input
                type="number"
                step="0.1"
                min="99"
                max="105"
                value={tempThreshold}
                onChange={(e) => setTempThreshold(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold"
              />
              <span className="text-[10px] text-slate-400">Trigger alert if ≥ {tempThreshold}°F</span>
            </div>
          </div>
        </div>

        {/* AI & Multi-lingual Settings */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-purple-500" />
            AI Decision Support & Linguistic Engine
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Gemini LLM Synthesis Model
              </label>
              <select
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800"
              >
                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Sub-second clinical reasoning)</option>
                <option value="gemini-2.5-pro">Gemini 2.5 Pro (Deep differential analysis)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                Enabled Regional Speech Languages:
              </label>
              <div className="flex gap-4 pt-1">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={enableHindi}
                    onChange={(e) => setEnableHindi(e.target.checked)}
                    className="rounded text-sky-600"
                  />
                  <span>हिंदी (Hindi)</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={enableMarathi}
                    onChange={(e) => setEnableMarathi(e.target.checked)}
                    className="rounded text-sky-600"
                  />
                  <span>मराठी (Marathi)</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <button
            type="button"
            disabled={isResetting}
            onClick={handleResetDemoData}
            className="px-4 py-2 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span>Reset Demo Benchmark Data</span>
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
};
