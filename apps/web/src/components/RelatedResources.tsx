import React, { useState } from 'react';
import type { EvidenceRelationshipDto, EvidenceRelationshipType } from '@sih26019/shared-types';
import { useAuth } from '../context/AuthContext.js';
import { createEvidenceRelationship } from '../api/client.js';

interface RelatedResourcesProps {
  currentEvidenceId: string;
  outgoingRelationships: EvidenceRelationshipDto[];
  incomingRelationships: EvidenceRelationshipDto[];
  onSelectEvidence: (evidenceId: string) => void;
  onRefresh: () => void;
}

const RELATIONSHIP_LABELS: Record<EvidenceRelationshipType, { label: string; color: string }> = {
  SUPPORTS: { label: 'Supports', color: '#16a34a' },
  CORROBORATES: { label: 'Corroborates', color: '#0284c7' },
  REFERENCES: { label: 'References', color: '#64748b' },
  DERIVED_FROM: { label: 'Derived From', color: '#8b5cf6' },
  SUPERSEDES: { label: 'Supersedes', color: '#d97706' },
  CONTRADICTS: { label: 'Contradicts', color: '#dc2626' },
};

export const RelatedResources: React.FC<RelatedResourcesProps> = ({
  currentEvidenceId,
  outgoingRelationships,
  incomingRelationships,
  onSelectEvidence,
  onRefresh,
}) => {
  const { user } = useAuth();
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [targetId, setTargetId] = useState('');
  const [relType, setRelType] = useState<EvidenceRelationshipType>('SUPPORTS');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const canLink = user && ['ADMIN', 'POLICY_OFFICER', 'RESEARCHER', 'ANALYST'].includes(user.role);

  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetId.trim()) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await createEvidenceRelationship(currentEvidenceId, {
        targetEvidenceId: targetId.trim(),
        relationshipType: relType,
      });

      if (res.success) {
        setTargetId('');
        setShowLinkForm(false);
        onRefresh();
      } else {
        setErrorMsg(res.error.message || 'Failed to link related resource.');
      }
    } catch {
      setErrorMsg('Network error occurred while linking relationship.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}
      >
        <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem' }}>
          Connected Knowledge Graph ({outgoingRelationships.length + incomingRelationships.length}{' '}
          links)
        </h4>
        {canLink && !showLinkForm && (
          <button
            onClick={() => setShowLinkForm(true)}
            style={{
              padding: '0.375rem 0.75rem',
              background: '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 500,
            }}
          >
            + Link Related Resource
          </button>
        )}
      </div>

      {showLinkForm && (
        <form
          onSubmit={handleLinkSubmit}
          style={{
            padding: '1rem',
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            marginBottom: '1.25rem',
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#1e293b' }}>
            Link New Evidence Edge
          </div>
          {errorMsg && (
            <div
              style={{
                color: '#b91c1c',
                background: '#fee2e2',
                padding: '0.5rem',
                borderRadius: '4px',
                marginBottom: '0.75rem',
                fontSize: '0.85rem',
              }}
            >
              {errorMsg}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: '#475569',
                  marginBottom: '0.25rem',
                }}
              >
                Target Evidence ID (e.g. SAMPLE-EV-003)
              </label>
              <input
                type="text"
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                placeholder="Target ID"
                required
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: '#475569',
                  marginBottom: '0.25rem',
                }}
              >
                Relationship Semantics
              </label>
              <select
                value={relType}
                onChange={(e) => setRelType(e.target.value as EvidenceRelationshipType)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                }}
              >
                <option value="SUPPORTS">SUPPORTS</option>
                <option value="CORROBORATES">CORROBORATES</option>
                <option value="REFERENCES">REFERENCES</option>
                <option value="DERIVED_FROM">DERIVED_FROM</option>
                <option value="SUPERSEDES">SUPERSEDES</option>
                <option value="CONTRADICTS">CONTRADICTS</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '0.375rem 0.75rem',
                background: '#0284c7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontWeight: 600,
              }}
            >
              {isSubmitting ? 'Saving...' : 'Save Connection'}
            </button>
            <button
              type="button"
              onClick={() => setShowLinkForm(false)}
              style={{
                padding: '0.375rem 0.75rem',
                background: '#e2e8f0',
                color: '#334155',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Outgoing relationships */}
      <div style={{ marginBottom: '1rem' }}>
        <div
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#475569',
            marginBottom: '0.5rem',
          }}
        >
          Outgoing Connections (This resource links to):
        </div>
        {outgoingRelationships.length === 0 ? (
          <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontStyle: 'italic' }}>
            No outgoing evidence links registered.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {outgoingRelationships.map((rel) => {
              const style = RELATIONSHIP_LABELS[rel.relationshipType] || {
                label: rel.relationshipType,
                color: '#64748b',
              };
              return (
                <div
                  key={rel.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.625rem 0.875rem',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span
                      style={{
                        padding: '0.2rem 0.5rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#ffffff',
                        background: style.color,
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {style.label}
                    </span>
                    <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>
                      {rel.targetEvidence?.title || rel.targetEvidenceId}
                    </span>
                  </div>
                  <button
                    onClick={() => onSelectEvidence(rel.targetEvidenceId)}
                    style={{
                      padding: '0.25rem 0.5rem',
                      background: '#e0f2fe',
                      color: '#0369a1',
                      border: '1px solid #bae6fd',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                    }}
                  >
                    View Resource →
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Incoming relationships */}
      <div>
        <div
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#475569',
            marginBottom: '0.5rem',
          }}
        >
          Incoming References (Linked from other resources):
        </div>
        {incomingRelationships.length === 0 ? (
          <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontStyle: 'italic' }}>
            No incoming references targeting this resource.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {incomingRelationships.map((rel) => {
              const style = RELATIONSHIP_LABELS[rel.relationshipType] || {
                label: rel.relationshipType,
                color: '#64748b',
              };
              return (
                <div
                  key={rel.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.625rem 0.875rem',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>
                      {rel.sourceEvidence?.title || rel.sourceEvidenceId}
                    </span>
                    <span
                      style={{
                        padding: '0.2rem 0.5rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#ffffff',
                        background: style.color,
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {style.label}
                    </span>
                  </div>
                  <button
                    onClick={() => onSelectEvidence(rel.sourceEvidenceId)}
                    style={{
                      padding: '0.25rem 0.5rem',
                      background: '#e0f2fe',
                      color: '#0369a1',
                      border: '1px solid #bae6fd',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                    }}
                  >
                    View Source →
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
