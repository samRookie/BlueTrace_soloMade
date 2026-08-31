import { describe, it, expect } from 'vitest';
import express, { type Request, type Response } from 'express';
import request from 'supertest';
import { z } from '@sih26019/validation';
import { validateRequest } from '../../src/middleware/validate.js';
import { errorHandler } from '../../src/middleware/errorHandler.js';

describe('Middleware - validateRequest', () => {
  function createTestApp() {
    const app = express();
    app.use(express.json());

    const testQuerySchema = z.object({
      page: z.coerce.number().int().min(1).default(1),
      status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
    });

    const testBodySchema = z.object({
      title: z.string().min(3),
      count: z.number().positive(),
    });

    app.get(
      '/test-validate',
      validateRequest({ query: testQuerySchema }),
      (req: Request, res: Response) => {
        res.status(200).json({ success: true, query: req.query });
      },
    );

    app.post(
      '/test-validate',
      validateRequest({ body: testBodySchema }),
      (req: Request, res: Response) => {
        res.status(200).json({ success: true, body: req.body });
      },
    );

    app.use(errorHandler);
    return app;
  }

  it('passes valid coerced query parameters to the route handler', async () => {
    const app = createTestApp();
    const response = await request(app).get('/test-validate?page=3&status=ACTIVE');

    expect(response.status).toBe(200);
    expect(response.body.query).toEqual({ page: 3, status: 'ACTIVE' });
  });

  it('rejects invalid query enum values with 400 VALIDATION_ERROR', async () => {
    const app = createTestApp();
    const response = await request(app).get('/test-validate?status=INVALID_STATUS');

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(response.body.error.message).toBe('Request validation failed.');
  });

  it('rejects invalid JSON request body with 400 VALIDATION_ERROR', async () => {
    const app = createTestApp();
    const response = await request(app).post('/test-validate').send({ title: 'a', count: -5 });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(response.body.error.details).toBeDefined();
  });
});
