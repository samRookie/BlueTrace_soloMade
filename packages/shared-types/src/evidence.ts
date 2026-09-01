import type { IsoTimestamp } from './timestamp.js';
import type { LifecycleStatus, IntegrityStatus } from './status.js';
import type { Visibility } from './visibility.js';
import type { SourceReference, SourceType } from './source.js';
import type { EvidenceRelationshipType } from './relationship.js';

/**
 * Standard classification taxonomy for knowledge and evidence resources.
 */
export type EvidenceCategory =
  | 'RESEARCH_PAPER'
  | 'POLICY_DOCUMENT'
  | 'LEGAL_FRAMEWORK'
  | 'DATASET'
  | 'CASE_STUDY'
  | 'GOVERNMENT_REPORT'
  | 'PROJECT_REPORT'
  | 'ACADEMIC_PUBLICATION';

/**
 * Public DTO for an evidence item.
 */
export interface EvidenceItemDto {
  id: string;
  title: string;
  category: EvidenceCategory | string;
  sourceId: string;
  source?: SourceReference;
  projectId?: string | null;
  policyId?: string | null;
  lifecycleStatus: LifecycleStatus;
  integrityStatus: IntegrityStatus;
  visibility: Visibility;
  sampleFlag: boolean;
  createdAt: IsoTimestamp;
  updatedAt: IsoTimestamp;
  outgoingRelationshipsCount?: number;
  incomingRelationshipsCount?: number;
  attachmentsCount?: number;
}

/**
 * Public DTO for a directed evidence relationship link.
 */
export interface EvidenceRelationshipDto {
  id: string;
  sourceEvidenceId: string;
  targetEvidenceId: string;
  relationshipType: EvidenceRelationshipType;
  createdAt: IsoTimestamp;
  targetEvidence?: {
    id: string;
    title: string;
    category: string;
    integrityStatus: IntegrityStatus;
  };
  sourceEvidence?: {
    id: string;
    title: string;
    category: string;
    integrityStatus: IntegrityStatus;
  };
}

/**
 * Public DTO for a safely managed file attachment.
 */
export interface ResourceAttachmentDto {
  id: string;
  evidenceId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  storageKey: string;
  checksumSha256?: string | null;
  sampleFlag: boolean;
  createdAt: IsoTimestamp;
}

/**
 * Detailed evidence item representation including connected graph relationships and attachments.
 */
export interface EvidenceDetailDto extends EvidenceItemDto {
  outgoingRelationships: EvidenceRelationshipDto[];
  incomingRelationships: EvidenceRelationshipDto[];
  attachments: ResourceAttachmentDto[];
  project?: {
    id: string;
    code: string;
    name: string;
  } | null;
  policy?: {
    id: string;
    code: string;
    title: string;
  } | null;
}

/**
 * Query parameters for filtering and discovering evidence records.
 */
export interface EvidenceFilterQuery {
  search?: string;
  category?: EvidenceCategory | string;
  sourceType?: SourceType;
  lifecycleStatus?: LifecycleStatus;
  integrityStatus?: IntegrityStatus;
  visibility?: Visibility;
  projectId?: string;
  policyId?: string;
  page?: number;
  limit?: number;
}

/**
 * Request payload for creating a new evidence item.
 */
export interface CreateEvidenceRequest {
  title: string;
  category: EvidenceCategory | string;
  sourceId: string;
  projectId?: string;
  policyId?: string;
  lifecycleStatus?: LifecycleStatus;
  integrityStatus?: IntegrityStatus;
  visibility?: Visibility;
}

/**
 * Request payload for linking two evidence items with a semantic relationship.
 */
export interface CreateRelationshipRequest {
  targetEvidenceId: string;
  relationshipType: EvidenceRelationshipType;
}

/**
 * Response payload for an uploaded attachment.
 */
export interface UploadAttachmentResponse {
  attachment: ResourceAttachmentDto;
}
