import type {
  ApiResponse,
  ApiSuccessResponse,
  ApiErrorResponse,
  RegionFilterQuery,
  PaginatedData,
  HealthCheckResponse,
} from '@sih26019/shared-types';

export interface ApiClientOptions extends RequestInit {
  baseUrl?: string;
}

export class ApiClientError extends Error {
  public readonly code: string;
  public readonly details?: unknown;
  public readonly requestId?: string;

  constructor(errorResponse: ApiErrorResponse['error'], requestId?: string) {
    super(errorResponse.message);
    this.name = 'ApiClientError';
    this.code = errorResponse.code;
    this.details = errorResponse.details;
    this.requestId = requestId;
  }
}

export class NetworkError extends Error {
  constructor(message = 'Network connection failed') {
    super(message);
    this.name = 'NetworkError';
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

/**
 * Typed client API functions for frontend consumers.
 */
export async function getRegions(
  params: RegionFilterQuery = {},
  options?: ApiClientOptions,
): Promise<ApiResponse<PaginatedData<unknown>>> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.pageSize) searchParams.set('pageSize', String(params.pageSize));
  if (params.level) searchParams.set('level', params.level);
  if (params.search) searchParams.set('search', params.search);

  const query = searchParams.toString();
  const endpoint = `/api/v1/regions${query ? `?${query}` : ''}`;
  return fetchApi<PaginatedData<unknown>>(endpoint, options);
}

export async function getRegionById<T = unknown>(
  id: string,
  options?: ApiClientOptions,
): Promise<ApiResponse<T>> {
  return fetchApi<T>(`/api/v1/regions/${encodeURIComponent(id)}`, options);
}

export async function getResourceCounts<T = unknown>(
  options?: ApiClientOptions,
): Promise<ApiResponse<T>> {
  return fetchApi<T>('/api/v1/resources/counts', options);
}

export async function getDataStatus<T = unknown>(
  options?: ApiClientOptions,
): Promise<ApiResponse<T>> {
  return fetchApi<T>('/api/v1/dev/data-status', options);
}

export async function getHealth(
  options?: ApiClientOptions,
): Promise<HealthCheckResponse | { status: 'error'; message: string }> {
  const baseUrl = options?.baseUrl || '';
  try {
    const response = await fetch(`${baseUrl}/health`, options);
    return (await response.json()) as HealthCheckResponse;
  } catch (err) {
    return { status: 'error', message: err instanceof Error ? err.message : 'Unreachable' };
  }
}
