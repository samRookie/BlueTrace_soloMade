import type { Request, Response, NextFunction, RequestHandler } from 'express';
import type { z } from '@sih26019/validation';

export interface RequestValidationSchemas {
  query?: z.ZodTypeAny;
  params?: z.ZodTypeAny;
  body?: z.ZodTypeAny;
}

/**
 * Higher-order middleware factory for declarative Zod validation of query, params, and body.
 */
export function validateRequest(schemas: RequestValidationSchemas): RequestHandler {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schemas.params) {
        req.params = (await schemas.params.parseAsync(req.params)) as Request['params'];
      }
      if (schemas.query) {
        req.query = (await schemas.query.parseAsync(req.query)) as Request['query'];
      }
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}
