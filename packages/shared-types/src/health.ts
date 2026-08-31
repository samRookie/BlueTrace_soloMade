/**
 * Standard health check response structure for API services.
 */
export interface HealthCheckResponse {
  status: 'ok';
  service: 'api';
  version: string;
}
