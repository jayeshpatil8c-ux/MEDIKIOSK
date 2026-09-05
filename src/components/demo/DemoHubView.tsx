import React from 'react';
import {
  Sparkles,
  Play,
  ArrowRight,
  ShieldAlert,
  Activity,
  Heart,
  Stethoscope,
  Cpu,
  Layers,
  CheckCircle2,
  BookOpen,
  User,
  Zap,
} from 'lucide-react';
import { usePatients } from '../../context/PatientContext';
import { Patient } from '../../types';

interface Props {
  onNavigateTab: (tab: string) => void;
  onSelectPatient: (patient: Patient, tab?: string) => void;
}

export const DemoHubView: React.FC<Props> = ({ onNavigateTab, onSelectPatient }) => {
  const { patients, setActivePatient } = usePatients();

  const handleSelectScenario = (opdToken: string, targetTab: string) => {
    const target = patients.find((p) => p.opdToken === opdToken) || patients[0];
    if (target) {
      setActivePatient(target);
      onSelectPatient(target, targetTab);
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 text-xs font-bold border border-sky-200 dark:border-sky-800 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Interactive Hackathon & Clinical Jury Demonstration Hub
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          MediKiosk End-to-End Clinical Lifecycle Showcase
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
          Explore the end-to-end clinical kiosk journey from patient arrival to ABHA registration, voice-enabled intake, triage vitals categorization, rule-based safety alarms, Gemini clinical summarization, and physician sign-off.
        </p>
      </div>

      {/* 5-Step Guided Lifecycle Cards */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          5-Phase End-to-End Demonstration Journey
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {[
            {
              step: '01',
              title: 'Registration',
              desc: 'ABHA Linkage & OPD Token generation',
              tab: 'registration',
              color: 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/30',
            },
            {
              step: '02',
              title: 'Intake & Voice',
              desc: 'Regional Hindi/Marathi voice dictation',
              tab: 'intake',
              color: 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30',
            },
            {
              step: '03',
              title: 'Nurse Triage',
              desc: 'Vitals acquisition & RED/ORANGE triggers',
              tab: 'triage',
              color: 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30',
            },
            {
              step: '04',
              title: 'Doctor Station',
              desc: 'Gemini synthesis & verified prescription',
              tab: 'doctor',
              color: 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30',
            },
            {
              step: '05',
              title: 'Public Queue',
              desc: 'Live token monitor with audio chime',
              tab: 'queue',
              color: 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/30',
            },
          ].map((item) => (
            <div
              key={item.step}
              onClick={() => onNavigateTab(item.tab)}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all hover:scale-[1.02] shadow-xs flex flex-col justify-between ${item.color}`}
            >
              <div>
                <span className="font-mono text-xs font-extrabold opacity-60">PHASE {item.step}</span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-1">{item.title}</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">{item.desc}</p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                <span>Launch</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Benchmark Demo Scenarios */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Pre-Loaded Clinical Benchmark Scenarios (1-Click Launch)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Scenario 1: Acute Chest Pain / ACS */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 hover:border-rose-300 dark:hover:border-rose-900/50 transition-colors">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300">
                SCENARIO A • EMERGENCY (RED)
              </span>
              <span className="font-mono text-xs font-bold text-slate-400">Token T-101</span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Acute Coronary Syndrome / Myocardial Infarction
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                58-year-old male presenting with crushing retrosternal pain, diaphoretic, BP 164/98 mmHg, known Penicillin allergy.
              </p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-[11px] text-rose-600 font-semibold">Triggers: Hypoxia, Severe HTN, Drug Allergy Alert</span>
              <button
                onClick={() => handleSelectScenario('T-101', 'doctor')}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-1 shadow-xs"
              >
                <span>Inspect in Doctor Station</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Scenario 2: High Fever Dengue / Sepsis */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 hover:border-amber-300 dark:hover:border-amber-900/50 transition-colors">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300">
                SCENARIO B • URGENT (YELLOW)
              </span>
              <span className="font-mono text-xs font-bold text-slate-400">Token T-102</span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Pyrexia of Unknown Origin (Suspected Dengue / Viral)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                34-year-old female presenting with 102.4°F continuous fever, retro-orbital pain, severe myalgia for 4 days.
              </p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-[11px] text-amber-600 font-semibold">Triggers: High grade pyrexia, NSAID avoidance</span>
              <button
                onClick={() => handleSelectScenario('T-102', 'doctor')}
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold flex items-center gap-1 shadow-xs"
              >
                <span>Inspect in Doctor Station</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Scenario 3: Pediatric Acute Asthma */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 hover:border-orange-300 dark:hover:border-orange-900/50 transition-colors">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border border-orange-300">
                SCENARIO C • VERY URGENT (ORANGE)
              </span>
              <span className="font-mono text-xs font-bold text-slate-400">Token T-103</span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Acute Bronchospasm & Respiratory Distress
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                8-year-old child presenting with severe audible wheeze, tachypnea (RR 32/min), SpO2 93% on room air.
              </p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-[11px] text-orange-600 font-semibold">Triggers: Hypoxemia & Pediatric Tachypnea</span>
              <button
                onClick={() => handleSelectScenario('T-103', 'triage')}
                className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold flex items-center gap-1 shadow-xs"
              >
                <span>Review Triage & Vitals</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Scenario 4: AYUSH Integrative Care */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 hover:border-emerald-300 dark:hover:border-emerald-900/50 transition-colors">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300">
                SCENARIO D • INTEGRATIVE AYUSH
              </span>
              <span className="font-mono text-xs font-bold text-slate-400">Token T-104</span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Chronic Lifestyle Dyspepsia & Arthralgia
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                46-year-old teacher seeking holistic herbal regimen, Prakriti assessment and Dinacharya protocol.
              </p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-[11px] text-emerald-600 font-semibold">Integrative dual-care with Allopathy</span>
              <button
                onClick={() => handleSelectScenario('T-104', 'ayush')}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1 shadow-xs"
              >
                <span>Open AYUSH Station</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Full-Stack Architecture Architecture Breakdown */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-400" />
            <h2 className="text-sm font-extrabold uppercase tracking-wider">
              Technical Architecture & Clinical Safety Pipeline
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">Node.js + React 18 + Gemini 2.5</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-800 space-y-2">
            <div className="font-bold text-sky-400 flex items-center gap-1.5">
              <Zap className="w-4 h-4" /> Client Layer
            </div>
            <p className="text-slate-300">
              React + TypeScript + Tailwind CSS with accessibility-first touch targets, multi-lingual audio dictation (Web Speech API), Three.js physiological 3D visualization, and real-time live OPD queue updates.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-800 space-y-2">
            <div className="font-bold text-emerald-400 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" /> Deterministic Safety Engine
            </div>
            <p className="text-slate-300">
              Rule-based physiological boundary checking (vital signs hypoxia, hypertensive crisis, tachycardia) and documented drug-allergy contraindication checks running decoupled from the LLM to guarantee safety.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-800 space-y-2">
            <div className="font-bold text-purple-400 flex items-center gap-1.5">
              <Cpu className="w-4 h-4" /> Gemini AI & Fallback
            </div>
            <p className="text-slate-300">
              Structured clinical case summarization, red flag extraction, and differential suggestions via Google GenAI SDK, with guaranteed offline deterministic fallback so clinics never face downtime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
