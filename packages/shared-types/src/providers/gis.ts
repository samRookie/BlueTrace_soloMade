import type { RegionReference } from '../region.js';

/**
 * High-level bounding box coordinate structure [minLon, minLat, maxLon, maxLat].
 */
export type BoundingBox = [number, number, number, number];

/**
 * Generic spatial query parameter contract.
 */
export interface SpatialQueryOptions {
  bbox?: BoundingBox;
  region?: RegionReference;
  limit?: number;
}

/**
 * Provider-neutral interface for geospatial operations and spatial indexing.
 */
export interface GISAdapter {
  validateCoordinates(longitude: number, latitude: number): boolean;
  resolveRegion(longitude: number, latitude: number): Promise<RegionReference | null>;
}
