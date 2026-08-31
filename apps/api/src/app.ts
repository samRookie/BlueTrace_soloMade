import express, { type Express, type Request, type Response } from 'express';
import cors from 'cors';
import { healthRouter } from './routes/health.js';

export function createApp(): Express {
  const app = express();

  // Basic security and parsing middleware
  app.use(cors());
  app.use(express.json());

  // Health endpoint
  app.use('/', healthRouter);

  // 404 Handler for undefined routes
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      error: 'Not Found',
      message: 'The requested resource does not exist.',
    });
  });

  return app;
}
