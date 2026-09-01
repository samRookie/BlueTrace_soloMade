import type { IsoTimestamp } from './timestamp.js';
import type { RegionLevel } from './region.js';

/**
 * Standard error codes across platform APIs.
 */
export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'BAD_REQUEST'
  | 'INTERNAL_ERROR'
  | 'SERVICE_UNAVAILABLE';

/**
 * Detailed error payload included in API failure responses.
 */
export interface ApiErrorDetails {
  code: ApiErrorCode;
  message: string;
  details?: unknown;
}

/**
 * Pagination query parameters accepted by list endpoints.
 */
export interface PaginationQuery {
  page?: number;
  pageSize?: number;
}

/**
 * Pagination metadata included in paginated response data.
 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/**
 * Standard paginated collection data structure.
 */
export interface PaginatedData<T> {
  items: T[];
  pagination: PaginationMeta;
}

/**
 * Filter query parameters for regions list endpoint.
 */
export interface RegionFilterQuery extends PaginationQuery {
  level?: RegionLevel;
  search?: string;
}

/**
 * Contextual metadata for API responses.
 */
export interface ApiMetadata {
  requestId?: string;
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  timestamp?: IsoTimestamp;
  [key: string]: unknown;
}

/**
 * Standard successful API response envelope.
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  meta?: ApiMetadata;
}

/**
 * Standard failure API response envelope.
 */
export interface ApiErrorResponse {
  success: false;
  error: ApiErrorDetails;
  requestId?: string;
}

/**
 * Unified API response envelope contract.
 */
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;
