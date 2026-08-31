import { Router, type Request, type Response } from 'express';
import { createRequire } from 'node:module';
import type { HealthCheckResponse } from '@sih26019/shared-types';

const require = createRequire(import.meta.url);
const pkg = require('../../package.json') as { version: string };

export const healthRouter: Router = Router();

healthRouter.get('/health', (_req: Request, res: Response<HealthCheckResponse>) => {
  const payload: HealthCheckResponse = {
    status: 'ok',
    service: 'api',
    version: pkg.version,
  };

  res.status(200).json(payload);
});
