import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { defaultUserRepository } from '../../src/repositories/userRepository.js';
import { defaultSessionRepository } from '../../src/repositories/sessionRepository.js';
import { defaultAuditRepository } from '../../src/repositories/auditRepository.js';
import { hashPassword } from '../../src/utils/crypto.js';
import type { UserRow, AuditEventRow } from '@sih26019/db';

describe('API Integration - Audit Logging Pipeline', () => {
  const app = createApp();

  let testPasswordHash: string;
  let mockActiveUser: UserRow;

  beforeEach(async () => {
    vi.restoreAllMocks();
    testPasswordHash = await hashPassword('ValidPassword123!');

    mockActiveUser = {
      id: 'USR-AUDIT-001',
      email: 'officer@bluetrace.gov.in',
      passwordHash: testPasswordHash,
      name: 'Dr. Priya Sharma',
      role: 'POLICY_OFFICER',
      status: 'ACTIVE',
      sampleFlag: true,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };
  });

  it('records structured audit entry with correlation requestId on successful login', async () => {
    vi.spyOn(defaultUserRepository, 'findByEmail').mockResolvedValue(mockActiveUser);
    vi.spyOn(defaultSessionRepository, 'create').mockResolvedValue({
      id: 'SES-001',
      userId: mockActiveUser.id,
      sessionTokenHash: 'hash',
      expiresAt: new Date(Date.now() + 100000),
      revokedAt: null,
      ipAddress: '127.0.0.1',
      userAgent: 'test',
      createdAt: new Date(),
    });

    const auditSpy = vi.spyOn(defaultAuditRepository, 'create').mockImplementation(async (data) => {
      return {
        ...data,
        createdAt: new Date(),
      } as AuditEventRow;
    });

    const response = await request(app)
      .post('/api/v1/auth/login')
      .set('x-request-id', 'test-req-corr-123')
      .send({
        email: 'officer@bluetrace.gov.in',
        password: 'ValidPassword123!',
      });

    expect(response.status).toBe(200);
    expect(auditSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: mockActiveUser.id,
        actorRole: 'POLICY_OFFICER',
        action: 'AUTH_LOGIN_SUCCESS',
        requestId: 'test-req-corr-123',
        status: 'SUCCESS',
      }),
    );
  });

  it('records audit entry with FAILURE status on bad credentials', async () => {
    vi.spyOn(defaultUserRepository, 'findByEmail').mockResolvedValue(mockActiveUser);

    const auditSpy = vi.spyOn(defaultAuditRepository, 'create').mockImplementation(async (data) => {
      return {
        ...data,
        createdAt: new Date(),
      } as AuditEventRow;
    });

    const response = await request(app)
      .post('/api/v1/auth/login')
      .set('x-request-id', 'test-req-fail-456')
      .send({
        email: 'officer@bluetrace.gov.in',
        password: 'IncorrectPassword',
      });

    expect(response.status).toBe(401);
    expect(auditSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: mockActiveUser.id,
        actorRole: 'POLICY_OFFICER',
        action: 'AUTH_LOGIN_FAILURE',
        requestId: 'test-req-fail-456',
        status: 'FAILURE',
      }),
    );
  });
});
