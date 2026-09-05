import { Router } from 'express';
import { defaultGisController } from '../../controllers/gisController.js';

export const gisRouter: Router = Router();

/**
 * GET /api/v1/gis/layers
 * Returns all accessible GIS layers with optional filtering by region and type.
 */
gisRouter.get('/layers', defaultGisController.listLayers);

/**
 * GET /api/v1/gis/layers/:id
 * Returns single GIS layer metadata.
 */
gisRouter.get('/layers/:id', defaultGisController.getLayerById);

/**
 * GET /api/v1/gis/layers/:id/features
 * Returns paginated GeoJSON features for a specific GIS layer.
 */
gisRouter.get('/layers/:id/features', defaultGisController.listFeatures);

/**
 * GET /api/v1/gis/features/:id
 * Returns single GIS feature details with linked entities.
 */
gisRouter.get('/features/:id', defaultGisController.getFeatureById);
