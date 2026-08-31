import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

describe('API Service - /api/v1 Namespace', () => {
  const app = createApp();

  it('GET /api/v1/health returns wrapped success response', async () => {
    const response = await request(app).get('/api/v1/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: {
        status: 'ok',
        service: 'api',
        version: '0.1.0',
        architectureVersion: '1.0',
      },
    });
  });

  it('GET /api/v1/version returns architecture version and operational status', async () => {
    const response = await request(app).get('/api/v1/version');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('version', '0.1.0');
    expect(response.body.data).toHaveProperty('architectureVersion', '1.0');
    expect(response.body.data).toHaveProperty('status', 'operational');
  });
});
