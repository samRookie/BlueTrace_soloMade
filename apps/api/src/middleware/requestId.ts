import { randomUUID } from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      id: string;
    }
  }
}

const SAFE_REQUEST_ID_REGEX = /^[a-zA-Z0-9_-]{1,64}$/;

/**
 * Middleware that assigns or preserves a unique Request ID across the HTTP execution context.
 */
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const incomingId = req.headers['x-request-id'];

  const requestId =
    typeof incomingId === 'string' && SAFE_REQUEST_ID_REGEX.test(incomingId)
      ? incomingId
      : randomUUID();

  req.id = requestId;
  res.setHeader('x-request-id', requestId);

  next();
}
