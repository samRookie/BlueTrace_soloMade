import { Router } from 'express';
import { defaultAnalyticsController } from '../../controllers/analyticsController.js';

export const analyticsRouter: Router = Router();

/**
 * GET /api/v1/analytics/overview
 * Returns the national evidence and decision-support analytics overview.
 */
analyticsRouter.get('/overview', defaultAnalyticsController.getOverview);
