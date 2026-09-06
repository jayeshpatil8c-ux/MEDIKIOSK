/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { PatientProvider, usePatients } from './context/PatientContext';

// Portals & Layouts
import { PortalSelectionView } from './components/portal/PortalSelectionView';
import { PatientPortalView } from './components/patient/PatientPortalView';
import { DoctorStaffLoginView } from './components/auth/DoctorStaffLoginView';
import { DoctorPortalLayout } from './components/doctor/DoctorPortalLayout';

const MainAppRouter: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window === 'undefined') return '/';
    const path = window.location.pathname;
    return path || '/';
  });

  const { isAuthenticated, currentRole } = useAuth();
  const { realtimeStatus } = usePatients();

  // Listen to browser Back / Forward events
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    if (typeof window !== 'undefined' && window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);
  };

  // Route 1: Patient Portal (/kiosk, /kiosk/register, /kiosk/existing, /kiosk/voice)
  if (currentPath.startsWith('/kiosk')) {
    let subView: 'register' | 'existing' | 'voice' = 'register';
    if (currentPath === '/kiosk/existing') subView = 'existing';
    else if (currentPath === '/kiosk/voice') subView = 'voice';

    return (
      <PatientPortalView
        initialSubView={subView}
        onExitToPortalSelection={() => navigateTo('/')}
      />
    );
  }

  // Route 2: Doctor & Staff Login (/doctor/login)
  if (currentPath === '/doctor/login') {
    return (
      <DoctorStaffLoginView
        onLoginSuccess={(role) => {
          if (role === 'Nurse') {
            navigateTo('/staff');
          } else {
            navigateTo('/doctor');
          }
        }}
        onBackToPortalSelection={() => navigateTo('/')}
      />
    );
  }

  // Route 3: Doctor & Staff Workstation (/doctor, /staff)
  if (currentPath.startsWith('/doctor') || currentPath.startsWith('/staff')) {
    // If not authenticated, redirect to /doctor/login
    if (!isAuthenticated) {
      return (
        <DoctorStaffLoginView
          onLoginSuccess={(role) => {
            if (role === 'Nurse') {
              navigateTo('/staff');
            } else {
              navigateTo('/doctor');
            }
          }}
          onBackToPortalSelection={() => navigateTo('/')}
        />
      );
    }

    return (
      <DoctorPortalLayout
        onLogout={() => navigateTo('/')}
        onOpenKioskView={() => navigateTo('/kiosk')}
      />
    );
  }

  // Route 4: Root / Landing Portal Selection (/)
  return (
    <PortalSelectionView
      onNavigate={(path) => navigateTo(path)}
    />
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <PatientProvider>
            <MainAppRouter />
          </PatientProvider>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
