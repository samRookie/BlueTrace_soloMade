import { Router } from 'express';
import { defaultAuthController } from '../../controllers/authController.js';
import { validateRequest } from '../../middleware/validate.js';
import { loginRequestSchema } from '@sih26019/validation';
import { authRateLimiter } from '../../middleware/rateLimit.js';
import { requireAuth } from '../../middleware/auth.js';

export const authRouter: Router = Router();

/**
 * POST /api/v1/auth/login
 * Public authentication route that issues a secure HttpOnly session cookie.
 */
authRouter.post(
  '/login',
  authRateLimiter,
  validateRequest({ body: loginRequestSchema }),
  defaultAuthController.login,
);

/**
 * POST /api/v1/auth/logout
 * Terminates the active session and clears the session cookie.
 */
authRouter.post('/logout', defaultAuthController.logout);

/**
 * GET /api/v1/auth/me
 * Returns the currently authenticated user profile.
 */
authRouter.get('/me', requireAuth, defaultAuthController.me);
