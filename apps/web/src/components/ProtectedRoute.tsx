import React, { type ReactNode } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { LoginForm } from './LoginForm.js';
import { DemoAccountSelector } from './DemoAccountSelector.js';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
        <p>Verifying active session security...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div>
        <LoginForm />
        <DemoAccountSelector />
      </div>
    );
  }

  return <>{children}</>;
}
