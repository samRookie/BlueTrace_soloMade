import { describe, it, expect } from 'vitest';
import express, { type Request, type Response } from 'express';
import request from 'supertest';
import { createRateLimiter } from '../../src/middleware/rateLimit.js';
import { errorHandler } from '../../src/middleware/errorHandler.js';

describe('Security - Rate Limiter Middleware', () => {
  it('allows requests within threshold and returns 429 once limit is exceeded', async () => {
    const app = express();
    const testLimiter = createRateLimiter({
      windowMs: 5000,
      maxRequests: 3,
      message: 'Rate limit test breach',
    });

    app.get('/test-limit', testLimiter, (_req: Request, res: Response) => {
      res.status(200).json({ success: true });
    });
    app.use(errorHandler);

    // 1st request -> ok
    const res1 = await request(app).get('/test-limit');
    expect(res1.status).toBe(200);

    // 2nd request -> ok
    const res2 = await request(app).get('/test-limit');
    expect(res2.status).toBe(200);

    // 3rd request -> ok
    const res3 = await request(app).get('/test-limit');
    expect(res3.status).toBe(200);

    // 4th request -> 429
    const res4 = await request(app).get('/test-limit');
    expect(res4.status).toBe(429);
    expect(res4.body.success).toBe(false);
    expect(res4.body.error.message).toBe('Rate limit test breach');
  });
});
