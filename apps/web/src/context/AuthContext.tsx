import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { AuthenticatedUser, LoginRequest } from '@sih26019/shared-types';
import {
  login as apiLogin,
  logout as apiLogout,
  getCurrentUser,
  setActivePersonaEmail,
} from '../api/client.js';

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

import { DEMO_PASSWORD, DEMO_PERSONAS, type DemoPersona } from '../constants/personas.js';
export { DEMO_PASSWORD, DEMO_PERSONAS, type DemoPersona };

export const DEFAULT_ACTIVE_USER: AuthenticatedUser = {
  id: 'SAMPLE-USR-001',
  email: 'admin@bluetrace.gov.in',
  name: 'Admin User',
  role: 'ADMIN',
  status: 'ACTIVE',
  sampleFlag: true,
  createdAt: '2026-01-01T00:00:00.000Z',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser>(DEFAULT_ACTIVE_USER);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = useCallback(async () => {
    try {
      const result = await getCurrentUser();
      if (result.success && result.data?.user) {
        setUser(result.data.user);
      }
    } catch {
      // Keep default active persona
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
    setActivePersonaEmail(email);
    const persona = DEMO_PERSONAS.find((p) => p.email === email);
    if (persona) {
      setUser({
        id: `SAMPLE-USR-${persona.role}`,
        email: persona.email,
        name: persona.name,
        role: persona.role,
        status: 'ACTIVE',
        sampleFlag: true,
        createdAt: '2026-01-01T00:00:00.000Z',
      });
    }
    try {
      await apiLogin({ email, password: DEMO_PASSWORD });
    } catch {
      // Direct access continues
    }
    return true;
  };

  const logout = async (): Promise<void> => {
    setActivePersonaEmail(DEFAULT_ACTIVE_USER.email);
    try {
      await apiLogout();
    } finally {
      setUser(DEFAULT_ACTIVE_USER);
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
