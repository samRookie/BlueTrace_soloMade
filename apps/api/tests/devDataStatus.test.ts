import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

describe('API Service - /api/v1/dev/data-status', () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    process.env.NODE_ENV = 'development';
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('returns data status envelope with counts in development mode', async () => {
    const app = createApp();
    const response = await request(app).get('/api/v1/dev/data-status');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('database');
    expect(response.body.data).toHaveProperty('counts');
    expect(response.body.data).toHaveProperty('architectureVersion', '1.0');
  });

  it('rejects access and returns 403 FORBIDDEN when in production mode', async () => {
    process.env.NODE_ENV = 'production';
    const app = createApp();
    const response = await request(app).get('/api/v1/dev/data-status');

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toEqual({
      code: 'FORBIDDEN',
      message: 'Diagnostic data-status endpoints are disabled in production.',
    });
    expect(response.body.requestId).toBeDefined();
  });
});
