import React, { useState } from 'react';
import type { GisFeatureDto } from '@sih26019/shared-types';

interface GisFeatureTableProps {
  features: GisFeatureDto[];
  selectedFeatureId: string | null;
  onSelectFeature: (featureId: string) => void;
}

export const GisFeatureTable: React.FC<GisFeatureTableProps> = ({
  features,
  selectedFeatureId,
  onSelectFeature,
}) => {
  const [filterText, setFilterText] = useState('');

  const filteredFeatures = features.filter((feat) => {
    if (!filterText) return true;
    const term = filterText.toLowerCase();
    return (
      feat.id.toLowerCase().includes(term) ||
      (feat.layerName || '').toLowerCase().includes(term) ||
      (feat.properties?.name && String(feat.properties.name).toLowerCase().includes(term)) ||
      (feat.relationships?.evidenceTitle &&
        feat.relationships.evidenceTitle.toLowerCase().includes(term)) ||
      (feat.relationships?.projectName &&
        feat.relationships.projectName.toLowerCase().includes(term))
    );
  });

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '1rem',
      }}
      role="region"
      aria-label="Accessible Spatial Features Table"
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div>
          <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1rem', fontWeight: 600 }}>
            📋 Spatial Features &amp; Governance Registry
          </h4>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>
            Accessible data-table representation with direct links to connected governance
            artifacts.
          </p>
        </div>

        <input
          type="text"
          placeholder="Filter features or linked entities..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          style={{
            padding: '0.4rem 0.75rem',
            fontSize: '0.85rem',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            width: '260px',
          }}
          aria-label="Filter spatial features"
        />
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.85rem',
            textAlign: 'left',
          }}
          role="table"
        >
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '0.6rem 0.75rem', color: '#475569', fontWeight: 600 }}>ID</th>
              <th style={{ padding: '0.6rem 0.75rem', color: '#475569', fontWeight: 600 }}>
                Layer
              </th>
              <th style={{ padding: '0.6rem 0.75rem', color: '#475569', fontWeight: 600 }}>
                Geometry
              </th>
              <th style={{ padding: '0.6rem 0.75rem', color: '#475569', fontWeight: 600 }}>
                Properties
              </th>
              <th style={{ padding: '0.6rem 0.75rem', color: '#475569', fontWeight: 600 }}>
                Linked Platform Entities
              </th>
              <th
                style={{
                  padding: '0.6rem 0.75rem',
                  color: '#475569',
                  fontWeight: 600,
                  textAlign: 'right',
                }}
              >
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredFeatures.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    padding: '2rem',
                    textAlign: 'center',
                    color: '#64748b',
                  }}
                >
                  No spatial features found matching the criteria.
                </td>
              </tr>
            ) : (
              filteredFeatures.map((feat) => {
                const isSelected = selectedFeatureId === feat.id;
                const rel = feat.relationships || {};

                return (
                  <tr
                    key={feat.id}
                    style={{
                      borderBottom: '1px solid #e2e8f0',
                      background: isSelected ? '#eff6ff' : 'transparent',
                      cursor: 'pointer',
                    }}
                    onClick={() => onSelectFeature(feat.id)}
                  >
                    <td style={{ padding: '0.6rem 0.75rem', fontWeight: 600, color: '#0284c7' }}>
                      {feat.id}
                    </td>
                    <td style={{ padding: '0.6rem 0.75rem' }}>
                      <span style={{ fontWeight: 500, color: '#1e293b' }}>{feat.layerName}</span>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{feat.layerType}</div>
                    </td>
                    <td style={{ padding: '0.6rem 0.75rem' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          background: '#e0f2fe',
                          color: '#0369a1',
                          padding: '0.15rem 0.4rem',
                          borderRadius: '4px',
                        }}
                      >
                        {feat.geometry.type}
                      </span>
                    </td>
                    <td style={{ padding: '0.6rem 0.75rem', maxWidth: '200px' }}>
                      {Object.entries(feat.properties || {})
                        .slice(0, 2)
                        .map(([k, v]) => (
                          <div
                            key={k}
                            style={{
                              fontSize: '0.75rem',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <span style={{ color: '#64748b' }}>{k}:</span>{' '}
                            <strong>{String(v)}</strong>
                          </div>
                        ))}
                    </td>
                    <td style={{ padding: '0.6rem 0.75rem' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                        {rel.evidenceId && (
                          <span
                            style={{
                              fontSize: '0.7rem',
                              background: '#dcfce7',
                              color: '#15803d',
                              padding: '0.1rem 0.35rem',
                              borderRadius: '4px',
                              fontWeight: 500,
                            }}
                            title={`Evidence: ${rel.evidenceTitle || rel.evidenceId}`}
                          >
                            📄 Evidence
                          </span>
                        )}
                        {rel.datasetId && (
                          <span
                            style={{
                              fontSize: '0.7rem',
                              background: '#ede9fe',
                              color: '#6b21a8',
                              padding: '0.1rem 0.35rem',
                              borderRadius: '4px',
                              fontWeight: 500,
                            }}
                            title={`Dataset: ${rel.datasetTitle || rel.datasetId}`}
                          >
                            📊 Dataset
                          </span>
                        )}
                        {rel.policyId && (
                          <span
                            style={{
                              fontSize: '0.7rem',
                              background: '#fef3c7',
                              color: '#92400e',
                              padding: '0.1rem 0.35rem',
                              borderRadius: '4px',
                              fontWeight: 500,
                            }}
                            title={`Policy: ${rel.policyTitle || rel.policyId}`}
                          >
                            📜 Policy
                          </span>
                        )}
                        {rel.projectId && (
                          <span
                            style={{
                              fontSize: '0.7rem',
                              background: '#e0e7ff',
                              color: '#3730a3',
                              padding: '0.1rem 0.35rem',
                              borderRadius: '4px',
                              fontWeight: 500,
                            }}
                            title={`Project: ${rel.projectName || rel.projectId}`}
                          >
                            🌲 Project
                          </span>
                        )}
                        {rel.indicatorId && (
                          <span
                            style={{
                              fontSize: '0.7rem',
                              background: '#ccfbf1',
                              color: '#115e59',
                              padding: '0.1rem 0.35rem',
                              borderRadius: '4px',
                              fontWeight: 500,
                            }}
                            title={`Indicator: ${rel.indicatorName || rel.indicatorId}`}
                          >
                            📈 Indicator
                          </span>
                        )}
                        {rel.disputeId && (
                          <span
                            style={{
                              fontSize: '0.7rem',
                              background: '#fee2e2',
                              color: '#991b1b',
                              padding: '0.1rem 0.35rem',
                              borderRadius: '4px',
                              fontWeight: 500,
                            }}
                            title={`Dispute: ${rel.disputeTitle || rel.disputeId}`}
                          >
                            ⚖️ Dispute
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectFeature(feat.id);
                        }}
                        style={{
                          padding: '0.25rem 0.6rem',
                          background: '#0284c7',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          fontWeight: 500,
                        }}
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
