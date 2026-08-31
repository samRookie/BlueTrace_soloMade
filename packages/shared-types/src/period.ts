import type { IsoTimestamp } from './timestamp.js';

/**
 * Type classification for evidence observation periods.
 */
export type PeriodType = 'POINT_IN_TIME' | 'DATE_RANGE' | 'ANNUAL' | 'QUARTERLY' | 'MONTHLY';

/**
 * Temporal boundary representation for evidence datasets.
 */
export interface EvidencePeriod {
  type: PeriodType;
  startDate: IsoTimestamp;
  endDate?: IsoTimestamp;
  year?: number;
  quarter?: number;
  month?: number;
}
