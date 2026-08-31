import { Router } from 'express';
import { defaultWorkspaceController } from '../../controllers/workspaceController.js';
import { requireAuth } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validate.js';
import { paginationQuerySchema } from '@sih26019/validation';
import { workspaceParamsSchema } from '@sih26019/validation';

export const workspacesRouter: Router = Router();

/**
 * GET /api/v1/workspaces
 * Retrieves a paginated list of workspaces accessible to the authenticated user.
 */
workspacesRouter.get(
  '/',
  requireAuth,
  validateRequest({ query: paginationQuerySchema }),
  defaultWorkspaceController.listWorkspaces,
);

/**
 * GET /api/v1/workspaces/:id
 * Retrieves a single workspace by ID with strict IDOR membership/ownership checks.
 */
workspacesRouter.get(
  '/:id',
  requireAuth,
  validateRequest({ params: workspaceParamsSchema }),
  defaultWorkspaceController.getWorkspaceById,
);
