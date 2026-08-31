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

export const SESSION_COOKIE_NAME = 'bluetrace_session';

/**
 * Extracts session tokens from cookies or Authorization Bearer header and attaches user context.
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

    next();
  } catch (error) {
    next(error);
  }
}
