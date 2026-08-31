import type { Request, Response, NextFunction } from 'express';
import { defaultAuditService, type AuditService } from '../services/auditService.js';
import { createSuccessResponse } from '../utils/response.js';
import type { AuditStatus } from '@sih26019/shared-types';

export class AuditController {
  constructor(private readonly auditService: AuditService = defaultAuditService) {}

  listEvents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Number(req.query.page) || 1;
      const pageSize = Number(req.query.pageSize) || 20;
      const actorId = typeof req.query.actorId === 'string' ? req.query.actorId : undefined;
      const action = typeof req.query.action === 'string' ? req.query.action : undefined;
      const status = req.query.status as AuditStatus | undefined;

      const result = await this.auditService.listEvents(
        { actorId, action, status },
        { page, pageSize },
      );

      res.status(200).json(
        createSuccessResponse(result, {
          requestId: req.id,
          page,
          limit: pageSize,
          total: result.pagination.total,
        }),
      );
    } catch (error) {
      next(error);
    }
  };
}

export const defaultAuditController = new AuditController();
