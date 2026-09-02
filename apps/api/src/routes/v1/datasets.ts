import { Router } from 'express';
import { defaultDatasetController } from '../../controllers/datasetController.js';
import { validateRequest } from '../../middleware/validate.js';
import { requireAuth, requirePermission } from '../../middleware/auth.js';
import { datasetQuerySchema, createDatasetSchema, updateDatasetSchema } from '@sih26019/validation';
import { z } from '@sih26019/validation';

export const datasetsRouter: Router = Router();

const datasetIdParamSchema = z.object({
  id: z.string().min(1),
});

const attachmentParamSchema = z.object({
  id: z.string().min(1),
  attachmentId: z.string().min(1),
});

/**
 * GET /api/v1/datasets — List datasets with search and faceted filters.
 */
datasetsRouter.get(
  '/',
  validateRequest({ query: datasetQuerySchema }),
  defaultDatasetController.listDatasets,
);

/**
 * POST /api/v1/datasets — Register a new dataset entry (requires dataset:create permission).
 */
datasetsRouter.post(
  '/',
  requireAuth,
  requirePermission('dataset:create'),
  validateRequest({ body: createDatasetSchema }),
  defaultDatasetController.createDataset,
);

/**
 * GET /api/v1/datasets/:id — Retrieve detailed dataset metadata, graph links, and attachments.
 */
datasetsRouter.get(
  '/:id',
  validateRequest({ params: datasetIdParamSchema }),
  defaultDatasetController.getDatasetById,
);

/**
 * PATCH /api/v1/datasets/:id — Update dataset metadata (requires dataset:update permission).
 */
datasetsRouter.patch(
  '/:id',
  requireAuth,
  requirePermission('dataset:update'),
  validateRequest({ params: datasetIdParamSchema, body: updateDatasetSchema }),
  defaultDatasetController.updateDataset,
);

/**
 * POST /api/v1/datasets/:id/attachments — Safely upload and attach a dataset file (requires dataset:create permission).
 */
datasetsRouter.post(
  '/:id/attachments',
  requireAuth,
  requirePermission('dataset:create'),
  validateRequest({ params: datasetIdParamSchema }),
  defaultDatasetController.uploadAttachment,
);

/**
 * GET /api/v1/datasets/:id/attachments/:attachmentId/download — Secure download of attached dataset file.
 */
datasetsRouter.get(
  '/:id/attachments/:attachmentId/download',
  validateRequest({ params: attachmentParamSchema }),
  defaultDatasetController.downloadAttachment,
);
