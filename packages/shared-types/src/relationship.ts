import type { IsoTimestamp } from './timestamp.js';

/**
 * Semantic relationship type between evidence entities.
 */
export type EvidenceRelationshipType =
  'SUPPORTS' | 'DERIVED_FROM' | 'REFERENCES' | 'SUPERSEDES' | 'CORROBORATES' | 'CONTRADICTS';

/**
 * Reusable contract representing a directed relationship between two evidence items.
 */
export interface EvidenceRelationship {
  relationshipId: string;
  sourceId: string;
  targetId: string;
  type: EvidenceRelationshipType;
  createdAt: IsoTimestamp;
  metadata?: Record<string, unknown>;
}
