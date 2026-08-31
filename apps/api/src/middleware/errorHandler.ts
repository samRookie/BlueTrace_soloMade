import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ZodError } from '@sih26019/validation';
import { createErrorResponse } from '../utils/response.js';

export interface HttpError extends Error {
  status?: number;
  statusCode?: number;
  code?: string;
}

export const errorHandler: ErrorRequestHandler = (
  err: Error | HttpError | ZodError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // Handle Zod validation errors
  if (err instanceof ZodError) {
    res
      .status(400)
      .json(createErrorResponse('VALIDATION_ERROR', 'Request validation failed.', err.errors));
    return;
  }

  const httpErr = err as HttpError;
  const status = httpErr.status || httpErr.statusCode || 500;

  if (status === 400) {
    res.status(400).json(createErrorResponse('BAD_REQUEST', err.message || 'Bad Request'));
    return;
  }

  if (status === 401) {
    res.status(401).json(createErrorResponse('UNAUTHORIZED', err.message || 'Unauthorized'));
    return;
  }

  if (status === 403) {
    res.status(403).json(createErrorResponse('FORBIDDEN', err.message || 'Forbidden'));
    return;
  }

  if (status === 404) {
    res.status(404).json(createErrorResponse('NOT_FOUND', err.message || 'Not Found'));
    return;
  }

  if (status === 409) {
    res.status(409).json(createErrorResponse('CONFLICT', err.message || 'Conflict'));
    return;
  }

  // Generic 500 Internal Server Error (Sanitized, no stack trace or secrets leaked)
  console.error('[API Error Handler]', err.message);
  res.status(500).json(createErrorResponse('INTERNAL_ERROR', 'An internal server error occurred.'));
};
