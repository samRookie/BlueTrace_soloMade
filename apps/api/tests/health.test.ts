import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

describe('API Service - Health Endpoint', () => {
  const app = createApp();

  it('boots and responds successfully to GET /health', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.body).toEqual({
      status: 'ok',
      service: 'api',
      version: '0.1.0',
    });
  });

  it('does not expose internal credentials or sensitive headers', async () => {
    const response = await request(app).get('/health');

    expect(response.body).not.toHaveProperty('DATABASE_URL');
    expect(response.body).not.toHaveProperty('password');
    expect(response.body).not.toHaveProperty('env');
  });

  it('returns 404 for unknown endpoints', async () => {
    const response = await request(app).get('/unknown-endpoint');
    expect(response.status).toBe(404);
  });
});
