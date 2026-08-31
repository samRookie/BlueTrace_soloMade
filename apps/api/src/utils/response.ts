import type {
  ApiSuccessResponse,
  ApiErrorResponse,
  ApiErrorCode,
  ApiMetadata,
} from '@sih26019/shared-types';

/**
 * Creates a standard successful API response envelope.
 */
export function createSuccessResponse<T>(data: T, meta?: ApiMetadata): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
    ...(meta ? { meta } : {}),
  };
}

/**
 * Creates a standard error API response envelope.
 */
export function createErrorResponse(
  code: ApiErrorCode,
  message: string,
  details?: unknown,
): ApiErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
    },
  };
}
