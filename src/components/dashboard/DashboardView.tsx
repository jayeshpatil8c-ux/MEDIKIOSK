import React from 'react';
import {
  Users,
  Activity,
  Stethoscope,
  Sparkles,
  Clock,
  ShieldAlert,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  UserPlus,
  Play,
  HeartPulse,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { ThreeHeroSphere } from '../common/ThreeHeroSphere';
import { usePatients } from '../../context/PatientContext';
import { useAuth } from '../../context/AuthContext';
import { Patient } from '../../types';

interface Props {
  onNavigateTab: (tab: string) => void;
  onSelectPatient: (patient: Patient, tab?: string) => void;
}

export const DashboardView: React.FC<Props> = ({ onNavigateTab, onSelectPatient }) => {
  const { patients, opdTokens, analytics, callNextQueuePatient, seedScenario } = usePatients();
  const { currentRole } = useAuth();

  const waitingTokens = opdTokens.filter((t) => t.status === 'Waiting' || t.status === 'Waiting for Doctor');
  const criticalPatients = patients.filter((p) => p.triage?.priority === 'RED' || p.triage?.priority === 'ORANGE');

  const stats = analytics?.stats || {
    totalPatientsToday: patients.length + 28,
    activeInClinic: patients.length,
    waitingPatients: opdTokens.filter((t) => t.status === 'Waiting').length,
    inTriage: opdTokens.filter((t) => t.status === 'In Triage').length,
    waitingForDoctor: opdTokens.filter((t) => t.status === 'Waiting for Doctor').length,
    completedCases: patients.filter((p) => p.status === 'Case Closed' || p.status === 'Doctor Approved').length,
    emergencyCases: criticalPatients.length,
    averageWaitingTimeMinutes: 14,
    aiAssistedCases: patients.filter((p) => Boolean(p.aiAnalysis)).length,
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 3D Hero Command Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 text-white p-6 sm:p-8 border border-sky-500/20 shadow-2xl">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Smart Hospital & PHC Workflow Orchestrator</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight text-white">
              AI Patient Case-Taking & <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-400">
                Clinical Safety Kiosk
              </span>
            </h1>

            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              Intelligent registration, multi-modal intake, automated vital sign triage, rule-based safety alerts, and AI-assisted clinical case summarization for doctors and AYUSH practitioners.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigateTab('registration')}
                className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-sky-500/25 transition-all"
              >
                <UserPlus className="w-4 h-4" />
                Register New Patient
              </button>

              <button
                onClick={() => onNavigateTab('demo')}
                className="px-4 py-2.5 rounded-xl bg-purple-600/80 hover:bg-purple-600 text-white text-xs font-bold flex items-center gap-2 border border-purple-400/30 shadow-lg shadow-purple-500/20 transition-all"
              >
                <Flame className="w-4 h-4 text-amber-300" />
                Load Demo Scenarios (5)
              </button>

              {currentRole === 'Doctor' && (
                <button
                  onClick={callNextQueuePatient}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all"
                >
                  <Play className="w-4 h-4" />
                  Call Next Patient
                </button>
              )}
            </div>
          </div>

          {/* 3D Medical Connected-Data Sphere */}
          <div className="lg:col-span-5 relative flex flex-col items-center justify-center">
            <div className="w-full h-56 sm:h-64 relative">
              <ThreeHeroSphere />
            </div>

            {/* Orbit Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-semibold text-slate-300 mt-2">
              <span className="px-2 py-0.5 rounded-md bg-sky-500/20 border border-sky-400/30 text-sky-300">Patients</span>
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-400/30 text-amber-300">Triage</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/30 text-emerald-300">Doctors</span>
              <span className="px-2 py-0.5 rounded-md bg-purple-500/20 border border-purple-400/30 text-purple-300">AI Support</span>
              <span className="px-2 py-0.5 rounded-md bg-rose-500/20 border border-rose-400/30 text-rose-300">Safety Rules</span>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Alert Notice (if any RED patient exists) */}
      {criticalPatients.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center font-bold flex-shrink-0 animate-bounce">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-rose-900 dark:text-rose-200 uppercase tracking-wider">
                Clinical Safety Alert: Urgent Patients Awaiting Doctor Attention
              </h3>
              <p className="text-xs text-rose-700 dark:text-rose-300">
                {criticalPatients[0].demographics.fullName} ({criticalPatients[0].opdToken}) is marked RED triage priority. Immediate physician review is advised.
              </p>
            </div>
          </div>
          <button
            onClick={() => onSelectPatient(criticalPatients[0], 'doctor')}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-sm whitespace-nowrap transition-colors"
          >
            Review Patient Now
          </button>
        </div>
      )}

      {/* Real-time KPI Metric Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Today</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {stats.totalPatientsToday}
            </span>
            <span className="text-[11px] text-emerald-600 flex items-center font-semibold">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +18%
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Registered in OPD</span>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">In Triage & Vitals</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {stats.inTriage}
            </span>
            <span className="text-[11px] text-amber-600 font-semibold">Active Stations</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Nurse triage checks</span>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Waiting for Doctor</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Stethoscope className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {stats.waitingForDoctor}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">Avg ~{stats.averageWaitingTimeMinutes}m wait</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Queue ready for review</span>
        </div>

        {/* Metric 4 */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">AI-Assisted Cases</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {stats.aiAssistedCases}
            </span>
            <span className="text-[11px] text-purple-600 font-semibold">Gemini + Safety</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Clinician validated</span>
        </div>
      </div>

      {/* Main Split: Live OPD Queue & Triage Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Live OPD Queue (8 cols) */}
        <div className="lg:col-span-8 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-500" />
                Live OPD Consultation Queue
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Current token status across triage and consultation rooms
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('queue')}
              className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
            >
              View Full Board <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {opdTokens.slice(0, 5).map((token) => {
              const priorityColors: Record<string, string> = {
                GREEN: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
                YELLOW: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
                ORANGE: 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300',
                RED: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 animate-pulse',
              };

              const matchedPatient = patients.find((p) => p.id === token.patientId);

              return (
                <div
                  key={token.id}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl px-2 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="font-mono text-xs font-extrabold px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-100 dark:border-sky-900/40">
                      {token.tokenNumber}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{token.patientName}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${priorityColors[token.priority]}`}>
                          {token.priority}
                        </span>
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                        {token.department} • Status: <span className="font-medium text-slate-700 dark:text-slate-300">{token.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {matchedPatient && (
                      <button
                        onClick={() => onSelectPatient(matchedPatient, 'doctor')}
                        className="px-3 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/50 hover:bg-sky-100 text-sky-700 dark:text-sky-300 text-xs font-semibold transition-colors"
                      >
                        Open Case
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Clinical Operations & Triage Priority Breakdown (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Triage breakdown */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
              Triage Priority Breakdown
            </h3>
            <div className="space-y-2.5">
              <div>
                <div className="flex justify-between text-xs mb-1 font-medium">
                  <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1.5 font-bold">
                    <span className="w-2 h-2 rounded-full bg-rose-500" /> RED (Resuscitation / Immediate)
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {patients.filter((p) => p.triage?.priority === 'RED').length}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: '20%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-medium">
                  <span className="text-orange-600 dark:text-orange-400 flex items-center gap-1.5 font-bold">
                    <span className="w-2 h-2 rounded-full bg-orange-500" /> ORANGE (Very Urgent)
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {patients.filter((p) => p.triage?.priority === 'ORANGE').length}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full" style={{ width: '25%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-medium">
                  <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1.5 font-bold">
                    <span className="w-2 h-2 rounded-full bg-amber-500" /> YELLOW (Urgent)
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {patients.filter((p) => p.triage?.priority === 'YELLOW').length}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '40%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-medium">
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> GREEN (Standard / Routine)
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {patients.filter((p) => p.triage?.priority === 'GREEN').length}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '60%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* System Telemetry & Safety Engine status */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
              System Telemetry & AI Status
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-600 dark:text-slate-400">Gemini AI Clinical Engine</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active (3.8-flash)
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-600 dark:text-slate-400">Deterministic Safety Engine</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> v2.1 Rules Active
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-600 dark:text-slate-400">Kiosk Voice Dictation</span>
                <span className="font-semibold text-sky-600">En / Hi / Mr</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
