import {
  AuditRepository,
  defaultAuditRepository,
  type AuditFilterOptions,
  type PaginationOptions,
} from '../repositories/auditRepository.js';
import type { AuditEventDto, AuditStatus, Role, PaginatedData } from '@sih26019/shared-types';
import { generateSecureId } from '../utils/crypto.js';

export interface CreateAuditEventParams {
  actorId?: string | null;
  actorRole?: Role | null;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  requestId?: string | null;
  status: AuditStatus;
  details?: unknown;
  ipAddress?: string | null;
}

export class AuditService {
  constructor(private readonly auditRepository: AuditRepository = defaultAuditRepository) {}

  /**
   * Appends an immutable audit event to the security audit trail.
   */
  async logEvent(params: CreateAuditEventParams): Promise<AuditEventDto> {
    const id = generateSecureId('AUDIT');
    const detailsStr = params.details !== undefined ? JSON.stringify(params.details) : null;

    const row = await this.auditRepository.create({
      id,
      actorId: params.actorId ?? null,
      actorRole: params.actorRole ?? null,
      action: params.action,
      targetType: params.targetType ?? null,
      targetId: params.targetId ?? null,
      requestId: params.requestId ?? null,
      status: params.status,
      details: detailsStr,
      ipAddress: params.ipAddress ?? null,
      createdAt: new Date(),
    });

    return {
      id: row.id,
      actorId: row.actorId,
      actorRole: row.actorRole as Role | null,
      action: row.action,
      targetType: row.targetType,
      targetId: row.targetId,
      requestId: row.requestId,
      status: row.status as AuditStatus,
      details: row.details ? JSON.parse(row.details) : undefined,
      ipAddress: row.ipAddress,
      createdAt: row.createdAt.toISOString(),
    };
  }

  /**
   * Retrieves a paginated list of audit events for authorized compliance personnel.
   */
  async listEvents(
    filters: AuditFilterOptions,
    pagination: PaginationOptions,
  ): Promise<PaginatedData<AuditEventDto>> {
    const { items, total } = await this.auditRepository.findMany(filters, pagination);
    const totalPages = total === 0 ? 0 : Math.ceil(total / pagination.pageSize);

    return {
      items: items.map((row) => ({
        id: row.id,
        actorId: row.actorId,
        actorRole: row.actorRole as Role | null,
        action: row.action,
        targetType: row.targetType,
        targetId: row.targetId,
        requestId: row.requestId,
        status: row.status as AuditStatus,
        details: row.details ? JSON.parse(row.details) : undefined,
        ipAddress: row.ipAddress,
        createdAt: row.createdAt.toISOString(),
      })),
      pagination: {
        page: pagination.page,
        pageSize: pagination.pageSize,
        total,
        totalPages,
      },
    };
  }
}

export const defaultAuditService = new AuditService();
