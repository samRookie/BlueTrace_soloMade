import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { defaultSessionRepository } from '../../src/repositories/sessionRepository.js';
import { defaultWorkspaceRepository } from '../../src/repositories/workspaceRepository.js';
import type { UserRow, WorkspaceRow } from '@sih26019/db';
import type { Role } from '@sih26019/shared-types';

describe('API Integration - IDOR & Resource Authorization', () => {
  const app = createApp();

  function mockUserSession(id: string, role: Role): UserRow {
    const user: UserRow = {
      id,
      email: `${id.toLowerCase()}@bluetrace.gov.in`,
      passwordHash: 'dummy',
      name: `User ${id}`,
      role,
      status: 'ACTIVE',
      sampleFlag: true,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };

    vi.spyOn(defaultSessionRepository, 'findByTokenHash').mockResolvedValue({
      id: `SES-${id}`,
      userId: user.id,
      sessionTokenHash: 'mock-hash',
      expiresAt: new Date(Date.now() + 100000),
      revokedAt: null,
      ipAddress: '127.0.0.1',
      userAgent: 'test',
      createdAt: new Date(),
      user,
    });

    return user;
  }

  const samplePrivateWorkspace: WorkspaceRow = {
    id: 'WS-PRIVATE-001',
    name: 'Private Research Workspace',
    description: 'Restricted',
    visibility: 'INTERNAL',
    ownerId: 'USR-OWNER',
    ownerType: 'INSTITUTION',
    sampleFlag: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/v1/workspaces/:id (IDOR Protection)', () => {
    it('allows owner to access their private workspace', async () => {
      mockUserSession('USR-OWNER', 'RESEARCHER');
      vi.spyOn(defaultWorkspaceRepository, 'findById').mockResolvedValue(samplePrivateWorkspace);

      const response = await request(app)
        .get('/api/v1/workspaces/WS-PRIVATE-001')
        .set('Cookie', ['bluetrace_session=mock-token']);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe('WS-PRIVATE-001');
    });

    it('allows global ADMIN to access any private workspace', async () => {
      mockUserSession('USR-ADMIN', 'ADMIN');
      vi.spyOn(defaultWorkspaceRepository, 'findById').mockResolvedValue(samplePrivateWorkspace);

      const response = await request(app)
        .get('/api/v1/workspaces/WS-PRIVATE-001')
        .set('Cookie', ['bluetrace_session=mock-token']);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe('WS-PRIVATE-001');
    });

    it('allows confirmed workspace member to access private workspace', async () => {
      mockUserSession('USR-MEMBER', 'RESEARCHER');
      vi.spyOn(defaultWorkspaceRepository, 'findById').mockResolvedValue(samplePrivateWorkspace);
      vi.spyOn(defaultWorkspaceRepository, 'isMember').mockResolvedValue(true);

      const response = await request(app)
        .get('/api/v1/workspaces/WS-PRIVATE-001')
        .set('Cookie', ['bluetrace_session=mock-token']);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe('WS-PRIVATE-001');
    });

    it('blocks non-member non-owner user with 404 to mask existence (IDOR mitigation)', async () => {
      mockUserSession('USR-OUTSIDER', 'RESEARCHER');
      vi.spyOn(defaultWorkspaceRepository, 'findById').mockResolvedValue(samplePrivateWorkspace);
      vi.spyOn(defaultWorkspaceRepository, 'isMember').mockResolvedValue(false);

      const response = await request(app)
        .get('/api/v1/workspaces/WS-PRIVATE-001')
        .set('Cookie', ['bluetrace_session=mock-token']);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });
});
