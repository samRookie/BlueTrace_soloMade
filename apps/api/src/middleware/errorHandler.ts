import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ZodError } from '@sih26019/validation';
import { AppError } from '../errors/index.js';
import { createErrorResponse } from '../utils/response.js';

export interface HttpError extends Error {
  status?: number;
  statusCode?: number;
  code?: string;
}

export const errorHandler: ErrorRequestHandler = (
  err: Error | HttpError | ZodError | AppError,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const requestId = req?.id;

  // 1. Handle Zod validation errors
  if (err instanceof ZodError) {
    res
      .status(400)
      .json(
        createErrorResponse(
          'VALIDATION_ERROR',
          'Request validation failed.',
          err.errors,
          requestId,
        ),
      );
    return;
  }

  // 2. Handle known operational application errors
  if (err instanceof AppError) {
    res
      .status(err.statusCode)
      .json(createErrorResponse(err.code, err.message, err.details, requestId));
    return;
  }

  // 3. Handle generic HTTP errors
  const httpErr = err as HttpError;
  const status = httpErr.status || httpErr.statusCode || 500;

  if (status === 400) {
    res
      .status(400)
      .json(createErrorResponse('BAD_REQUEST', err.message || 'Bad Request', undefined, requestId));
    return;
  }

  if (status === 401) {
    res
      .status(401)
      .json(
        createErrorResponse('UNAUTHORIZED', err.message || 'Unauthorized', undefined, requestId),
      );
    return;
  }

  if (status === 403) {
    res
      .status(403)
      .json(createErrorResponse('FORBIDDEN', err.message || 'Forbidden', undefined, requestId));
    return;
  }

  if (status === 404) {
    res
      .status(404)
      .json(createErrorResponse('NOT_FOUND', err.message || 'Not Found', undefined, requestId));
    return;
  }

  if (status === 409) {
    res
      .status(409)
      .json(createErrorResponse('CONFLICT', err.message || 'Conflict', undefined, requestId));
    return;
  }

  // 4. Generic 500 Internal Server Error (Sanitized, no stack traces or database secrets leaked)
  console.error(`[API Error] [${requestId || 'no-req-id'}]`, err.message);
  res
    .status(500)
    .json(
      createErrorResponse(
        'INTERNAL_ERROR',
        'An internal server error occurred.',
        undefined,
        requestId,
      ),
    );
};
