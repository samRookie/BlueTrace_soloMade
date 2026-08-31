import type { Request, Response, NextFunction } from 'express';
import { defaultAuthService, type AuthService } from '../services/authService.js';
import { createSuccessResponse } from '../utils/response.js';
import { SESSION_COOKIE_NAME } from '../middleware/session.js';
import { UnauthorizedError } from '../errors/index.js';

export class AuthController {
  constructor(private readonly authService: AuthService = defaultAuthService) {}

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const result = await this.authService.login(
        { email, password },
        ipAddress,
        userAgent,
        req.id,
      );

      // Set secure HTTP-only session cookie
      res.cookie(SESSION_COOKIE_NAME, result.sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: result.expiresAt,
        path: '/',
      });

      res.status(200).json(
        createSuccessResponse(
          {
            user: result.user,
            session: {
              id: result.sessionId,
              expiresAt: result.expiresAt.toISOString(),
            },
          },
          { requestId: req.id },
        ),
      );
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ipAddress = req.ip || req.socket.remoteAddress;

      if (req.session) {
        await this.authService.logout(
          req.session.id,
          req.user?.id,
          req.user?.role,
          req.id,
          ipAddress,
        );
      }

      // Clear HTTP-only session cookie
      res.clearCookie(SESSION_COOKIE_NAME, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });

      res.status(200).json(
        createSuccessResponse(
          {
            loggedOut: true,
          },
          { requestId: req.id },
        ),
      );
    } catch (error) {
      next(error);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required.');
      }

      res.status(200).json(
        createSuccessResponse(
          {
            user: req.user,
          },
          { requestId: req.id },
        ),
      );
    } catch (error) {
      next(error);
    }
  };
}

export const defaultAuthController = new AuthController();
