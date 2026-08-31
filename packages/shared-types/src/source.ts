import type { IsoTimestamp } from './timestamp.js';

/**
 * Category of origin for evidence or research data.
 */
export type SourceType =
  | 'GOVERNMENT_RECORD'
  | 'SATELLITE_OBSERVATION'
  | 'RESEARCH_PUBLICATION'
  | 'OFFICIAL_SURVEY'
  | 'COMMUNITY_REPORT'
  | 'OTHER';

/**
 * Reusable source reference describing origin and attribution.
 */
export interface SourceReference {
  sourceId: string;
  title: string;
  sourceType: SourceType;
  publisher?: string;
  uri?: string;
  attribution?: string;
  obtainedAt?: IsoTimestamp;
}
