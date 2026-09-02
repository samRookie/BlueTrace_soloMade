import type { Request, Response, NextFunction } from 'express';
import { DatasetService, defaultDatasetService } from '../services/datasetService.js';
import { createSuccessResponse } from '../utils/response.js';
import type {
  DatasetFilterQuery,
  CreateDatasetRequest,
  UpdateDatasetRequest,
} from '@sih26019/shared-types';
import { BadRequestError } from '../errors/index.js';

export class DatasetController {
  constructor(private readonly datasetService: DatasetService = defaultDatasetService) {}

  /**
   * GET /api/v1/datasets — List datasets with search and faceted filters.
   */
  listDatasets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as unknown as DatasetFilterQuery;
      const result = await this.datasetService.searchDatasets(query, req.user);

      res.status(200).json(
        createSuccessResponse(result.items, {
          requestId: req.id,
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        }),
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/datasets/:id — Retrieve detailed dataset metadata, graph links, and attachments.
   */
  getDatasetById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const detail = await this.datasetService.getDatasetById(id!, req.user);

      res.status(200).json(
        createSuccessResponse(detail, {
          requestId: req.id,
        }),
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/datasets — Register a new dataset entry.
   */
  createDataset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const payload = req.body as CreateDatasetRequest;
      const created = await this.datasetService.createDataset(payload, req.user!, req.id);

      res.status(201).json(
        createSuccessResponse(created, {
          requestId: req.id,
        }),
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/v1/datasets/:id — Update dataset metadata.
   */
  updateDataset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const payload = req.body as UpdateDatasetRequest;
      const updated = await this.datasetService.updateDataset(id!, payload, req.user!, req.id);

      res.status(200).json(
        createSuccessResponse(updated, {
          requestId: req.id,
        }),
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/datasets/:id/attachments — Safely upload and attach a dataset file.
   */
  uploadAttachment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { fileName, mimeType, fileBase64, content } = req.body;

      if (!fileName || typeof fileName !== 'string') {
        throw new BadRequestError('fileName string is required.');
      }
      if (!mimeType || typeof mimeType !== 'string') {
        throw new BadRequestError('mimeType string is required.');
      }

      let buffer: Buffer;
      if (fileBase64 && typeof fileBase64 === 'string') {
        buffer = Buffer.from(fileBase64, 'base64');
      } else if (content && typeof content === 'string') {
        buffer = Buffer.from(content, 'utf8');
      } else {
        throw new BadRequestError('fileBase64 or text content is required for file upload.');
      }

      const attachment = await this.datasetService.uploadAttachment(
        id!,
        fileName,
        mimeType,
        buffer,
        req.user!,
        req.id,
      );

      res.status(201).json(
        createSuccessResponse(attachment, {
          requestId: req.id,
        }),
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/datasets/:id/attachments/:attachmentId/download — Secure download of attached dataset file.
   */
  downloadAttachment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id, attachmentId } = req.params;
      const file = await this.datasetService.downloadAttachment(
        id!,
        attachmentId!,
        req.user,
        req.id,
      );

      res.setHeader('Content-Type', file.mimeType);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(file.fileName)}"`,
      );
      res.setHeader('Content-Length', file.fileSize);
      if (file.checksumSha256) {
        res.setHeader('X-Checksum-Sha256', file.checksumSha256);
      }

      res.status(200).send(file.data);
    } catch (error) {
      next(error);
    }
  };
}

export const defaultDatasetController = new DatasetController();
