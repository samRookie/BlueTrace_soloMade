import { z } from 'zod';

export const gisLayerTypeSchema = z.enum([
  'COASTAL',
  'LAND_USE',
  'PROJECTS',
  'DISPUTES',
  'CLIMATE',
  'FOREST',
  'AGRICULTURE',
  'URBAN',
  'INFRASTRUCTURE',
  'INDICATORS',
]);

export const gisGeometryTypeSchema = z.enum(['Point', 'LineString', 'Polygon', 'MultiPolygon']);

export const gisLayerFilterSchema = z.object({
  regionId: z.string().trim().min(1).max(64).optional(),
  layerType: z.string().trim().min(1).max(64).optional(),
  sampleFlag: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .transform((val) => (typeof val === 'boolean' ? val : val === 'true'))
    .optional(),
});

export const gisFeatureFilterSchema = z.object({
  regionId: z.string().trim().min(1).max(64).optional(),
  bbox: z
    .string()
    .trim()
    .regex(
      /^-?\d+(\.\d+)?,-?\d+(\.\d+)?,-?\d+(\.\d+)?,-?\d+(\.\d+)?$/,
      'bbox must be minLon,minLat,maxLon,maxLat',
    )
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const gisParamsSchema = z.object({
  id: z.string().trim().min(1).max(64),
});

export const regionContextParamsSchema = z.object({
  id: z.string().trim().min(1).max(64),
});
