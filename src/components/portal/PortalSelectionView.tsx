import React from 'react';
import {
  User,
  Heart,
  Stethoscope,
  Sparkles,
  ArrowRight,
  Mic,
  Search,
  ShieldAlert,
  Activity,
  Users,
  Building2,
  PhoneCall,
  Clock,
  Radio,
  FileText,
  Lock,
} from 'lucide-react';
import { ThreeHeroSphere } from '../common/ThreeHeroSphere';

interface Props {
  onNavigate: (path: string) => void;
}

export const PortalSelectionView: React.FC<Props> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-sky-500 selection:text-white">
      {/* Background ambient lighting */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-sky-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-600/10 blur-[120px] pointer-events-none" />

      {/* Top hospital banner */}
      <header className="w-full border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Activity className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white">
                  MEDIKIOSK
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  Dual-Portal Architecture
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                AI Patient Case-Taking & Clinical Orchestration System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-300">
              <Building2 className="w-3.5 h-3.5 text-sky-400" />
              <span>District Civil Hospital & PHC Network</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
              <Radio className="w-3 h-3 animate-ping" />
              <span className="font-semibold">System Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-10 relative z-10 max-w-6xl mx-auto w-full">
        {/* Intro Tag & Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-sky-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Autonomous Patient Intake & Real-Time Clinical Station</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Select Your Portal
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto">
            Choose whether you are a patient checking into the hospital or a medical professional accessing the clinical workstation.
          </p>
        </div>

        {/* The Two Main Portals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          {/* PORTAL 1: PATIENT PORTAL */}
          <div
            id="patient-portal-card"
            className="group relative flex flex-col justify-between rounded-3xl bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950/90 border border-sky-500/30 p-7 sm:p-8 hover:border-sky-400/70 transition-all duration-300 shadow-2xl hover:shadow-sky-500/10"
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-400/30 text-sky-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <User className="w-7 h-7" />
                </div>
                <span className="px-3 py-1 rounded-full bg-sky-500/20 border border-sky-500/30 text-sky-300 text-xs font-semibold">
                  Self-Service Touchscreen
                </span>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  PATIENT PORTAL
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    /kiosk
                  </span>
                </h2>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                  Register, provide your health information, complete your guided assessment and receive your OPD token.
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-2">
                <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-2 rounded-xl border border-slate-700/50">
                  <Heart className="w-3.5 h-3.5 text-rose-400" />
                  <span>Audio & Large Text</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-2 rounded-xl border border-slate-700/50">
                  <Mic className="w-3.5 h-3.5 text-sky-400" />
                  <span>3 Indian Languages</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-2 rounded-xl border border-slate-700/50">
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span>ABHA & OCR Scanning</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-2 rounded-xl border border-slate-700/50">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Instant OPD Token</span>
                </div>
              </div>
            </div>

            {/* Action Buttons for Patient */}
            <div className="pt-8 space-y-2.5">
              <button
                id="btn-new-patient-registration"
                onClick={() => onNavigate('/kiosk/register')}
                className="w-full py-3.5 px-4 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 group/btn transition-all"
              >
                <span>NEW PATIENT REGISTRATION</span>
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </button>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  id="btn-existing-patient"
                  onClick={() => onNavigate('/kiosk/existing')}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <Search className="w-3.5 h-3.5 text-slate-400" />
                  <span>Existing Patient</span>
                </button>
                <button
                  id="btn-voice-registration"
                  onClick={() => onNavigate('/kiosk/voice')}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <Mic className="w-3.5 h-3.5 text-sky-400" />
                  <span>Voice-Assisted</span>
                </button>
              </div>
            </div>
          </div>

          {/* PORTAL 2: DOCTOR / STAFF PORTAL */}
          <div
            id="doctor-portal-card"
            className="group relative flex flex-col justify-between rounded-3xl bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950/90 border border-emerald-500/30 p-7 sm:p-8 hover:border-emerald-400/70 transition-all duration-300 shadow-2xl hover:shadow-emerald-500/10"
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Stethoscope className="w-7 h-7" />
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
                  <Lock className="w-3 h-3" />
                  Clinical Staff Access
                </span>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  DOCTOR / STAFF PORTAL
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    /doctor
                  </span>
                </h2>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                  Access patient records, live registrations, triage, queue, clinical summaries and consultation workflow.
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-2">
                <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-2 rounded-xl border border-slate-700/50">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Real-Time SSE Sync</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-2 rounded-xl border border-slate-700/50">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <span>Critical Safety Alerts</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-2 rounded-xl border border-slate-700/50">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>AI Structured SOAP</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-2 rounded-xl border border-slate-700/50">
                  <Users className="w-3.5 h-3.5 text-sky-400" />
                  <span>Queue & Prescription</span>
                </div>
              </div>
            </div>

            {/* Action Buttons for Doctor */}
            <div className="pt-8 space-y-2.5">
              <button
                id="btn-doctor-staff-login"
                onClick={() => onNavigate('/doctor/login')}
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 group/btn transition-all"
              >
                <span>DOCTOR / STAFF LOGIN</span>
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </button>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-400">
                  Authorized access for Physicians, Triage Nurses, AYUSH Vaidyas & Clinic Admins.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer info & emergency helpline */}
      <footer className="w-full border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md py-4 px-4 sm:px-6 lg:px-8 text-xs text-slate-400 z-20">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">MediKiosk Health System</span>
            <span>•</span>
            <span>Smart India Healthcare Initiative</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-rose-400 font-semibold">
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Emergency Helpline: 108 / 112</span>
            </div>
            <span className="hidden sm:inline">•</span>
            <span className="text-slate-400">Shared Unified Medical Persistence</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
