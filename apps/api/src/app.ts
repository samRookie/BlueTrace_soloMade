import express, { type Express, type Request, type Response } from 'express';
import cors from 'cors';
import { requestIdMiddleware } from './middleware/requestId.js';
import { sessionMiddleware } from './middleware/session.js';
import { csrfProtection } from './middleware/csrf.js';
import { healthRouter } from './routes/health.js';
import { v1Router } from './routes/v1/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { createErrorResponse } from './utils/response.js';

export function createApp(): Express {
  const app = express();

  // 1. Request correlation context
  app.use(requestIdMiddleware);

  // 2. Security & body parsing middleware
  app.use(
    cors({
      origin: true,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));

  // 3. Session extraction & context attachment
  app.use(sessionMiddleware);

  // 4. CSRF protection on state-changing requests
  app.use(csrfProtection);

  // 5. Base Health endpoint (unversioned for infrastructure probes)
  app.use('/', healthRouter);

  // 6. Versioned API namespace
  app.use('/api/v1', v1Router);

  // 7. 404 Handler for undefined routes using standard error envelope
  app.use((req: Request, res: Response) => {
    res
      .status(404)
      .json(
        createErrorResponse(
          'NOT_FOUND',
          'The requested resource does not exist.',
          undefined,
          req.id,
        ),
      );
  });

  // 8. Central error handling middleware
  app.use(errorHandler);

  return app;
}
