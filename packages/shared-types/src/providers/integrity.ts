import type { IsoTimestamp } from '../timestamp.js';

/**
 * Result of an integrity verification check.
 */
export interface IntegrityCheckResult {
  isValid: boolean;
  algorithm: 'SHA-256' | 'SHA-512';
  calculatedHash: string;
  verifiedAt: IsoTimestamp;
  details?: string;
}

/**
 * Provider-neutral interface for cryptographic hashing and provenance integrity checks.
 */
export interface IntegrityAdapter {
  calculateChecksum(payload: string | Uint8Array): Promise<string>;
  verifyChecksum(
    payload: string | Uint8Array,
    expectedChecksum: string,
  ): Promise<IntegrityCheckResult>;
}
