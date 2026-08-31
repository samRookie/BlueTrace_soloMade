import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { defaultSessionRepository } from '../../src/repositories/sessionRepository.js';
import { defaultAuditRepository } from '../../src/repositories/auditRepository.js';
import type { UserRow } from '@sih26019/db';
import type { Role } from '@sih26019/shared-types';

describe('API Integration - RBAC Route Enforcement', () => {
  const app = createApp();

  function mockUserSession(role: Role): UserRow {
    const user: UserRow = {
      id: `USR-${role}`,
      email: `${role.toLowerCase()}@bluetrace.gov.in`,
      passwordHash: 'dummy',
      name: `${role} User`,
      role,
      status: 'ACTIVE',
      sampleFlag: true,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };

    vi.spyOn(defaultSessionRepository, 'findByTokenHash').mockResolvedValue({
      id: `SES-${role}`,
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

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/v1/audit/events (Protected with audit:read)', () => {
    it('allows ADMIN to access audit events', async () => {
      mockUserSession('ADMIN');
      vi.spyOn(defaultAuditRepository, 'findMany').mockResolvedValue({
        items: [],
        total: 0,
      });

      const response = await request(app)
        .get('/api/v1/audit/events')
        .set('Cookie', ['bluetrace_session=mock-token']);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('allows VERIFIER to access audit events', async () => {
      mockUserSession('VERIFIER');
      vi.spyOn(defaultAuditRepository, 'findMany').mockResolvedValue({
        items: [],
        total: 0,
      });

      const response = await request(app)
        .get('/api/v1/audit/events')
        .set('Cookie', ['bluetrace_session=mock-token']);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('denies VIEWER with 403 FORBIDDEN', async () => {
      mockUserSession('VIEWER');

      const response = await request(app)
        .get('/api/v1/audit/events')
        .set('Cookie', ['bluetrace_session=mock-token']);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    it('denies RESEARCHER with 403 FORBIDDEN', async () => {
      mockUserSession('RESEARCHER');

      const response = await request(app)
        .get('/api/v1/audit/events')
        .set('Cookie', ['bluetrace_session=mock-token']);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    it('returns 401 UNAUTHORIZED for unauthenticated anonymous request', async () => {
      const response = await request(app).get('/api/v1/audit/events');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
  });
});
