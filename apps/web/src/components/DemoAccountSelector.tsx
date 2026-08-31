import React from 'react';
import { useAuth, DEMO_PERSONAS } from '../context/AuthContext.js';
import { getRoleLabel } from '../utils/presenters.js';

export function DemoAccountSelector() {
  const { demoLogin, isLoading, user } = useAuth();

  return (
    <div
      style={{
        marginTop: '2rem',
        padding: '1.5rem',
        background: '#f8fafc',
        border: '1px dashed #cbd5e1',
        borderRadius: '8px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.75rem',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '1rem', color: '#0f172a' }}>
          ⚡ Development Demo Persona Quick-Selector
        </h3>
        <span
          style={{
            fontSize: '0.75rem',
            background: '#e0f2fe',
            color: '#0369a1',
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            fontWeight: 600,
          }}
        >
          DEV ONLY
        </span>
      </div>
      <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: '#64748b' }}>
        Select any of the 8 simulated platform personas to execute server-side authentication with
        deterministic test credentials:
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '0.75rem',
        }}
      >
        {DEMO_PERSONAS.map((persona) => {
          const isActive = user?.email === persona.email;
          return (
            <button
              key={persona.role}
              type="button"
              disabled={isLoading || isActive}
              onClick={() => demoLogin(persona.email)}
              style={{
                textAlign: 'left',
                padding: '0.75rem',
                border: isActive ? '2px solid #0284c7' : '1px solid #e2e8f0',
                borderRadius: '6px',
                background: isActive ? '#f0f9ff' : '#ffffff',
                cursor: isActive || isLoading ? 'default' : 'pointer',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                transition: 'all 0.15s ease-in-out',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.25rem',
                }}
              >
                <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f172a' }}>
                  {persona.name}
                </span>
                {isActive && (
                  <span
                    style={{
                      fontSize: '0.7rem',
                      background: '#0284c7',
                      color: '#fff',
                      padding: '0.1rem 0.35rem',
                      borderRadius: '3px',
                    }}
                  >
                    ACTIVE
                  </span>
                )}
              </div>
              <div
                style={{
                  fontSize: '0.75rem',
                  color: '#0284c7',
                  fontWeight: 500,
                  marginBottom: '0.25rem',
                }}
              >
                {getRoleLabel(persona.role)}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{persona.description}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
