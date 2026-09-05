import React, { createContext, useContext, useState, useEffect } from 'react';

export interface PresentationStepInfo {
  step: number;
  title: string;
  tab: string;
  description: string;
}

export const PRESENTATION_STEPS: PresentationStepInfo[] = [
  { step: 1, title: 'Patient Registration', tab: 'registration', description: '5-step intake with ABHA ID & duplicate prevention' },
  { step: 2, title: 'Patient Intake', tab: 'intake', description: 'Conversational symptoms, voice dictation, multilingual' },
  { step: 3, title: 'Nurse Triage', tab: 'triage', description: 'Vitals recording & priority color assignment (Green/Yellow/Orange/Red)' },
  { step: 4, title: 'AI Case Summary', tab: 'ai-insights', description: 'Gemini decision-support & differential considerations' },
  { step: 5, title: 'Clinical Safety Check', tab: 'ai-insights', description: 'Deterministic safety rules: critical vitals & allergy conflict alerts' },
  { step: 6, title: 'Doctor Review', tab: 'doctor', description: '3-column workspace with patient clinical history' },
  { step: 7, title: 'Clinical Approval', tab: 'doctor', description: 'Physician diagnosis verification & case sign-off' },
  { step: 8, title: 'Prescription & Referral', tab: 'doctor', description: 'Safe Rx generation with allergy verification & tertiary referral' },
  { step: 9, title: 'Audit Trail', tab: 'audit', description: 'Immutable clinical event log with parameter diffs' },
];

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  isKioskMode: boolean;
  toggleKioskMode: () => void;
  isPresentationMode: boolean;
  togglePresentationMode: () => void;
  presentationStep: number;
  setPresentationStep: (step: number) => void;
  nextPresentationStep: () => void;
  prevPresentationStep: () => void;
  activePresentationStepInfo: PresentationStepInfo;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('medikiosk_theme');
    // Default to dark mode for the Immersive UI theme
    return saved !== null ? saved === 'dark' : true;
  });

  const [isKioskMode, setIsKioskMode] = useState<boolean>(() => {
    return localStorage.getItem('medikiosk_kiosk_mode') === 'true';
  });

  const [isPresentationMode, setIsPresentationMode] = useState<boolean>(false);
  const [presentationStep, setPresentationStep] = useState<number>(1);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('medikiosk_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('medikiosk_theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem('medikiosk_kiosk_mode', isKioskMode ? 'true' : 'false');
  }, [isKioskMode]);

  const toggleTheme = () => setIsDark((prev) => !prev);
  const toggleKioskMode = () => setIsKioskMode((prev) => !prev);
  const togglePresentationMode = () => {
    setIsPresentationMode((prev) => !prev);
    if (!isPresentationMode) setPresentationStep(1);
  };

  const nextPresentationStep = () => {
    setPresentationStep((prev) => (prev < PRESENTATION_STEPS.length ? prev + 1 : prev));
  };

  const prevPresentationStep = () => {
    setPresentationStep((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const activePresentationStepInfo = PRESENTATION_STEPS[presentationStep - 1] || PRESENTATION_STEPS[0];

  return (
    <ThemeContext.Provider
      value={{
        isDark,
        toggleTheme,
        isKioskMode,
        toggleKioskMode,
        isPresentationMode,
        togglePresentationMode,
        presentationStep,
        setPresentationStep,
        nextPresentationStep,
        prevPresentationStep,
        activePresentationStepInfo,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
