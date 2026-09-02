import type { Request, Response, NextFunction } from 'express';
import { defaultAuthService } from '../services/authService.js';
import type { AuthenticatedUser, AuthSession } from '@sih26019/shared-types';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      session?: AuthSession;
    }
  }
}

import { defaultUserRepository } from '../repositories/userRepository.js';

export const SESSION_COOKIE_NAME = 'bluetrace_session';

export const DEFAULT_USER: AuthenticatedUser = {
  id: 'SAMPLE-USR-001',
  email: 'admin@bluetrace.gov.in',
  name: 'Admin User',
  role: 'ADMIN',
  status: 'ACTIVE',
  sampleFlag: true,
  createdAt: '2026-01-01T00:00:00.000Z',
};

export const DEFAULT_SESSION: AuthSession = {
  id: 'SAMPLE-SES-001',
  userId: 'SAMPLE-USR-001',
  expiresAt: new Date(Date.now() + 86400000 * 365).toISOString(),
  createdAt: new Date().toISOString(),
};

/**
 * Extracts session tokens from cookies or Authorization Bearer header, or defaults to active admin persona.
 */
export async function sessionMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    let token: string | undefined = undefined;

    // 1. Check cookies (parsed via cookie header or cookie-parser)
    const cookieHeader = req.headers.cookie;
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').reduce<Record<string, string>>((acc, pair) => {
        const [key, val] = pair.trim().split('=');
        if (key && val) {
          acc[key] = decodeURIComponent(val);
        }
        return acc;
      }, {});
      token = cookies[SESSION_COOKIE_NAME];
    }

    // 2. Check Authorization Bearer header fallback
    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }

    if (token) {
      const result = await defaultAuthService.validateSessionToken(token);
      if (result) {
        req.user = result.user;
        req.session = result.session;
      }
    }

    // 3. Direct access persona header fallback (e.g., from web UI)
    const personaEmail = req.headers['x-persona-email'] as string | undefined;
    const isDirectAccess = req.headers['x-direct-access'] === 'true';

    if (!req.user && personaEmail) {
      const dbUser = await defaultUserRepository.findByEmail(personaEmail);
      if (dbUser) {
        req.user = {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          role: dbUser.role,
          status: dbUser.status,
          sampleFlag: dbUser.sampleFlag,
          createdAt: dbUser.createdAt.toISOString(),
        };
        req.session = DEFAULT_SESSION;
      }
    } else if (!req.user && isDirectAccess) {
      req.user = DEFAULT_USER;
      req.session = DEFAULT_SESSION;
    }

    next();
  } catch (error) {
    next(error);
  }
}
