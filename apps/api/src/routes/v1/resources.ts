import { Router } from 'express';
import { defaultResourceController } from '../../controllers/resourceController.js';

export const resourcesRouter: Router = Router();

/**
 * GET /api/v1/resources/counts
 * Returns aggregate counts of all domain entities across the platform persistence layer.
 */
resourcesRouter.get('/counts', defaultResourceController.getCounts);
