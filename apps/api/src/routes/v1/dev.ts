import { Router } from 'express';
import { defaultDevController } from '../../controllers/devController.js';

export const devRouter: Router = Router();

/**
 * GET /api/v1/dev/data-status
 * Development-only diagnostic route exposing database connectivity, sample data status, and entity counts.
 */
devRouter.get('/data-status', defaultDevController.getDataStatus);
