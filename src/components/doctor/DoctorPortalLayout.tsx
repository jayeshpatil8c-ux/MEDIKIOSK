import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Clock,
  HeartPulse,
  Calendar,
  Stethoscope,
  ShieldAlert,
  Leaf,
  FileText,
  BarChart3,
  History,
  Settings,
  LogOut,
  Search,
  Bell,
  Radio,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  Play,
  Flame,
  CheckCircle2,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  UserCheck,
  Building2,
  Lock,
} from 'lucide-react';
import { usePatients } from '../../context/PatientContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage, LANGUAGE_OPTIONS } from '../../context/LanguageContext';
import { Patient, UserRole } from '../../types';
import { ClinicalCaseViewModal } from './ClinicalCaseViewModal';

// Existing clinical views
import { DashboardView } from '../dashboard/DashboardView';
import { PatientListView } from '../patients/PatientListView';
import { QueueDisplayView } from '../queue/QueueDisplayView';
import { NurseTriageView } from '../triage/NurseTriageView';
import { AppointmentsView } from '../appointments/AppointmentsView';
import { DoctorStationView } from './DoctorStationView';
import { AiSafetyHubView } from '../safety/AiSafetyHubView';
import { AyushModuleView } from '../ayush/AyushModuleView';
import { HomeopathyView } from '../homeopathy/HomeopathyView';
import { AnalyticsView } from '../analytics/AnalyticsView';
import { AuditLogView } from '../audit/AuditLogView';
import { AdminConfigView } from '../admin/AdminConfigView';
import { DemoHubView } from '../demo/DemoHubView';
import { PatientProfileView } from '../patients/PatientProfileView';
import { GlobalSearchModal } from '../common/GlobalSearchModal';

interface Props {
  onLogout: () => void;
  onOpenKioskView?: () => void;
}

export const DoctorPortalLayout: React.FC<Props> = ({ onLogout, onOpenKioskView }) => {
  const {
    patients,
    opdTokens,
    appointments,
    notifications,
    markNotificationRead,
    realtimeStatus,
    activePatient,
    setActivePatient,
    callNextQueuePatient,
    liveAlertToast,
    clearLiveAlertToast,
  } = usePatients();

  const { currentUser, currentRole, switchRole, logout } = useAuth();
  const { languageCode, setLanguage } = useLanguage();

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [caseModalPatient, setCaseModalPatient] = useState<Patient | null>(null);

  // Clock
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

  const handleSelectPatient = (p: Patient, tab?: string) => {
    setActivePatient(p);
    setCaseModalPatient(p);
  };

  const handleLogoutClick = () => {
    logout();
    onLogout();
  };

  // Nav Items requested in spec:
  // Overview, Live Patients, Patient Directory, Today's Queue, Triage, Appointments, Clinical Cases, AI & Safety, Ayurveda, Homeopathy, Documents, Analytics, Audit Trail
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, badge: null },
    {
      id: 'live-patients',
      label: 'Live Patients',
      icon: Users,
      badge: patients.filter((p) => p.status !== 'Case Closed').length,
    },
    { id: 'patients', label: 'Patient Directory', icon: UserCheck, badge: null },
    {
      id: 'queue',
      label: "Today's Queue",
      icon: Clock,
      badge: opdTokens.filter((t) => t.status === 'Waiting' || t.status === 'Waiting for Doctor').length,
    },
    { id: 'triage', label: 'Triage', icon: HeartPulse, badge: null },
    { id: 'appointments', label: 'Appointments', icon: Calendar, badge: appointments.length },
    { id: 'cases', label: 'Clinical Cases', icon: Stethoscope, badge: null },
    {
      id: 'ai-safety',
      label: 'AI & Safety',
      icon: ShieldAlert,
      badge: patients.filter((p) => p.safetyAlerts?.some((a) => !a.acknowledged)).length || null,
      badgeColor: 'bg-rose-500',
    },
    { id: 'ayush', label: 'Ayurveda', icon: Leaf, badge: null },
    { id: 'homeopathy', label: 'Homeopathy', icon: Sparkles, badge: null },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, badge: null },
    { id: 'audit', label: 'Audit Trail', icon: History, badge: null },
    { id: 'demo', label: 'Demo Hub', icon: Flame, badge: '5 Scenarios' },
    { id: 'admin', label: 'Admin', icon: Settings, badge: null },
  ];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* ========================================================================= */}
      {/* REAL-TIME TOAST NOTIFICATION (SSE: patient.created) */}
      {/* ========================================================================= */}
      {liveAlertToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-full bg-slate-900 border border-emerald-500/50 rounded-2xl p-4 shadow-2xl text-white animate-bounce-short">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                  ● Real-Time Event Sync
                </span>
                <p className="text-xs font-semibold text-white mt-0.5">
                  {liveAlertToast.message}
                </p>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Received at {liveAlertToast.timestamp}
                </span>
              </div>
            </div>

            <button
              onClick={clearLiveAlertToast}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              onClick={() => {
                const target = patients.find((p) => p.id === liveAlertToast.patientId);
                if (target) {
                  setCaseModalPatient(target);
                }
                clearLiveAlertToast();
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-colors"
            >
              <span>VIEW CASE</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TOP BAR */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Left: Menu toggle & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div
              onClick={() => setActiveTab('overview')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                    MediKiosk
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono">
                    CLINICAL
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                  Staff & Doctor Workstation
                </p>
              </div>
            </div>
          </div>

          {/* Right Controls: Search, Live Status, Notification, Doctor Profile, Language */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live SSE Status Indicator */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-colors">
              {realtimeStatus === 'connected' ? (
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
                  <span className="text-[11px]">LIVE CONNECTED</span>
                </div>
              ) : realtimeStatus === 'reconnecting' ? (
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block" />
                  <span className="text-[11px]">RECONNECTING</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 border-rose-500/30 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                  <span className="text-[11px]">OFFLINE</span>
                </div>
              )}
            </div>

            {/* Global Search Button */}
            <button
              id="btn-doctor-global-search"
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white text-xs transition-colors"
            >
              <Search className="w-4 h-4" />
              <span className="hidden md:inline">Search (Cmd+K)</span>
            </button>

            {/* Live Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-3 z-50 space-y-2 max-h-96 overflow-y-auto">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Live Clinical Notifications
                    </span>
                    <span className="text-[10px] text-slate-400">{notifications.length} total</span>
                  </div>

                  {notifications.slice(0, 8).map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        markNotificationRead(notif.id);
                        if (notif.patientId) {
                          const p = patients.find((pat) => pat.id === notif.patientId);
                          if (p) setCaseModalPatient(p);
                        }
                      }}
                      className={`p-2.5 rounded-xl text-xs cursor-pointer transition-colors ${
                        notif.read
                          ? 'bg-slate-50 dark:bg-slate-800/40 text-slate-500'
                          : 'bg-sky-50/70 dark:bg-sky-950/40 text-slate-800 dark:text-slate-200 border border-sky-200 dark:border-sky-800/50'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span>{notif.title}</span>
                        <span className="text-[10px] text-slate-400">{notif.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                        {notif.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Current Time */}
            <div className="hidden lg:block text-xs font-mono text-slate-500 dark:text-slate-400 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              {currentTime}
            </div>

            {/* Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden xl:block text-left">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block leading-tight">
                    {currentUser.role} • {currentUser.department}
                  </span>
                </div>
              </button>

              {showRoleDropdown && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 space-y-1">
                  <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Switch Role
                    </span>
                  </div>
                  {(['Doctor', 'Nurse', 'AYUSH Vaidya', 'Admin'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        switchRole(r);
                        setShowRoleDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between ${
                        currentRole === r
                          ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>{r}</span>
                      {currentRole === r && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                    </button>
                  ))}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={handleLogoutClick}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out Workstation</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* BODY: SIDEBAR + MAIN CONTENT */}
      {/* ========================================================================= */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside
          className={`${
            isSidebarOpen ? 'w-64' : 'w-20'
          } bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-200 flex flex-col justify-between shrink-0 z-30`}
        >
          {/* Nav Links */}
          <div className="p-3 space-y-1 overflow-y-auto flex-1">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {isSidebarOpen ? 'Clinical Navigation' : 'Nav'}
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                  title={item.label}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-500' : 'text-slate-400'}`} />
                    {isSidebarOpen && <span className="truncate">{item.label}</span>}
                  </div>

                  {isSidebarOpen && item.badge !== null && item.badge !== undefined && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        item.badgeColor
                          ? `${item.badgeColor} text-white`
                          : isActive
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sidebar Bottom: Doctor profile & Logout */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2 bg-slate-50/50 dark:bg-slate-950/40">
            {isSidebarOpen && (
              <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="overflow-hidden flex-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                    {currentUser.department}
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={handleLogoutClick}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {isSidebarOpen && <span>Sign Out Workstation</span>}
            </button>
          </div>
        </aside>

        {/* Main Content View Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {activeTab === 'overview' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              {/* Stat Cards (Requirement 6) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Active Patients
                  </span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
                    {patients.length}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Waiting
                  </span>
                  <span className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 block">
                    {opdTokens.filter((t) => t.status === 'Waiting').length}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    In Triage
                  </span>
                  <span className="text-2xl font-black text-sky-600 dark:text-sky-400 mt-1 block">
                    {opdTokens.filter((t) => t.status === 'In Triage').length}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Ready for Doctor
                  </span>
                  <span className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1 block">
                    {patients.filter((p) => p.status === 'Triage Completed' || p.status === 'READY_FOR_DOCTOR' || p.status === 'Waiting for Doctor').length}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    In Consultation
                  </span>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                    {opdTokens.filter((t) => t.status === 'In Consultation').length}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Completed
                  </span>
                  <span className="text-2xl font-black text-slate-600 dark:text-slate-400 mt-1 block">
                    {patients.filter((p) => p.status === 'Case Closed' || p.status === 'Doctor Approved' || p.status === 'COMPLETED').length}
                  </span>
                </div>
              </div>

              {/* CRITICAL SAFETY ALERTS SECTION */}
              {patients.some((p) => p.safetyAlerts && p.safetyAlerts.length > 0) && (
                <div className="p-5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
                      <ShieldAlert className="w-5 h-5" />
                      <span>CRITICAL SAFETY ALERTS REQUIRING REVIEW</span>
                    </div>
                    <button
                      onClick={() => setActiveTab('ai-safety')}
                      className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline"
                    >
                      View All in Safety Hub →
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {patients
                      .filter((p) => p.safetyAlerts && p.safetyAlerts.length > 0)
                      .slice(0, 4)
                      .map((p) => {
                        const topAlert = p.safetyAlerts![0];
                        return (
                          <div
                            key={p.id}
                            className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/40 flex items-start justify-between gap-3 shadow-sm"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-slate-900 dark:text-white">
                                  {p.demographics.fullName}
                                </span>
                                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                                  {p.opdToken}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500 text-white font-bold">
                                  {topAlert.level}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-1">
                                {topAlert.title}: {topAlert.reason}
                              </p>
                            </div>

                            <button
                              onClick={() => setCaseModalPatient(p)}
                              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shrink-0"
                            >
                              VIEW CASE
                            </button>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* LIVE PATIENT REGISTRATIONS (Real-Time Synchronized List) */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        LIVE PATIENT REGISTRATIONS
                      </h2>
                      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
                        Synchronized via SSE
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Real-time arrivals from the Patient Kiosk portal with zero manual refresh.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={callNextQueuePatient}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Call Next Patient</span>
                    </button>
                  </div>
                </div>

                {/* Table / Cards of Patients */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                        <th className="pb-3 font-bold">Token</th>
                        <th className="pb-3 font-bold">Patient Name</th>
                        <th className="pb-3 font-bold">Age / Gender</th>
                        <th className="pb-3 font-bold">Language</th>
                        <th className="pb-3 font-bold">Chief Complaint</th>
                        <th className="pb-3 font-bold">Status</th>
                        <th className="pb-3 font-bold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {patients.slice(0, 10).map((pat) => (
                        <tr
                          key={pat.id}
                          className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="py-3 font-mono font-bold text-sky-600 dark:text-sky-400">
                            {pat.opdToken || 'OPD-PENDING'}
                          </td>
                          <td className="py-3 font-bold text-slate-900 dark:text-white">
                            {pat.demographics.fullName}
                          </td>
                          <td className="py-3 text-slate-500 dark:text-slate-400">
                            {pat.demographics.age} yrs • {pat.demographics.gender}
                          </td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px]">
                              {pat.demographics.preferredLanguage}
                            </span>
                          </td>
                          <td className="py-3 text-slate-700 dark:text-slate-300 max-w-xs truncate">
                            {pat.symptoms?.chiefComplaint || 'Awaiting clinical input'}
                          </td>
                          <td className="py-3">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                              {pat.status}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <button
                              id={`btn-view-case-${pat.id}`}
                              onClick={() => setCaseModalPatient(pat)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-sm"
                            >
                              VIEW CASE
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bottom Split: Live OPD Queue & Today's Appointments */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Live OPD Queue Preview */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-sky-500" />
                      LIVE OPD QUEUE ({opdTokens.length})
                    </h3>
                    <button
                      onClick={() => setActiveTab('queue')}
                      className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline"
                    >
                      Full Queue View →
                    </button>
                  </div>

                  <div className="space-y-2">
                    {opdTokens.slice(0, 5).map((tok) => (
                      <div
                        key={tok.id}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-black text-sm text-sky-600 dark:text-sky-400">
                            {tok.tokenNumber}
                          </span>
                          <div>
                            <span className="font-bold text-xs text-slate-900 dark:text-white block">
                              {tok.patientName}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Issued: {tok.issueTime} • Est. Wait: {tok.estimatedWaitMinutes}m
                            </span>
                          </div>
                        </div>

                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          tok.status === 'In Consultation'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {tok.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Today's Appointments Preview */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-500" />
                      TODAY'S APPOINTMENTS ({appointments.length})
                    </h3>
                    <button
                      onClick={() => setActiveTab('appointments')}
                      className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
                    >
                      All Appointments →
                    </button>
                  </div>

                  <div className="space-y-2">
                    {appointments.slice(0, 5).map((app) => (
                      <div
                        key={app.id}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-xs text-slate-900 dark:text-white block">
                            {app.patientName}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {app.time} • {app.department} • Dr. {app.doctorName}
                          </span>
                        </div>

                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                          {app.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* OTHER SPECIFIED CLINICAL TABS */}
          {activeTab === 'live-patients' && (
            <div className="max-w-7xl mx-auto">
              <PatientListView onSelectPatient={handleSelectPatient} />
            </div>
          )}

          {activeTab === 'patients' && (
            <div className="max-w-7xl mx-auto">
              <PatientListView onSelectPatient={handleSelectPatient} />
            </div>
          )}

          {activeTab === 'queue' && (
            <div className="max-w-7xl mx-auto">
              <QueueDisplayView />
            </div>
          )}

          {activeTab === 'triage' && (
            <div className="max-w-7xl mx-auto">
              <NurseTriageView onNavigateTab={setActiveTab} />
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="max-w-7xl mx-auto">
              <AppointmentsView />
            </div>
          )}

          {activeTab === 'cases' && (
            <div className="max-w-7xl mx-auto">
              <DoctorStationView
                onNavigateTab={setActiveTab}
                onSelectPatient={handleSelectPatient}
              />
            </div>
          )}

          {activeTab === 'ai-safety' && (
            <div className="max-w-7xl mx-auto">
              <AiSafetyHubView onSelectPatient={handleSelectPatient} />
            </div>
          )}

          {activeTab === 'ayush' && (
            <div className="max-w-7xl mx-auto">
              <AyushModuleView onNavigateTab={setActiveTab} />
            </div>
          )}

          {activeTab === 'homeopathy' && (
            <div className="max-w-7xl mx-auto">
              <HomeopathyView onNavigateTab={setActiveTab} />
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="max-w-7xl mx-auto">
              <AnalyticsView />
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="max-w-7xl mx-auto">
              <AuditLogView />
            </div>
          )}

          {activeTab === 'demo' && (
            <div className="max-w-7xl mx-auto">
              <DemoHubView onNavigateTab={setActiveTab} />
            </div>
          )}

          {activeTab === 'admin' && (
            <div className="max-w-7xl mx-auto">
              <AdminConfigView />
            </div>
          )}
        </main>
      </div>

      {/* Global Search Modal */}
      {isSearchOpen && (
        <GlobalSearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          onSelectPatient={(p, targetTab) => {
            setIsSearchOpen(false);
            setCaseModalPatient(p);
          }}
          onNavigate={(targetTab) => {
            setIsSearchOpen(false);
            setActiveTab(targetTab);
          }}
        />
      )}

      {/* Clinical Case Modal */}
      {caseModalPatient && (
        <ClinicalCaseViewModal
          patient={caseModalPatient}
          onClose={() => setCaseModalPatient(null)}
          onOpenPrescriptionBuilder={() => {
            setActiveTab('cases');
            setCaseModalPatient(null);
          }}
        />
      )}
    </div>
  );
};
