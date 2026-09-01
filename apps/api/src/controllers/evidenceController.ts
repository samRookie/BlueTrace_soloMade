import type { Request, Response, NextFunction } from 'express';
import { EvidenceService, defaultEvidenceService } from '../services/evidenceService.js';
import { createSuccessResponse } from '../utils/response.js';
import { BadRequestError } from '../errors/index.js';
import type {
  EvidenceFilterQuery,
  CreateEvidenceRequest,
  CreateRelationshipRequest,
} from '@sih26019/shared-types';

export class EvidenceController {
  constructor(private readonly evidenceService: EvidenceService = defaultEvidenceService) {}

  /**
   * GET /api/v1/evidence
   */
  listEvidence = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as unknown as EvidenceFilterQuery;
      const result = await this.evidenceService.listEvidence(query, req.user);

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
   * GET /api/v1/evidence/:id
   */
  getEvidenceById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const item = await this.evidenceService.getEvidenceById(id, req.user);

      res.status(200).json(createSuccessResponse(item, { requestId: req.id }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/evidence
   */
  createEvidence = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const payload = req.body as CreateEvidenceRequest;
      const created = await this.evidenceService.createEvidence(payload, req.user!, req.id);

      res.status(201).json(createSuccessResponse(created, { requestId: req.id }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/evidence/:id/relationships
   */
  createRelationship = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const payload = req.body as CreateRelationshipRequest;

      await this.evidenceService.createRelationship(id, payload, req.user!, req.id);

      res
        .status(201)
        .json(
          createSuccessResponse(
            { message: 'Evidence relationship created successfully.' },
            { requestId: req.id },
          ),
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/evidence/:id/attachments
   */
  uploadAttachment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const evidenceId = req.params.id as string;
      const { fileName, mimeType, fileBase64, content } = req.body;

      if (!fileName || !mimeType) {
        throw new BadRequestError('fileName and mimeType are required.');
      }

      let buffer: Buffer;
      if (fileBase64 && typeof fileBase64 === 'string') {
        buffer = Buffer.from(fileBase64, 'base64');
      } else if (content && typeof content === 'string') {
        buffer = Buffer.from(content, 'utf-8');
      } else {
        throw new BadRequestError('Either fileBase64 or content payload is required.');
      }

      const attachment = await this.evidenceService.uploadAttachment(
        evidenceId,
        { fileName, mimeType, buffer },
        req.user!,
        req.id,
      );

      res.status(201).json(createSuccessResponse(attachment, { requestId: req.id }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/evidence/:id/attachments/:attachmentId/download
   */
  downloadAttachment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const evidenceId = req.params.id as string;
      const attachmentId = req.params.attachmentId as string;

      const { attachment, buffer } = await this.evidenceService.getAttachmentDownload(
        evidenceId,
        attachmentId,
        req.user,
        req.id,
      );

      res.setHeader('Content-Type', attachment.mimeType);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(attachment.fileName)}"`,
      );
      res.setHeader('Content-Length', buffer.length);
      res.send(buffer);
    } catch (error) {
      next(error);
    }
  };
}

export const defaultEvidenceController = new EvidenceController();
