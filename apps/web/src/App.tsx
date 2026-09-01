import React, { useState, useEffect } from 'react';
import {
  ARCHITECTURE_VERSION,
  type WorkspaceDto,
  type AuditEventDto,
} from '@sih26019/shared-types';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { LoginForm } from './components/LoginForm.js';
import { DemoAccountSelector } from './components/DemoAccountSelector.js';
import { PermissionDenied } from './components/PermissionDenied.js';
import { EvidenceExplorer } from './components/EvidenceExplorer.js';
import { getRoleLabel } from './utils/presenters.js';
import { getWorkspaces, getAuditEvents } from './api/client.js';
import './App.css';

type Tab = 'overview' | 'evidence' | 'workspaces' | 'audit' | 'demo';

const MainApp: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [workspaces, setWorkspaces] = useState<WorkspaceDto[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEventDto[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && activeTab === 'workspaces') {
      setDataLoading(true);
      getWorkspaces()
        .then((res) => {
          if (res.success) {
            setWorkspaces(res.data.items);
          }
        })
        .finally(() => setDataLoading(false));
    } else if (isAuthenticated && activeTab === 'audit') {
      setDataLoading(true);
      getAuditEvents()
        .then((res) => {
          if (res.success) {
            setAuditEvents(res.data.items);
          }
        })
        .finally(() => setDataLoading(false));
    }
  }, [isAuthenticated, activeTab]);

  const canReadAudit =
    user && ['ADMIN', 'POLICY_OFFICER', 'VERIFIER', 'DISPUTE_MEDIATOR'].includes(user.role);

  return (
    <div className="app-container">
      <header
        className="site-header"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <div>
          <span className="brand-badge">SIH26019</span>
          <h1 className="site-title">
            National Land Governance Research &amp; Policy Innovation Platform
          </h1>
        </div>
        {isAuthenticated && user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>
                {user.name}
              </div>
              <span
                style={{
                  fontSize: '0.75rem',
                  background: '#dbeafe',
                  color: '#1e40af',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px',
                  fontWeight: 600,
                }}
              >
                {getRoleLabel(user.role)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => logout()}
              style={{
                padding: '0.4rem 0.8rem',
                fontSize: '0.85rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                cursor: 'pointer',
                color: '#475569',
              }}
            >
              Sign Out
            </button>
          </div>
        )}
      </header>

      <main className="main-content">
        {!isAuthenticated ? (
          <div>
            <section className="status-card" aria-labelledby="status-heading">
              <div className="status-indicator-wrapper">
                <div className="status-dot" aria-hidden="true" />
                <h2 id="status-heading" className="status-heading">
                  Phase 4 — Authentication, RBAC &amp; Security Baseline
                </h2>
              </div>
              <p className="status-description">
                The platform enforces server-side authentication, session isolation, and role-based
                access control across eight institutional personas.
              </p>
            </section>

            <LoginForm />
            <DemoAccountSelector />
          </div>
        ) : (
          <div>
            {/* Authenticated Persona Banner */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '1.25rem',
                marginBottom: '1.5rem',
              }}
            >
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div>
                  <h2 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem', color: '#0f172a' }}>
                    Welcome, {user?.name}
                  </h2>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
                    Authenticated as <strong>{user ? getRoleLabel(user.role) : ''}</strong> (
                    {user?.email}) &bull; Status:{' '}
                    <span style={{ color: '#16a34a', fontWeight: 600 }}>{user?.status}</span>
                  </p>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Architecture Version: v{ARCHITECTURE_VERSION}
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div
              style={{
                display: 'flex',
                borderBottom: '1px solid #e2e8f0',
                marginBottom: '1.5rem',
                gap: '0.5rem',
              }}
            >
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                style={{
                  padding: '0.6rem 1.2rem',
                  border: 'none',
                  borderBottom:
                    activeTab === 'overview' ? '2px solid #0284c7' : '2px solid transparent',
                  background: 'none',
                  fontWeight: activeTab === 'overview' ? 600 : 500,
                  color: activeTab === 'overview' ? '#0284c7' : '#64748b',
                  cursor: 'pointer',
                }}
              >
                Platform Overview
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('evidence')}
                style={{
                  padding: '0.6rem 1.2rem',
                  border: 'none',
                  borderBottom:
                    activeTab === 'evidence' ? '2px solid #0284c7' : '2px solid transparent',
                  background: 'none',
                  fontWeight: activeTab === 'evidence' ? 600 : 500,
                  color: activeTab === 'evidence' ? '#0284c7' : '#64748b',
                  cursor: 'pointer',
                }}
              >
                Knowledge &amp; Evidence
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('workspaces')}
                style={{
                  padding: '0.6rem 1.2rem',
                  border: 'none',
                  borderBottom:
                    activeTab === 'workspaces' ? '2px solid #0284c7' : '2px solid transparent',
                  background: 'none',
                  fontWeight: activeTab === 'workspaces' ? 600 : 500,
                  color: activeTab === 'workspaces' ? '#0284c7' : '#64748b',
                  cursor: 'pointer',
                }}
              >
                My Workspaces
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('audit')}
                style={{
                  padding: '0.6rem 1.2rem',
                  border: 'none',
                  borderBottom:
                    activeTab === 'audit' ? '2px solid #0284c7' : '2px solid transparent',
                  background: 'none',
                  fontWeight: activeTab === 'audit' ? 600 : 500,
                  color: activeTab === 'audit' ? '#0284c7' : '#64748b',
                  cursor: 'pointer',
                }}
              >
                Security Audit Trail
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('demo')}
                style={{
                  padding: '0.6rem 1.2rem',
                  border: 'none',
                  borderBottom:
                    activeTab === 'demo' ? '2px solid #0284c7' : '2px solid transparent',
                  background: 'none',
                  fontWeight: activeTab === 'demo' ? 600 : 500,
                  color: activeTab === 'demo' ? '#0284c7' : '#64748b',
                  cursor: 'pointer',
                }}
              >
                ⚡ Switch Demo Persona
              </button>
            </div>

            {/* Tab Contents */}
            {activeTab === 'overview' && (
              <section className="status-card">
                <h3 style={{ marginTop: 0, color: '#0f172a' }}>
                  Platform Security &amp; RBAC Active
                </h3>
                <p className="status-description">
                  All requests to protected APIs are verified on the server using encrypted session
                  tokens and permission policies.
                </p>
                <div className="foundation-info-grid">
                  <div className="info-box">
                    <p className="info-label">Active Persona</p>
                    <p className="info-value">{user ? getRoleLabel(user.role) : ''}</p>
                  </div>
                  <div className="info-box">
                    <p className="info-label">Security Tier</p>
                    <p className="info-value">Server-Enforced RBAC</p>
                  </div>
                  <div className="info-box">
                    <p className="info-label">Session Transport</p>
                    <p className="info-value">HttpOnly Cookie</p>
                  </div>
                  <div className="info-box">
                    <p className="info-label">Audit Logging</p>
                    <p className="info-value">Immutable Append-Only</p>
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'evidence' && <EvidenceExplorer />}

            {activeTab === 'workspaces' && (
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '1.5rem',
                }}
              >
                <h3 style={{ marginTop: 0, color: '#0f172a' }}>Accessible Governance Workspaces</h3>
                {dataLoading ? (
                  <p style={{ color: '#64748b' }}>Loading workspaces...</p>
                ) : workspaces.length === 0 ? (
                  <p style={{ color: '#64748b' }}>
                    No private or member workspaces found for your account.
                  </p>
                ) : (
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    {workspaces.map((ws) => (
                      <div
                        key={ws.id}
                        style={{
                          border: '1px solid #e2e8f0',
                          padding: '1rem',
                          borderRadius: '6px',
                          background: '#f8fafc',
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
                          <span style={{ fontWeight: 600, color: '#0f172a' }}>{ws.name}</span>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              background: '#e2e8f0',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                            }}
                          >
                            {ws.visibility}
                          </span>
                        </div>
                        <p
                          style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#64748b' }}
                        >
                          {ws.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'audit' && (
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '1.5rem',
                }}
              >
                <h3 style={{ marginTop: 0, color: '#0f172a' }}>Security Audit Trail</h3>
                {!canReadAudit ? (
                  <PermissionDenied requiredAction="inspect platform security audit events" />
                ) : dataLoading ? (
                  <p style={{ color: '#64748b' }}>Loading audit events...</p>
                ) : auditEvents.length === 0 ? (
                  <p style={{ color: '#64748b' }}>No audit events logged yet.</p>
                ) : (
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {auditEvents.map((evt) => (
                      <div
                        key={evt.id}
                        style={{
                          border: '1px solid #e2e8f0',
                          padding: '0.75rem 1rem',
                          borderRadius: '6px',
                          background: '#f8fafc',
                          fontSize: '0.85rem',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '0.25rem',
                          }}
                        >
                          <span style={{ fontWeight: 600, color: '#0f172a' }}>{evt.action}</span>
                          <span
                            style={{
                              fontWeight: 600,
                              color: evt.status === 'SUCCESS' ? '#16a34a' : '#dc2626',
                            }}
                          >
                            {evt.status}
                          </span>
                        </div>
                        <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
                          Actor: {evt.actorId || 'Anonymous'} ({evt.actorRole || 'None'}) &bull;
                          Time: {new Date(evt.createdAt).toLocaleString()} &bull; Request ID:{' '}
                          {evt.requestId || 'N/A'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'demo' && <DemoAccountSelector />}
          </div>
        )}
      </main>

      <footer className="site-footer">
        <p>SIH26019 &bull; National Land Governance Platform</p>
        <p>Phase 4 &bull; Authentication, RBAC &amp; Security Baseline</p>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

export default App;
