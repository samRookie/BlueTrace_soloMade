import type { Request, Response, NextFunction } from 'express';
import { defaultWorkspaceService, type WorkspaceService } from '../services/workspaceService.js';
import { createSuccessResponse } from '../utils/response.js';
import { UnauthorizedError } from '../errors/index.js';

export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService = defaultWorkspaceService) {}

  listWorkspaces = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required.');
      }

      const page = Number(req.query.page) || 1;
      const pageSize = Number(req.query.pageSize) || 20;

      const result = await this.workspaceService.listUserWorkspaces(req.user, { page, pageSize });

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

  getWorkspaceById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required.');
      }

      const { id } = req.params;
      const workspace = await this.workspaceService.getWorkspaceById(id as string, req.user);

      res.status(200).json(
        createSuccessResponse(workspace, {
          requestId: req.id,
        }),
      );
    } catch (error) {
      next(error);
    }
  };
}

export const defaultWorkspaceController = new WorkspaceController();
