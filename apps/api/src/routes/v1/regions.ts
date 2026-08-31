import { Router } from 'express';
import { defaultRegionController } from '../../controllers/regionController.js';
import { validateRequest } from '../../middleware/validate.js';
import { regionFilterSchema, regionParamsSchema } from '@sih26019/validation';

export const regionsRouter: Router = Router();

/**
 * GET /api/v1/regions
 * Returns a paginated list of regions with optional filtering by administrative level and search query.
 */
regionsRouter.get(
  '/',
  validateRequest({ query: regionFilterSchema }),
  defaultRegionController.listRegions,
);

/**
 * GET /api/v1/regions/:id
 * Returns a single region by unique ID.
 */
regionsRouter.get(
  '/:id',
  validateRequest({ params: regionParamsSchema }),
  defaultRegionController.getRegionById,
);
