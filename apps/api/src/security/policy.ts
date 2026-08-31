import type { Role, Permission, AuthenticatedUser } from '@sih26019/shared-types';

/**
 * Institutional Role-to-Permission mapping matrix for the eight platform personas.
 */
export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  ADMIN: [
    'auth:login',
    'auth:logout',
    'auth:me',
    'regions:read',
    'resources:read',
    'workspaces:read',
    'workspaces:create',
    'projects:read',
    'projects:create',
    'projects:update',
    'projects:verify',
    'disputes:read',
    'disputes:create',
    'disputes:resolve',
    'audit:read',
    'admin:all',
  ],
  POLICY_OFFICER: [
    'auth:login',
    'auth:logout',
    'auth:me',
    'regions:read',
    'resources:read',
    'workspaces:read',
    'workspaces:create',
    'projects:read',
    'projects:create',
    'projects:update',
    'disputes:read',
    'audit:read',
  ],
  RESEARCHER: [
    'auth:login',
    'auth:logout',
    'auth:me',
    'regions:read',
    'resources:read',
    'workspaces:read',
    'workspaces:create',
    'projects:read',
    'projects:create',
    'projects:update',
  ],
  ANALYST: [
    'auth:login',
    'auth:logout',
    'auth:me',
    'regions:read',
    'resources:read',
    'workspaces:read',
    'projects:read',
  ],
  VERIFIER: [
    'auth:login',
    'auth:logout',
    'auth:me',
    'regions:read',
    'resources:read',
    'projects:read',
    'projects:verify',
    'audit:read',
  ],
  COMMUNITY_LEAD: [
    'auth:login',
    'auth:logout',
    'auth:me',
    'regions:read',
    'resources:read',
    'workspaces:read',
    'projects:read',
    'disputes:read',
    'disputes:create',
  ],
  DISPUTE_MEDIATOR: [
    'auth:login',
    'auth:logout',
    'auth:me',
    'regions:read',
    'resources:read',
    'projects:read',
    'disputes:read',
    'disputes:resolve',
    'audit:read',
  ],
  VIEWER: [
    'auth:login',
    'auth:logout',
    'auth:me',
    'regions:read',
    'resources:read',
    'projects:read',
  ],
};

/**
 * Canonical server-side authorization check evaluating if a user possesses a specific permission.
 */
export function can(user: AuthenticatedUser | null | undefined, permission: Permission): boolean {
  if (!user || user.status !== 'ACTIVE') {
    return false;
  }

  if (user.role === 'ADMIN') {
    return true;
  }

  const permissions = ROLE_PERMISSIONS[user.role];
  if (!permissions) {
    return false;
  }

  return permissions.includes(permission);
}
