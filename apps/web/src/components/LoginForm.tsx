import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';

export function LoginForm() {
  const { login, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    await login({ email, password });
  };

  return (
    <div
      style={{
        maxWidth: '440px',
        margin: '2rem auto',
        padding: '2rem',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        background: '#ffffff',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: '0.5rem', color: '#0f172a', fontSize: '1.5rem' }}>
        Platform Sign In
      </h2>
      <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
        Authenticate with institutional credentials to access protected land governance workspaces
        and evidence audits.
      </p>

      {error && (
        <div
          role="alert"
          style={{
            padding: '0.75rem 1rem',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            color: '#991b1b',
            fontSize: '0.875rem',
            marginBottom: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={clearError}
            style={{
              background: 'none',
              border: 'none',
              color: '#991b1b',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.25rem' }}>
          <label
            htmlFor="login-email"
            style={{
              display: 'block',
              marginBottom: '0.375rem',
              fontWeight: 600,
              color: '#334155',
              fontSize: '0.875rem',
            }}
          >
            Institutional Email Address
          </label>
          <input
            id="login-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="officer@bluetrace.gov.in"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '0.625rem 0.75rem',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '0.95rem',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label
            htmlFor="login-password"
            style={{
              display: 'block',
              marginBottom: '0.375rem',
              fontWeight: 600,
              color: '#334155',
              fontSize: '0.875rem',
            }}
          >
            Password
          </label>
          <input
            id="login-password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '0.625rem 0.75rem',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '0.95rem',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !email || !password}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: isLoading ? '#94a3b8' : '#0284c7',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 600,
            fontSize: '1rem',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
          }}
        >
          {isLoading ? 'Authenticating...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
