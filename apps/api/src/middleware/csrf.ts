import type { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../errors/index.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Cross-Site Request Forgery (CSRF) mitigation middleware for state-changing endpoints.
 */
export function csrfProtection(req: Request, _res: Response, next: NextFunction): void {
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  // Exempt public authentication login/logout endpoints from strict origin checks if headers are standard
  if (req.path === '/api/v1/auth/login' || req.path === '/api/v1/auth/logout') {
    return next();
  }

  const origin = req.headers.origin;
  const referer = req.headers.referer;
  const customHeader = req.headers['x-requested-with'] || req.headers['x-csrf-token'];

  // If a custom AJAX/API header is present, standard browser cross-origin form POSTs cannot forge it
  if (customHeader) {
    return next();
  }

  // Validate origin domain if provided
  if (origin) {
    const isAllowed =
      origin.includes('localhost') ||
      origin.includes('127.0.0.1') ||
      (req.headers.host && origin.includes(req.headers.host));

    if (!isAllowed) {
      throw new ForbiddenError('CSRF protection: Invalid request origin.');
    }
  } else if (referer) {
    const isAllowed =
      referer.includes('localhost') ||
      referer.includes('127.0.0.1') ||
      (req.headers.host && referer.includes(req.headers.host));

    if (!isAllowed) {
      throw new ForbiddenError('CSRF protection: Invalid request referer.');
    }
  }

  next();
}
