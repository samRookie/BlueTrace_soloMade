import type { IsoTimestamp } from './timestamp.js';

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
 * Pagination and contextual metadata for API responses.
 */
export interface ApiMetadata {
  page?: number;
  limit?: number;
  total?: number;
  timestamp?: IsoTimestamp;
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
}

/**
 * Unified API response envelope contract.
 */
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;
