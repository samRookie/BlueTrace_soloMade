import * as crypto from 'node:crypto';
import type {
  EvidenceFilterQuery,
  AuthenticatedUser,
  EvidenceItemDto,
  EvidenceDetailDto,
  CreateEvidenceRequest,
  CreateRelationshipRequest,
  ResourceAttachmentDto,
  StorageAdapter,
} from '@sih26019/shared-types';
import {
  EvidenceRepository,
  defaultEvidenceRepository,
} from '../repositories/evidenceRepository.js';
import { AuditService, defaultAuditService } from './auditService.js';
import { defaultStorageAdapter } from '../storage/storageAdapter.js';
import { NotFoundError, BadRequestError } from '../errors/index.js';

export class EvidenceService {
  constructor(
    private readonly evidenceRepository: EvidenceRepository = defaultEvidenceRepository,
    private readonly auditService: AuditService = defaultAuditService,
    private readonly storageAdapter: StorageAdapter = defaultStorageAdapter,
  ) {}

  /**
   * Discovers and lists evidence items based on search criteria and persona visibility.
   */
  async listEvidence(
    query: EvidenceFilterQuery,
    user?: AuthenticatedUser | null,
  ): Promise<{
    items: EvidenceItemDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.evidenceRepository.findMany(query, user);
  }

  /**
   * Retrieves an evidence item with graph relationships and file attachments.
   */
  async getEvidenceById(id: string, user?: AuthenticatedUser | null): Promise<EvidenceDetailDto> {
    const item = await this.evidenceRepository.findById(id, user);
    if (!item) {
      throw new NotFoundError(`Evidence item "${id}" was not found or access is restricted.`);
    }
    return item;
  }

  /**
   * Registers a new evidence item in the catalog.
   */
  async createEvidence(
    payload: CreateEvidenceRequest,
    user: AuthenticatedUser,
    requestId?: string,
  ): Promise<EvidenceDetailDto> {
    const id = `EV-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

    await this.evidenceRepository.create({
      id,
      title: payload.title,
      category: payload.category,
      sourceId: payload.sourceId,
      projectId: payload.projectId ?? null,
      policyId: payload.policyId ?? null,
      lifecycleStatus: payload.lifecycleStatus ?? 'PUBLISHED',
      integrityStatus: payload.integrityStatus ?? 'VERIFIED',
      visibility: payload.visibility ?? 'PUBLIC',
      sampleFlag: true,
    });

    await this.auditService.logEvent({
      actorId: user.id,
      actorRole: user.role,
      action: 'evidence:create',
      targetType: 'evidence',
      targetId: id,
      requestId,
      status: 'SUCCESS',
      details: { title: payload.title, category: payload.category },
    });

    const created = await this.evidenceRepository.findById(id, user);
    if (!created) {
      throw new NotFoundError(`Failed to retrieve newly created evidence item "${id}".`);
    }
    return created;
  }

  /**
   * Creates a directed relationship between two evidence items.
   */
  async createRelationship(
    sourceEvidenceId: string,
    payload: CreateRelationshipRequest,
    user: AuthenticatedUser,
    requestId?: string,
  ): Promise<void> {
    if (sourceEvidenceId === payload.targetEvidenceId) {
      throw new BadRequestError('Evidence item cannot link to itself (self-loop forbidden).');
    }

    const [source, target] = await Promise.all([
      this.evidenceRepository.findById(sourceEvidenceId, user),
      this.evidenceRepository.findById(payload.targetEvidenceId, user),
    ]);

    if (!source) {
      throw new NotFoundError(`Source evidence item "${sourceEvidenceId}" not found.`);
    }
    if (!target) {
      throw new NotFoundError(`Target evidence item "${payload.targetEvidenceId}" not found.`);
    }

    const id = `REL-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

    await this.evidenceRepository.createRelationship({
      id,
      sourceEvidenceId,
      targetEvidenceId: payload.targetEvidenceId,
      relationshipType: payload.relationshipType,
    });

    await this.auditService.logEvent({
      actorId: user.id,
      actorRole: user.role,
      action: 'evidence:link',
      targetType: 'evidence_relationship',
      targetId: id,
      requestId,
      status: 'SUCCESS',
      details: {
        sourceEvidenceId,
        targetEvidenceId: payload.targetEvidenceId,
        relationshipType: payload.relationshipType,
      },
    });
  }

  /**
   * Safely stores a file attachment and links it to an evidence item.
   */
  async uploadAttachment(
    evidenceId: string,
    file: { fileName: string; mimeType: string; buffer: Buffer },
    user: AuthenticatedUser,
    requestId?: string,
  ): Promise<ResourceAttachmentDto> {
    const evidence = await this.evidenceRepository.findById(evidenceId, user);
    if (!evidence) {
      throw new NotFoundError(`Evidence item "${evidenceId}" not found.`);
    }

    const sanitizedName = file.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storageKey = `evidence/${crypto.randomUUID()}_${sanitizedName}`;

    const storedItem = await this.storageAdapter.upload(storageKey, file.buffer, file.mimeType);

    const attachmentId = `ATT-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

    const attachmentRow = await this.evidenceRepository.createAttachment({
      id: attachmentId,
      evidenceId,
      fileName: file.fileName,
      fileSize: storedItem.sizeBytes,
      mimeType: storedItem.mimeType,
      storageKey: storedItem.key,
      checksumSha256: storedItem.checksum ?? null,
      sampleFlag: true,
    });

    await this.auditService.logEvent({
      actorId: user.id,
      actorRole: user.role,
      action: 'evidence:attachment:upload',
      targetType: 'evidence_attachment',
      targetId: attachmentId,
      requestId,
      status: 'SUCCESS',
      details: {
        evidenceId,
        fileName: file.fileName,
        fileSize: storedItem.sizeBytes,
        mimeType: storedItem.mimeType,
      },
    });

    return {
      id: attachmentRow.id,
      evidenceId: attachmentRow.evidenceId,
      fileName: attachmentRow.fileName,
      fileSize: attachmentRow.fileSize,
      mimeType: attachmentRow.mimeType,
      storageKey: attachmentRow.storageKey,
      checksumSha256: attachmentRow.checksumSha256,
      sampleFlag: attachmentRow.sampleFlag,
      createdAt: attachmentRow.createdAt.toISOString(),
    };
  }

  /**
   * Authorizes and retrieves the file stream / buffer for a secure download.
   */
  async getAttachmentDownload(
    evidenceId: string,
    attachmentId: string,
    user?: AuthenticatedUser | null,
    requestId?: string,
  ): Promise<{
    attachment: ResourceAttachmentDto;
    buffer: Buffer;
  }> {
    const evidence = await this.evidenceRepository.findById(evidenceId, user);
    if (!evidence) {
      throw new NotFoundError(`Evidence item "${evidenceId}" not found or access restricted.`);
    }

    const attachmentRow = await this.evidenceRepository.findAttachmentById(attachmentId);
    if (!attachmentRow || attachmentRow.evidenceId !== evidenceId) {
      throw new NotFoundError(
        `Attachment "${attachmentId}" was not found on evidence "${evidenceId}".`,
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blob = await (this.storageAdapter as any).getBuffer(attachmentRow.storageKey);
    if (!blob) {
      throw new NotFoundError(`File binary for "${attachmentRow.storageKey}" is unavailable.`);
    }

    if (user) {
      await this.auditService.logEvent({
        actorId: user.id,
        actorRole: user.role,
        action: 'evidence:attachment:download',
        targetType: 'evidence_attachment',
        targetId: attachmentId,
        requestId,
        status: 'SUCCESS',
        details: { fileName: attachmentRow.fileName },
      });
    }

    return {
      attachment: {
        id: attachmentRow.id,
        evidenceId: attachmentRow.evidenceId,
        fileName: attachmentRow.fileName,
        fileSize: attachmentRow.fileSize,
        mimeType: attachmentRow.mimeType,
        storageKey: attachmentRow.storageKey,
        checksumSha256: attachmentRow.checksumSha256,
        sampleFlag: attachmentRow.sampleFlag,
        createdAt: attachmentRow.createdAt.toISOString(),
      },
      buffer: blob.data,
    };
  }
}

export const defaultEvidenceService = new EvidenceService();
