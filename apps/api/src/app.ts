import express, { type Express, type Request, type Response } from 'express';
import cors from 'cors';
import { healthRouter } from './routes/health.js';
import { v1Router } from './routes/v1/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { createErrorResponse } from './utils/response.js';

export function createApp(): Express {
  const app = express();

  // Basic security and parsing middleware
  app.use(cors());
  app.use(express.json());

  // Base Health endpoint
  app.use('/', healthRouter);

  // Versioned API namespace
  app.use('/api/v1', v1Router);

  // 404 Handler for undefined routes using standard error envelope
  app.use((_req: Request, res: Response) => {
    res
      .status(404)
      .json(createErrorResponse('NOT_FOUND', 'The requested resource does not exist.'));
  });

  // Central error handling middleware
  app.use(errorHandler);

  return app;
}
