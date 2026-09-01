import React, { useEffect, useState, useCallback } from 'react';
import type { EvidenceDetailDto } from '@sih26019/shared-types';
import { getEvidenceById } from '../api/client.js';
import { RelatedResources } from './RelatedResources.js';
import { EvidenceAttachments } from './EvidenceAttachments.js';
import {
  getIntegrityStatusLabel,
  getVisibilityLabel,
  getSourceTypeLabel,
} from '../utils/presenters.js';

interface EvidenceDetailModalProps {
  evidenceId: string;
  onClose: () => void;
  onNavigateToEvidence?: (evidenceId: string) => void;
}

export const EvidenceDetailModal: React.FC<EvidenceDetailModalProps> = ({
  evidenceId: initialEvidenceId,
  onClose,
}) => {
  const [currentId, setCurrentId] = useState(initialEvidenceId);
  const [evidence, setEvidence] = useState<EvidenceDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'metadata' | 'graph' | 'attachments'>('metadata');

  const loadEvidence = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getEvidenceById(id);
      if (res.success) {
        setEvidence(res.data);
      } else {
        setError(res.error.message || 'Failed to load evidence details.');
      }
    } catch {
      setError('Network error loading evidence record.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvidence(currentId);
  }, [currentId, loadEvidence]);

  const handleSelectRelated = (newId: string) => {
    setCurrentId(newId);
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
          maxWidth: '840px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
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
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.375rem',
              }}
            >
              <span
                style={{
                  background: '#0369a1',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  textTransform: 'uppercase',
                }}
              >
                {evidence?.category || 'RESOURCE'}
              </span>
              <span
                style={{
                  background: '#16a34a',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                }}
              >
                {evidence ? getIntegrityStatusLabel(evidence.integrityStatus) : 'VERIFIED'}
              </span>
              <span
                style={{
                  background: '#e2e8f0',
                  color: '#334155',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                }}
              >
                {evidence ? getVisibilityLabel(evidence.visibility) : 'PUBLIC'}
              </span>
            </div>
            <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.25rem', lineHeight: 1.3 }}>
              {evidence?.title || 'Loading evidence details...'}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              color: '#64748b',
              cursor: 'pointer',
              padding: '0 0.5rem',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Prototype Sample Disclaimer Banner */}
        <div
          style={{
            background: '#fef3c7',
            borderBottom: '1px solid #fde68a',
            color: '#92400e',
            padding: '0.5rem 1.5rem',
            fontSize: '0.78rem',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <span>⚠️</span>
          <span>
            Prototype demonstration dataset — Research catalog items represent sample scenarios for
            platform evaluation.
          </span>
        </div>

        {/* Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #e2e8f0',
            padding: '0 1.5rem',
            background: '#ffffff',
          }}
        >
          <button
            onClick={() => setActiveTab('metadata')}
            style={{
              padding: '0.75rem 1rem',
              border: 'none',
              background: 'none',
              borderBottom:
                activeTab === 'metadata' ? '2px solid #0284c7' : '2px solid transparent',
              color: activeTab === 'metadata' ? '#0284c7' : '#64748b',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            Overview & Metadata
          </button>
          <button
            onClick={() => setActiveTab('graph')}
            style={{
              padding: '0.75rem 1rem',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'graph' ? '2px solid #0284c7' : '2px solid transparent',
              color: activeTab === 'graph' ? '#0284c7' : '#64748b',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            Connected Knowledge Graph (
            {(evidence?.outgoingRelationships.length ?? 0) +
              (evidence?.incomingRelationships.length ?? 0)}
            )
          </button>
          <button
            onClick={() => setActiveTab('attachments')}
            style={{
              padding: '0.75rem 1rem',
              border: 'none',
              background: 'none',
              borderBottom:
                activeTab === 'attachments' ? '2px solid #0284c7' : '2px solid transparent',
              color: activeTab === 'attachments' ? '#0284c7' : '#64748b',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            Files & Datasets ({evidence?.attachments.length ?? 0})
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
              Loading resource graph and attachments...
            </div>
          ) : error ? (
            <div
              style={{
                padding: '1rem',
                background: '#fee2e2',
                color: '#b91c1c',
                borderRadius: '6px',
              }}
            >
              {error}
            </div>
          ) : evidence ? (
            <>
              {activeTab === 'metadata' && (
                <div>
                  {/* Attribution card */}
                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      padding: '1rem',
                      marginBottom: '1.25rem',
                    }}
                  >
                    <h4 style={{ margin: '0 0 0.75rem 0', color: '#1e293b', fontSize: '0.95rem' }}>
                      Source & Attribution Provenance
                    </h4>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: '0.75rem',
                        fontSize: '0.85rem',
                      }}
                    >
                      <div>
                        <span style={{ color: '#64748b', display: 'block' }}>Origin Category</span>
                        <strong style={{ color: '#0f172a' }}>
                          {evidence.source
                            ? getSourceTypeLabel(evidence.source.sourceType)
                            : 'Direct Entry'}
                        </strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', display: 'block' }}>
                          Publisher / Author
                        </span>
                        <strong style={{ color: '#0f172a' }}>
                          {evidence.source?.publisher || 'Institutional Contributor'}
                        </strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', display: 'block' }}>Attribution</span>
                        <span style={{ color: '#334155' }}>
                          {evidence.source?.attribution ||
                            'Standard Platform Repository Attribution'}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', display: 'block' }}>Obtained Date</span>
                        <span style={{ color: '#334155' }}>
                          {evidence.source?.obtainedAt
                            ? new Date(evidence.source.obtainedAt).toLocaleDateString()
                            : new Date(evidence.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {evidence.source?.uri && (
                      <div style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>
                        <span style={{ color: '#64748b' }}>Canonical Link: </span>
                        <a
                          href={evidence.source.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#0284c7', textDecoration: 'underline' }}
                        >
                          {evidence.source.uri}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Connected Project / Policy Badges */}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '1rem',
                      marginBottom: '1rem',
                    }}
                  >
                    {evidence.project && (
                      <div
                        style={{
                          padding: '0.75rem 1rem',
                          background: '#f0fdf4',
                          border: '1px solid #bbf7d0',
                          borderRadius: '6px',
                          flex: '1 1 200px',
                        }}
                      >
                        <div style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 600 }}>
                          CONNECTED PROJECT
                        </div>
                        <div style={{ fontWeight: 700, color: '#14532d', marginTop: '0.25rem' }}>
                          {evidence.project.name}
                        </div>
                        <div
                          style={{ fontSize: '0.8rem', color: '#166534', fontFamily: 'monospace' }}
                        >
                          {evidence.project.code}
                        </div>
                      </div>
                    )}

                    {evidence.policy && (
                      <div
                        style={{
                          padding: '0.75rem 1rem',
                          background: '#eff6ff',
                          border: '1px solid #bfdbfe',
                          borderRadius: '6px',
                          flex: '1 1 200px',
                        }}
                      >
                        <div style={{ fontSize: '0.75rem', color: '#1d4ed8', fontWeight: 600 }}>
                          GOVERNING POLICY FRAMEWORK
                        </div>
                        <div style={{ fontWeight: 700, color: '#1e3a8a', marginTop: '0.25rem' }}>
                          {evidence.policy.title}
                        </div>
                        <div
                          style={{ fontSize: '0.8rem', color: '#1e40af', fontFamily: 'monospace' }}
                        >
                          {evidence.policy.code}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'graph' && (
                <RelatedResources
                  currentEvidenceId={evidence.id}
                  outgoingRelationships={evidence.outgoingRelationships}
                  incomingRelationships={evidence.incomingRelationships}
                  onSelectEvidence={handleSelectRelated}
                  onRefresh={() => loadEvidence(evidence.id)}
                />
              )}

              {activeTab === 'attachments' && (
                <EvidenceAttachments
                  evidenceId={evidence.id}
                  attachments={evidence.attachments}
                  onRefresh={() => loadEvidence(evidence.id)}
                />
              )}
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'flex-end',
            background: '#f8fafc',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '0.5rem 1rem',
              background: '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Close Detail
          </button>
        </div>
      </div>
    </div>
  );
};
