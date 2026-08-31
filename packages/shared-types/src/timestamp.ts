/**
 * Machine-readable ISO 8601 timestamp string representing UTC date-time.
 * Format: `YYYY-MM-DDTHH:mm:ss.sssZ` (e.g. `2026-08-31T12:00:00.000Z`).
 */
export type IsoTimestamp = string;

/**
 * Standard timestamp fields for auditable entities.
 */
export interface Timestamps {
  createdAt: IsoTimestamp;
  updatedAt?: IsoTimestamp;
}
