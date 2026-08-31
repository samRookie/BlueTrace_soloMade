import React from 'react';
import { ARCHITECTURE_VERSION } from '@sih26019/shared-types';
import './App.css';

export const App: React.FC = () => {
  return (
    <div className="app-container">
      <header className="site-header">
        <span className="brand-badge">SIH26019</span>
        <h1 className="site-title">
          National Land Governance Research &amp; Policy Innovation Platform
        </h1>
      </header>

      <main className="main-content">
        <section className="status-card" aria-labelledby="status-heading">
          <div className="status-indicator-wrapper">
            <div className="status-dot" aria-hidden="true" />
            <h2 id="status-heading" className="status-heading">
              Phase 1 — Shared Contracts Foundation Initialized
            </h2>
          </div>
          <p className="status-description">
            The shared domain contract layer, validation schemas, API response envelopes, error
            conventions, evidence relationship semantics, and provider adapter interfaces are
            established. Future platform pillars build directly upon this stable contract baseline.
          </p>
          <div className="foundation-info-grid">
            <div className="info-box">
              <p className="info-label">Phase</p>
              <p className="info-value">Phase 1 — Shared Contracts</p>
            </div>
            <div className="info-box">
              <p className="info-label">Architecture Version</p>
              <p className="info-value">v{ARCHITECTURE_VERSION}</p>
            </div>
            <div className="info-box">
              <p className="info-label">API Namespace</p>
              <p className="info-value">/api/v1 &amp; /health</p>
            </div>
            <div className="info-box">
              <p className="info-label">Domain Layer</p>
              <p className="info-value">Shared Types &amp; Schemas</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <p>SIH26019 &bull; National Land Governance Platform</p>
        <p>Phase 1 &bull; Shared Contracts &amp; Architecture Foundation</p>
      </footer>
    </div>
  );
};

export default App;
