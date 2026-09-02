import type {
  ApiResponse,
  ApiErrorResponse,
  RegionFilterQuery,
  PaginatedData,
  HealthCheckResponse,
  LoginRequest,
  LoginResponse,
  AuthenticatedUser,
  AuditEventDto,
  AuditStatus,
  WorkspaceDto,
  PaginationQuery,
  EvidenceItemDto,
  EvidenceDetailDto,
  EvidenceFilterQuery,
  CreateEvidenceRequest,
  CreateRelationshipRequest,
  ResourceAttachmentDto,
  DatasetItemDto,
  DatasetDetailDto,
  DatasetFilterQuery,
  CreateDatasetRequest,
  UpdateDatasetRequest,
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
    'X-Requested-With': 'XMLHttpRequest',
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: options.credentials || 'include',
    });

    if (typeof response.json === 'function') {
      try {
        const body = (await response.json()) as ApiResponse<T>;
        return body;
      } catch {
        // Fall through to text parsing if json() fails (e.g. empty 404 response)
      }
    }

    if (typeof response.text === 'function') {
      const text = await response.text();
      if (!text) {
        if (!response.ok) {
          return {
            success: false,
            error: {
              code: response.status === 404 ? 'NOT_FOUND' : 'INTERNAL_ERROR',
              message:
                response.status === 404
                  ? `API endpoint "${url}" was not found (HTTP 404). Ensure the backend API server is running on port 3001.`
                  : `Server returned HTTP ${response.status} with empty response body.`,
            },
          };
        }
        return {
          success: true,
          data: {} as T,
        };
      }

      try {
        const body = JSON.parse(text) as ApiResponse<T>;
        return body;
      } catch {
        return {
          success: false,
          error: {
            code: response.status === 404 ? 'NOT_FOUND' : 'INTERNAL_ERROR',
            message:
              response.status === 404
                ? `API endpoint "${url}" was not found (HTTP 404). Ensure backend server is running.`
                : `Received non-JSON response from server (HTTP ${response.status}): ${text.slice(0, 120)}`,
          },
        };
      }
    }

    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Unsupported response format from server.',
      },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message:
          error instanceof Error
            ? error.message
            : 'Network connection failed. Ensure the API server is running.',
      },
    };
  }
}

/**
 * Authentication API Client Methods
 */
export async function login(
  credentials: LoginRequest,
  options?: ApiClientOptions,
): Promise<ApiResponse<LoginResponse>> {
  return fetchApi<LoginResponse>('/api/v1/auth/login', {
    ...options,
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export async function logout(
  options?: ApiClientOptions,
): Promise<ApiResponse<{ loggedOut: boolean }>> {
  return fetchApi<{ loggedOut: boolean }>('/api/v1/auth/logout', {
    ...options,
    method: 'POST',
  });
}

export async function getCurrentUser(
  options?: ApiClientOptions,
): Promise<ApiResponse<{ user: AuthenticatedUser }>> {
  return fetchApi<{ user: AuthenticatedUser }>('/api/v1/auth/me', options);
}

/**
 * Audit and Workspaces API Client Methods
 */
export async function getAuditEvents(
  params: {
    page?: number;
    pageSize?: number;
    actorId?: string;
    action?: string;
    status?: AuditStatus;
  } = {},
  options?: ApiClientOptions,
): Promise<ApiResponse<PaginatedData<AuditEventDto>>> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.pageSize) searchParams.set('pageSize', String(params.pageSize));
  if (params.actorId) searchParams.set('actorId', params.actorId);
  if (params.action) searchParams.set('action', params.action);
  if (params.status) searchParams.set('status', params.status);

  const query = searchParams.toString();
  return fetchApi<PaginatedData<AuditEventDto>>(
    `/api/v1/audit/events${query ? `?${query}` : ''}`,
    options,
  );
}

export async function getWorkspaces(
  params: PaginationQuery = {},
  options?: ApiClientOptions,
): Promise<ApiResponse<PaginatedData<WorkspaceDto>>> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.pageSize) searchParams.set('pageSize', String(params.pageSize));

  const query = searchParams.toString();
  return fetchApi<PaginatedData<WorkspaceDto>>(
    `/api/v1/workspaces${query ? `?${query}` : ''}`,
    options,
  );
}

export async function getWorkspaceById(
  id: string,
  options?: ApiClientOptions,
): Promise<ApiResponse<WorkspaceDto>> {
  return fetchApi<WorkspaceDto>(`/api/v1/workspaces/${encodeURIComponent(id)}`, options);
}

/**
 * Domain & Infrastructure API Client Methods
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

/**
 * Phase 5 — Knowledge and Evidence Repository API Client Methods
 */
export async function getEvidenceList(
  params: EvidenceFilterQuery = {},
  options?: ApiClientOptions,
): Promise<ApiResponse<EvidenceItemDto[]>> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.category) searchParams.set('category', params.category);
  if (params.sourceType) searchParams.set('sourceType', params.sourceType);
  if (params.lifecycleStatus) searchParams.set('lifecycleStatus', params.lifecycleStatus);
  if (params.integrityStatus) searchParams.set('integrityStatus', params.integrityStatus);
  if (params.visibility) searchParams.set('visibility', params.visibility);
  if (params.projectId) searchParams.set('projectId', params.projectId);
  if (params.policyId) searchParams.set('policyId', params.policyId);
  if (params.search) searchParams.set('search', params.search);

  const query = searchParams.toString();
  const endpoint = `/api/v1/evidence${query ? `?${query}` : ''}`;
  return fetchApi<EvidenceItemDto[]>(endpoint, options);
}

export async function getEvidenceById(
  id: string,
  options?: ApiClientOptions,
): Promise<ApiResponse<EvidenceDetailDto>> {
  return fetchApi<EvidenceDetailDto>(`/api/v1/evidence/${encodeURIComponent(id)}`, options);
}

export async function createEvidence(
  payload: CreateEvidenceRequest,
  options?: ApiClientOptions,
): Promise<ApiResponse<EvidenceDetailDto>> {
  return fetchApi<EvidenceDetailDto>('/api/v1/evidence', {
    ...options,
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function createEvidenceRelationship(
  sourceId: string,
  payload: CreateRelationshipRequest,
  options?: ApiClientOptions,
): Promise<ApiResponse<{ message: string }>> {
  return fetchApi<{ message: string }>(
    `/api/v1/evidence/${encodeURIComponent(sourceId)}/relationships`,
    {
      ...options,
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );
}

export async function uploadEvidenceAttachment(
  evidenceId: string,
  payload: { fileName: string; mimeType: string; fileBase64: string },
  options?: ApiClientOptions,
): Promise<ApiResponse<ResourceAttachmentDto>> {
  return fetchApi<ResourceAttachmentDto>(
    `/api/v1/evidence/${encodeURIComponent(evidenceId)}/attachments`,
    {
      ...options,
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );
}

export function getAttachmentDownloadUrl(evidenceId: string, attachmentId: string): string {
  return `/api/v1/evidence/${encodeURIComponent(evidenceId)}/attachments/${encodeURIComponent(attachmentId)}/download`;
}

/**
 * Phase 6 Dataset Catalog and Storage API Client Methods
 */
export async function getDatasets(
  params: DatasetFilterQuery = {},
  options?: ApiClientOptions,
): Promise<ApiResponse<DatasetItemDto[]>> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.type) searchParams.set('type', params.type);
  if (params.format) searchParams.set('format', params.format);
  if (params.accessLevel) searchParams.set('accessLevel', params.accessLevel);
  if (params.updateFrequency) searchParams.set('updateFrequency', params.updateFrequency);
  if (params.regionId) searchParams.set('regionId', params.regionId);
  if (params.sourceId) searchParams.set('sourceId', params.sourceId);
  if (params.tag) searchParams.set('tag', params.tag);
  if (params.lifecycleStatus) searchParams.set('lifecycleStatus', params.lifecycleStatus);
  if (params.integrityStatus) searchParams.set('integrityStatus', params.integrityStatus);
  if (params.visibility) searchParams.set('visibility', params.visibility);
  if (params.q) searchParams.set('q', params.q);

  const query = searchParams.toString();
  const endpoint = `/api/v1/datasets${query ? `?${query}` : ''}`;
  return fetchApi<DatasetItemDto[]>(endpoint, options);
}

export async function getDatasetById(
  id: string,
  options?: ApiClientOptions,
): Promise<ApiResponse<DatasetDetailDto>> {
  return fetchApi<DatasetDetailDto>(`/api/v1/datasets/${encodeURIComponent(id)}`, options);
}

export async function createDataset(
  payload: CreateDatasetRequest,
  options?: ApiClientOptions,
): Promise<ApiResponse<DatasetDetailDto>> {
  return fetchApi<DatasetDetailDto>('/api/v1/datasets', {
    ...options,
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateDataset(
  id: string,
  payload: UpdateDatasetRequest,
  options?: ApiClientOptions,
): Promise<ApiResponse<DatasetDetailDto>> {
  return fetchApi<DatasetDetailDto>(`/api/v1/datasets/${encodeURIComponent(id)}`, {
    ...options,
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function uploadDatasetAttachment(
  datasetId: string,
  payload: { fileName: string; mimeType: string; fileBase64: string },
  options?: ApiClientOptions,
): Promise<ApiResponse<ResourceAttachmentDto>> {
  return fetchApi<ResourceAttachmentDto>(
    `/api/v1/datasets/${encodeURIComponent(datasetId)}/attachments`,
    {
      ...options,
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );
}

export function getDatasetDownloadUrl(datasetId: string, attachmentId: string): string {
  return `/api/v1/datasets/${encodeURIComponent(datasetId)}/attachments/${encodeURIComponent(attachmentId)}/download`;
}
