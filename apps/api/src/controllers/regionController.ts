import type { Request, Response, NextFunction } from 'express';
import { RegionService, defaultRegionService } from '../services/regionService.js';
import { createSuccessResponse } from '../utils/response.js';
import type { RegionLevel } from '@sih26019/shared-types';

export class RegionController {
  constructor(private readonly regionService: RegionService = defaultRegionService) {}

  listRegions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Number(req.query.page) || 1;
      const pageSize = Number(req.query.pageSize) || 20;
      const level = req.query.level as RegionLevel | undefined;
      const search = typeof req.query.search === 'string' ? req.query.search : undefined;

      const result = await this.regionService.listRegions({ level, search }, { page, pageSize });

      res.status(200).json(
        createSuccessResponse(result, {
          requestId: req.id,
          page,
          limit: pageSize,
          total: result.pagination.total,
        }),
      );
    } catch (error) {
      next(error);
    }
  };

  getRegionById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const region = await this.regionService.getRegionById(id);

      res.status(200).json(
        createSuccessResponse(region, {
          requestId: req.id,
        }),
      );
    } catch (error) {
      next(error);
    }
  };
}

export const defaultRegionController = new RegionController();
