import React, { useEffect, useState, useCallback } from 'react';
import type {
  EvidenceItemDto,
  EvidenceFilterQuery,
  EvidenceCategory,
  SourceType,
  LifecycleStatus,
  IntegrityStatus,
  CreateEvidenceRequest,
} from '@sih26019/shared-types';
import { getEvidenceList, createEvidence } from '../api/client.js';
import { useAuth } from '../context/AuthContext.js';
import { EvidenceDetailModal } from './EvidenceDetailModal.js';
import {
  getIntegrityStatusLabel,
  getVisibilityLabel,
  getSourceTypeLabel,
} from '../utils/presenters.js';

export const EvidenceExplorer: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<EvidenceItemDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<EvidenceCategory | ''>('');
  const [sourceType, setSourceType] = useState<SourceType | ''>('');
  const [lifecycleStatus, setLifecycleStatus] = useState<LifecycleStatus | ''>('');
  const [integrityStatus, setIntegrityStatus] = useState<IntegrityStatus | ''>('');

  // Modals state
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Create form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<EvidenceCategory>('RESEARCH_PAPER');
  const [newSourceId, setNewSourceId] = useState('SAMPLE-SRC-001');
  const [newProjectId, setNewProjectId] = useState('SAMPLE-PROJ-001');
  const [newPolicyId, setNewPolicyId] = useState('SAMPLE-POL-001');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const canCreate =
    user && ['ADMIN', 'POLICY_OFFICER', 'RESEARCHER', 'ANALYST'].includes(user.role);

  const fetchEvidence = useCallback(async () => {
    setLoading(true);
    setError(null);

    const query: EvidenceFilterQuery = {};
    if (search.trim()) query.search = search.trim();
    if (category) query.category = category;
    if (sourceType) query.sourceType = sourceType;
    if (lifecycleStatus) query.lifecycleStatus = lifecycleStatus;
    if (integrityStatus) query.integrityStatus = integrityStatus;

    try {
      const res = await getEvidenceList(query);
      if (res.success) {
        setItems(res.data);
        setTotalCount(res.meta?.total ?? res.data.length);
      } else {
        setError(res.error.message || 'Failed to retrieve evidence catalog.');
      }
    } catch {
      setError('Network failure connecting to evidence repository.');
    } finally {
      setLoading(false);
    }
  }, [search, category, sourceType, lifecycleStatus, integrityStatus]);

  useEffect(() => {
    fetchEvidence();
  }, [fetchEvidence]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsSubmitting(true);
    setCreateError(null);

    const payload: CreateEvidenceRequest = {
      title: newTitle.trim(),
      category: newCategory,
      sourceId: newSourceId.trim(),
      projectId: newProjectId.trim() || undefined,
      policyId: newPolicyId.trim() || undefined,
      lifecycleStatus: 'PUBLISHED',
      integrityStatus: 'VERIFIED',
      visibility: 'PUBLIC',
    };

    try {
      const res = await createEvidence(payload);
      if (res.success) {
        setShowCreateModal(false);
        setNewTitle('');
        fetchEvidence();
        setSelectedEvidenceId(res.data.id);
      } else {
        setCreateError(res.error.message || 'Failed to create evidence resource.');
      }
    } catch {
      setCreateError('Network failure submitting evidence record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Header Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h2 style={{ margin: '0 0 0.25rem 0', color: '#0f172a', fontSize: '1.6rem' }}>
            Knowledge & Evidence Repository
          </h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>
            Multi-disciplinary evidence graph connecting research papers, legal frameworks, policy
            documents, satellite datasets, and field surveys.
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              padding: '0.625rem 1.25rem',
              background: '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            + Register Evidence Item
          </button>
        )}
      </div>

      {/* Prototype Disclaimer Alert */}
      <div
        style={{
          background: '#fef3c7',
          border: '1px solid #fde68a',
          borderRadius: '6px',
          padding: '0.75rem 1rem',
          color: '#92400e',
          fontSize: '0.85rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <span style={{ fontSize: '1.25rem' }}>ℹ️</span>
        <div>
          <strong>Prototype / Demonstration Dataset Notice:</strong> All catalog entries and
          downloadable attachments in this environment represent synthetic demonstration data for
          testing evidence validation and relational graph traversal. None represent official
          government records.
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div
        style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '1.25rem',
          marginBottom: '1.5rem',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
          }}
        >
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#475569',
                marginBottom: '0.375rem',
              }}
            >
              Search Title or Keywords
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search catalog..."
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                fontSize: '0.9rem',
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
                marginBottom: '0.375rem',
              }}
            >
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as EvidenceCategory | '')}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                fontSize: '0.9rem',
                boxSizing: 'border-box',
              }}
            >
              <option value="">All Categories</option>
              <option value="RESEARCH_PAPER">Research Paper</option>
              <option value="POLICY_DOCUMENT">Policy Document</option>
              <option value="DATASET">Dataset / Remote Sensing</option>
              <option value="CASE_STUDY">Case Study</option>
              <option value="GOVERNMENT_REPORT">Government Report</option>
              <option value="LEGAL_FRAMEWORK">Legal Framework</option>
              <option value="PROJECT_REPORT">Project Report</option>
              <option value="ACADEMIC_PUBLICATION">Academic Publication</option>
              <option value="EMPIRICAL_FIELD_SAMPLE">Field Sample</option>
            </select>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#475569',
                marginBottom: '0.375rem',
              }}
            >
              Source Type
            </label>
            <select
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value as SourceType | '')}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                fontSize: '0.9rem',
                boxSizing: 'border-box',
              }}
            >
              <option value="">All Source Types</option>
              <option value="GOVERNMENT_RECORD">Government Record</option>
              <option value="SATELLITE_OBSERVATION">Satellite Observation</option>
              <option value="RESEARCH_PUBLICATION">Research Publication</option>
              <option value="OFFICIAL_SURVEY">Official Survey</option>
              <option value="COMMUNITY_REPORT">Community Report</option>
            </select>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#475569',
                marginBottom: '0.375rem',
              }}
            >
              Integrity Status
            </label>
            <select
              value={integrityStatus}
              onChange={(e) => setIntegrityStatus(e.target.value as IntegrityStatus | '')}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                fontSize: '0.9rem',
                boxSizing: 'border-box',
              }}
            >
              <option value="">All Verification States</option>
              <option value="VERIFIED">Verified</option>
              <option value="UNVERIFIED">Unverified</option>
              <option value="FLAGGED">Flagged</option>
            </select>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '1rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid #e2e8f0',
          }}
        >
          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Showing <strong>{items.length}</strong> of <strong>{totalCount}</strong> evidence
            records
          </div>
          {(search || category || sourceType || lifecycleStatus || integrityStatus) && (
            <button
              onClick={() => {
                setSearch('');
                setCategory('');
                setSourceType('');
                setLifecycleStatus('');
                setIntegrityStatus('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#0284c7',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Results Section */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
          Querying evidence repository...
        </div>
      ) : error ? (
        <div
          style={{
            padding: '1.5rem',
            background: '#fee2e2',
            color: '#b91c1c',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          {error}
        </div>
      ) : items.length === 0 ? (
        <div
          style={{
            padding: '3rem',
            textAlign: 'center',
            background: '#f8fafc',
            borderRadius: '8px',
            border: '1px dashed #cbd5e1',
          }}
        >
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📄</div>
          <div style={{ fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
            No evidence records found
          </div>
          <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
            Try broadening your search query or resetting filters.
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                transition: 'box-shadow 0.2s ease, transform 0.2s ease',
              }}
            >
              <div>
                {/* Header pills */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.75rem',
                  }}
                >
                  <span
                    style={{
                      background: '#0369a1',
                      color: '#ffffff',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {item.category}
                  </span>
                  <div style={{ display: 'flex', gap: '0.375rem' }}>
                    <span
                      style={{
                        background: '#16a34a',
                        color: '#ffffff',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        padding: '0.15rem 0.4rem',
                        borderRadius: '3px',
                      }}
                    >
                      {getIntegrityStatusLabel(item.integrityStatus)}
                    </span>
                    <span
                      style={{
                        background: '#f1f5f9',
                        color: '#475569',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        padding: '0.15rem 0.4rem',
                        borderRadius: '3px',
                      }}
                    >
                      {getVisibilityLabel(item.visibility)}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h4
                  style={{
                    margin: '0 0 0.5rem 0',
                    color: '#0f172a',
                    fontSize: '1.05rem',
                    lineHeight: 1.35,
                  }}
                >
                  {item.title}
                </h4>

                {/* Source attribution */}
                <div style={{ fontSize: '0.825rem', color: '#475569', marginBottom: '0.75rem' }}>
                  <span style={{ color: '#94a3b8' }}>Source: </span>
                  <strong>{item.source?.publisher || 'Institutional Author'}</strong>
                  {item.source?.sourceType && (
                    <span style={{ color: '#64748b' }}>
                      {' '}
                      ({getSourceTypeLabel(item.source.sourceType)})
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom footer counters & action */}
              <div
                style={{
                  borderTop: '1px solid #f1f5f9',
                  paddingTop: '0.75rem',
                  marginTop: '0.75rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.8rem',
                    color: '#64748b',
                  }}
                >
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <span>
                      🔗{' '}
                      {(item.outgoingRelationshipsCount ?? 0) +
                        (item.incomingRelationshipsCount ?? 0)}{' '}
                      Links
                    </span>
                    <span>📎 {item.attachmentsCount ?? 0} Files</span>
                  </div>
                  <button
                    onClick={() => setSelectedEvidenceId(item.id)}
                    style={{
                      background: '#e0f2fe',
                      color: '#0369a1',
                      border: '1px solid #bae6fd',
                      borderRadius: '4px',
                      padding: '0.35rem 0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                    }}
                  >
                    Inspect Graph →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedEvidenceId && (
        <EvidenceDetailModal
          evidenceId={selectedEvidenceId}
          onClose={() => setSelectedEvidenceId(null)}
        />
      )}

      {/* Create Modal */}
      {showCreateModal && (
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
              maxWidth: '560px',
              padding: '1.5rem',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
              }}
            >
              <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.25rem' }}>
                Register New Evidence Resource
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  color: '#64748b',
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
            </div>

            {createError && (
              <div
                style={{
                  background: '#fee2e2',
                  color: '#b91c1c',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  marginBottom: '1rem',
                  fontSize: '0.85rem',
                }}
              >
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#334155',
                    marginBottom: '0.25rem',
                  }}
                >
                  Evidence Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. High-Resolution Estuarine Blue Carbon Sequestration Model"
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                  marginBottom: '1rem',
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#334155',
                      marginBottom: '0.25rem',
                    }}
                  >
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as EvidenceCategory)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="RESEARCH_PAPER">Research Paper</option>
                    <option value="POLICY_DOCUMENT">Policy Document</option>
                    <option value="DATASET">Dataset</option>
                    <option value="CASE_STUDY">Case Study</option>
                    <option value="GOVERNMENT_REPORT">Government Report</option>
                    <option value="LEGAL_FRAMEWORK">Legal Framework</option>
                    <option value="PROJECT_REPORT">Project Report</option>
                    <option value="ACADEMIC_PUBLICATION">Academic Publication</option>
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#334155',
                      marginBottom: '0.25rem',
                    }}
                  >
                    Source Authority ID
                  </label>
                  <input
                    type="text"
                    value={newSourceId}
                    onChange={(e) => setNewSourceId(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#334155',
                      marginBottom: '0.25rem',
                    }}
                  >
                    Linked Project ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={newProjectId}
                    onChange={(e) => setNewProjectId(e.target.value)}
                    placeholder="SAMPLE-PROJ-001"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#334155',
                      marginBottom: '0.25rem',
                    }}
                  >
                    Governing Policy ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={newPolicyId}
                    onChange={(e) => setNewPolicyId(e.target.value)}
                    placeholder="SAMPLE-POL-001"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#e2e8f0',
                    color: '#334155',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '0.5rem 1.25rem',
                    background: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 600,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isSubmitting ? 'Registering...' : 'Register Evidence'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
