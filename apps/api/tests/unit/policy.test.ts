import { describe, it, expect } from 'vitest';
import { can, ROLE_PERMISSIONS } from '../../src/security/policy.js';
import type { AuthenticatedUser, Role } from '@sih26019/shared-types';

describe('Security - RBAC Policy Matrix', () => {
  const createMockUser = (
    role: Role,
    status: 'ACTIVE' | 'DISABLED' = 'ACTIVE',
  ): AuthenticatedUser => ({
    id: `mock-${role.toLowerCase()}`,
    email: `${role.toLowerCase()}@example.gov.in`,
    name: `${role} User`,
    role,
    status,
    sampleFlag: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  });

  it('allows ADMIN to access all permissions unconditionally', () => {
    const admin = createMockUser('ADMIN');
    expect(can(admin, 'admin:all')).toBe(true);
    expect(can(admin, 'audit:read')).toBe(true);
    expect(can(admin, 'projects:verify')).toBe(true);
    expect(can(admin, 'disputes:resolve')).toBe(true);
  });

  it('grants specific permissions matching the eight personas policy matrix', () => {
    const verifier = createMockUser('VERIFIER');
    expect(can(verifier, 'projects:verify')).toBe(true);
    expect(can(verifier, 'audit:read')).toBe(true);
    expect(can(verifier, 'disputes:resolve')).toBe(false);

    const mediator = createMockUser('DISPUTE_MEDIATOR');
    expect(can(mediator, 'disputes:resolve')).toBe(true);
    expect(can(mediator, 'projects:verify')).toBe(false);

    const communityLead = createMockUser('COMMUNITY_LEAD');
    expect(can(communityLead, 'disputes:create')).toBe(true);
    expect(can(communityLead, 'disputes:resolve')).toBe(false);

    const viewer = createMockUser('VIEWER');
    expect(can(viewer, 'regions:read')).toBe(true);
    expect(can(viewer, 'projects:create')).toBe(false);
    expect(can(viewer, 'audit:read')).toBe(false);
  });

  it('denies all actions when user status is DISABLED', () => {
    const disabledAdmin = createMockUser('ADMIN', 'DISABLED');
    expect(can(disabledAdmin, 'admin:all')).toBe(false);
    expect(can(disabledAdmin, 'regions:read')).toBe(false);
  });

  it('denies all actions when user is null or undefined', () => {
    expect(can(null, 'regions:read')).toBe(false);
    expect(can(undefined, 'regions:read')).toBe(false);
  });

  it('validates that all eight roles are defined in the role policy matrix', () => {
    const expectedRoles: Role[] = [
      'ADMIN',
      'POLICY_OFFICER',
      'RESEARCHER',
      'ANALYST',
      'VERIFIER',
      'COMMUNITY_LEAD',
      'DISPUTE_MEDIATOR',
      'VIEWER',
    ];

    for (const role of expectedRoles) {
      expect(ROLE_PERMISSIONS[role]).toBeDefined();
      expect(ROLE_PERMISSIONS[role].length).toBeGreaterThan(0);
    }
  });
});
