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

import { DEMO_PASSWORD, DEMO_PERSONAS, type DemoPersona } from '../constants/personas.js';
export { DEMO_PASSWORD, DEMO_PERSONAS, type DemoPersona };

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
