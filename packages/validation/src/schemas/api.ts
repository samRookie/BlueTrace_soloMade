import { z } from 'zod';
import type {
  ApiErrorCode,
  ApiErrorDetails,
  ApiMetadata,
  ApiSuccessResponse,
  ApiErrorResponse,
  HealthCheckResponse,
} from '@sih26019/shared-types';
import { ARCHITECTURE_VERSION } from '@sih26019/shared-types';
import { isoTimestampSchema } from './domain.js';

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
 * API metadata validator schema.
 */
export const apiMetadataSchema = z.object({
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
