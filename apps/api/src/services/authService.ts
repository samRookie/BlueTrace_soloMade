import { UserRepository, defaultUserRepository } from '../repositories/userRepository.js';
import { SessionRepository, defaultSessionRepository } from '../repositories/sessionRepository.js';
import { AuditService, defaultAuditService } from './auditService.js';
import {
  verifyPassword,
  generateSessionToken,
  hashSessionToken,
  generateSecureId,
} from '../utils/crypto.js';
import { UnauthorizedError, ForbiddenError, NotFoundError } from '../errors/index.js';
import type {
  AuthenticatedUser,
  AuthSession,
  LoginRequest,
  Role,
  UserStatus,
} from '@sih26019/shared-types';
import type { UserRow } from '@sih26019/db';

export interface LoginResult {
  user: AuthenticatedUser;
  sessionToken: string;
  sessionId: string;
  expiresAt: Date;
}

export function mapUserToDto(user: UserRow): AuthenticatedUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as Role,
    status: user.status as UserStatus,
    sampleFlag: user.sampleFlag,
    createdAt: user.createdAt.toISOString(),
  };
}

export class AuthService {
  constructor(
    private readonly userRepository: UserRepository = defaultUserRepository,
    private readonly sessionRepository: SessionRepository = defaultSessionRepository,
    private readonly auditService: AuditService = defaultAuditService,
  ) {}

  /**
   * Authenticates a user with email and password, establishing a new secure session.
   */
  async login(
    credentials: LoginRequest,
    ipAddress?: string,
    userAgent?: string,
    requestId?: string,
  ): Promise<LoginResult> {
    const normalizedEmail = credentials.email.trim().toLowerCase();
    const user = await this.userRepository.findByEmail(normalizedEmail);

    if (!user) {
      await this.auditService.logEvent({
        action: 'AUTH_LOGIN_FAILURE',
        targetType: 'user',
        status: 'FAILURE',
        requestId,
        ipAddress,
        details: { email: normalizedEmail, reason: 'user_not_found' },
      });
      throw new UnauthorizedError('Invalid email or password.');
    }

    if (user.status === 'DISABLED') {
      await this.auditService.logEvent({
        actorId: user.id,
        actorRole: user.role as Role,
        action: 'AUTH_LOGIN_FAILURE',
        targetType: 'user',
        targetId: user.id,
        status: 'DENIED',
        requestId,
        ipAddress,
        details: { reason: 'account_disabled' },
      });
      throw new ForbiddenError('Account is disabled. Please contact an administrator.');
    }

    const isValidPassword = await verifyPassword(credentials.password, user.passwordHash);
    if (!isValidPassword) {
      await this.auditService.logEvent({
        actorId: user.id,
        actorRole: user.role as Role,
        action: 'AUTH_LOGIN_FAILURE',
        targetType: 'user',
        targetId: user.id,
        status: 'FAILURE',
        requestId,
        ipAddress,
        details: { reason: 'invalid_password' },
      });
      throw new UnauthorizedError('Invalid email or password.');
    }

    const sessionToken = generateSessionToken();
    const sessionTokenHash = hashSessionToken(sessionToken);
    const sessionId = generateSecureId('SES');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await this.sessionRepository.create({
      id: sessionId,
      userId: user.id,
      sessionTokenHash,
      expiresAt,
      ipAddress: ipAddress ?? null,
      userAgent: userAgent ?? null,
      createdAt: new Date(),
    });

    await this.auditService.logEvent({
      actorId: user.id,
      actorRole: user.role as Role,
      action: 'AUTH_LOGIN_SUCCESS',
      targetType: 'user',
      targetId: user.id,
      status: 'SUCCESS',
      requestId,
      ipAddress,
    });

    return {
      user: mapUserToDto(user),
      sessionToken,
      sessionId,
      expiresAt,
    };
  }

  /**
   * Invalidates the active session and logs the logout event.
   */
  async logout(
    sessionId: string,
    actorId?: string,
    actorRole?: Role,
    requestId?: string,
    ipAddress?: string,
  ): Promise<void> {
    await this.sessionRepository.revoke(sessionId);
    await this.auditService.logEvent({
      actorId: actorId ?? null,
      actorRole: actorRole ?? null,
      action: 'AUTH_LOGOUT',
      targetType: 'session',
      targetId: sessionId,
      status: 'SUCCESS',
      requestId,
      ipAddress,
    });
  }

  /**
   * Validates a session token string against the persistence layer.
   */
  async validateSessionToken(
    token: string,
  ): Promise<{ user: AuthenticatedUser; session: AuthSession } | null> {
    const tokenHash = hashSessionToken(token);
    const sessionWithUser = await this.sessionRepository.findByTokenHash(tokenHash);

    if (!sessionWithUser || sessionWithUser.user.status !== 'ACTIVE') {
      return null;
    }

    return {
      user: mapUserToDto(sessionWithUser.user),
      session: {
        id: sessionWithUser.id,
        userId: sessionWithUser.userId,
        expiresAt: sessionWithUser.expiresAt.toISOString(),
        createdAt: sessionWithUser.createdAt.toISOString(),
      },
    };
  }

  /**
   * Retrieves current user profile by user ID.
   */
  async getCurrentUser(userId: string): Promise<AuthenticatedUser> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found.');
    }
    return mapUserToDto(user);
  }
}

export const defaultAuthService = new AuthService();
