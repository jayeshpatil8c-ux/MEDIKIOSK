import React, { useState } from 'react';
import {
  Stethoscope,
  Lock,
  User,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  ArrowLeft,
  KeyRound,
  AlertCircle,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface Props {
  onLoginSuccess: (role: UserRole) => void;
  onBackToPortalSelection: () => void;
  defaultRole?: UserRole;
}

export const DoctorStaffLoginView: React.FC<Props> = ({
  onLoginSuccess,
  onBackToPortalSelection,
  defaultRole = 'Doctor',
}) => {
  const { login, users } = useAuth();
  const [username, setUsername] = useState('arvind.mehta@hospital.gov.in');
  const [password, setPassword] = useState('clinical2026');
  const [selectedRole, setSelectedRole] = useState<UserRole>(defaultRole);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await login(username, selectedRole);
      onLoginSuccess(selectedRole);
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async (user: (typeof users)[0]) => {
    setUsername(user.email);
    setSelectedRole(user.role);
    setIsSubmitting(true);
    try {
      await login(user.email, user.role);
      onLoginSuccess(user.role);
    } catch {
      // Fallback
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background glow */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-600/10 blur-[120px] pointer-events-none" />

      {/* Top Bar */}
      <header className="w-full border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-4 sm:px-6 py-3.5 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={onBackToPortalSelection}
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Portal Selection</span>
          </button>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>NABH & HIPAA Compliant Session</span>
          </div>
        </div>
      </header>

      {/* Center Login Form */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10 max-w-lg mx-auto w-full">
        <div className="w-full bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800 rounded-3xl p-7 sm:p-9 shadow-2xl space-y-6">
          {/* Form Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <Stethoscope className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              MEDIKIOSK CLINICAL STAFF PORTAL
            </h1>
            <p className="text-xs text-slate-400">
              Sign in with your hospital staff ID to access clinical records & triage
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role selection tab */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Staff Department / Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['Doctor', 'Nurse', 'AYUSH Vaidya', 'Admin'] as UserRole[]).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      selectedRole === role
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm shadow-emerald-500/10'
                        : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-200'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Username / Staff ID */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Username / Hospital Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. arvind.mehta@hospital.gov.in"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Clinical Access Key / Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono"
                />
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all mt-2 cursor-pointer disabled:opacity-50"
            >
              <span>SIGN IN TO WORKSTATION</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Clearly marked DEMO logins */}
          <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-bold tracking-wider uppercase text-amber-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                DEMO CLINICAL PROFILES (1-CLICK TEST)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {users.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleDemoLogin(u)}
                  className="text-left p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 truncate">
                      {u.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-700 text-slate-300">
                      {u.role}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 block truncate">
                    {u.department}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-3 px-4 text-center text-xs text-slate-500 border-t border-slate-800/60 z-20">
        <span>MediKiosk Hospital Orchestrator • Protected Clinical System</span>
      </footer>
    </div>
  );
};
