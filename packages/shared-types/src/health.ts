import type { ArchitectureVersion } from './constants.js';

/**
 * Standard health check response structure for API services.
 */
export interface HealthCheckResponse {
  status: 'ok';
  service: 'api';
  version: string;
  architectureVersion: ArchitectureVersion;
}
