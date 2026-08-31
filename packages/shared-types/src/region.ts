/**
 * Administrative hierarchy level for regional data.
 */
export type RegionLevel = 'COUNTRY' | 'STATE' | 'DISTRICT' | 'SUB_DISTRICT' | 'LOCAL';

/**
 * Standard reference to a geographical or administrative region.
 */
export interface RegionReference {
  code: string;
  name: string;
  level: RegionLevel;
  parentCode?: string;
}
