import { Router, type Request, type Response } from 'express';
import { createRequire } from 'node:module';
import { ARCHITECTURE_VERSION } from '@sih26019/shared-types';
import { createSuccessResponse } from '../../utils/response.js';
import { devRouter } from './dev.js';

const require = createRequire(import.meta.url);
const pkg = require('../../../package.json') as { version: string };

export const v1Router: Router = Router();

// Mount development diagnostic routes
v1Router.use('/dev', devRouter);

/**
 * GET /api/v1/health
 * Standard health check endpoint wrapped in the API response envelope.
 */
v1Router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json(
    createSuccessResponse({
      status: 'ok',
      service: 'api',
      version: pkg.version,
      architectureVersion: ARCHITECTURE_VERSION,
    }),
  );
});

/**
 * GET /api/v1/version
 * Exposes API version and architectural baseline information.
 */
v1Router.get('/version', (_req: Request, res: Response) => {
  res.status(200).json(
    createSuccessResponse({
      version: pkg.version,
      architectureVersion: ARCHITECTURE_VERSION,
      environment: process.env.NODE_ENV || 'development',
      status: 'operational',
    }),
  );
});
