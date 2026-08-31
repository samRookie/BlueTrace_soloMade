import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express, { type Request, type Response, type NextFunction } from 'express';
import { z } from '@sih26019/validation';
import { errorHandler } from '../src/middleware/errorHandler.js';
import {
  NotFoundError,
  ForbiddenError,
  ConflictError,
  BadRequestError,
} from '../src/errors/index.js';

describe('API Service - Error Handler Middleware', () => {
  const app = express();
  app.use(express.json());

  // Route that throws a Zod validation error
  app.post('/test/validation', (req: Request, _res: Response, next: NextFunction) => {
    try {
      const schema = z.object({ requiredField: z.string() });
      schema.parse(req.body);
    } catch (err) {
      next(err);
    }
  });

  // Routes that throw custom AppErrors
  app.get('/test/not-found', () => {
    throw new NotFoundError('Custom resource was not found');
  });

  app.get('/test/forbidden', () => {
    throw new ForbiddenError('Access is restricted');
  });

  app.get('/test/conflict', () => {
    throw new ConflictError('Unique constraint conflict');
  });

  app.get('/test/bad-request', () => {
    throw new BadRequestError('Invalid parameter format');
  });

  // Route that throws an unexpected error
  app.get('/test/internal-error', () => {
    throw new Error('Sensitive database connection failure on host 10.0.0.1');
  });

  app.use(errorHandler);

  it('maps ZodError to HTTP 400 VALIDATION_ERROR response', async () => {
    const response = await request(app).post('/test/validation').send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
    expect(response.body.error).toHaveProperty('message', 'Request validation failed.');
    expect(response.body.error).toHaveProperty('details');
  });

  it('maps NotFoundError to HTTP 404 NOT_FOUND response', async () => {
    const response = await request(app).get('/test/not-found');

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('NOT_FOUND');
    expect(response.body.error.message).toBe('Custom resource was not found');
  });

  it('maps ForbiddenError to HTTP 403 FORBIDDEN response', async () => {
    const response = await request(app).get('/test/forbidden');

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('FORBIDDEN');
  });

  it('maps ConflictError to HTTP 409 CONFLICT response', async () => {
    const response = await request(app).get('/test/conflict');

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('CONFLICT');
  });

  it('maps BadRequestError to HTTP 400 BAD_REQUEST response', async () => {
    const response = await request(app).get('/test/bad-request');

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('BAD_REQUEST');
  });

  it('sanitizes unexpected internal errors and returns HTTP 500 INTERNAL_ERROR', async () => {
    const response = await request(app).get('/test/internal-error');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An internal server error occurred.',
      },
    });
    // Ensure sensitive message or stack trace was NOT leaked
    expect(JSON.stringify(response.body)).not.toContain('10.0.0.1');
    expect(JSON.stringify(response.body)).not.toContain('stack');
  });
});
