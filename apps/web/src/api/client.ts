import type { ApiResponse, ApiErrorResponse } from '@sih26019/shared-types';

export interface ApiClientOptions extends RequestInit {
  baseUrl?: string;
}

export class ApiClientError extends Error {
  public readonly code: string;
  public readonly details?: unknown;

  constructor(errorResponse: ApiErrorResponse['error']) {
    super(errorResponse.message);
    this.name = 'ApiClientError';
    this.code = errorResponse.code;
    this.details = errorResponse.details;
  }
}

/**
 * Standard typed API request helper for web application components.
 */
export async function fetchApi<T>(
  endpoint: string,
  options: ApiClientOptions = {},
): Promise<ApiResponse<T>> {
  const baseUrl = options.baseUrl || '';
  const url = `${baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const body = (await response.json()) as ApiResponse<T>;
    return body;
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Network request failed',
      },
    };
  }
}
