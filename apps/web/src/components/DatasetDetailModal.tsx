import React, { useEffect, useState, useCallback } from 'react';
import type { DatasetDetailDto } from '@sih26019/shared-types';
import { getDatasetById, getDatasetDownloadUrl } from '../api/client.js';

interface DatasetDetailModalProps {
  datasetId: string;
  onClose: () => void;
  onNavigateToDataset?: (id: string) => void;
}

export const DatasetDetailModal: React.FC<DatasetDetailModalProps> = ({
  datasetId: initialDatasetId,
  onClose,
  onNavigateToDataset,
}) => {
  const [currentId, setCurrentId] = useState(initialDatasetId);
  const [dataset, setDataset] = useState<DatasetDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'graph' | 'attachments'>('overview');

  const loadDataset = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDatasetById(id);
      if (res.success) {
        setDataset(res.data);
      } else {
        setError(res.error.message || 'Failed to load dataset details.');
      }
    } catch {
      setError('Network error loading dataset record.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDataset(currentId);
  }, [currentId, loadDataset]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
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
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '8px',
          width: '100%',
          maxWidth: '860px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden',
        }}
      >
        {/* Prototype Warning Banner */}
        <div
          style={{
            background: '#fffbeb',
            borderBottom: '1px solid #fef3c7',
            padding: '0.625rem 1.25rem',
            fontSize: '0.8125rem',
            color: '#92400e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>
            <strong>RESEARCH & DEMONSTRATION RECORD:</strong> Synthetic sample dataset designed for
            land governance research, policy innovation, and MRV verification workflows.
          </span>
          <span
            style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              background: '#fef3c7',
              padding: '0.125rem 0.375rem',
              borderRadius: '4px',
              border: '1px solid #fde68a',
            }}
          >
            NOT LIVE FEED
          </span>
        </div>

        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            background: '#f8fafc',
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.375rem',
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  background: '#0284c7',
                  color: '#ffffff',
                  padding: '0.125rem 0.5rem',
                  borderRadius: '4px',
                }}
              >
                DATASET CATALOG
              </span>
              {dataset && (
                <>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: '#e0f2fe',
                      color: '#0369a1',
                      padding: '0.125rem 0.5rem',
                      borderRadius: '4px',
                    }}
                  >
                    {dataset.metadata.datasetType}
                  </span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: '#f1f5f9',
                      color: '#334155',
                      padding: '0.125rem 0.5rem',
                      borderRadius: '4px',
                    }}
                  >
                    {dataset.metadata.technicalFormat}
                  </span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '0.125rem 0.5rem',
                      borderRadius: '4px',
                      ...getAccessBadgeStyle(dataset.metadata.accessLevel),
                    }}
                  >
                    {dataset.metadata.accessLevel}
                  </span>
                </>
              )}
            </div>
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#0f172a',
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              {dataset ? dataset.title : 'Loading Dataset...'}
            </h2>
            <div
              style={{
                fontSize: '0.75rem',
                color: '#64748b',
                marginTop: '0.25rem',
                fontFamily: 'monospace',
              }}
            >
              {currentId}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '1.5rem',
              color: '#64748b',
              cursor: 'pointer',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #e2e8f0',
            background: '#ffffff',
            padding: '0 1.5rem',
          }}
        >
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '0.75rem 1rem',
              border: 'none',
              background: 'transparent',
              borderBottom:
                activeTab === 'overview' ? '2px solid #0284c7' : '2px solid transparent',
              color: activeTab === 'overview' ? '#0284c7' : '#64748b',
              fontWeight: activeTab === 'overview' ? 600 : 500,
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            Overview & Coverage
          </button>
          <button
            onClick={() => setActiveTab('graph')}
            style={{
              padding: '0.75rem 1rem',
              border: 'none',
              background: 'transparent',
              borderBottom: activeTab === 'graph' ? '2px solid #0284c7' : '2px solid transparent',
              color: activeTab === 'graph' ? '#0284c7' : '#64748b',
              fontWeight: activeTab === 'graph' ? 600 : 500,
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            Graph & Governance Context (
            {(dataset?.outgoingRelationships.length || 0) +
              (dataset?.incomingRelationships.length || 0)}
            )
          </button>
          <button
            onClick={() => setActiveTab('attachments')}
            style={{
              padding: '0.75rem 1rem',
              border: 'none',
              background: 'transparent',
              borderBottom:
                activeTab === 'attachments' ? '2px solid #0284c7' : '2px solid transparent',
              color: activeTab === 'attachments' ? '#0284c7' : '#64748b',
              fontWeight: activeTab === 'attachments' ? 600 : 500,
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            Files & Downloads ({dataset?.attachments.length || 0})
          </button>
        </div>

        {/* Body Content */}
        <div
          style={{
            padding: '1.5rem',
            overflowY: 'auto',
            flex: 1,
          }}
        >
          {loading && (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
              Loading dataset information...
            </div>
          )}

          {error && (
            <div
              style={{
                padding: '1rem',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '6px',
                color: '#b91c1c',
                fontSize: '0.875rem',
              }}
            >
              {error}
            </div>
          )}

          {dataset && !loading && (
            <>
              {activeTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {/* Metadata Grid */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '1rem',
                      background: '#f8fafc',
                      padding: '1rem',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>
                        Dataset Category
                      </span>
                      <strong style={{ fontSize: '0.875rem', color: '#0f172a' }}>
                        {dataset.metadata.datasetType}
                      </strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>
                        Technical Format
                      </span>
                      <strong style={{ fontSize: '0.875rem', color: '#0f172a' }}>
                        {dataset.metadata.technicalFormat}
                      </strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>
                        Update Cadence
                      </span>
                      <strong style={{ fontSize: '0.875rem', color: '#0f172a' }}>
                        {dataset.metadata.updateFrequency}
                      </strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>
                        Access Level
                      </span>
                      <strong style={{ fontSize: '0.875rem', color: '#0f172a' }}>
                        {dataset.metadata.accessLevel}
                      </strong>
                    </div>
                  </div>

                  {/* Coverage Details */}
                  <div>
                    <h3
                      style={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: '#0f172a',
                        marginBottom: '0.75rem',
                      }}
                    >
                      Geographic & Temporal Coverage
                    </h3>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '1rem',
                      }}
                    >
                      <div
                        style={{
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          padding: '0.875rem',
                        }}
                      >
                        <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>
                          Spatial Coverage
                        </span>
                        <div
                          style={{ fontSize: '0.875rem', color: '#1e293b', marginTop: '0.25rem' }}
                        >
                          {dataset.metadata.spatialCoverageSummary || 'National / General Extent'}
                        </div>
                        {dataset.region && (
                          <div
                            style={{
                              fontSize: '0.8125rem',
                              color: '#0284c7',
                              marginTop: '0.375rem',
                            }}
                          >
                            Linked Region: <strong>{dataset.region.name}</strong> (
                            {dataset.region.code})
                          </div>
                        )}
                        {dataset.gisLayer && (
                          <div
                            style={{
                              fontSize: '0.8125rem',
                              color: '#0d9488',
                              marginTop: '0.25rem',
                            }}
                          >
                            GIS Layer Reference: <strong>{dataset.gisLayer.name}</strong> (
                            {dataset.gisLayer.layerType})
                          </div>
                        )}
                      </div>

                      <div
                        style={{
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          padding: '0.875rem',
                        }}
                      >
                        <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>
                          Temporal Coverage
                        </span>
                        <div
                          style={{ fontSize: '0.875rem', color: '#1e293b', marginTop: '0.25rem' }}
                        >
                          {dataset.metadata.temporalCoverageStart
                            ? `${new Date(dataset.metadata.temporalCoverageStart).toLocaleDateString()} — ${
                                dataset.metadata.temporalCoverageEnd
                                  ? new Date(
                                      dataset.metadata.temporalCoverageEnd,
                                    ).toLocaleDateString()
                                  : 'Present'
                              }`
                            : 'Continuous / Open Timeline'}
                        </div>
                        {dataset.metadata.periodType && (
                          <div
                            style={{
                              fontSize: '0.8125rem',
                              color: '#64748b',
                              marginTop: '0.375rem',
                            }}
                          >
                            Granularity: <strong>{dataset.metadata.periodType}</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Provenance & Source */}
                  <div>
                    <h3
                      style={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: '#0f172a',
                        marginBottom: '0.75rem',
                      }}
                    >
                      Data Source & Provenance
                    </h3>
                    <div
                      style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        padding: '0.875rem',
                        background: '#f8fafc',
                      }}
                    >
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>
                        {dataset.source.title}
                      </div>
                      <div
                        style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.25rem' }}
                      >
                        Source Type: {dataset.source.sourceType}
                        {dataset.source.publisher && ` • Publisher: ${dataset.source.publisher}`}
                      </div>
                      {dataset.source.uri && (
                        <div
                          style={{ fontSize: '0.8125rem', color: '#0284c7', marginTop: '0.25rem' }}
                        >
                          Official URI:{' '}
                          <a href={dataset.source.uri} target="_blank" rel="noopener noreferrer">
                            {dataset.source.uri}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  {dataset.metadata.tags && dataset.metadata.tags.length > 0 && (
                    <div>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: '#64748b',
                          display: 'block',
                          marginBottom: '0.5rem',
                        }}
                      >
                        Taxonomy & Keywords
                      </span>
                      <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                        {dataset.metadata.tags.map((tag) => (
                          <span
                            key={tag}
                            style={{
                              background: '#f1f5f9',
                              color: '#334155',
                              padding: '0.25rem 0.625rem',
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              border: '1px solid #e2e8f0',
                            }}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'graph' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {/* Context Links */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div
                      style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        padding: '0.875rem',
                      }}
                    >
                      <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>
                        Associated Project
                      </span>
                      <strong style={{ fontSize: '0.875rem', color: '#0f172a' }}>
                        {dataset.projectName || 'None directly associated'}
                      </strong>
                      {dataset.projectId && (
                        <div
                          style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}
                        >
                          {dataset.projectId}
                        </div>
                      )}
                    </div>
                    <div
                      style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        padding: '0.875rem',
                      }}
                    >
                      <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>
                        Policy Framework Reference
                      </span>
                      <strong style={{ fontSize: '0.875rem', color: '#0f172a' }}>
                        {dataset.policyTitle || 'None directly associated'}
                      </strong>
                      {dataset.policyId && (
                        <div
                          style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}
                        >
                          {dataset.policyId}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Evidence Graph Connections */}
                  <div>
                    <h3
                      style={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: '#0f172a',
                        marginBottom: '0.75rem',
                      }}
                    >
                      Evidence Graph Relationships
                    </h3>

                    {dataset.outgoingRelationships.length === 0 &&
                    dataset.incomingRelationships.length === 0 ? (
                      <div
                        style={{
                          color: '#64748b',
                          fontSize: '0.875rem',
                          padding: '1rem',
                          textAlign: 'center',
                          background: '#f8fafc',
                          borderRadius: '6px',
                        }}
                      >
                        No evidence graph connections established for this dataset yet.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {dataset.outgoingRelationships.map((rel) => (
                          <div
                            key={rel.id}
                            style={{
                              padding: '0.75rem 1rem',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              background: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <div>
                              <span
                                style={{
                                  fontSize: '0.6875rem',
                                  fontWeight: 700,
                                  background: '#e0e7ff',
                                  color: '#3730a3',
                                  padding: '0.125rem 0.375rem',
                                  borderRadius: '4px',
                                  marginRight: '0.5rem',
                                }}
                              >
                                {rel.relationshipType}
                              </span>
                              <span
                                style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f172a' }}
                              >
                                {rel.targetEvidence?.title || rel.targetEvidenceId}
                              </span>
                              {rel.targetEvidence?.category && (
                                <span
                                  style={{
                                    fontSize: '0.75rem',
                                    color: '#64748b',
                                    marginLeft: '0.5rem',
                                  }}
                                >
                                  ({rel.targetEvidence.category})
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => {
                                setCurrentId(rel.targetEvidenceId);
                                if (onNavigateToDataset) {
                                  onNavigateToDataset(rel.targetEvidenceId);
                                }
                              }}
                              style={{
                                fontSize: '0.75rem',
                                color: '#0284c7',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: 600,
                              }}
                            >
                              View →
                            </button>
                          </div>
                        ))}

                        {dataset.incomingRelationships.map((rel) => (
                          <div
                            key={rel.id}
                            style={{
                              padding: '0.75rem 1rem',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              background: '#f8fafc',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <div>
                              <span
                                style={{
                                  fontSize: '0.75rem',
                                  color: '#64748b',
                                  marginRight: '0.5rem',
                                }}
                              >
                                Referenced By:
                              </span>
                              <span
                                style={{
                                  fontSize: '0.6875rem',
                                  fontWeight: 700,
                                  background: '#f1f5f9',
                                  color: '#475569',
                                  padding: '0.125rem 0.375rem',
                                  borderRadius: '4px',
                                  marginRight: '0.5rem',
                                }}
                              >
                                {rel.relationshipType}
                              </span>
                              <span
                                style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f172a' }}
                              >
                                {rel.sourceEvidence?.title || rel.sourceEvidenceId}
                              </span>
                              {rel.sourceEvidence?.category && (
                                <span
                                  style={{
                                    fontSize: '0.75rem',
                                    color: '#64748b',
                                    marginLeft: '0.5rem',
                                  }}
                                >
                                  ({rel.sourceEvidence.category})
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'attachments' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Access Status Banner */}
                  <div
                    style={{
                      padding: '0.875rem 1rem',
                      borderRadius: '6px',
                      ...getAccessBadgeStyle(dataset.metadata.accessLevel),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <strong>Access Policy: {dataset.metadata.accessLevel}</strong>
                      <div style={{ fontSize: '0.8125rem', marginTop: '0.125rem' }}>
                        {dataset.userAccess.canDownload
                          ? 'Your credentials permit direct research access and file download for this resource.'
                          : dataset.userAccess.reason || 'Authentication required to download.'}
                      </div>
                    </div>
                  </div>

                  {dataset.attachments.length === 0 ? (
                    <div
                      style={{
                        color: '#64748b',
                        fontSize: '0.875rem',
                        padding: '2rem',
                        textAlign: 'center',
                        background: '#f8fafc',
                        borderRadius: '6px',
                      }}
                    >
                      No downloadable file assets attached to this dataset record.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {dataset.attachments.map((att) => (
                        <div
                          key={att.id}
                          style={{
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            padding: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: '#ffffff',
                          }}
                        >
                          <div>
                            <div
                              style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9375rem' }}
                            >
                              {att.fileName}
                            </div>
                            <div
                              style={{
                                fontSize: '0.75rem',
                                color: '#64748b',
                                marginTop: '0.25rem',
                              }}
                            >
                              {att.mimeType} • {formatFileSize(att.fileSize)}
                              {att.checksumSha256 && (
                                <span style={{ marginLeft: '0.5rem', fontFamily: 'monospace' }}>
                                  SHA: {att.checksumSha256.slice(0, 12)}...
                                </span>
                              )}
                            </div>
                          </div>

                          <div>
                            {dataset.userAccess.canDownload ? (
                              <a
                                href={getDatasetDownloadUrl(dataset.id, att.id)}
                                target="_blank"
                                rel="noopener noreferrer"
                                download={att.fileName}
                                style={{
                                  display: 'inline-block',
                                  background: '#0284c7',
                                  color: '#ffffff',
                                  padding: '0.5rem 1rem',
                                  borderRadius: '6px',
                                  fontSize: '0.8125rem',
                                  fontWeight: 600,
                                  textDecoration: 'none',
                                }}
                              >
                                Download Asset
                              </a>
                            ) : (
                              <span
                                style={{
                                  fontSize: '0.75rem',
                                  color: '#b91c1c',
                                  background: '#fef2f2',
                                  padding: '0.375rem 0.75rem',
                                  borderRadius: '4px',
                                  border: '1px solid #fecaca',
                                  fontWeight: 600,
                                }}
                              >
                                Download Locked
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid #e2e8f0',
            background: '#f8fafc',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#334155',
              fontSize: '0.875rem',
              fontWeight: 500,
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
