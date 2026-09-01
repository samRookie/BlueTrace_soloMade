import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { AuthenticatedUser, LoginRequest, Role } from '@sih26019/shared-types';
import { login as apiLogin, logout as apiLogout, getCurrentUser } from '../api/client.js';

export interface AuthContextType {
  user: AuthenticatedUser | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  demoLogin: (email: string) => Promise<boolean>;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const DEMO_PASSWORD = 'BlueTrace#Demo2026!';

export interface DemoPersona {
  role: Role;
  name: string;
  email: string;
  description: string;
}

export const DEMO_PERSONAS: DemoPersona[] = [
  {
    role: 'ADMIN',
    name: 'Admin User',
    email: 'admin@bluetrace.gov.in',
    description: 'Full system administration, audit inspection, and user control',
  },
  {
    role: 'POLICY_OFFICER',
    name: 'Dr. Priya Sharma',
    email: 'policy.officer@bluetrace.gov.in',
    description: 'National land policy guidelines and statutory indicator regulation',
  },
  {
    role: 'RESEARCHER',
    name: 'Dr. Anand Rao',
    email: 'researcher@bluetrace.gov.in',
    description: 'Geospatial observation layers, research workspaces, and field projects',
  },
  {
    role: 'ANALYST',
    name: 'Sunita Patel',
    email: 'analyst@bluetrace.gov.in',
    description: 'Biomass density metrics, carbon analytics, and statistical models',
  },
  {
    role: 'VERIFIER',
    name: 'Marcus Chen',
    email: 'verifier@coastal-audit.org',
    description: 'Third-party MRV audit assessments and SHA-256 integrity proofs',
  },
  {
    role: 'COMMUNITY_LEAD',
    name: 'K. Someswara Rao',
    email: 'community.lead@coringa-council.org',
    description: 'Local land tenure dispute lodging and community nursery proposals',
  },
  {
    role: 'DISPUTE_MEDIATOR',
    name: 'Justice R. Murthy',
    email: 'mediator@land-tribunal.gov.in',
    description: 'Boundary dispute arbitration, hearing logs, and mediation notes',
  },
  {
    role: 'VIEWER',
    name: 'Citizen Observer',
    email: 'public.viewer@citizens.in',
    description: 'Public observer access to transparent evidence catalogs',
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getCurrentUser();
      if (result.success) {
        setUser(result.data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (credentials: LoginRequest): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiLogin(credentials);
      if (result.success) {
        setUser(result.data.user);
        return true;
      } else {
        setError(result.error.message || 'Login failed');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error during login');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async (email: string): Promise<boolean> => {
    return login({ email, password: DEMO_PASSWORD });
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await apiLogout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        isAuthenticated: !!user,
        login,
        logout,
        demoLogin,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
