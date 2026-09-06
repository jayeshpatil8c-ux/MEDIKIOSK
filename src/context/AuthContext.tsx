import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  currentUser: User;
  currentRole: UserRole;
  switchRole: (role: UserRole) => void;
  switchUser: (userId: string) => void;
  login: (identifier: string, role?: UserRole) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  users: User[];
  canPerformDoctorActions: boolean;
  canPerformNurseActions: boolean;
  canPerformAyushActions: boolean;
  canPerformAdminActions: boolean;
}

const DEFAULT_USERS: User[] = [
  {
    id: 'usr-doc-01',
    name: 'Dr. Arvind Mehta',
    email: 'arvind.mehta@medikiosk.in',
    role: 'Doctor',
    department: 'General Medicine',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr-nurse-01',
    name: 'Sister Meena Pillai',
    email: 'meena.pillai@medikiosk.in',
    role: 'Nurse',
    department: 'Emergency & Triage Unit',
    avatar: 'https://images.unsplash.com/photo-1594824813633-442805232822?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr-ayush-01',
    name: 'Vaidya Devraj Joshi',
    email: 'devraj.joshi@medikiosk.in',
    role: 'AYUSH Vaidya',
    department: 'Ayurveda & Integrative Medicine',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr-admin-01',
    name: 'Suman Rao',
    email: 'suman.rao@medikiosk.in',
    role: 'Admin',
    department: 'Health Informatics & Operations',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(DEFAULT_USERS);
  const [currentUser, setCurrentUser] = useState<User>(DEFAULT_USERS[0]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('medikiosk_authenticated') === 'true';
  });

  useEffect(() => {
    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.users?.length) {
          setUsers(data.users);
          const savedUserId = localStorage.getItem('medikiosk_user_id');
          const savedRole = localStorage.getItem('medikiosk_role');
          if (savedUserId) {
            const matchUser = data.users.find((u: User) => u.id === savedUserId);
            if (matchUser) {
              setCurrentUser(matchUser);
              return;
            }
          }
          if (savedRole) {
            const match = data.users.find((u: User) => u.role === savedRole);
            if (match) setCurrentUser(match);
          }
        }
      })
      .catch(() => {
        // use default fallback
      });
  }, []);

  const login = async (identifier: string, role?: UserRole): Promise<boolean> => {
    const matched = users.find(
      (u) =>
        u.email.toLowerCase() === identifier.toLowerCase() ||
        u.name.toLowerCase().includes(identifier.toLowerCase()) ||
        (role && u.role === role)
    ) || users.find((u) => (role ? u.role === role : true)) || users[0];

    setCurrentUser(matched);
    setIsAuthenticated(true);
    localStorage.setItem('medikiosk_authenticated', 'true');
    localStorage.setItem('medikiosk_user_id', matched.id);
    localStorage.setItem('medikiosk_role', matched.role);

    try {
      await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: matched.role }),
      });
    } catch {
      // Offline fallback
    }

    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('medikiosk_authenticated');
  };

  const switchRole = (role: UserRole) => {
    const match = users.find((u) => u.role === role);
    if (match) {
      setCurrentUser(match);
      localStorage.setItem('medikiosk_role', role);
      localStorage.setItem('medikiosk_user_id', match.id);
      fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      }).catch(() => {});
    }
  };

  const switchUser = (userId: string) => {
    const match = users.find((u) => u.id === userId);
    if (match) {
      setCurrentUser(match);
      localStorage.setItem('medikiosk_role', match.role);
      localStorage.setItem('medikiosk_user_id', match.id);
    }
  };

  const currentRole = currentUser.role;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole,
        switchRole,
        switchUser,
        login,
        logout,
        isAuthenticated,
        users,
        canPerformDoctorActions: currentRole === 'Doctor' || currentRole === 'Admin',
        canPerformNurseActions: currentRole === 'Nurse' || currentRole === 'Admin',
        canPerformAyushActions: currentRole === 'AYUSH Vaidya' || currentRole === 'Admin',
        canPerformAdminActions: currentRole === 'Admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
