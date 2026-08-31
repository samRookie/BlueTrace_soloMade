import {
  WorkspaceRepository,
  defaultWorkspaceRepository,
  type PaginationOptions,
} from '../repositories/workspaceRepository.js';
import type {
  AuthenticatedUser,
  WorkspaceDto,
  PaginatedData,
  Visibility,
  OwnerType,
} from '@sih26019/shared-types';
import type { WorkspaceRow } from '@sih26019/db';
import { NotFoundError } from '../errors/index.js';

function mapWorkspaceToDto(row: WorkspaceRow): WorkspaceDto {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    ownerId: row.ownerId,
    ownerType: row.ownerType as OwnerType,
    visibility: row.visibility as Visibility,
    sampleFlag: row.sampleFlag,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export class WorkspaceService {
  constructor(
    private readonly workspaceRepository: WorkspaceRepository = defaultWorkspaceRepository,
  ) {}

  /**
   * Retrieves a paginated list of workspaces accessible to the authenticated user.
   */
  async listUserWorkspaces(
    user: AuthenticatedUser,
    pagination: PaginationOptions,
  ): Promise<PaginatedData<WorkspaceDto>> {
    const isGlobalAdmin = user.role === 'ADMIN';
    const { items, total } = await this.workspaceRepository.findManyForUser(
      user.id,
      isGlobalAdmin,
      pagination,
    );

    const totalPages = total === 0 ? 0 : Math.ceil(total / pagination.pageSize);

    return {
      items: items.map(mapWorkspaceToDto),
      pagination: {
        page: pagination.page,
        pageSize: pagination.pageSize,
        total,
        totalPages,
      },
    };
  }

  /**
   * Retrieves a single workspace by ID with strict IDOR membership/ownership checks.
   */
  async getWorkspaceById(id: string, user: AuthenticatedUser): Promise<WorkspaceDto> {
    const workspace = await this.workspaceRepository.findById(id);

    if (!workspace) {
      throw new NotFoundError(`Workspace with ID '${id}' not found.`);
    }

    // Public workspaces or Admin/Owner can access
    if (
      workspace.visibility === 'PUBLIC' ||
      user.role === 'ADMIN' ||
      workspace.ownerId === user.id
    ) {
      return mapWorkspaceToDto(workspace);
    }

    // Check membership
    const isMember = await this.workspaceRepository.isMember(id, user.id);
    if (!isMember) {
      // Return 404 to avoid disclosing existence of private workspace (IDOR protection)
      throw new NotFoundError(`Workspace with ID '${id}' not found.`);
    }

    return mapWorkspaceToDto(workspace);
  }
}

export const defaultWorkspaceService = new WorkspaceService();
