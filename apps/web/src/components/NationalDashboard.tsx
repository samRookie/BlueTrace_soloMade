import React, { useState, useEffect, useCallback } from 'react';
import type {
  AnalyticsOverviewDto,
  AnalyticsQuery,
  DashboardMetricDto,
} from '@sih26019/shared-types';
import { getAnalyticsOverview } from '../api/client.js';
import { MetricCard } from './MetricCard.js';

interface NationalDashboardProps {
  onNavigateTab: (
    tab: 'overview' | 'datasets' | 'evidence' | 'workspaces' | 'audit' | 'demo',
  ) => void;
}

export const NationalDashboard: React.FC<NationalDashboardProps> = ({ onNavigateTab }) => {
  const [data, setData] = useState<AnalyticsOverviewDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [selectedRegionId, setSelectedRegionId] = useState<string>('');
  const [selectedPeriodOption, setSelectedPeriodOption] = useState<string>('all');

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const query: AnalyticsQuery = {};
    if (selectedRegionId) {
      query.regionId = selectedRegionId;
    }

    if (selectedPeriodOption === '2025-2026') {
      query.periodStart = '2025-01-01T00:00:00.000Z';
      query.periodEnd = '2026-12-31T23:59:59.000Z';
    } else if (selectedPeriodOption === '2024-2025') {
      query.periodStart = '2024-01-01T00:00:00.000Z';
      query.periodEnd = '2025-01-01T00:00:00.000Z';
    }

    try {
      const response = await getAnalyticsOverview(query);
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.error.message || 'Failed to retrieve analytics overview.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error loading analytics.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedRegionId, selectedPeriodOption]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleDetailNavigation = (path: string) => {
    if (path.startsWith('/datasets')) {
      onNavigateTab('datasets');
    } else if (path.startsWith('/evidence')) {
      onNavigateTab('evidence');
    } else if (path.startsWith('/workspaces')) {
      onNavigateTab('workspaces');
    }
  };

  const handleResetFilters = () => {
    setSelectedRegionId('');
    setSelectedPeriodOption('all');
  };

  return (
    <div
      className="national-dashboard"
      style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
    >
      {/* Platform Scope & Filter Context Bar */}
      <section
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '1.25rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
        }}
        aria-label="Dashboard Context and Filters"
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div>
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#0f172a',
                margin: '0 0 0.25rem 0',
              }}
            >
              National Evidence &amp; Governance Overview
            </h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
              Traceable aggregations across scientific research, dataset catalogs, GIS layers,
              policy guidelines, and coastal restoration projects.
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
            {/* Region Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <label
                htmlFor="dashboard-region-select"
                style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}
              >
                Geographic Jurisdiction
              </label>
              <select
                id="dashboard-region-select"
                value={selectedRegionId}
                onChange={(e) => setSelectedRegionId(e.target.value)}
                style={{
                  padding: '0.45rem 0.75rem',
                  fontSize: '0.85rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#1e293b',
                  minWidth: '220px',
                }}
              >
                <option value="">National (All Jurisdictions)</option>
                <option value="SAMPLE-REG-KR-001">
                  Coringa Mangrove Estuarine Zone (IN-AP-CORINGA)
                </option>
              </select>
            </div>

            {/* Period Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <label
                htmlFor="dashboard-period-select"
                style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}
              >
                Reporting Cycle
              </label>
              <select
                id="dashboard-period-select"
                value={selectedPeriodOption}
                onChange={(e) => setSelectedPeriodOption(e.target.value)}
                style={{
                  padding: '0.45rem 0.75rem',
                  fontSize: '0.85rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#1e293b',
                  minWidth: '180px',
                }}
              >
                <option value="all">Catalog Snapshot (All)</option>
                <option value="2025-2026">2025–2026 Active Cycle</option>
                <option value="2024-2025">2024–2025 Baseline Period</option>
              </select>
            </div>

            {/* Clear / Refresh buttons */}
            {(selectedRegionId || selectedPeriodOption !== 'all') && (
              <button
                type="button"
                onClick={handleResetFilters}
                style={{
                  marginTop: '1.1rem',
                  padding: '0.45rem 0.75rem',
                  fontSize: '0.85rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  color: '#475569',
                  cursor: 'pointer',
                }}
              >
                Clear Filters
              </button>
            )}

            <button
              type="button"
              onClick={fetchDashboardData}
              disabled={isLoading}
              style={{
                marginTop: '1.1rem',
                padding: '0.45rem 0.75rem',
                fontSize: '0.85rem',
                borderRadius: '6px',
                border: '1px solid #0284c7',
                background: '#0284c7',
                color: '#ffffff',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              {isLoading ? 'Refreshing...' : '🔄 Refresh'}
            </button>
          </div>
        </div>

        {/* Prototype Sample Data Banner */}
        <div
          style={{
            marginTop: '1rem',
            padding: '0.65rem 0.9rem',
            borderRadius: '6px',
            background: '#fffbeb',
            border: '1px solid #fef3c7',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.8rem',
            color: '#92400e',
          }}
        >
          <span>⚠️</span>
          <span>
            <strong>Prototype Demonstration Environment</strong> &bull; Displayed metrics are
            derived from verified in-process coastal mangrove demonstration models. Every metric
            carries an explicit provenance indicator and links directly to its underlying canonical
            data.
          </span>
        </div>
      </section>

      {/* Loading Skeleton State */}
      {isLoading && !data && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              style={{
                height: '160px',
                background: '#f1f5f9',
                borderRadius: '8px',
                animation: 'pulse 1.5s infinite ease-in-out',
              }}
            />
          ))}
        </div>
      )}

      {/* Error State with Retry */}
      {error && (
        <div
          style={{
            padding: '1.5rem',
            borderRadius: '8px',
            background: '#fef2f2',
            border: '1px solid #fca5a5',
            color: '#991b1b',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            alignItems: 'flex-start',
          }}
          role="alert"
        >
          <div style={{ fontWeight: 600, fontSize: '1rem' }}>Failed to Load National Overview</div>
          <div style={{ fontSize: '0.875rem' }}>{error}</div>
          <button
            type="button"
            onClick={fetchDashboardData}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '6px',
              border: '1px solid #b91c1c',
              background: '#ffffff',
              color: '#b91c1c',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Retry Loading
          </button>
        </div>
      )}

      {/* Main Dashboard Content */}
      {data && (
        <>
          {/* Section 1: National Snapshot */}
          <section aria-labelledby="section-national-snapshot">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.85rem',
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>🏛️</span>
              <h3
                id="section-national-snapshot"
                style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: 0 }}
              >
                National Snapshot
              </h3>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '1rem',
              }}
            >
              {data.sections.nationalSnapshot.map((metric: DashboardMetricDto) => (
                <MetricCard key={metric.key} metric={metric} onNavigate={handleDetailNavigation} />
              ))}
            </div>
          </section>

          {/* Section 2: Evidence & Research Activity */}
          <section aria-labelledby="section-evidence-activity">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.85rem',
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>📜</span>
              <h3
                id="section-evidence-activity"
                style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: 0 }}
              >
                Evidence &amp; Research Activity
              </h3>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '1rem',
              }}
            >
              {data.sections.evidenceActivity.map((metric: DashboardMetricDto) => (
                <MetricCard key={metric.key} metric={metric} onNavigate={handleDetailNavigation} />
              ))}
            </div>
          </section>

          {/* Section 3: Geospatial Intelligence */}
          <section aria-labelledby="section-geospatial">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.85rem',
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>🗺️</span>
              <h3
                id="section-geospatial"
                style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: 0 }}
              >
                Geospatial Intelligence &amp; Spatial Extent
              </h3>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '1rem',
              }}
            >
              {data.sections.geospatialIntelligence.map((metric: DashboardMetricDto) => (
                <MetricCard key={metric.key} metric={metric} onNavigate={handleDetailNavigation} />
              ))}
            </div>
          </section>

          {/* Section 4: Policy Intelligence */}
          <section aria-labelledby="section-policy">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.85rem',
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>⚖️</span>
              <h3
                id="section-policy"
                style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: 0 }}
              >
                Policy Intelligence &amp; Indicators
              </h3>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '1rem',
              }}
            >
              {data.sections.policyIntelligence.map((metric: DashboardMetricDto) => (
                <MetricCard key={metric.key} metric={metric} onNavigate={handleDetailNavigation} />
              ))}
            </div>
          </section>

          {/* Section 5: Implementation Overview */}
          <section aria-labelledby="section-implementation">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.85rem',
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>🏗️</span>
              <h3
                id="section-implementation"
                style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: 0 }}
              >
                Implementation &amp; Project Governance
              </h3>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '1rem',
              }}
            >
              {data.sections.implementation.map((metric: DashboardMetricDto) => (
                <MetricCard key={metric.key} metric={metric} onNavigate={handleDetailNavigation} />
              ))}
            </div>
          </section>

          {/* Section 6: Environmental & Blue Carbon */}
          <section aria-labelledby="section-environmental">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.85rem',
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>🌿</span>
              <h3
                id="section-environmental"
                style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: 0 }}
              >
                Environmental &amp; Blue Carbon Ecosystems
              </h3>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '1rem',
              }}
            >
              {data.sections.environmental.map((metric: DashboardMetricDto) => (
                <MetricCard key={metric.key} metric={metric} onNavigate={handleDetailNavigation} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};
