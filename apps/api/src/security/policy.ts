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
    'evidence:read',
    'evidence:create',
    'evidence:update',
    'evidence:link',
    'evidence:upload',
    'evidence:download',
    'dataset:read',
    'dataset:create',
    'dataset:update',
    'dataset:download',
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
    'evidence:read',
    'evidence:create',
    'evidence:update',
    'evidence:link',
    'evidence:upload',
    'evidence:download',
    'dataset:read',
    'dataset:create',
    'dataset:update',
    'dataset:download',
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
    'evidence:read',
    'evidence:create',
    'evidence:update',
    'evidence:link',
    'evidence:upload',
    'evidence:download',
    'dataset:read',
    'dataset:create',
    'dataset:update',
    'dataset:download',
  ],
  ANALYST: [
    'auth:login',
    'auth:logout',
    'auth:me',
    'regions:read',
    'resources:read',
    'workspaces:read',
    'projects:read',
    'evidence:read',
    'evidence:create',
    'evidence:update',
    'evidence:link',
    'evidence:upload',
    'evidence:download',
    'dataset:read',
    'dataset:create',
    'dataset:update',
    'dataset:download',
  ],
  VERIFIER: [
    'auth:login',
    'auth:logout',
    'auth:me',
    'regions:read',
    'resources:read',
    'projects:read',
    'projects:verify',
    'evidence:read',
    'evidence:download',
    'dataset:read',
    'dataset:download',
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
    'evidence:read',
    'evidence:download',
    'dataset:read',
    'dataset:download',
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
    'evidence:read',
    'evidence:download',
    'dataset:read',
    'dataset:download',
    'audit:read',
  ],
  VIEWER: [
    'auth:login',
    'auth:logout',
    'auth:me',
    'regions:read',
    'resources:read',
    'projects:read',
    'evidence:read',
    'evidence:download',
    'dataset:read',
    'dataset:download',
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
