import { Router } from 'express';
import { defaultAuditController } from '../../controllers/auditController.js';
import { requirePermission } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validate.js';
import { auditFilterSchema } from '@sih26019/validation';

export const auditRouter: Router = Router();

/**
 * GET /api/v1/audit/events
 * Protected compliance endpoint retrieving immutable audit event records.
 */
auditRouter.get(
  '/events',
  requirePermission('audit:read'),
  validateRequest({ query: auditFilterSchema }),
  defaultAuditController.listEvents,
);
