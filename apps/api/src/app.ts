import express, { type Express, type Request, type Response } from 'express';
import cors from 'cors';
import { requestIdMiddleware } from './middleware/requestId.js';
import { healthRouter } from './routes/health.js';
import { v1Router } from './routes/v1/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { createErrorResponse } from './utils/response.js';

export function createApp(): Express {
  const app = express();

  // 1. Request correlation context
  app.use(requestIdMiddleware);

  // 2. Security & body parsing middleware
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));

  // 3. Base Health endpoint (unversioned for infrastructure probes)
  app.use('/', healthRouter);

  // 4. Versioned API namespace
  app.use('/api/v1', v1Router);

  // 5. 404 Handler for undefined routes using standard error envelope
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

  // 6. Central error handling middleware
  app.use(errorHandler);

  return app;
}
