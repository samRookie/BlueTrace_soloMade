import { describe, it, expect } from 'vitest';
import { healthCheckResponseSchema } from '../src/index.js';

describe('Validation Foundation Package', () => {
  it('validates a correct health check response', () => {
    const validData = {
      status: 'ok',
      service: 'api',
      version: '0.1.0',
    };

    const result = healthCheckResponseSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validData);
    }
  });

  it('rejects an invalid health check response', () => {
    const invalidData = {
      status: 'error',
      service: 'api',
      version: '0.1.0',
    };

    const result = healthCheckResponseSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
