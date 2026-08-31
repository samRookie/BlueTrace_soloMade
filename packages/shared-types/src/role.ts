/**
 * Platform user and actor role vocabulary.
 *
 * NOTE: In Phase 1, roles are contractual vocabulary only.
 * Authentication and authorization enforcement are handled in future phases.
 */
export type Role = 'ADMIN' | 'RESEARCHER' | 'ANALYST' | 'REVIEWER' | 'PUBLISHER' | 'VIEWER';
