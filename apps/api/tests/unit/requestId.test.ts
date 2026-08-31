import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';

describe('Middleware - Request ID', () => {
  const app = createApp();

  it('generates a fresh UUID request ID when none is provided', async () => {
    const response = await request(app).get('/api/v1/version');

    expect(response.headers['x-request-id']).toBeDefined();
    expect(response.headers['x-request-id']).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    expect(response.body.meta?.requestId).toBe(response.headers['x-request-id']);
  });

  it('preserves a valid incoming x-request-id header', async () => {
    const customId = 'client-trace-12345';
    const response = await request(app).get('/api/v1/version').set('x-request-id', customId);

    expect(response.headers['x-request-id']).toBe(customId);
    expect(response.body.meta?.requestId).toBe(customId);
  });

  it('replaces an invalid/unsafe x-request-id with a clean generated UUID', async () => {
    const maliciousId = '<script>alert(1)</script>--very-long-and-dangerous-characters';
    const response = await request(app).get('/api/v1/version').set('x-request-id', maliciousId);

    expect(response.headers['x-request-id']).not.toBe(maliciousId);
    expect(response.headers['x-request-id']).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  it('attaches the request ID to 404 error responses', async () => {
    const response = await request(app).get('/api/v1/non-existent-route');

    expect(response.status).toBe(404);
    expect(response.headers['x-request-id']).toBeDefined();
    expect(response.body.requestId).toBe(response.headers['x-request-id']);
    expect(response.body.error.code).toBe('NOT_FOUND');
  });
});
