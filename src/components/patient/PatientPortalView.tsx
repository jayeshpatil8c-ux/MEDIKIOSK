import React, { useState } from 'react';
import { PatientPortalHeader } from './PatientPortalHeader';
import { PatientRegistrationView } from '../patients/PatientRegistrationView';
import { PatientLookupView } from './PatientLookupView';
import { Patient } from '../../types';
import { usePatients } from '../../context/PatientContext';

interface Props {
  initialSubView?: 'register' | 'existing' | 'voice';
  onExitToPortalSelection: () => void;
}

export const PatientPortalView: React.FC<Props> = ({
  initialSubView = 'register',
  onExitToPortalSelection,
}) => {
  const { setActivePatient } = usePatients();
  const [subView, setSubView] = useState<'register' | 'existing'>(
    initialSubView === 'existing' ? 'existing' : 'register'
  );
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(initialSubView === 'voice');
  const [isLargeText, setIsLargeText] = useState(false);
  const [prefilledPatient, setPrefilledPatient] = useState<Patient | null>(null);

  const handleSelectExistingPatient = (patient: Patient, isSameProblem: boolean) => {
    setActivePatient(patient);
    setPrefilledPatient(patient);
    setSubView('register');
  };

  return (
    <div
      className={`min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-all ${
        isLargeText ? 'text-lg' : 'text-sm'
      }`}
    >
      {/* Dedicated Patient Portal Header */}
      <PatientPortalHeader
        onExit={onExitToPortalSelection}
        isVoiceEnabled={isVoiceEnabled}
        onToggleVoice={() => setIsVoiceEnabled((prev) => !prev)}
        isLargeText={isLargeText}
        onToggleLargeText={() => setIsLargeText((prev) => !prev)}
      />

      {/* Portal Mode Tabs (New Registration vs Returning Patient) */}
      <div className="bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setPrefilledPatient(null);
                setSubView('register');
              }}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                subView === 'register'
                  ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              New Registration
            </button>
            <button
              onClick={() => setSubView('existing')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                subView === 'existing'
                  ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Returning Patient Check-In
            </button>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 hidden sm:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>Kiosk Terminal Active • Step-by-Step Guidance</span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {subView === 'existing' ? (
          <PatientLookupView
            onSelectExistingPatient={handleSelectExistingPatient}
            onBackToNewRegistration={() => setSubView('register')}
          />
        ) : (
          <div className="relative">
            <PatientRegistrationView
              onNavigateTab={(tab) => {
                // If the user finishes or wants to restart, they stay within patient kiosk
                if (tab === 'dashboard' || tab === 'welcome') {
                  onExitToPortalSelection();
                }
              }}
              onProceedToDoctor={() => {
                // Completed registration in Kiosk mode - show completion confirmation
                onExitToPortalSelection();
              }}
              existingPatient={prefilledPatient || undefined}
            />
          </div>
        )}
      </main>
    </div>
  );
};
