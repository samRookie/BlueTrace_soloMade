import { Router, type Request, type Response } from 'express';
import { createRequire } from 'node:module';
import { ARCHITECTURE_VERSION } from '@sih26019/shared-types';
import { createSuccessResponse } from '../../utils/response.js';
import { authRouter } from './auth.js';
import { auditRouter } from './audit.js';
import { workspacesRouter } from './workspaces.js';
import { regionsRouter } from './regions.js';
import { resourcesRouter } from './resources.js';
import { devRouter } from './dev.js';
import { evidenceRouter } from './evidence.js';

const require = createRequire(import.meta.url);
const pkg = require('../../../package.json') as { version: string };

export const v1Router: Router = Router();

// Mount authentication, audit, and workspace routers
v1Router.use('/auth', authRouter);
v1Router.use('/audit', auditRouter);
v1Router.use('/workspaces', workspacesRouter);

// Mount Phase 5 Knowledge and Evidence Repository router
v1Router.use('/evidence', evidenceRouter);
v1Router.use('/research', evidenceRouter);

// Mount foundational domain routers
v1Router.use('/regions', regionsRouter);
v1Router.use('/resources', resourcesRouter);
v1Router.use('/dev', devRouter);

/**
 * GET /api/v1/health
 * Standard health check endpoint wrapped in the API response envelope.
 */
v1Router.get('/health', (req: Request, res: Response) => {
  res.status(200).json(
    createSuccessResponse(
      {
        status: 'ok',
        service: 'api',
        version: pkg.version,
        architectureVersion: ARCHITECTURE_VERSION,
      },
      { requestId: req.id },
    ),
  );
});

/**
 * GET /api/v1/version
 * Exposes API version and architectural baseline information.
 */
v1Router.get('/version', (req: Request, res: Response) => {
  res.status(200).json(
    createSuccessResponse(
      {
        version: pkg.version,
        architectureVersion: ARCHITECTURE_VERSION,
        environment: process.env.NODE_ENV || 'development',
        status: 'operational',
      },
      { requestId: req.id },
    ),
  );
});
