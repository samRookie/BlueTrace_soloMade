import { describe, it, expect } from 'vitest';
import express, { type Request, type Response } from 'express';
import request from 'supertest';
import { csrfProtection } from '../../src/middleware/csrf.js';
import { errorHandler } from '../../src/middleware/errorHandler.js';

describe('Security - CSRF Protection Middleware', () => {
  const app = express();
  app.use(express.json());
  app.use(csrfProtection);

  app.get('/test-safe', (_req: Request, res: Response) => {
    res.status(200).json({ success: true });
  });

  app.post('/test-mutate', (_req: Request, res: Response) => {
    res.status(200).json({ success: true, mutated: true });
  });

  app.use(errorHandler);

  it('allows safe read-only HTTP methods without CSRF checks', async () => {
    const res = await request(app).get('/test-safe');
    expect(res.status).toBe(200);
  });

  it('allows state-changing request with valid X-Requested-With header', async () => {
    const res = await request(app)
      .post('/test-mutate')
      .set('X-Requested-With', 'XMLHttpRequest')
      .send({ data: 123 });

    expect(res.status).toBe(200);
    expect(res.body.mutated).toBe(true);
  });

  it('allows state-changing request with valid localhost Origin', async () => {
    const res = await request(app)
      .post('/test-mutate')
      .set('Origin', 'http://localhost:3000')
      .send({ data: 123 });

    expect(res.status).toBe(200);
    expect(res.body.mutated).toBe(true);
  });

  it('rejects state-changing request from untrusted external Origin', async () => {
    const res = await request(app)
      .post('/test-mutate')
      .set('Origin', 'https://malicious-attacker-site.com')
      .send({ data: 123 });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
    expect(res.body.error.message).toContain('CSRF protection');
  });
});
