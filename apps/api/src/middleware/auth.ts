import type { Request, Response, NextFunction, RequestHandler } from 'express';
import type { Permission } from '@sih26019/shared-types';
import { can } from '../security/policy.js';
import { UnauthorizedError, ForbiddenError } from '../errors/index.js';

/**
 * Middleware requiring an active, authenticated session.
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user || !req.session) {
    throw new UnauthorizedError('Authentication required to access this resource.');
  }
  next();
}

/**
 * Higher-order middleware requiring a specific RBAC permission.
 */
export function requirePermission(permission: Permission): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !req.session) {
      throw new UnauthorizedError('Authentication required to access this resource.');
    }

    if (!can(req.user, permission)) {
      throw new ForbiddenError(`Forbidden: User does not possess '${permission}' permission.`);
    }

    next();
  };
}
