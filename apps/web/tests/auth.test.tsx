import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { AuthProvider, useAuth } from '../src/context/AuthContext.js';
import { LoginForm } from '../src/components/LoginForm.js';
import { DemoAccountSelector } from '../src/components/DemoAccountSelector.js';
import { PermissionDenied } from '../src/components/PermissionDenied.js';

const TestAuthConsumer = () => {
  const { user, isAuthenticated, logout } = useAuth();
  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'LOGGED_IN' : 'LOGGED_OUT'}</div>
      {user && <div data-testid="user-role">{user.role}</div>}
      {isAuthenticated && <button onClick={() => logout()}>Logout</button>}
    </div>
  );
};

describe('Web Application - Auth Components', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders LoginForm with inputs and submit button', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: async () => ({ success: false }),
      }),
    );

    render(
      <AuthProvider>
        <LoginForm />
      </AuthProvider>,
    );

    expect(screen.getByLabelText(/Institutional Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
    });
  });

  it('renders DemoAccountSelector with 8 persona buttons', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: async () => ({ success: false }),
      }),
    );

    render(
      <AuthProvider>
        <DemoAccountSelector />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Admin User/i)).toBeInTheDocument();
      expect(screen.getByText(/Dr. Priya Sharma/i)).toBeInTheDocument();
      expect(screen.getByText(/Dr. Anand Rao/i)).toBeInTheDocument();
      expect(screen.getByText(/Sunita Patel/i)).toBeInTheDocument();
      expect(screen.getByText(/Marcus Chen/i)).toBeInTheDocument();
      expect(screen.getByText(/K. Someswara Rao/i)).toBeInTheDocument();
      expect(screen.getByText(/Justice R. Murthy/i)).toBeInTheDocument();
      expect(screen.getByText(/Citizen Observer/i)).toBeInTheDocument();
    });
  });

  it('renders PermissionDenied notice with 403 Forbidden message', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: async () => ({ success: false }),
      }),
    );

    render(
      <AuthProvider>
        <PermissionDenied requiredAction="modify policy guidelines" />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Access Restricted \(403 Forbidden\)/i)).toBeInTheDocument();
      expect(screen.getByText(/modify policy guidelines/i)).toBeInTheDocument();
    });
  });

  it('executes login flow and updates authenticated context state', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string) => {
        if (typeof url === 'string' && url.includes('/api/v1/auth/login')) {
          return Promise.resolve({
            json: async () => ({
              success: true,
              data: {
                user: {
                  id: 'USR-001',
                  email: 'admin@bluetrace.gov.in',
                  name: 'Admin User',
                  role: 'ADMIN',
                  status: 'ACTIVE',
                  sampleFlag: true,
                  createdAt: '2026-01-01T00:00:00.000Z',
                },
                session: {
                  id: 'SES-001',
                  expiresAt: '2026-01-02T00:00:00.000Z',
                },
              },
            }),
          });
        }
        return Promise.resolve({
          json: async () => ({ success: false }),
        });
      }),
    );

    render(
      <AuthProvider>
        <LoginForm />
        <TestAuthConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Institutional Email Address/i)).not.toBeDisabled();
    });

    fireEvent.change(screen.getByLabelText(/Institutional Email Address/i), {
      target: { value: 'admin@bluetrace.gov.in' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'ValidPass123!' },
    });

    const submitBtn = screen.getByRole('button', { name: /Sign In/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('LOGGED_IN');
      expect(screen.getByTestId('user-role')).toHaveTextContent('ADMIN');
    });
  });
});
