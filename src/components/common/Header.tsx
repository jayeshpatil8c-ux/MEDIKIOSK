import React, { useState, useEffect } from 'react';
import {
  HeartPulse,
  Search,
  Bell,
  Sun,
  Moon,
  Monitor,
  Presentation,
  ShieldAlert,
  ChevronDown,
  User,
  Sparkles,
  CheckCircle,
  Clock,
  Menu,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { usePatients } from '../../context/PatientContext';
import { UserRole } from '../../types';
import { LANGUAGE_OPTIONS, useLanguage } from '../../context/LanguageContext';

interface Props {
  onToggleSidebar?: () => void;
  onOpenSearch: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const Header: React.FC<Props> = ({ onToggleSidebar, onOpenSearch, onNavigateTab }) => {
  const navigate = onNavigateTab || (() => {});
  const { currentUser, currentRole, switchRole, users } = useAuth();
  const { isDark, toggleTheme, isKioskMode, toggleKioskMode, isPresentationMode, togglePresentationMode, activePresentationStepInfo } = useTheme();
  const { notifications, markNotificationRead, patients } = usePatients();
  const { languageCode, setLanguage } = useLanguage();

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const criticalCount = patients.filter((p) => p.triage?.priority === 'RED').length;

  const roleBadges: Record<UserRole, string> = {
    Doctor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    Nurse: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    'AYUSH Vaidya': 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
    Admin: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand & Badges */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <div
            onClick={() => navigate('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <HeartPulse className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                  MediKiosk
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-mono">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                AI Patient Case-Taking & Clinical Safety Kiosk
              </p>
            </div>
          </div>

          {/* Smart India Hackathon Tag */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-[11px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
            <span>SIH26047</span>
          </div>

          {/* Critical Priority Alert Pill */}
          {criticalCount > 0 && (
            <div
              onClick={() => navigate('triage')}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold animate-pulse cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{criticalCount} Critical RED Alert</span>
            </div>
          )}
        </div>

        {/* Center: Quick Search Trigger */}
        <div className="flex-1 max-w-md hidden md:block">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs transition-colors"
          >
            <span className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <span>Search patients, tokens, ABHA ID...</span>
            </span>
            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[10px] font-mono shadow-xs">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Actions: Presentation, Kiosk, Theme, Alerts, User Switcher */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <label className="sr-only" htmlFor="global-language-selector">Language</label>
          <select id="global-language-selector" value={languageCode} onChange={(event) => setLanguage(event.target.value as 'en' | 'hi' | 'mr')} className="min-h-[40px] max-w-[120px] rounded-xl border border-slate-200 bg-slate-100 px-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
            {LANGUAGE_OPTIONS.map((option) => <option key={option.code} value={option.code}>{option.nativeName}</option>)}
          </select>
          {/* Real-time Clock */}
          <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono px-2">
            <Clock className="w-3.5 h-3.5 text-sky-500" />
            <span>{currentTime}</span>
          </div>

          {/* Presentation Mode Toggle */}
          <button
            onClick={togglePresentationMode}
            title="Toggle Hackathon Presentation Mode"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              isPresentationMode
                ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-600'
            }`}
          >
            <Presentation className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Demo Flow</span>
            {isPresentationMode && (
              <span className="bg-white/20 text-[10px] px-1.5 py-0.2 rounded font-mono">
                {activePresentationStepInfo.step}/9
              </span>
            )}
          </button>

          {/* Kiosk Mode Toggle */}
          <button
            onClick={toggleKioskMode}
            title={isKioskMode ? 'Exit High-Contrast Kiosk Mode' : 'Enter Kiosk Touch Terminal Mode'}
            className={`p-2 rounded-xl text-xs border transition-colors ${
              isKioskMode
                ? 'bg-sky-600 text-white border-sky-600'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Monitor className="w-4 h-4" />
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Notifications Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications((prev) => !prev)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Popover */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden">
                <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-sky-500" /> Clinical Notifications ({unreadCount})
                  </span>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-[11px] text-slate-400 hover:text-slate-600"
                  >
                    Close
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-slate-400">No alerts or notifications</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markNotificationRead(n.id);
                          if (n.link) navigate(n.link);
                          setShowNotifications(false);
                        }}
                        className={`p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors ${
                          !n.read ? 'bg-sky-50/40 dark:bg-sky-950/20' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-slate-900 dark:text-white">{n.title}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Role Switcher Menu */}
          <div className="relative">
            <button
              onClick={() => setShowRoleDropdown((prev) => !prev)}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                roleBadges[currentRole]
              }`}
            >
              <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-300">
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-full h-full p-0.5" />
                )}
              </div>
              <div className="text-left hidden sm:block">
                <span className="block text-[11px] font-bold leading-tight">{currentUser.name}</span>
                <span className="block text-[9px] uppercase tracking-wider opacity-75">{currentRole}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>

            {/* Role Switcher Dropdown */}
            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 p-2">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
                  Switch Active Role & Station:
                </div>
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      switchRole(user.role);
                      setShowRoleDropdown(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl flex items-center gap-3 transition-colors ${
                      user.role === currentRole
                        ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 font-semibold'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 flex-shrink-0">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-full h-full p-1" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold">{user.name}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        {user.role} • {user.department}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
