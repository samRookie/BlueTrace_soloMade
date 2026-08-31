import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { defaultUserRepository } from '../../src/repositories/userRepository.js';
import { defaultSessionRepository } from '../../src/repositories/sessionRepository.js';
import { defaultAuditRepository } from '../../src/repositories/auditRepository.js';
import { hashPassword } from '../../src/utils/crypto.js';
import type { UserRow, AuditEventRow } from '@sih26019/db';

describe('API Integration - Authentication & Session Lifecycle', () => {
  const app = createApp();

  let testPasswordHash: string;
  let mockActiveUser: UserRow;
  let mockDisabledUser: UserRow;

  beforeEach(async () => {
    vi.restoreAllMocks();
    testPasswordHash = await hashPassword('ValidPassword123!');

    // Mock audit repository by default to prevent unseeded DB dependency in tests
    vi.spyOn(defaultAuditRepository, 'create').mockImplementation(async (data) => {
      return {
        ...data,
        createdAt: new Date(),
      } as AuditEventRow;
    });

    mockActiveUser = {
      id: 'USR-TEST-001',
      email: 'active.researcher@bluetrace.gov.in',
      passwordHash: testPasswordHash,
      name: 'Dr. Anand Rao',
      role: 'RESEARCHER',
      status: 'ACTIVE',
      sampleFlag: true,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };

    mockDisabledUser = {
      id: 'USR-TEST-002',
      email: 'disabled.user@bluetrace.gov.in',
      passwordHash: testPasswordHash,
      name: 'Disabled User',
      role: 'VIEWER',
      status: 'DISABLED',
      sampleFlag: true,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };
  });

  describe('POST /api/v1/auth/login', () => {
    it('authenticates valid credentials, returns user DTO and sets HttpOnly session cookie', async () => {
      vi.spyOn(defaultUserRepository, 'findByEmail').mockResolvedValue(mockActiveUser);
      vi.spyOn(defaultSessionRepository, 'create').mockResolvedValue({
        id: 'SES-TEST-001',
        userId: mockActiveUser.id,
        sessionTokenHash: 'mock-token-hash',
        expiresAt: new Date(Date.now() + 86400000),
        revokedAt: null,
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent',
        createdAt: new Date(),
      });

      const response = await request(app).post('/api/v1/auth/login').send({
        email: 'active.researcher@bluetrace.gov.in',
        password: 'ValidPassword123!',
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('active.researcher@bluetrace.gov.in');
      expect(response.body.data.user.role).toBe('RESEARCHER');
      expect(response.body.data.user).not.toHaveProperty('passwordHash');

      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toContain('bluetrace_session=');
      expect(cookies[0]).toContain('HttpOnly');
    });

    it('rejects incorrect password with generic 401 UNAUTHORIZED message', async () => {
      vi.spyOn(defaultUserRepository, 'findByEmail').mockResolvedValue(mockActiveUser);

      const response = await request(app).post('/api/v1/auth/login').send({
        email: 'active.researcher@bluetrace.gov.in',
        password: 'WrongPassword!',
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
      expect(response.body.error.message).toBe('Invalid email or password.');
    });

    it('rejects unknown user with identical generic 401 UNAUTHORIZED message to prevent user enumeration', async () => {
      vi.spyOn(defaultUserRepository, 'findByEmail').mockResolvedValue(null);

      const response = await request(app).post('/api/v1/auth/login').send({
        email: 'nonexistent.user@bluetrace.gov.in',
        password: 'SomePassword123!',
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
      expect(response.body.error.message).toBe('Invalid email or password.');
    });

    it('rejects disabled accounts with 403 FORBIDDEN', async () => {
      vi.spyOn(defaultUserRepository, 'findByEmail').mockResolvedValue(mockDisabledUser);

      const response = await request(app).post('/api/v1/auth/login').send({
        email: 'disabled.user@bluetrace.gov.in',
        password: 'ValidPassword123!',
      });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
      expect(response.body.error.message).toContain('Account is disabled');
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('returns current user profile when valid session exists', async () => {
      vi.spyOn(defaultSessionRepository, 'findByTokenHash').mockResolvedValue({
        id: 'SES-001',
        userId: mockActiveUser.id,
        sessionTokenHash: 'mock-hash',
        expiresAt: new Date(Date.now() + 100000),
        revokedAt: null,
        ipAddress: '127.0.0.1',
        userAgent: 'test',
        createdAt: new Date(),
        user: mockActiveUser,
      });

      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Cookie', ['bluetrace_session=valid-session-token-123']);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.id).toBe(mockActiveUser.id);
      expect(response.body.data.user.role).toBe('RESEARCHER');
    });

    it('returns 401 UNAUTHORIZED when no session cookie is provided', async () => {
      const response = await request(app).get('/api/v1/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('revokes session and clears session cookie', async () => {
      const revokeSpy = vi.spyOn(defaultSessionRepository, 'revoke').mockResolvedValue();

      vi.spyOn(defaultSessionRepository, 'findByTokenHash').mockResolvedValue({
        id: 'SES-001',
        userId: mockActiveUser.id,
        sessionTokenHash: 'mock-hash',
        expiresAt: new Date(Date.now() + 100000),
        revokedAt: null,
        ipAddress: '127.0.0.1',
        userAgent: 'test',
        createdAt: new Date(),
        user: mockActiveUser,
      });

      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Cookie', ['bluetrace_session=valid-session-token-123']);

      expect(response.status).toBe(200);
      expect(response.body.data.loggedOut).toBe(true);
      expect(revokeSpy).toHaveBeenCalledWith('SES-001');

      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toContain('bluetrace_session=;');
    });
  });
});
