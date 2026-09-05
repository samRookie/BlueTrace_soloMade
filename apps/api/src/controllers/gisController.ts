import type { Request, Response, NextFunction } from 'express';
import { GisService, defaultGisService } from '../services/gisService.js';
import { createSuccessResponse, createErrorResponse } from '../utils/response.js';
import {
  gisLayerFilterSchema,
  gisFeatureFilterSchema,
  gisParamsSchema,
  regionContextParamsSchema,
} from '@sih26019/validation';

export class GisController {
  constructor(private readonly service: GisService = defaultGisService) {}

  listLayers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = gisLayerFilterSchema.parse(req.query);
      const layers = await this.service.listLayers(query, req.user);

      res.status(200).json(
        createSuccessResponse(layers, {
          requestId: req.id,
        }),
      );
    } catch (error) {
      next(error);
    }
  };

  getLayerById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = gisParamsSchema.parse(req.params);
      const layer = await this.service.getLayerById(id, req.user);

      if (!layer) {
        res
          .status(404)
          .json(createErrorResponse('NOT_FOUND', `GIS layer '${id}' not found or inaccessible.`));
        return;
      }

      res.status(200).json(
        createSuccessResponse(layer, {
          requestId: req.id,
        }),
      );
    } catch (error) {
      next(error);
    }
  };

  listFeatures = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id: layerId } = gisParamsSchema.parse(req.params);
      const query = gisFeatureFilterSchema.parse(req.query);

      // Check layer exists and is accessible
      const layer = await this.service.getLayerById(layerId, req.user);
      if (!layer) {
        res
          .status(404)
          .json(
            createErrorResponse('NOT_FOUND', `GIS layer '${layerId}' not found or inaccessible.`),
          );
        return;
      }

      const features = await this.service.listFeatures(layerId, query, req.user);

      res.status(200).json(
        createSuccessResponse(features, {
          requestId: req.id,
        }),
      );
    } catch (error) {
      next(error);
    }
  };

  getFeatureById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = gisParamsSchema.parse(req.params);
      const feature = await this.service.getFeatureById(id, req.user);

      if (!feature) {
        res
          .status(404)
          .json(createErrorResponse('NOT_FOUND', `GIS feature '${id}' not found or inaccessible.`));
        return;
      }

      res.status(200).json(
        createSuccessResponse(feature, {
          requestId: req.id,
        }),
      );
    } catch (error) {
      next(error);
    }
  };

  getRegionalContext = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = regionContextParamsSchema.parse(req.params);
      const context = await this.service.getRegionalContext(id, req.user);

      if (!context) {
        res
          .status(404)
          .json(createErrorResponse('NOT_FOUND', `Region '${id}' not found or inaccessible.`));
        return;
      }

      res.status(200).json(
        createSuccessResponse(context, {
          requestId: req.id,
        }),
      );
    } catch (error) {
      next(error);
    }
  };
}

export const defaultGisController = new GisController();
