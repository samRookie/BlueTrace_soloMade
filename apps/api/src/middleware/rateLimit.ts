import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { AppError } from '../errors/index.js';

export interface RateLimiterOptions {
  windowMs: number;
  maxRequests: number;
  message?: string;
}

interface ClientRecord {
  count: number;
  resetTime: number;
}

/**
 * In-memory sliding-window rate limiting middleware factory for brute-force protection.
 */
export function createRateLimiter(options: RateLimiterOptions): RequestHandler {
  const clients = new Map<string, ClientRecord>();

  return (req: Request, _res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown-ip';
    const now = Date.now();

    let record = clients.get(ip);
    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + options.windowMs,
      };
      clients.set(ip, record);
      return next();
    }

    record.count += 1;
    if (record.count > options.maxRequests) {
      throw new AppError(
        429,
        'BAD_REQUEST',
        options.message || 'Too many requests. Please slow down and try again later.',
      );
    }

    next();
  };
}

/**
 * Dedicated rate limiter for authentication endpoints (e.g. max 20 login attempts per minute).
 */
export const authRateLimiter: RequestHandler = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 20,
  message: 'Too many authentication attempts. Please try again in 1 minute.',
});
