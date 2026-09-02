import React, { useEffect, useState, useCallback } from 'react';
import type {
  DatasetItemDto,
  DatasetType,
  DatasetTechnicalFormat,
  DatasetAccessLevel,
  DatasetUpdateFrequency,
} from '@sih26019/shared-types';
import { getDatasets } from '../api/client.js';
import { DatasetDetailModal } from './DatasetDetailModal.js';

export const DatasetCatalog: React.FC = () => {
  const [datasets, setDatasets] = useState<DatasetItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedFormat, setSelectedFormat] = useState<string>('ALL');
  const [selectedAccessLevel, setSelectedAccessLevel] = useState<string>('ALL');
  const [selectedFrequency, setSelectedFrequency] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Selected Dataset for Modal
  const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(null);

  const fetchDatasets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDatasets({
        page,
        limit: 12,
        q: searchTerm.trim() || undefined,
        type: selectedType !== 'ALL' ? (selectedType as DatasetType) : undefined,
        format: selectedFormat !== 'ALL' ? (selectedFormat as DatasetTechnicalFormat) : undefined,
        accessLevel:
          selectedAccessLevel !== 'ALL' ? (selectedAccessLevel as DatasetAccessLevel) : undefined,
        updateFrequency:
          selectedFrequency !== 'ALL' ? (selectedFrequency as DatasetUpdateFrequency) : undefined,
      });

      if (res.success) {
        setDatasets(res.data);
        if (res.meta) {
          setTotalCount(res.meta.total || 0);
          setTotalPages(res.meta.totalPages || 1);
        }
      } else {
        setError(res.error.message || 'Failed to retrieve datasets.');
      }
    } catch {
      setError('Network error while querying dataset catalog.');
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, selectedType, selectedFormat, selectedAccessLevel, selectedFrequency]);

  useEffect(() => {
    fetchDatasets();
  }, [fetchDatasets]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchDatasets();
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedType('ALL');
    setSelectedFormat('ALL');
    setSelectedAccessLevel('ALL');
    setSelectedFrequency('ALL');
    setPage(1);
  };

  const getAccessBadgeStyle = (level: string) => {
    switch (level) {
      case 'OPEN':
        return { background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' };
      case 'CONTROLLED':
        return { background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' };
      case 'REQUEST_REQUIRED':
        return { background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' };
      case 'RESTRICTED':
        return { background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' };
      default:
        return { background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' };
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem' }}>
      {/* Research Disclaimer Banner */}
      <div
        style={{
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '8px',
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <strong style={{ color: '#1e40af' }}>RESEARCH & DEMONSTRATION PROTOTYPE:</strong>
          <span style={{ color: '#1e3a8a', marginLeft: '0.5rem', fontSize: '0.875rem' }}>
            All dataset catalog entries, spatial summaries, and attachments are synthetic data
            assets curated for platform validation, policy modeling, and MRV verification workflows.
          </span>
        </div>
        <span
          style={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            background: '#dbeafe',
            color: '#1e40af',
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Pillar 2 Catalog
        </span>
      </div>

      {/* Catalog Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1
          style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            color: '#0f172a',
            margin: '0 0 0.25rem 0',
          }}
        >
          Dataset Catalog & Evidence Storage
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
          Discover, inspect, and safely access structured land, climate, remote sensing,
          socioeconomic, and Blue Carbon datasets.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          padding: '1.25rem',
          marginBottom: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <form
          onSubmit={handleSearchSubmit}
          style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}
        >
          <input
            type="text"
            placeholder="Search datasets by title, spatial coverage, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              padding: '0.625rem 1rem',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '0.875rem',
            }}
          />
          <button
            type="submit"
            style={{
              padding: '0.625rem 1.25rem',
              borderRadius: '6px',
              border: 'none',
              background: '#0284c7',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            Search
          </button>
          <button
            type="button"
            onClick={handleResetFilters}
            style={{
              padding: '0.625rem 1rem',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#475569',
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            Reset
          </button>
        </form>

        {/* Filter Dropdowns Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.75rem',
          }}
        >
          <div>
            <label
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#475569',
                display: 'block',
                marginBottom: '0.25rem',
              }}
            >
              Dataset Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setPage(1);
              }}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.8125rem',
              }}
            >
              <option value="ALL">All Types</option>
              <option value="LAND">Land (Cadastral / Use)</option>
              <option value="CLIMATE">Climate & Weather</option>
              <option value="REMOTE_SENSING">Remote Sensing / Satellite</option>
              <option value="SOCIOECONOMIC">Socioeconomic & Tenure</option>
              <option value="BLUE_CARBON">Blue Carbon MRV</option>
            </select>
          </div>

          <div>
            <label
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#475569',
                display: 'block',
                marginBottom: '0.25rem',
              }}
            >
              Technical Format
            </label>
            <select
              value={selectedFormat}
              onChange={(e) => {
                setSelectedFormat(e.target.value);
                setPage(1);
              }}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.8125rem',
              }}
            >
              <option value="ALL">All Formats</option>
              <option value="GEOJSON">GeoJSON</option>
              <option value="CSV">CSV Tabular</option>
              <option value="GEOTIFF">GeoTIFF Raster</option>
              <option value="JSON">JSON Structure</option>
              <option value="PARQUET">Apache Parquet</option>
              <option value="PDF">PDF Report</option>
            </select>
          </div>

          <div>
            <label
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#475569',
                display: 'block',
                marginBottom: '0.25rem',
              }}
            >
              Access Level
            </label>
            <select
              value={selectedAccessLevel}
              onChange={(e) => {
                setSelectedAccessLevel(e.target.value);
                setPage(1);
              }}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.8125rem',
              }}
            >
              <option value="ALL">All Access Levels</option>
              <option value="OPEN">Open Public</option>
              <option value="CONTROLLED">Controlled Institutional</option>
              <option value="REQUEST_REQUIRED">Request Required</option>
              <option value="RESTRICTED">Restricted Verified</option>
            </select>
          </div>

          <div>
            <label
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#475569',
                display: 'block',
                marginBottom: '0.25rem',
              }}
            >
              Update Cadence
            </label>
            <select
              value={selectedFrequency}
              onChange={(e) => {
                setSelectedFrequency(e.target.value);
                setPage(1);
              }}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.8125rem',
              }}
            >
              <option value="ALL">All Cadences</option>
              <option value="STATIC">Static Archive</option>
              <option value="ANNUAL">Annual Update</option>
              <option value="QUARTERLY">Quarterly Update</option>
              <option value="MONTHLY">Monthly Update</option>
              <option value="WEEKLY">Weekly Update</option>
              <option value="DAILY">Daily Stream</option>
              <option value="IRREGULAR">Irregular / Ad-hoc</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}
      >
        <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
          Showing <strong>{datasets.length}</strong> of <strong>{totalCount}</strong> catalog
          datasets
        </span>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
          Querying dataset repository...
        </div>
      )}

      {error && (
        <div
          style={{
            padding: '1.25rem',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            color: '#b91c1c',
            marginBottom: '1.5rem',
          }}
        >
          {error}
        </div>
      )}

      {/* Dataset Cards Grid */}
      {!loading && datasets.length === 0 && !error && (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '8px',
            border: '1px dashed #cbd5e1',
            padding: '3rem',
            textAlign: 'center',
            color: '#64748b',
          }}
        >
          <div
            style={{
              fontSize: '1.125rem',
              fontWeight: 600,
              color: '#334155',
              marginBottom: '0.5rem',
            }}
          >
            No matching datasets found
          </div>
          <p style={{ fontSize: '0.875rem', margin: 0 }}>
            Try adjusting your query keywords, format, or access level filters.
          </p>
        </div>
      )}

      {!loading && datasets.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2rem',
          }}
        >
          {datasets.map((item) => (
            <div
              key={item.id}
              style={{
                background: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'box-shadow 0.2s',
              }}
            >
              <div>
                {/* Header Badges */}
                <div
                  style={{
                    display: 'flex',
                    gap: '0.375rem',
                    flexWrap: 'wrap',
                    marginBottom: '0.75rem',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      background: '#e0f2fe',
                      color: '#0369a1',
                      padding: '0.125rem 0.375rem',
                      borderRadius: '4px',
                    }}
                  >
                    {item.datasetType}
                  </span>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      background: '#f1f5f9',
                      color: '#475569',
                      padding: '0.125rem 0.375rem',
                      borderRadius: '4px',
                    }}
                  >
                    {item.technicalFormat}
                  </span>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      padding: '0.125rem 0.375rem',
                      borderRadius: '4px',
                      ...getAccessBadgeStyle(item.accessLevel),
                    }}
                  >
                    {item.accessLevel}
                  </span>
                </div>

                {/* Title */}
                <h3
                  style={{
                    fontSize: '1.0625rem',
                    fontWeight: 700,
                    color: '#0f172a',
                    margin: '0 0 0.5rem 0',
                    lineHeight: 1.35,
                  }}
                >
                  {item.title}
                </h3>

                {/* Spatial Coverage */}
                <div style={{ fontSize: '0.8125rem', color: '#475569', marginBottom: '0.5rem' }}>
                  📍 {item.spatialCoverageSummary || 'General Spatial Extent'}
                </div>

                {/* Source Provenance */}
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.75rem' }}>
                  Source: <strong>{item.source.title}</strong>
                </div>

                {/* Tags */}
                {item.tags && item.tags.length > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      gap: '0.25rem',
                      flexWrap: 'wrap',
                      marginBottom: '0.75rem',
                    }}
                  >
                    {item.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontSize: '0.6875rem',
                          background: '#f8fafc',
                          color: '#64748b',
                          padding: '0.125rem 0.375rem',
                          borderRadius: '4px',
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                    {item.tags.length > 3 && (
                      <span
                        style={{ fontSize: '0.6875rem', color: '#94a3b8', alignSelf: 'center' }}
                      >
                        +{item.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div
                style={{
                  borderTop: '1px solid #f1f5f9',
                  paddingTop: '0.75rem',
                  marginTop: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  📁 {item.attachmentsCount} {item.attachmentsCount === 1 ? 'file' : 'files'} • 🔗{' '}
                  {item.relationshipsCount} {item.relationshipsCount === 1 ? 'link' : 'links'}
                </div>
                <button
                  onClick={() => setSelectedDatasetId(item.id)}
                  style={{
                    background: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.375rem 0.75rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Explore Dataset
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '1rem',
            marginTop: '1.5rem',
          }}
        >
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              background: page === 1 ? '#f8fafc' : '#ffffff',
              color: page === 1 ? '#94a3b8' : '#334155',
              cursor: page === 1 ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
            }}
          >
            ← Previous
          </button>
          <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Page <strong>{page}</strong> of <strong>{totalPages}</strong>
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              background: page === totalPages ? '#f8fafc' : '#ffffff',
              color: page === totalPages ? '#94a3b8' : '#334155',
              cursor: page === totalPages ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
            }}
          >
            Next →
          </button>
        </div>
      )}

      {/* Dataset Detail Modal */}
      {selectedDatasetId && (
        <DatasetDetailModal
          datasetId={selectedDatasetId}
          onClose={() => setSelectedDatasetId(null)}
          onNavigateToDataset={(id) => setSelectedDatasetId(id)}
        />
      )}
    </div>
  );
};
