import * as crypto from 'node:crypto';
import type {
  DatasetFilterQuery,
  DatasetItemDto,
  DatasetDetailDto,
  CreateDatasetRequest,
  UpdateDatasetRequest,
  AuthenticatedUser,
  StorageAdapter,
} from '@sih26019/shared-types';
import { DatasetRepository, defaultDatasetRepository } from '../repositories/datasetRepository.js';
import { defaultStorageAdapter, MemoryStorageAdapter } from '../storage/storageAdapter.js';
import { AuditService, defaultAuditService } from './auditService.js';
import { NotFoundError, ForbiddenError } from '../errors/index.js';

export class DatasetService {
  constructor(
    private readonly repository: DatasetRepository = defaultDatasetRepository,
    private readonly storageAdapter: StorageAdapter = defaultStorageAdapter,
    private readonly auditService: AuditService = defaultAuditService,
  ) {}

  /**
   * Search and filter datasets with pagination.
   */
  async searchDatasets(
    query: DatasetFilterQuery,
    user?: AuthenticatedUser | null,
  ): Promise<{
    items: DatasetItemDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.repository.findMany(query, user);
  }

  /**
   * Retrieve dataset detail with access evaluation.
   */
  async getDatasetById(id: string, user?: AuthenticatedUser | null): Promise<DatasetDetailDto> {
    const detail = await this.repository.findById(id, user);
    if (!detail) {
      throw new NotFoundError(`Dataset with ID "${id}" was not found.`);
    }
    return detail;
  }

  /**
   * Register a new dataset entry.
   */
  async createDataset(
    payload: CreateDatasetRequest,
    user: AuthenticatedUser,
    requestId?: string,
  ): Promise<DatasetDetailDto> {
    const created = await this.repository.create(payload, user.id);

    await this.auditService.logEvent({
      actorId: user.id,
      actorRole: user.role,
      action: 'dataset:create',
      targetType: 'dataset',
      targetId: created.id,
      requestId: requestId || null,
      status: 'SUCCESS',
      details: {
        title: created.title,
        datasetType: created.metadata.datasetType,
        accessLevel: created.metadata.accessLevel,
      },
    });

    return created;
  }

  /**
   * Update dataset metadata.
   */
  async updateDataset(
    id: string,
    payload: UpdateDatasetRequest,
    user: AuthenticatedUser,
    requestId?: string,
  ): Promise<DatasetDetailDto> {
    const updated = await this.repository.update(id, payload, user.id);

    await this.auditService.logEvent({
      actorId: user.id,
      actorRole: user.role,
      action: 'dataset:update',
      targetType: 'dataset',
      targetId: updated.id,
      requestId: requestId || null,
      status: 'SUCCESS',
      details: {
        updates: payload,
      },
    });

    return updated;
  }

  /**
   * Safely upload and attach a dataset document/archive.
   */
  async uploadAttachment(
    evidenceId: string,
    fileName: string,
    mimeType: string,
    fileBuffer: Buffer,
    user: AuthenticatedUser,
    requestId?: string,
  ) {
    await this.getDatasetById(evidenceId, user);

    const storageKey = MemoryStorageAdapter.generateStorageKey(fileName);

    const storedItem = await this.storageAdapter.upload(storageKey, fileBuffer, mimeType);

    const attachmentId = `ATT-${crypto.randomUUID()}`;

    await this.repository.createAttachment({
      id: attachmentId,
      evidenceId,
      fileName,
      fileSize: storedItem.sizeBytes,
      mimeType,
      storageKey,
      checksumSha256: storedItem.checksum ?? null,
      sampleFlag: true,
      createdAt: new Date(),
    });

    await this.auditService.logEvent({
      actorId: user.id,
      actorRole: user.role,
      action: 'dataset:attachment:upload',
      targetType: 'dataset_attachment',
      targetId: attachmentId,
      requestId: requestId || null,
      status: 'SUCCESS',
      details: {
        datasetId: evidenceId,
        fileName,
        fileSize: storedItem.sizeBytes,
        mimeType,
      },
    });

    return {
      id: attachmentId,
      evidenceId,
      fileName,
      fileSize: storedItem.sizeBytes,
      mimeType,
      storageKey,
      checksumSha256: storedItem.checksum,
    };
  }

  /**
   * Securely retrieve attachment stream and enforce download permissions.
   */
  async downloadAttachment(
    evidenceId: string,
    attachmentId: string,
    user?: AuthenticatedUser | null,
    requestId?: string,
  ) {
    const dataset = await this.getDatasetById(evidenceId, user);

    if (!dataset.userAccess.canDownload) {
      if (requestId) {
        await this.auditService.logEvent({
          actorId: user?.id || null,
          actorRole: user?.role || null,
          action: 'dataset:download',
          targetType: 'dataset_attachment',
          targetId: attachmentId,
          requestId,
          status: 'DENIED',
          details: {
            reason: dataset.userAccess.reason || 'Access denied by policy.',
          },
        });
      }
      throw new ForbiddenError(
        dataset.userAccess.reason || 'You do not have permission to download this dataset.',
      );
    }

    const attachment = await this.repository.findAttachmentById(evidenceId, attachmentId);
    if (!attachment) {
      throw new NotFoundError(
        `Attachment "${attachmentId}" not found for dataset "${evidenceId}".`,
      );
    }

    const blob = await (this.storageAdapter as MemoryStorageAdapter).getBuffer(
      attachment.storageKey,
    );
    if (!blob) {
      throw new NotFoundError('Underlying dataset file blob was not found in storage.');
    }

    if (requestId) {
      await this.auditService.logEvent({
        actorId: user?.id || null,
        actorRole: user?.role || null,
        action: 'dataset:download',
        targetType: 'dataset_attachment',
        targetId: attachmentId,
        requestId,
        status: 'SUCCESS',
        details: {
          datasetId: evidenceId,
          fileName: attachment.fileName,
          sizeBytes: attachment.fileSize,
        },
      });
    }

    return {
      fileName: attachment.fileName,
      mimeType: attachment.mimeType,
      fileSize: attachment.fileSize,
      data: blob.data,
      checksumSha256: attachment.checksumSha256,
    };
  }
}

export const defaultDatasetService = new DatasetService();
