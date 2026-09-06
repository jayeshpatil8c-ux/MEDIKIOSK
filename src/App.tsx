/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { PatientProvider, usePatients } from './context/PatientContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { PresentationModeBar } from './components/common/PresentationModeBar';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { WelcomeView } from './components/welcome/WelcomeView';
import { AppointmentsView } from './components/appointments/AppointmentsView';
import { AiSafetyHubView } from './components/safety/AiSafetyHubView';
import { HomeopathyView } from './components/homeopathy/HomeopathyView';
import { PatientListView } from './components/patients/PatientListView';
import { PatientRegistrationView } from './components/patients/PatientRegistrationView';
import { PatientIntakeView } from './components/patients/PatientIntakeView';
import { NurseTriageView } from './components/triage/NurseTriageView';
import { DoctorStationView } from './components/doctor/DoctorStationView';
import { AyushModuleView } from './components/ayush/AyushModuleView';
import { QueueDisplayView } from './components/queue/QueueDisplayView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { AuditLogView } from './components/audit/AuditLogView';
import { AdminConfigView } from './components/admin/AdminConfigView';
import { DemoHubView } from './components/demo/DemoHubView';
import { PatientProfileView } from './components/patients/PatientProfileView';
import { Patient } from './types';

const MainAppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>(() => {
    if (typeof window === 'undefined') return 'dashboard';
    if (window.location.pathname.startsWith('/kiosk')) return 'registration';
    if (window.location.pathname.startsWith('/doctor')) return 'doctor';
    if (window.location.pathname.startsWith('/admin')) return 'admin';
    return 'dashboard';
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [viewingPatient, setViewingPatient] = useState<Patient | null>(null);

  const { activePatient, setActivePatient, realtimeStatus } = usePatients();

  const handleSelectPatient = (patient: Patient, targetTab?: string) => {
    setActivePatient(patient);
    if (targetTab === 'profile') {
      setViewingPatient(patient);
      setCurrentTab('profile');
    } else if (targetTab) {
      setViewingPatient(null);
      setCurrentTab(targetTab);
    } else {
      setViewingPatient(patient);
      setCurrentTab('profile');
    }
  };

  const handleNavigateTab = (tab: string) => {
    setViewingPatient(null);
    setCurrentTab(tab);
  };

  const handleRegistrationComplete = (patient: Patient) => {
    setActivePatient(patient);
    setViewingPatient(null);
    setCurrentTab('doctor');
  };

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased transition-colors duration-200">
      {/* Top Presentation Walkthrough Banner */}
      <PresentationModeBar
        onSelectTab={handleNavigateTab}
        onNavigateTab={handleNavigateTab}
      />

      {/* Main App Bar Header */}
      <Header
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onNavigateTab={handleNavigateTab}
      />
      <div className="fixed right-4 bottom-4 z-40 rounded-full border border-slate-200/80 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 px-3 py-1.5 text-[11px] font-bold shadow-lg backdrop-blur">
        <span className={`mr-1.5 inline-block h-2 w-2 rounded-full ${realtimeStatus === 'connected' ? 'bg-emerald-500' : realtimeStatus === 'reconnecting' ? 'bg-amber-500 animate-pulse' : 'bg-rose-500'}`} />
        {realtimeStatus === 'connected' ? 'LIVE CONNECTED' : realtimeStatus === 'reconnecting' ? 'RECONNECTING...' : 'OFFLINE'}
      </div>

      {/* Layout Body: Sidebar + Dynamic Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          activeTab={currentTab}
          onSelectTab={handleNavigateTab}
        />

        {/* Dynamic Main Workspace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {currentTab === 'welcome' && (
            <WelcomeView
              onStartRegistration={() => {
                setCurrentTab('registration');
              }}
              onOpenDoctorStation={() => setCurrentTab('doctor')}
              onOpenQueueBoard={() => setCurrentTab('queue')}
              onOpenExistingPatient={() => setCurrentTab('patients')}
              onOpenEmergency={() => setCurrentTab('triage')}
            />
          )}

          {currentTab === 'dashboard' && (
            <DashboardView
              onNavigateTab={handleNavigateTab}
              onSelectPatient={handleSelectPatient}
            />
          )}

          {currentTab === 'patients' && (
            <PatientListView
              onSelectPatient={handleSelectPatient}
              onNavigateTab={handleNavigateTab}
            />
          )}

          {currentTab === 'registration' && (
            <PatientRegistrationView
              onRegistrationComplete={handleRegistrationComplete}
              onNavigateTab={handleNavigateTab}
            />
          )}

          {currentTab === 'appointments' && (
            <AppointmentsView
              onNavigateTab={handleNavigateTab}
              onSelectPatient={handleSelectPatient}
            />
          )}

          {currentTab === 'ai-insights' && (
            <AiSafetyHubView
              onNavigateTab={handleNavigateTab}
              onSelectPatient={handleSelectPatient}
            />
          )}

          {currentTab === 'homeopathy' && (
            <HomeopathyView
              onNavigateTab={handleNavigateTab}
              onSelectPatient={handleSelectPatient}
            />
          )}

          {currentTab === 'intake' && (
            <PatientIntakeView
              onNavigateTab={handleNavigateTab}
              onSelectPatient={handleSelectPatient}
            />
          )}

          {currentTab === 'triage' && (
            <NurseTriageView
              onNavigateTab={handleNavigateTab}
              onSelectPatient={handleSelectPatient}
            />
          )}

          {currentTab === 'doctor' && (
            <DoctorStationView
              onNavigateTab={handleNavigateTab}
              onSelectPatient={handleSelectPatient}
            />
          )}

          {currentTab === 'ayush' && (
            <AyushModuleView
              onNavigateTab={handleNavigateTab}
              onSelectPatient={handleSelectPatient}
            />
          )}

          {currentTab === 'queue' && (
            <QueueDisplayView onNavigateTab={handleNavigateTab} />
          )}

          {currentTab === 'analytics' && <AnalyticsView />}

          {currentTab === 'audit' && <AuditLogView />}

          {currentTab === 'admin' && <AdminConfigView />}

          {currentTab === 'demo' && (
            <DemoHubView
              onNavigateTab={handleNavigateTab}
              onSelectPatient={handleSelectPatient}
            />
          )}

          {currentTab === 'profile' && viewingPatient && (
            <PatientProfileView
              patient={viewingPatient}
              onBack={() => {
                setViewingPatient(null);
                setCurrentTab('patients');
              }}
              onNavigateTab={handleNavigateTab}
            />
          )}
        </main>
      </div>

      {/* Global Command Search (Cmd+K / Ctrl+K) */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectPatient={handleSelectPatient}
      />
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
      <AuthProvider>
        <PatientProvider>
          <MainAppContent />
        </PatientProvider>
      </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
