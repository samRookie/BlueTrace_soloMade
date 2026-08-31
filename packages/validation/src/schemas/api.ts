import { z } from 'zod';
import type {
  ApiErrorCode,
  ApiErrorDetails,
  ApiMetadata,
  ApiSuccessResponse,
  ApiErrorResponse,
  HealthCheckResponse,
  PaginationQuery,
  PaginationMeta,
  RegionFilterQuery,
} from '@sih26019/shared-types';
import { ARCHITECTURE_VERSION } from '@sih26019/shared-types';
import { isoTimestampSchema, regionLevelSchema } from './domain.js';

/**
 * Standard API error code validator schema.
 */
export const apiErrorCodeSchema = z.enum([
  'VALIDATION_ERROR',
  'UNAUTHORIZED',
  'FORBIDDEN',
  'NOT_FOUND',
  'CONFLICT',
  'BAD_REQUEST',
  'INTERNAL_ERROR',
  'SERVICE_UNAVAILABLE',
]) satisfies z.ZodType<ApiErrorCode>;

/**
 * API error details validator schema.
 */
export const apiErrorDetailsSchema = z.object({
  code: apiErrorCodeSchema,
  message: z.string().min(1, 'Error message is required'),
  details: z.unknown().optional(),
}) satisfies z.ZodType<ApiErrorDetails>;

/**
 * Standard pagination query parameter schema.
 */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
}) satisfies z.ZodType<PaginationQuery>;

/**
 * Pagination metadata validator schema.
 */
export const paginationMetaSchema = z.object({
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
}) satisfies z.ZodType<PaginationMeta>;

/**
 * Factory for creating typed paginated data collection schemas.
 */
export function createPaginatedDataSchema<T>(itemSchema: z.ZodType<T>) {
  return z.object({
    items: z.array(itemSchema),
    pagination: paginationMetaSchema,
  });
}

/**
 * Region query filters validator schema.
 */
export const regionFilterSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  level: regionLevelSchema.optional(),
  search: z.string().min(1).max(100).optional(),
}) satisfies z.ZodType<RegionFilterQuery>;

/**
 * Region route parameter validator schema.
 */
export const regionParamsSchema = z.object({
  id: z.string().min(1).max(64),
});

/**
 * API metadata validator schema.
 */
export const apiMetadataSchema = z.object({
  requestId: z.string().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
  total: z.number().int().nonnegative().optional(),
  timestamp: isoTimestampSchema.optional(),
}) satisfies z.ZodType<ApiMetadata>;

/**
 * Factory for creating typed success response envelope schemas.
 */
export function createApiSuccessResponseSchema<T>(dataSchema: z.ZodType<T>) {
  return z.object({
    success: z.literal(true),
    data: dataSchema,
    meta: apiMetadataSchema.optional(),
  }) as z.ZodType<ApiSuccessResponse<T>>;
}

/**
 * API error response envelope schema.
 */
export const apiErrorResponseSchema = z.object({
  success: z.literal(false),
  error: apiErrorDetailsSchema,
  requestId: z.string().optional(),
}) satisfies z.ZodType<ApiErrorResponse>;

/**
 * Factory for creating typed API response envelope schemas.
 */
export function createApiResponseSchema<T>(dataSchema: z.ZodType<T>) {
  return z.union([createApiSuccessResponseSchema(dataSchema), apiErrorResponseSchema]);
}

/**
 * Health check response validation schema with Architecture Version check.
 */
export const healthCheckResponseSchema = z.object({
  status: z.literal('ok'),
  service: z.literal('api'),
  version: z.string().min(1),
  architectureVersion: z.literal(ARCHITECTURE_VERSION),
}) satisfies z.ZodType<HealthCheckResponse>;
