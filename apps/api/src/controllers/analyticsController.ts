import type { Request, Response, NextFunction } from 'express';
import { AnalyticsService, defaultAnalyticsService } from '../services/analyticsService.js';
import { createSuccessResponse } from '../utils/response.js';
import { analyticsQuerySchema } from '@sih26019/validation';

export class AnalyticsController {
  constructor(private readonly service: AnalyticsService = defaultAnalyticsService) {}

  getOverview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedQuery = analyticsQuerySchema.parse(req.query);
      const data = await this.service.getOverview(validatedQuery, req.user);

      res.status(200).json(
        createSuccessResponse(data, {
          requestId: req.id,
        }),
      );
    } catch (error) {
      next(error);
    }
  };
}

export const defaultAnalyticsController = new AnalyticsController();
