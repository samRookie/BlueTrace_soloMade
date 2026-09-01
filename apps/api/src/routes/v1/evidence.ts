import { Router } from 'express';
import { defaultEvidenceController } from '../../controllers/evidenceController.js';
import { validateRequest } from '../../middleware/validate.js';
import { requireAuth, requirePermission } from '../../middleware/auth.js';
import {
  evidenceQuerySchema,
  createEvidenceSchema,
  createRelationshipSchema,
} from '@sih26019/validation';
import { z } from '@sih26019/validation';

export const evidenceRouter: Router = Router();

const evidenceIdParamSchema = z.object({
  id: z.string().min(1),
});

const attachmentParamSchema = z.object({
  id: z.string().min(1),
  attachmentId: z.string().min(1),
});

/**
 * GET /api/v1/evidence — List and discover evidence resources with search and filters.
 */
evidenceRouter.get(
  '/',
  validateRequest({ query: evidenceQuerySchema }),
  defaultEvidenceController.listEvidence,
);

/**
 * POST /api/v1/evidence — Register a new evidence item (requires evidence:create permission).
 */
evidenceRouter.post(
  '/',
  requireAuth,
  requirePermission('evidence:create'),
  validateRequest({ body: createEvidenceSchema }),
  defaultEvidenceController.createEvidence,
);

/**
 * GET /api/v1/evidence/:id — Retrieve detailed evidence item with graph links and attachments.
 */
evidenceRouter.get(
  '/:id',
  validateRequest({ params: evidenceIdParamSchema }),
  defaultEvidenceController.getEvidenceById,
);

/**
 * POST /api/v1/evidence/:id/relationships — Link two evidence items (requires evidence:link permission).
 */
evidenceRouter.post(
  '/:id/relationships',
  requireAuth,
  requirePermission('evidence:link'),
  validateRequest({ params: evidenceIdParamSchema, body: createRelationshipSchema }),
  defaultEvidenceController.createRelationship,
);

/**
 * POST /api/v1/evidence/:id/attachments — Safe upload and attach document (requires evidence:upload permission).
 */
evidenceRouter.post(
  '/:id/attachments',
  requireAuth,
  requirePermission('evidence:upload'),
  validateRequest({ params: evidenceIdParamSchema }),
  defaultEvidenceController.uploadAttachment,
);

/**
 * GET /api/v1/evidence/:id/attachments/:attachmentId/download — Secure download of attached file.
 */
evidenceRouter.get(
  '/:id/attachments/:attachmentId/download',
  validateRequest({ params: attachmentParamSchema }),
  defaultEvidenceController.downloadAttachment,
);
