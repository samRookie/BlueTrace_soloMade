import { describe, it, expect } from 'vitest';
import { healthCheckResponseSchema } from '../src/index.js';

describe('Validation Foundation Package - Health Check', () => {
  it('validates a correct health check response with architectureVersion', () => {
    const validData = {
      status: 'ok',
      service: 'api',
      version: '0.1.0',
      architectureVersion: '1.0',
    };

    const result = healthCheckResponseSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validData);
    }
  });

  it('rejects a health check response missing architectureVersion', () => {
    const invalidData = {
      status: 'ok',
      service: 'api',
      version: '0.1.0',
    };

    const result = healthCheckResponseSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('rejects an invalid health check status', () => {
    const invalidData = {
      status: 'error',
      service: 'api',
      version: '0.1.0',
      architectureVersion: '1.0',
    };

    const result = healthCheckResponseSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
