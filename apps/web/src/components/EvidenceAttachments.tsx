import React, { useState } from 'react';
import type { ResourceAttachmentDto } from '@sih26019/shared-types';
import { useAuth } from '../context/AuthContext.js';
import { uploadEvidenceAttachment, getAttachmentDownloadUrl } from '../api/client.js';

interface EvidenceAttachmentsProps {
  evidenceId: string;
  attachments: ResourceAttachmentDto[];
  onRefresh: () => void;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export const EvidenceAttachments: React.FC<EvidenceAttachmentsProps> = ({
  evidenceId,
  attachments,
  onRefresh,
}) => {
  const { user } = useAuth();
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const canUpload =
    user && ['ADMIN', 'POLICY_OFFICER', 'RESEARCHER', 'ANALYST'].includes(user.role);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg('File size exceeds the maximum limit of 10MB.');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setErrorMsg(null);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    setErrorMsg(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const result = reader.result as string;
          // Extract base64 content
          const base64Data = result.split(',')[1] || '';

          const res = await uploadEvidenceAttachment(evidenceId, {
            fileName: selectedFile.name,
            mimeType: selectedFile.type || 'application/octet-stream',
            fileBase64: base64Data,
          });

          if (res.success) {
            setSelectedFile(null);
            setShowUploadForm(false);
            onRefresh();
          } else {
            setErrorMsg(res.error.message || 'Upload failed.');
          }
        } catch {
          setErrorMsg('Failed to process upload response.');
        } finally {
          setIsUploading(false);
        }
      };

      reader.onerror = () => {
        setErrorMsg('Failed to read file.');
        setIsUploading(false);
      };

      reader.readAsDataURL(selectedFile);
    } catch {
      setErrorMsg('Unexpected error during file upload.');
      setIsUploading(false);
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
          Attached Documents & Datasets ({attachments.length})
        </h4>
        {canUpload && !showUploadForm && (
          <button
            onClick={() => setShowUploadForm(true)}
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
            + Upload Document
          </button>
        )}
      </div>

      {showUploadForm && (
        <form
          onSubmit={handleUploadSubmit}
          style={{
            padding: '1rem',
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            marginBottom: '1.25rem',
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#1e293b' }}>
            Upload Safe Evidence Attachment (PDF, CSV, GeoJSON, PNG, JSON - Max 10MB)
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
          <div style={{ marginBottom: '0.75rem' }}>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.csv,.json,.geojson,.png,.jpg,.jpeg,.txt"
              required
              style={{
                fontSize: '0.9rem',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="submit"
              disabled={isUploading || !selectedFile}
              style={{
                padding: '0.375rem 0.75rem',
                background: '#0284c7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                cursor: isUploading || !selectedFile ? 'not-allowed' : 'pointer',
                fontWeight: 600,
              }}
            >
              {isUploading ? 'Uploading...' : 'Upload & Secure'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowUploadForm(false);
                setSelectedFile(null);
              }}
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

      {attachments.length === 0 ? (
        <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontStyle: 'italic' }}>
          No file attachments uploaded for this evidence record.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {attachments.map((att) => (
            <div
              key={att.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.92rem' }}>
                  {att.fileName}
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginTop: '0.25rem',
                    fontSize: '0.78rem',
                    color: '#64748b',
                  }}
                >
                  <span
                    style={{
                      background: '#f1f5f9',
                      padding: '0.15rem 0.4rem',
                      borderRadius: '3px',
                      fontFamily: 'monospace',
                    }}
                  >
                    {att.mimeType}
                  </span>
                  <span>{formatBytes(att.fileSize)}</span>
                  {att.checksumSha256 && (
                    <span
                      title={`SHA-256: ${att.checksumSha256}`}
                      style={{
                        background: '#e0f2fe',
                        color: '#0369a1',
                        padding: '0.15rem 0.4rem',
                        borderRadius: '3px',
                        fontFamily: 'monospace',
                      }}
                    >
                      SHA256: {att.checksumSha256.slice(0, 8)}...
                    </span>
                  )}
                </div>
              </div>

              <a
                href={getAttachmentDownloadUrl(evidenceId, att.id)}
                download={att.fileName}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '0.375rem 0.75rem',
                  background: '#0284c7',
                  color: '#ffffff',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                }}
              >
                Download ↓
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
