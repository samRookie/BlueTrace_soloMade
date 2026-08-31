import type { AuthenticatedUser } from '@sih26019/shared-types';
import { ForbiddenError, NotFoundError } from '../errors/index.js';

/**
 * Checks if the user is the owner of a resource or has administrator privileges.
 */
export function isResourceOwner(user: AuthenticatedUser, ownerId: string): boolean {
  if (user.role === 'ADMIN') {
    return true;
  }
  return user.id === ownerId;
}

/**
 * Checks if the user is assigned to a workflow entity or has administrator privileges.
 */
export function isAssignedTo(
  user: AuthenticatedUser,
  assignedUserId: string | null | undefined,
): boolean {
  if (user.role === 'ADMIN') {
    return true;
  }
  return !!assignedUserId && user.id === assignedUserId;
}

/**
 * Asserts that the authenticated user owns the resource, throwing ForbiddenError if unauthorized.
 */
export function assertOwnership(
  user: AuthenticatedUser,
  ownerId: string,
  resourceName = 'Resource',
): void {
  if (!isResourceOwner(user, ownerId)) {
    throw new ForbiddenError(
      `You do not have permission to access or modify this ${resourceName}.`,
    );
  }
}

/**
 * Asserts that the authenticated user is assigned to the resource, throwing ForbiddenError if unauthorized.
 */
export function assertAssignment(
  user: AuthenticatedUser,
  assignedUserId: string | null | undefined,
  resourceName = 'Resource',
): void {
  if (!isAssignedTo(user, assignedUserId)) {
    throw new ForbiddenError(`You are not assigned to perform actions on this ${resourceName}.`);
  }
}

/**
 * Helper to prevent information leakage on private/restricted resources (returns 404 instead of 403 when required).
 */
export function assertResourceAccess(
  allowed: boolean,
  resourceName = 'Resource',
  maskExistence = false,
): void {
  if (!allowed) {
    if (maskExistence) {
      throw new NotFoundError(`${resourceName} was not found.`);
    }
    throw new ForbiddenError(`Access to this ${resourceName} is forbidden.`);
  }
}
