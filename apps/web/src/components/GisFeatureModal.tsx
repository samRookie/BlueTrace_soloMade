import React from 'react';
import type { GisFeatureDetailDto } from '@sih26019/shared-types';

interface GisFeatureModalProps {
  feature: GisFeatureDetailDto;
  onClose: () => void;
  onNavigateTab: (tab: 'evidence' | 'datasets') => void;
}

export const GisFeatureModal: React.FC<GisFeatureModalProps> = ({
  feature,
  onClose,
  onNavigateTab,
}) => {
  const { linkedEntities, properties, geometry } = feature;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(2px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="gis-feature-title"
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '8px',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            background: '#f8fafc',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
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
              <span
                style={{
                  fontSize: '0.75rem',
                  background: '#e0f2fe',
                  color: '#0369a1',
                  padding: '0.15rem 0.4rem',
                  borderRadius: '4px',
                  fontWeight: 600,
                }}
              >
                {feature.layerType}
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  background: feature.visibility === 'INTERNAL' ? '#fef3c7' : '#dcfce7',
                  color: feature.visibility === 'INTERNAL' ? '#92400e' : '#15803d',
                  padding: '0.15rem 0.4rem',
                  borderRadius: '4px',
                  fontWeight: 600,
                }}
              >
                {feature.visibility}
              </span>
              {feature.sampleFlag && (
                <span
                  style={{
                    fontSize: '0.75rem',
                    background: '#f1f5f9',
                    color: '#64748b',
                    padding: '0.15rem 0.4rem',
                    borderRadius: '4px',
                  }}
                >
                  Prototype Sample
                </span>
              )}
            </div>
            <h3 id="gis-feature-title" style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>
              {properties?.name ? String(properties.name) : feature.id}
            </h3>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
              Layer: <strong>{feature.layerName}</strong> &bull; Region: {feature.regionId}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.25rem',
              cursor: 'pointer',
              color: '#64748b',
              padding: '0.25rem',
            }}
            aria-label="Close dialog"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div
          style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
        >
          {/* Spatial Geometry Info */}
          <div
            style={{
              background: '#f8fafc',
              padding: '0.75rem',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
            }}
          >
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#334155' }}>
              📍 Spatial Geometry: {geometry.type}
            </h4>
            {feature.coordinatesGeneralized ||
            !geometry.coordinates ||
            (Array.isArray(geometry.coordinates) && geometry.coordinates.length === 0) ? (
              <div
                style={{
                  fontSize: '0.8rem',
                  color: '#b45309',
                  background: '#fef3c7',
                  padding: '0.5rem',
                  borderRadius: '4px',
                }}
              >
                🔒 <strong>Coordinates Protected / Masked:</strong> Spatial coordinates for this
                internal dispute layer are generalized to prevent location sensitivity exposure.
              </div>
            ) : (
              <pre
                style={{
                  margin: 0,
                  fontSize: '0.75rem',
                  background: '#1e293b',
                  color: '#e2e8f0',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  maxHeight: '100px',
                  overflowY: 'auto',
                }}
              >
                {JSON.stringify(geometry.coordinates, null, 2)}
              </pre>
            )}
          </div>

          {/* Properties / Attributes */}
          <div>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#334155' }}>
              ⚙️ Feature Properties &amp; Attributes
            </h4>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '0.5rem',
              }}
            >
              {Object.entries(properties || {}).map(([key, val]) => (
                <div
                  key={key}
                  style={{
                    background: '#f1f5f9',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                  }}
                >
                  <div
                    style={{ color: '#64748b', fontSize: '0.7rem', textTransform: 'capitalize' }}
                  >
                    {key.replace(/([A-Z])/g, ' $1')}
                  </div>
                  <div style={{ fontWeight: 600, color: '#0f172a', wordBreak: 'break-word' }}>
                    {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Connected Platform Artifacts (Cross-Module Links) */}
          <div>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#334155' }}>
              🔗 Connected Governance Artifacts (Cross-Module Index)
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {/* Linked Evidence */}
              {linkedEntities?.evidence ? (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.6rem 0.8rem',
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '6px',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 600 }}>
                      📄 LINKED EVIDENCE ITEM
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#14532d' }}>
                      {linkedEntities.evidence.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#166534' }}>
                      Category: {linkedEntities.evidence.category} &bull; ID:{' '}
                      {linkedEntities.evidence.id}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigateTab('evidence')}
                    style={{
                      padding: '0.35rem 0.75rem',
                      background: '#16a34a',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Open Evidence &rarr;
                  </button>
                </div>
              ) : null}

              {/* Linked Dataset */}
              {linkedEntities?.dataset ? (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.6rem 0.8rem',
                    background: '#faf5ff',
                    border: '1px solid #e9d5ff',
                    borderRadius: '6px',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#9333ea', fontWeight: 600 }}>
                      📊 LINKED SCIENTIFIC DATASET
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#581c87' }}>
                      {linkedEntities.dataset.title || linkedEntities.dataset.id}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#7e22ce' }}>
                      Format: {linkedEntities.dataset.technicalFormat || 'GeoTIFF / CSV'} &bull; ID:{' '}
                      {linkedEntities.dataset.id}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigateTab('datasets')}
                    style={{
                      padding: '0.35rem 0.75rem',
                      background: '#9333ea',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Open Dataset &rarr;
                  </button>
                </div>
              ) : null}

              {/* Linked Policy */}
              {linkedEntities?.policy && (
                <div
                  style={{
                    padding: '0.6rem 0.8rem',
                    background: '#fffbeb',
                    border: '1px solid #fde68a',
                    borderRadius: '6px',
                  }}
                >
                  <div style={{ fontSize: '0.7rem', color: '#d97706', fontWeight: 600 }}>
                    📜 LINKED STATUTORY POLICY
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#78350f' }}>
                    {linkedEntities.policy.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#92400e' }}>
                    Code: {linkedEntities.policy.code} &bull; ID: {linkedEntities.policy.id}
                  </div>
                </div>
              )}

              {/* Linked Project */}
              {linkedEntities?.project && (
                <div
                  style={{
                    padding: '0.6rem 0.8rem',
                    background: '#eef2ff',
                    border: '1px solid #c7d2fe',
                    borderRadius: '6px',
                  }}
                >
                  <div style={{ fontSize: '0.7rem', color: '#4f46e5', fontWeight: 600 }}>
                    🌲 LINKED CONSERVATION PROJECT
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#312e81' }}>
                    {linkedEntities.project.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#3730a3' }}>
                    Code: {linkedEntities.project.code} &bull; ID: {linkedEntities.project.id}
                  </div>
                </div>
              )}

              {/* Linked Indicator */}
              {linkedEntities?.indicator && (
                <div
                  style={{
                    padding: '0.6rem 0.8rem',
                    background: '#f0fdfa',
                    border: '1px solid #99f6e4',
                    borderRadius: '6px',
                  }}
                >
                  <div style={{ fontSize: '0.7rem', color: '#0d9488', fontWeight: 600 }}>
                    📈 LINKED REGIONAL INDICATOR
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#134e4a' }}>
                    {linkedEntities.indicator.name} ({linkedEntities.indicator.unit})
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#115e59' }}>
                    ID: {linkedEntities.indicator.id}
                  </div>
                </div>
              )}

              {/* Linked Dispute */}
              {linkedEntities?.dispute && (
                <div
                  style={{
                    padding: '0.6rem 0.8rem',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '6px',
                  }}
                >
                  <div style={{ fontSize: '0.7rem', color: '#dc2626', fontWeight: 600 }}>
                    ⚖️ LINKED ACTIVE DISPUTE / MEDIATION CASE
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#7f1d1d' }}>
                    {linkedEntities.dispute.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#991b1b' }}>
                    Status: {linkedEntities.dispute.lifecycleStatus} &bull; ID:{' '}
                    {linkedEntities.dispute.id}
                  </div>
                </div>
              )}

              {/* Linked Blue Carbon Ecosystem */}
              {linkedEntities?.blueCarbon && (
                <div
                  style={{
                    padding: '0.6rem 0.8rem',
                    background: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    borderRadius: '6px',
                  }}
                >
                  <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 600 }}>
                    🌊 BLUE CARBON SEQUESTRATION MODEL
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#064e3b' }}>
                    {linkedEntities.blueCarbon.ecosystemType} &bull;{' '}
                    {linkedEntities.blueCarbon.estimatedHectares} Hectares
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#047857' }}>
                    ID: {linkedEntities.blueCarbon.id}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '1rem 1.25rem',
            borderTop: '1px solid #e2e8f0',
            background: '#f8fafc',
            display: 'flex',
            justifyContent: 'flex-end',
            borderBottomLeftRadius: '8px',
            borderBottomRightRadius: '8px',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.4rem 1rem',
              background: '#e2e8f0',
              color: '#334155',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
