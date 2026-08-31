import type { Request, Response, NextFunction } from 'express';
import { ResourceService, defaultResourceService } from '../services/resourceService.js';
import { createSuccessResponse } from '../utils/response.js';
import { ForbiddenError } from '../errors/index.js';

export class DevController {
  constructor(private readonly resourceService: ResourceService = defaultResourceService) {}

  getDataStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (process.env.NODE_ENV === 'production') {
        throw new ForbiddenError('Diagnostic data-status endpoints are disabled in production.');
      }

      const status = await this.resourceService.getDataStatus();

      res.status(200).json(
        createSuccessResponse(status, {
          requestId: req.id,
        }),
      );
    } catch (error) {
      next(error);
    }
  };
}

export const defaultDevController = new DevController();
