import React from 'react';
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
              Foundation Phase Initialized
            </h2>
          </div>
          <p className="status-description">
            Core platform infrastructure and monorepo architecture are being established. This
            technical foundation provides shared types, configuration management, schema validation,
            database tooling, and CI automation for future platform capabilities.
          </p>
          <div className="foundation-info-grid">
            <div className="info-box">
              <p className="info-label">Phase</p>
              <p className="info-value">Phase 0 — Foundation</p>
            </div>
            <div className="info-box">
              <p className="info-label">Architecture</p>
              <p className="info-value">pnpm TypeScript Monorepo</p>
            </div>
            <div className="info-box">
              <p className="info-label">Service Layer</p>
              <p className="info-value">HTTP API / Health Endpoint</p>
            </div>
            <div className="info-box">
              <p className="info-label">Database Tooling</p>
              <p className="info-value">Drizzle ORM &amp; Migrations</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <p>SIH26019 &bull; National Land Governance Platform</p>
        <p>Phase 0 &bull; Technical Foundation Only</p>
      </footer>
    </div>
  );
};

export default App;
