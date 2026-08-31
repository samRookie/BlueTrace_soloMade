import type { Request, Response, NextFunction } from 'express';
import { ResourceService, defaultResourceService } from '../services/resourceService.js';
import { createSuccessResponse } from '../utils/response.js';

export class ResourceController {
  constructor(private readonly resourceService: ResourceService = defaultResourceService) {}

  getCounts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const counts = await this.resourceService.getResourceCounts();

      res.status(200).json(
        createSuccessResponse(counts, {
          requestId: req.id,
        }),
      );
    } catch (error) {
      next(error);
    }
  };
}

export const defaultResourceController = new ResourceController();
