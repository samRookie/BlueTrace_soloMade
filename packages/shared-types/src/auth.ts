import type { Role } from './role.js';
import type { OwnerType } from './owner.js';
import type { Visibility } from './visibility.js';

export type UserStatus = 'ACTIVE' | 'DISABLED';

export type Permission =
  | 'auth:login'
  | 'auth:logout'
  | 'auth:me'
  | 'regions:read'
  | 'resources:read'
  | 'workspaces:read'
  | 'workspaces:create'
  | 'projects:read'
  | 'projects:create'
  | 'projects:update'
  | 'projects:verify'
  | 'disputes:read'
  | 'disputes:create'
  | 'disputes:resolve'
  | 'audit:read'
  | 'admin:all';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  status: UserStatus;
  sampleFlag: boolean;
  createdAt: string;
}

export interface AuthSession {
  id: string;
  userId: string;
  expiresAt: string;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: AuthenticatedUser;
  session: {
    id: string;
    expiresAt: string;
  };
}

export type AuditStatus = 'SUCCESS' | 'FAILURE' | 'DENIED';

export interface AuditEventDto {
  id: string;
  actorId: string | null;
  actorRole: Role | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  requestId: string | null;
  status: AuditStatus;
  details?: unknown;
  ipAddress: string | null;
  createdAt: string;
}

export interface WorkspaceDto {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  ownerType: OwnerType;
  visibility: Visibility;
  sampleFlag: boolean;
  createdAt: string;
  updatedAt: string;
}
