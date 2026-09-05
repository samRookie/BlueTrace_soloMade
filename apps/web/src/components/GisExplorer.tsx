import React, { useState, useEffect, useCallback } from 'react';
import type {
  GisLayerDto,
  GisFeatureDto,
  GisFeatureDetailDto,
  RegionalContextDto,
} from '@sih26019/shared-types';
import {
  getGisLayers,
  getGisFeatures,
  getGisFeatureById,
  getRegionContext,
  getRegions,
} from '../api/client.js';
import { GisMap } from './GisMap.js';
import { GisLegend } from './GisLegend.js';
import { GisFeatureTable } from './GisFeatureTable.js';
import { GisFeatureModal } from './GisFeatureModal.js';

interface RegionItem {
  id: string;
  code: string;
  name: string;
  level: string;
}

interface GisExplorerProps {
  onNavigateTab: (tab: 'overview' | 'datasets' | 'evidence' | 'workspaces') => void;
}

export const GisExplorer: React.FC<GisExplorerProps> = ({ onNavigateTab }) => {
  const [regions, setRegions] = useState<RegionItem[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<string>('SAMPLE-REG-KR-001');

  const [layers, setLayers] = useState<GisLayerDto[]>([]);
  const [activeLayerIds, setActiveLayerIds] = useState<Set<string>>(new Set());

  const [features, setFeatures] = useState<GisFeatureDto[]>([]);
  const [selectedFeature, setSelectedFeature] = useState<GisFeatureDetailDto | null>(null);

  const [regionalContext, setRegionalContext] = useState<RegionalContextDto | null>(null);

  const [viewMode, setViewMode] = useState<'map' | 'table'>('map');
  const [simulateFailure, setSimulateFailure] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch available regions
  useEffect(() => {
    getRegions()
      .then((res) => {
        if (res.success && Array.isArray(res.data.items) && res.data.items.length > 0) {
          const regionList: RegionItem[] = (res.data.items as Array<Record<string, unknown>>).map(
            (r) => ({
              id: String(r.id),
              code: String(r.code),
              name: String(r.name),
              level: String(r.level),
            }),
          );
          setRegions(regionList);
          if (!selectedRegionId && regionList[0]) {
            setSelectedRegionId(regionList[0].id);
          }
        }
      })
      .catch(() => {
        // Fallback default region
        setRegions([
          {
            id: 'SAMPLE-REG-KR-001',
            code: 'IN-AP-CORINGA',
            name: 'Coringa Mangrove Estuarine Zone',
            level: 'DISTRICT',
          },
        ]);
      });
  }, []);

  // 2. Fetch layers and regional context whenever selected region changes
  const loadRegionData = useCallback(async () => {
    if (!selectedRegionId) return;
    setIsLoading(true);
    setError(null);

    try {
      const [layersRes, contextRes] = await Promise.all([
        getGisLayers({ regionId: selectedRegionId }),
        getRegionContext(selectedRegionId),
      ]);

      if (layersRes.success) {
        setLayers(layersRes.data);
        // Default all layers to active
        setActiveLayerIds(new Set(layersRes.data.map((l) => l.id)));
      } else {
        setError(layersRes.error.message || 'Failed to load GIS layers.');
      }

      if (contextRes.success) {
        setRegionalContext(contextRes.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading regional GIS data.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedRegionId]);

  useEffect(() => {
    loadRegionData();
  }, [loadRegionData]);

  // 3. Fetch features for all currently active layers
  const loadFeatures = useCallback(async () => {
    if (activeLayerIds.size === 0) {
      setFeatures([]);
      return;
    }

    try {
      const featurePromises = Array.from(activeLayerIds).map((layerId) =>
        getGisFeatures(layerId, { regionId: selectedRegionId, limit: 100 }),
      );

      const results = await Promise.all(featurePromises);
      const seenIds = new Set<string>();
      const combinedFeatures: GisFeatureDto[] = [];

      results.forEach((res) => {
        if (res.success && res.data.items) {
          res.data.items.forEach((item) => {
            if (!seenIds.has(item.id)) {
              seenIds.add(item.id);
              combinedFeatures.push(item);
            }
          });
        }
      });

      setFeatures(combinedFeatures);
    } catch (err) {
      console.error('Error fetching spatial features:', err);
    }
  }, [activeLayerIds, selectedRegionId]);

  useEffect(() => {
    loadFeatures();
  }, [loadFeatures]);

  // Layer toggle handler
  const handleToggleLayer = (layerId: string) => {
    setActiveLayerIds((prev) => {
      const next = new Set(prev);
      if (next.has(layerId)) {
        next.delete(layerId);
      } else {
        next.add(layerId);
      }
      return next;
    });
  };

  // Feature selection handler
  const handleSelectFeature = async (featureId: string) => {
    try {
      const res = await getGisFeatureById(featureId);
      if (res.success) {
        setSelectedFeature(res.data);
      }
    } catch (err) {
      console.error('Failed to load feature details:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner & Control Bar */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '1.25rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.25rem',
              }}
            >
              <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#0f172a' }}>
                🗺️ GIS Explorer &amp; Regional Context
              </h2>
              <span
                style={{
                  fontSize: '0.75rem',
                  background: '#fef3c7',
                  color: '#92400e',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px',
                  fontWeight: 600,
                }}
              >
                Prototype / Sample Data
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
              Spatial index connecting coastal evidence, datasets, conservation projects, disputes,
              and blue carbon models.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Region Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <label
                htmlFor="gis-region-select"
                style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}
              >
                Region:
              </label>
              <select
                id="gis-region-select"
                value={selectedRegionId}
                onChange={(e) => setSelectedRegionId(e.target.value)}
                style={{
                  padding: '0.4rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  color: '#1e293b',
                  background: '#ffffff',
                }}
              >
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.code})
                  </option>
                ))}
              </select>
            </div>

            {/* View Switcher */}
            <div
              style={{
                display: 'flex',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                overflow: 'hidden',
              }}
            >
              <button
                type="button"
                onClick={() => setViewMode('map')}
                style={{
                  padding: '0.4rem 0.8rem',
                  border: 'none',
                  background: viewMode === 'map' ? '#0284c7' : '#ffffff',
                  color: viewMode === 'map' ? '#ffffff' : '#475569',
                  fontWeight: viewMode === 'map' ? 600 : 400,
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                }}
              >
                🗺️ Map View
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                style={{
                  padding: '0.4rem 0.8rem',
                  border: 'none',
                  borderLeft: '1px solid #cbd5e1',
                  background: viewMode === 'table' ? '#0284c7' : '#ffffff',
                  color: viewMode === 'table' ? '#ffffff' : '#475569',
                  fontWeight: viewMode === 'table' ? 600 : 400,
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                }}
              >
                📋 Accessible Table
              </button>
            </div>

            {/* Simulate Provider Failure Toggle */}
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.8rem',
                color: '#64748b',
                cursor: 'pointer',
                background: '#f8fafc',
                padding: '0.35rem 0.6rem',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
              }}
            >
              <input
                type="checkbox"
                checked={simulateFailure}
                onChange={(e) => setSimulateFailure(e.target.checked)}
              />
              Simulate Map Failure
            </label>
          </div>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            borderRadius: '8px',
            padding: '1rem',
            fontSize: '0.875rem',
          }}
        >
          {error}
        </div>
      )}

      {/* Main Exploration Grid: Sidebar + Canvas/Table */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '280px 1fr',
          gap: '1.25rem',
          alignItems: 'start',
        }}
      >
        {/* Left Column: Spatial Layers & Legend */}
        <div>
          <GisLegend
            layers={layers}
            activeLayerIds={activeLayerIds}
            onToggleLayer={handleToggleLayer}
          />

          {/* Quick Context Stats Card */}
          {regionalContext && (
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '1rem',
                marginTop: '1rem',
              }}
            >
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#0f172a' }}>
                📍 Regional Spatial Metrics
              </h4>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.5rem',
                  fontSize: '0.75rem',
                }}
              >
                <div style={{ background: '#f8fafc', padding: '0.4rem', borderRadius: '4px' }}>
                  <span style={{ color: '#64748b' }}>Layers:</span>{' '}
                  <strong>{regionalContext.gisLayers.length}</strong>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.4rem', borderRadius: '4px' }}>
                  <span style={{ color: '#64748b' }}>Features:</span>{' '}
                  <strong>{regionalContext.featureCount}</strong>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.4rem', borderRadius: '4px' }}>
                  <span style={{ color: '#64748b' }}>Evidence:</span>{' '}
                  <strong>{regionalContext.counts.evidence}</strong>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.4rem', borderRadius: '4px' }}>
                  <span style={{ color: '#64748b' }}>Datasets:</span>{' '}
                  <strong>{regionalContext.counts.datasets}</strong>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.4rem', borderRadius: '4px' }}>
                  <span style={{ color: '#64748b' }}>Projects:</span>{' '}
                  <strong>{regionalContext.counts.projects}</strong>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.4rem', borderRadius: '4px' }}>
                  <span style={{ color: '#64748b' }}>Disputes:</span>{' '}
                  <strong
                    style={{ color: regionalContext.counts.disputes > 0 ? '#dc2626' : 'inherit' }}
                  >
                    {regionalContext.counts.disputes}
                  </strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Interactive Map or Accessible Table */}
        <div>
          {isLoading ? (
            <div
              style={{
                height: '400px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                color: '#64748b',
              }}
            >
              Loading GIS Spatial Environment...
            </div>
          ) : viewMode === 'map' ? (
            <GisMap
              features={features}
              layers={layers}
              selectedFeatureId={selectedFeature?.id || null}
              onSelectFeature={handleSelectFeature}
              simulateFailure={simulateFailure}
              onSwitchToTable={() => setViewMode('table')}
            />
          ) : (
            <GisFeatureTable
              features={features}
              selectedFeatureId={selectedFeature?.id || null}
              onSelectFeature={handleSelectFeature}
            />
          )}
        </div>
      </div>

      {/* Bottom Panel: Regional Context Synthesis */}
      {regionalContext && (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '1.25rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>
                🌐 Regional Evidence &amp; Governance Ecosystem ({regionalContext.region.name})
              </h3>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Direct cross-module intelligence index linking spatial features to statutory
                policies, research datasets, and field evidence.
              </p>
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                background: '#e0f2fe',
                color: '#0369a1',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                fontWeight: 600,
              }}
            >
              {regionalContext.region.code} &bull; {regionalContext.region.level}
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1rem',
            }}
          >
            {/* Linked Evidence Card */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '0.85rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem',
                }}
              >
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#166534' }}>
                  📄 Regional Evidence ({regionalContext.connectedEntities.evidence.length})
                </span>
                <button
                  type="button"
                  onClick={() => onNavigateTab('evidence')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0284c7',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  View All &rarr;
                </button>
              </div>
              <ul
                style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.75rem', color: '#334155' }}
              >
                {regionalContext.connectedEntities.evidence.slice(0, 3).map((e) => (
                  <li key={e.id} style={{ marginBottom: '0.25rem' }}>
                    {e.title}
                  </li>
                ))}
              </ul>
            </div>

            {/* Linked Datasets Card */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '0.85rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem',
                }}
              >
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6b21a8' }}>
                  📊 Regional Datasets ({regionalContext.connectedEntities.datasets.length})
                </span>
                <button
                  type="button"
                  onClick={() => onNavigateTab('datasets')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0284c7',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  View All &rarr;
                </button>
              </div>
              <ul
                style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.75rem', color: '#334155' }}
              >
                {regionalContext.connectedEntities.datasets.slice(0, 3).map((d) => (
                  <li key={d.id} style={{ marginBottom: '0.25rem' }}>
                    {d.title || d.id}
                  </li>
                ))}
              </ul>
            </div>

            {/* Linked Policies & Projects Card */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '0.85rem',
              }}
            >
              <span
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#312e81',
                  display: 'block',
                  marginBottom: '0.5rem',
                }}
              >
                📜 Policies &amp; Projects (
                {regionalContext.counts.policies + regionalContext.counts.projects})
              </span>
              <ul
                style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.75rem', color: '#334155' }}
              >
                {regionalContext.connectedEntities.policies.map((p) => (
                  <li key={p.id} style={{ marginBottom: '0.25rem' }}>
                    <span style={{ color: '#d97706', fontWeight: 600 }}>[Policy]</span> {p.title}
                  </li>
                ))}
                {regionalContext.connectedEntities.projects.map((pr) => (
                  <li key={pr.id} style={{ marginBottom: '0.25rem' }}>
                    <span style={{ color: '#4f46e5', fontWeight: 600 }}>[Project]</span> {pr.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Feature Detail Modal */}
      {selectedFeature && (
        <GisFeatureModal
          feature={selectedFeature}
          onClose={() => setSelectedFeature(null)}
          onNavigateTab={(tab) => {
            setSelectedFeature(null);
            onNavigateTab(tab);
          }}
        />
      )}
    </div>
  );
};
