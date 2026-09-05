import React from 'react';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  ClipboardList,
  Activity,
  Stethoscope,
  Sparkles,
  ListOrdered,
  Calendar,
  ShieldCheck,
  History,
  BarChart3,
  Settings,
  Flame,
  Leaf,
  HeartPulse,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePatients } from '../../context/PatientContext';

interface Props {
  isOpen?: boolean;
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const Sidebar: React.FC<Props> = ({ isOpen = true, activeTab, onSelectTab }) => {
  const { currentRole } = useAuth();
  const { opdTokens, patients } = usePatients();

  if (!isOpen) return null;

  const waitingDoctorCount = opdTokens.filter((t) => t.status === 'Waiting for Doctor').length;
  const inTriageCount = opdTokens.filter((t) => t.status === 'In Triage').length;
  const criticalCount = patients.filter((p) => p.triage?.priority === 'RED').length;

  const navSections = [
    {
      title: 'Command & Registry',
      items: [
        { id: 'welcome', label: 'Welcome Kiosk', icon: HeartPulse },
        { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
        { id: 'patients', label: 'Patient Directory', icon: Users, badge: patients.length },
        { id: 'registration', label: 'Patient Registration', icon: UserPlus },
        { id: 'intake', label: 'Patient Intake', icon: ClipboardList },
      ],
    },
    {
      title: 'Clinical Stations',
      items: [
        {
          id: 'triage',
          label: 'Nurse Triage',
          icon: Activity,
          badge: inTriageCount > 0 ? inTriageCount : undefined,
          urgent: criticalCount > 0,
        },
        {
          id: 'doctor',
          label: 'Doctor Station',
          icon: Stethoscope,
          badge: waitingDoctorCount > 0 ? waitingDoctorCount : undefined,
          highlight: currentRole === 'Doctor',
        },
        {
          id: 'homeopathy',
          label: 'Homoeopathy (Robinia 30)',
          icon: Sparkles,
        },
        {
          id: 'ayush',
          label: 'AYUSH Vaidya',
          icon: Leaf,
          highlight: currentRole === 'AYUSH Vaidya',
        },
      ],
    },
    {
      title: 'Queue & Operations',
      items: [
        { id: 'queue', label: 'OPD Queue Board', icon: ListOrdered, badge: opdTokens.length },
        { id: 'appointments', label: 'Appointments', icon: Calendar },
        { id: 'ai-insights', label: 'AI & Safety Hub', icon: Sparkles },
      ],
    },
    {
      title: 'Governance & Demo',
      items: [
        { id: 'audit', label: 'Audit Trail', icon: History },
        { id: 'analytics', label: 'Analytics & Insights', icon: BarChart3 },
        { id: 'admin', label: 'Administration', icon: Settings },
        { id: 'demo', label: 'Demo Hub (5 Scenarios)', icon: Flame, special: true },
      ],
    },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col justify-between overflow-y-auto select-none">
      <div className="p-3 space-y-6">
        {navSections.map((section, sIdx) => (
          <div key={sIdx}>
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {section.title}
            </div>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    id={`nav-${item.id}`}
                    onClick={() => onSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20 font-semibold'
                        : item.special
                        ? 'bg-gradient-to-r from-amber-500/10 to-rose-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 border border-amber-500/20'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive
                            ? 'text-white'
                            : item.special
                            ? 'text-amber-500'
                            : 'text-slate-400 group-hover:text-slate-600'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : item.urgent
                            ? 'bg-rose-500 text-white animate-pulse'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Safety Compliance Footer Badge */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="p-2.5 rounded-xl bg-sky-50/80 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/50 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-sky-600 dark:text-sky-400 flex-shrink-0 mt-0.5" />
          <div className="text-[11px] leading-tight text-sky-900 dark:text-sky-300">
            <span className="font-semibold block mb-0.5">Clinical Decision-Support</span>
            <span className="text-[10px] opacity-80">AI suggestions require qualified doctor approval.</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
