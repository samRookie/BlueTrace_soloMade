import type { IsoTimestamp } from './timestamp.js';
import type { SourceReference } from './source.js';
import type { OwnerReference } from './owner.js';

/**
 * Audit trail and provenance metadata for evidence entities.
 */
export interface ProvenanceMetadata {
  originSource: SourceReference;
  producedBy?: OwnerReference;
  capturedAt: IsoTimestamp;
  transformationContext?: string;
  checksum?: string;
}
