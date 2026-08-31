/**
 * Lifecycle state of a platform resource or document.
 */
export type LifecycleStatus = 'DRAFT' | 'IN_REVIEW' | 'PUBLISHED' | 'ARCHIVED' | 'DEPRECATED';

/**
 * Integrity and verification status of evidence data.
 */
export type IntegrityStatus = 'UNVERIFIED' | 'VERIFIED' | 'FLAGGED' | 'INVALID';

/**
 * Combined domain status descriptor for evidence entities.
 */
export interface EntityStatus {
  lifecycle: LifecycleStatus;
  integrity: IntegrityStatus;
}
