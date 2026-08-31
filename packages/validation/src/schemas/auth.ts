import { z } from 'zod';
import type { LoginRequest, UserStatus, AuditStatus } from '@sih26019/shared-types';

export const userStatusSchema = z.enum(['ACTIVE', 'DISABLED']) satisfies z.ZodType<UserStatus>;

export const auditStatusSchema = z.enum([
  'SUCCESS',
  'FAILURE',
  'DENIED',
]) satisfies z.ZodType<AuditStatus>;

/**
 * Authentication login request payload validator schema.
 */
export const loginRequestSchema = z.object({
  email: z.string().email('Invalid email address format').min(5).max(255),
  password: z.string().min(8, 'Password must be at least 8 characters long').max(128),
}) satisfies z.ZodType<LoginRequest>;

/**
 * Audit event list query filter validator schema.
 */
export const auditFilterSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  actorId: z.string().max(64).optional(),
  action: z.string().max(64).optional(),
  status: auditStatusSchema.optional(),
});

/**
 * Workspace parameter schema.
 */
export const workspaceParamsSchema = z.object({
  id: z.string().min(1).max(64),
});
