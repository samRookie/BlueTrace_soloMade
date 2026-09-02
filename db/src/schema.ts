import {
  pgTable,
  varchar,
  text,
  boolean,
  timestamp,
  numeric,
  integer,
  jsonb,
  uniqueIndex,
  index,
  check,
} from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import type {
  SourceType,
  RegionLevel,
  LifecycleStatus,
  IntegrityStatus,
  Visibility,
  OwnerType,
  EvidenceRelationshipType,
  Role,
  UserStatus,
  AuditStatus,
  DatasetType,
  DatasetTechnicalFormat,
  DatasetUpdateFrequency,
  DatasetAccessLevel,
  PeriodType,
} from '@sih26019/shared-types';

/**
 * 1. Sources Table
 */
export const sources = pgTable(
  'sources',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    title: text('title').notNull(),
    sourceType: varchar('source_type', { length: 32 }).$type<SourceType>().notNull(),
    publisher: text('publisher'),
    uri: text('uri'),
    attribution: text('attribution'),
    obtainedAt: timestamp('obtained_at', { withTimezone: true }),
    sampleFlag: boolean('sample_flag').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('sources_type_idx').on(table.sourceType),
    index('sources_sample_idx').on(table.sampleFlag),
  ],
);

/**
 * 2. Regions Table
 */
export const regions = pgTable(
  'regions',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    code: varchar('code', { length: 64 }).notNull().unique(),
    name: text('name').notNull(),
    level: varchar('level', { length: 32 }).$type<RegionLevel>().notNull(),
    parentCode: varchar('parent_code', { length: 64 }),
    sampleFlag: boolean('sample_flag').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('regions_level_idx').on(table.level),
    index('regions_parent_code_idx').on(table.parentCode),
  ],
);

/**
 * 3. Workspaces Table
 */
export const workspaces = pgTable(
  'workspaces',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    visibility: varchar('visibility', { length: 32 })
      .$type<Visibility>()
      .notNull()
      .default('INTERNAL'),
    ownerId: varchar('owner_id', { length: 64 }).notNull(),
    ownerType: varchar('owner_type', { length: 32 })
      .$type<OwnerType>()
      .notNull()
      .default('INSTITUTION'),
    sampleFlag: boolean('sample_flag').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('workspaces_owner_idx').on(table.ownerId, table.ownerType)],
);

/**
 * 4. Policies Table
 */
export const policies = pgTable(
  'policies',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    code: varchar('code', { length: 64 }).notNull().unique(),
    title: text('title').notNull(),
    description: text('description'),
    lifecycleStatus: varchar('lifecycle_status', { length: 32 })
      .$type<LifecycleStatus>()
      .notNull()
      .default('DRAFT'),
    visibility: varchar('visibility', { length: 32 })
      .$type<Visibility>()
      .notNull()
      .default('PUBLIC'),
    regionId: varchar('region_id', { length: 64 }).references(() => regions.id, {
      onDelete: 'set null',
    }),
    sourceId: varchar('source_id', { length: 64 }).references(() => sources.id, {
      onDelete: 'set null',
    }),
    sampleFlag: boolean('sample_flag').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('policies_region_idx').on(table.regionId),
    index('policies_status_idx').on(table.lifecycleStatus),
  ],
);

/**
 * 5. Indicators Table
 */
export const indicators = pgTable(
  'indicators',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    code: varchar('code', { length: 64 }).notNull().unique(),
    name: text('name').notNull(),
    category: varchar('category', { length: 64 }).notNull(),
    unit: varchar('unit', { length: 32 }).notNull(),
    policyId: varchar('policy_id', { length: 64 }).references(() => policies.id, {
      onDelete: 'cascade',
    }),
    sampleFlag: boolean('sample_flag').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('indicators_policy_idx').on(table.policyId)],
);

/**
 * 6. GIS Layers Table
 */
export const gisLayers = pgTable(
  'gis_layers',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    name: text('name').notNull(),
    layerType: varchar('layer_type', { length: 64 }).notNull(),
    regionId: varchar('region_id', { length: 64 })
      .notNull()
      .references(() => regions.id, { onDelete: 'restrict' }),
    sourceId: varchar('source_id', { length: 64 }).references(() => sources.id, {
      onDelete: 'set null',
    }),
    visibility: varchar('visibility', { length: 32 })
      .$type<Visibility>()
      .notNull()
      .default('PUBLIC'),
    status: varchar('status', { length: 32 }).notNull().default('PUBLISHED'),
    sampleFlag: boolean('sample_flag').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('gis_layers_region_idx').on(table.regionId),
    index('gis_layers_type_idx').on(table.layerType),
  ],
);

/**
 * 7. Projects Table
 */
export const projects = pgTable(
  'projects',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    code: varchar('code', { length: 64 }).notNull().unique(),
    name: text('name').notNull(),
    description: text('description'),
    regionId: varchar('region_id', { length: 64 })
      .notNull()
      .references(() => regions.id, { onDelete: 'restrict' }),
    workspaceId: varchar('workspace_id', { length: 64 }).references(() => workspaces.id, {
      onDelete: 'cascade',
    }),
    lifecycleStatus: varchar('lifecycle_status', { length: 32 })
      .$type<LifecycleStatus>()
      .notNull()
      .default('DRAFT'),
    visibility: varchar('visibility', { length: 32 })
      .$type<Visibility>()
      .notNull()
      .default('PUBLIC'),
    sampleFlag: boolean('sample_flag').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('projects_region_idx').on(table.regionId),
    index('projects_workspace_idx').on(table.workspaceId),
    index('projects_status_idx').on(table.lifecycleStatus),
  ],
);

/**
 * 8. Innovation Opportunities Table
 */
export const innovationOpportunities = pgTable(
  'innovation_opportunities',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    title: text('title').notNull(),
    summary: text('summary').notNull(),
    projectId: varchar('project_id', { length: 64 })
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    policyId: varchar('policy_id', { length: 64 }).references(() => policies.id, {
      onDelete: 'set null',
    }),
    status: varchar('status', { length: 32 }).notNull().default('DRAFT'),
    sampleFlag: boolean('sample_flag').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('innovations_project_idx').on(table.projectId),
    index('innovations_policy_idx').on(table.policyId),
  ],
);

/**
 * 9. Blue Carbon Projects Table (1:1 with Projects)
 */
export const blueCarbonProjects = pgTable(
  'blue_carbon_projects',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    projectId: varchar('project_id', { length: 64 })
      .notNull()
      .unique()
      .references(() => projects.id, { onDelete: 'cascade' }),
    ecosystemType: varchar('ecosystem_type', { length: 64 }).notNull(),
    estimatedHectares: numeric('estimated_hectares', { precision: 12, scale: 2 }).notNull(),
    targetCo2SequesterTpy: numeric('target_co2_sequester_tpy', { precision: 12, scale: 2 }),
    sampleFlag: boolean('sample_flag').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('blue_carbon_ecosystem_idx').on(table.ecosystemType)],
);

/**
 * 10. MRV Records Table
 */
export const mrvRecords = pgTable(
  'mrv_records',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    blueCarbonProjectId: varchar('blue_carbon_project_id', { length: 64 })
      .notNull()
      .references(() => blueCarbonProjects.id, { onDelete: 'cascade' }),
    reportingPeriodStart: timestamp('reporting_period_start', { withTimezone: true }).notNull(),
    reportingPeriodEnd: timestamp('reporting_period_end', { withTimezone: true }).notNull(),
    measuredBiomassDensity: numeric('measured_biomass_density', { precision: 10, scale: 4 }),
    estimatedSequestrationTonnes: numeric('estimated_sequestration_tonnes', {
      precision: 12,
      scale: 2,
    }).notNull(),
    status: varchar('status', { length: 32 }).notNull().default('DRAFT'),
    sampleFlag: boolean('sample_flag').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('mrv_project_idx').on(table.blueCarbonProjectId),
    check('mrv_period_check', sql`${table.reportingPeriodStart} <= ${table.reportingPeriodEnd}`),
  ],
);

/**
 * 11. Verification Records Table
 */
export const verificationRecords = pgTable(
  'verification_records',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    mrvId: varchar('mrv_id', { length: 64 })
      .notNull()
      .references(() => mrvRecords.id, { onDelete: 'cascade' }),
    verifierIdentity: text('verifier_identity').notNull(),
    verificationStatus: varchar('verification_status', { length: 32 })
      .$type<IntegrityStatus>()
      .notNull()
      .default('UNVERIFIED'),
    verifiedAt: timestamp('verified_at', { withTimezone: true }),
    methodology: text('methodology').notNull(),
    sampleFlag: boolean('sample_flag').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('verifications_mrv_idx').on(table.mrvId),
    index('verifications_status_idx').on(table.verificationStatus),
  ],
);

/**
 * 12. Integrity Records Table (1:1 with Verification Records)
 */
export const integrityRecords = pgTable(
  'integrity_records',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    verificationId: varchar('verification_id', { length: 64 })
      .notNull()
      .unique()
      .references(() => verificationRecords.id, { onDelete: 'cascade' }),
    checksum: varchar('checksum', { length: 128 }).notNull(),
    algorithm: varchar('algorithm', { length: 32 }).notNull().default('SHA-256'),
    integrityStatus: varchar('integrity_status', { length: 32 })
      .$type<IntegrityStatus>()
      .notNull()
      .default('VERIFIED'),
    recordedAt: timestamp('recorded_at', { withTimezone: true }).notNull().defaultNow(),
    sampleFlag: boolean('sample_flag').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('integrity_hash_idx').on(table.checksum)],
);

/**
 * 13. Disputes Table
 */
export const disputes = pgTable(
  'disputes',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    projectId: varchar('project_id', { length: 64 })
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    lifecycleStatus: varchar('lifecycle_status', { length: 32 })
      .$type<LifecycleStatus>()
      .notNull()
      .default('DRAFT'),
    visibility: varchar('visibility', { length: 32 })
      .$type<Visibility>()
      .notNull()
      .default('INTERNAL'),
    resolutionSummary: text('resolution_summary'),
    sampleFlag: boolean('sample_flag').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('disputes_project_idx').on(table.projectId),
    index('disputes_status_idx').on(table.lifecycleStatus),
  ],
);

/**
 * 14. Evidence Items Table
 */
export const evidenceItems = pgTable(
  'evidence_items',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    title: text('title').notNull(),
    category: varchar('category', { length: 64 }).notNull(),
    sourceId: varchar('source_id', { length: 64 })
      .notNull()
      .references(() => sources.id, { onDelete: 'restrict' }),
    projectId: varchar('project_id', { length: 64 }).references(() => projects.id, {
      onDelete: 'set null',
    }),
    policyId: varchar('policy_id', { length: 64 }).references(() => policies.id, {
      onDelete: 'set null',
    }),
    lifecycleStatus: varchar('lifecycle_status', { length: 32 })
      .$type<LifecycleStatus>()
      .notNull()
      .default('PUBLISHED'),
    integrityStatus: varchar('integrity_status', { length: 32 })
      .$type<IntegrityStatus>()
      .notNull()
      .default('VERIFIED'),
    visibility: varchar('visibility', { length: 32 })
      .$type<Visibility>()
      .notNull()
      .default('PUBLIC'),
    sampleFlag: boolean('sample_flag').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('evidence_source_idx').on(table.sourceId),
    index('evidence_project_idx').on(table.projectId),
    index('evidence_policy_idx').on(table.policyId),
  ],
);

/**
 * 15. Evidence Relationships Table (Graph Edges)
 */
export const evidenceRelationships = pgTable(
  'evidence_relationships',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    sourceEvidenceId: varchar('source_evidence_id', { length: 64 })
      .notNull()
      .references(() => evidenceItems.id, { onDelete: 'cascade' }),
    targetEvidenceId: varchar('target_evidence_id', { length: 64 })
      .notNull()
      .references(() => evidenceItems.id, { onDelete: 'cascade' }),
    relationshipType: varchar('relationship_type', { length: 32 })
      .$type<EvidenceRelationshipType>()
      .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('evidence_rel_unique_idx').on(
      table.sourceEvidenceId,
      table.targetEvidenceId,
      table.relationshipType,
    ),
    index('evidence_rel_source_idx').on(table.sourceEvidenceId),
    index('evidence_rel_target_idx').on(table.targetEvidenceId),
    check('evidence_rel_no_self_loop', sql`${table.sourceEvidenceId} <> ${table.targetEvidenceId}`),
  ],
);

/**
 * 16. Users Table (Phase 4 Security & Personas)
 */
export const users = pgTable(
  'users',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    role: varchar('role', { length: 32 }).$type<Role>().notNull(),
    status: varchar('status', { length: 32 }).$type<UserStatus>().notNull().default('ACTIVE'),
    sampleFlag: boolean('sample_flag').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('users_email_idx').on(table.email),
    index('users_role_idx').on(table.role),
    index('users_status_idx').on(table.status),
    index('users_sample_flag_idx').on(table.sampleFlag),
  ],
);

/**
 * 17. Sessions Table (Phase 4 Server-Managed Sessions)
 */
export const sessions = pgTable(
  'sessions',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    userId: varchar('user_id', { length: 64 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    sessionTokenHash: varchar('session_token_hash', { length: 128 }).notNull().unique(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    ipAddress: varchar('ip_address', { length: 64 }),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('sessions_user_id_idx').on(table.userId),
    index('sessions_token_hash_idx').on(table.sessionTokenHash),
    index('sessions_expires_at_idx').on(table.expiresAt),
  ],
);

/**
 * 18. Audit Events Table (Phase 4 Immutable Security Logs)
 */
export const auditEvents = pgTable(
  'audit_events',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    actorId: varchar('actor_id', { length: 64 }),
    actorRole: varchar('actor_role', { length: 32 }).$type<Role>(),
    action: varchar('action', { length: 64 }).notNull(),
    targetType: varchar('target_type', { length: 64 }),
    targetId: varchar('target_id', { length: 64 }),
    requestId: varchar('request_id', { length: 64 }),
    status: varchar('status', { length: 32 }).$type<AuditStatus>().notNull(),
    details: text('details'),
    ipAddress: varchar('ip_address', { length: 64 }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('audit_events_actor_idx').on(table.actorId),
    index('audit_events_action_idx').on(table.action),
    index('audit_events_target_idx').on(table.targetType, table.targetId),
    index('audit_events_request_id_idx').on(table.requestId),
    index('audit_events_created_at_idx').on(table.createdAt),
  ],
);

/**
 * 19. Workspace Memberships Table (Phase 4 Membership Authorization)
 */
export const workspaceMemberships = pgTable(
  'workspace_memberships',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    workspaceId: varchar('workspace_id', { length: 64 })
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    userId: varchar('user_id', { length: 64 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: varchar('role', { length: 32 }).$type<Role>().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('workspace_memberships_unique_idx').on(table.workspaceId, table.userId),
    index('workspace_memberships_workspace_idx').on(table.workspaceId),
    index('workspace_memberships_user_idx').on(table.userId),
  ],
);

/**
 * 20. Evidence Attachments Table (Phase 5 Knowledge & Evidence Repository)
 */
export const evidenceAttachments = pgTable(
  'evidence_attachments',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    evidenceId: varchar('evidence_id', { length: 64 })
      .notNull()
      .references(() => evidenceItems.id, { onDelete: 'cascade' }),
    fileName: text('file_name').notNull(),
    fileSize: integer('file_size').notNull(),
    mimeType: varchar('mime_type', { length: 128 }).notNull(),
    storageKey: varchar('storage_key', { length: 255 }).notNull().unique(),
    checksumSha256: varchar('checksum_sha256', { length: 64 }),
    sampleFlag: boolean('sample_flag').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('evidence_attachments_evidence_idx').on(table.evidenceId),
    index('evidence_attachments_storage_idx').on(table.storageKey),
  ],
);

/**
 * 21. Dataset Metadata Table (Phase 6 Dataset Catalog & Storage)
 */
export const datasetMetadata = pgTable(
  'dataset_metadata',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    evidenceId: varchar('evidence_id', { length: 64 })
      .notNull()
      .unique()
      .references(() => evidenceItems.id, { onDelete: 'cascade' }),
    datasetType: varchar('dataset_type', { length: 32 }).$type<DatasetType>().notNull(),
    technicalFormat: varchar('technical_format', { length: 32 })
      .$type<DatasetTechnicalFormat>()
      .notNull(),
    updateFrequency: varchar('update_frequency', { length: 32 })
      .$type<DatasetUpdateFrequency>()
      .notNull(),
    accessLevel: varchar('access_level', { length: 32 })
      .$type<DatasetAccessLevel>()
      .notNull()
      .default('OPEN'),
    spatialCoverageSummary: text('spatial_coverage_summary'),
    temporalCoverageStart: timestamp('temporal_coverage_start', { withTimezone: true }),
    temporalCoverageEnd: timestamp('temporal_coverage_end', { withTimezone: true }),
    periodType: varchar('period_type', { length: 32 }).$type<PeriodType>(),
    regionId: varchar('region_id', { length: 64 }).references(() => regions.id, {
      onDelete: 'set null',
    }),
    gisLayerId: varchar('gis_layer_id', { length: 64 }).references(() => gisLayers.id, {
      onDelete: 'set null',
    }),
    tags: jsonb('tags')
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    sampleFlag: boolean('sample_flag').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('dataset_metadata_evidence_idx').on(table.evidenceId),
    index('dataset_metadata_type_idx').on(table.datasetType),
    index('dataset_metadata_format_idx').on(table.technicalFormat),
    index('dataset_metadata_access_idx').on(table.accessLevel),
    index('dataset_metadata_frequency_idx').on(table.updateFrequency),
    index('dataset_metadata_region_idx').on(table.regionId),
    index('dataset_metadata_gis_idx').on(table.gisLayerId),
  ],
);

/**
 * Relational Graph Definitions (Drizzle ORM Relations)
 */
export const sourcesRelations = relations(sources, ({ many }) => ({
  policies: many(policies),
  gisLayers: many(gisLayers),
  evidenceItems: many(evidenceItems),
}));

export const regionsRelations = relations(regions, ({ many }) => ({
  policies: many(policies),
  gisLayers: many(gisLayers),
  projects: many(projects),
}));

export const workspacesRelations = relations(workspaces, ({ many }) => ({
  projects: many(projects),
  memberships: many(workspaceMemberships),
}));

export const policiesRelations = relations(policies, ({ one, many }) => ({
  region: one(regions, {
    fields: [policies.regionId],
    references: [regions.id],
  }),
  source: one(sources, {
    fields: [policies.sourceId],
    references: [sources.id],
  }),
  indicators: many(indicators),
  innovationOpportunities: many(innovationOpportunities),
  evidenceItems: many(evidenceItems),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  region: one(regions, {
    fields: [projects.regionId],
    references: [regions.id],
  }),
  workspace: one(workspaces, {
    fields: [projects.workspaceId],
    references: [workspaces.id],
  }),
  blueCarbonProject: one(blueCarbonProjects, {
    fields: [projects.id],
    references: [blueCarbonProjects.projectId],
  }),
  disputes: many(disputes),
  innovationOpportunities: many(innovationOpportunities),
  evidenceItems: many(evidenceItems),
}));

export const blueCarbonProjectsRelations = relations(blueCarbonProjects, ({ one, many }) => ({
  project: one(projects, {
    fields: [blueCarbonProjects.projectId],
    references: [projects.id],
  }),
  mrvRecords: many(mrvRecords),
}));

export const mrvRecordsRelations = relations(mrvRecords, ({ one, many }) => ({
  blueCarbonProject: one(blueCarbonProjects, {
    fields: [mrvRecords.blueCarbonProjectId],
    references: [blueCarbonProjects.id],
  }),
  verificationRecords: many(verificationRecords),
}));

export const verificationRecordsRelations = relations(verificationRecords, ({ one }) => ({
  mrvRecord: one(mrvRecords, {
    fields: [verificationRecords.mrvId],
    references: [mrvRecords.id],
  }),
  integrityRecord: one(integrityRecords, {
    fields: [verificationRecords.id],
    references: [integrityRecords.verificationId],
  }),
}));

export const evidenceItemsRelations = relations(evidenceItems, ({ one, many }) => ({
  source: one(sources, {
    fields: [evidenceItems.sourceId],
    references: [sources.id],
  }),
  project: one(projects, {
    fields: [evidenceItems.projectId],
    references: [projects.id],
  }),
  policy: one(policies, {
    fields: [evidenceItems.policyId],
    references: [policies.id],
  }),
  outgoingRelationships: many(evidenceRelationships, {
    relationName: 'sourceEvidence',
  }),
  incomingRelationships: many(evidenceRelationships, {
    relationName: 'targetEvidence',
  }),
  attachments: many(evidenceAttachments),
  datasetMetadata: one(datasetMetadata),
}));

export const datasetMetadataRelations = relations(datasetMetadata, ({ one }) => ({
  evidenceItem: one(evidenceItems, {
    fields: [datasetMetadata.evidenceId],
    references: [evidenceItems.id],
  }),
  region: one(regions, {
    fields: [datasetMetadata.regionId],
    references: [regions.id],
  }),
  gisLayer: one(gisLayers, {
    fields: [datasetMetadata.gisLayerId],
    references: [gisLayers.id],
  }),
}));

export const evidenceAttachmentsRelations = relations(evidenceAttachments, ({ one }) => ({
  evidenceItem: one(evidenceItems, {
    fields: [evidenceAttachments.evidenceId],
    references: [evidenceItems.id],
  }),
}));

export const evidenceRelationshipsRelations = relations(evidenceRelationships, ({ one }) => ({
  sourceEvidence: one(evidenceItems, {
    fields: [evidenceRelationships.sourceEvidenceId],
    references: [evidenceItems.id],
    relationName: 'sourceEvidence',
  }),
  targetEvidence: one(evidenceItems, {
    fields: [evidenceRelationships.targetEvidenceId],
    references: [evidenceItems.id],
    relationName: 'targetEvidence',
  }),
}));

export const indicatorsRelations = relations(indicators, ({ one }) => ({
  policy: one(policies, {
    fields: [indicators.policyId],
    references: [policies.id],
  }),
}));

export const gisLayersRelations = relations(gisLayers, ({ one }) => ({
  region: one(regions, {
    fields: [gisLayers.regionId],
    references: [regions.id],
  }),
  source: one(sources, {
    fields: [gisLayers.sourceId],
    references: [sources.id],
  }),
}));

export const innovationOpportunitiesRelations = relations(innovationOpportunities, ({ one }) => ({
  project: one(projects, {
    fields: [innovationOpportunities.projectId],
    references: [projects.id],
  }),
  policy: one(policies, {
    fields: [innovationOpportunities.policyId],
    references: [policies.id],
  }),
}));

export const disputesRelations = relations(disputes, ({ one }) => ({
  project: one(projects, {
    fields: [disputes.projectId],
    references: [projects.id],
  }),
}));

export const integrityRecordsRelations = relations(integrityRecords, ({ one }) => ({
  verificationRecord: one(verificationRecords, {
    fields: [integrityRecords.verificationId],
    references: [verificationRecords.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  workspaceMemberships: many(workspaceMemberships),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const workspaceMembershipsRelations = relations(workspaceMemberships, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [workspaceMemberships.workspaceId],
    references: [workspaces.id],
  }),
  user: one(users, {
    fields: [workspaceMemberships.userId],
    references: [users.id],
  }),
}));

/**
 * Type Inference Exports
 */
export type SourceRow = typeof sources.$inferSelect;
export type InsertSourceRow = typeof sources.$inferInsert;

export type RegionRow = typeof regions.$inferSelect;
export type InsertRegionRow = typeof regions.$inferInsert;

export type WorkspaceRow = typeof workspaces.$inferSelect;
export type InsertWorkspaceRow = typeof workspaces.$inferInsert;

export type PolicyRow = typeof policies.$inferSelect;
export type InsertPolicyRow = typeof policies.$inferInsert;

export type IndicatorRow = typeof indicators.$inferSelect;
export type InsertIndicatorRow = typeof indicators.$inferInsert;

export type GisLayerRow = typeof gisLayers.$inferSelect;
export type InsertGisLayerRow = typeof gisLayers.$inferInsert;

export type ProjectRow = typeof projects.$inferSelect;
export type InsertProjectRow = typeof projects.$inferInsert;

export type InnovationOpportunityRow = typeof innovationOpportunities.$inferSelect;
export type InsertInnovationOpportunityRow = typeof innovationOpportunities.$inferInsert;

export type BlueCarbonProjectRow = typeof blueCarbonProjects.$inferSelect;
export type InsertBlueCarbonProjectRow = typeof blueCarbonProjects.$inferInsert;

export type MrvRecordRow = typeof mrvRecords.$inferSelect;
export type InsertMrvRecordRow = typeof mrvRecords.$inferInsert;

export type VerificationRecordRow = typeof verificationRecords.$inferSelect;
export type InsertVerificationRecordRow = typeof verificationRecords.$inferInsert;

export type IntegrityRecordRow = typeof integrityRecords.$inferSelect;
export type InsertIntegrityRecordRow = typeof integrityRecords.$inferInsert;

export type DisputeRow = typeof disputes.$inferSelect;
export type InsertDisputeRow = typeof disputes.$inferInsert;

export type EvidenceItemRow = typeof evidenceItems.$inferSelect;
export type InsertEvidenceItemRow = typeof evidenceItems.$inferInsert;

export type EvidenceRelationshipRow = typeof evidenceRelationships.$inferSelect;
export type InsertEvidenceRelationshipRow = typeof evidenceRelationships.$inferInsert;

export type UserRow = typeof users.$inferSelect;
export type InsertUserRow = typeof users.$inferInsert;

export type SessionRow = typeof sessions.$inferSelect;
export type InsertSessionRow = typeof sessions.$inferInsert;

export type AuditEventRow = typeof auditEvents.$inferSelect;
export type InsertAuditEventRow = typeof auditEvents.$inferInsert;

export type WorkspaceMembershipRow = typeof workspaceMemberships.$inferSelect;
export type InsertWorkspaceMembershipRow = typeof workspaceMemberships.$inferInsert;

export type EvidenceAttachmentRow = typeof evidenceAttachments.$inferSelect;
export type InsertEvidenceAttachmentRow = typeof evidenceAttachments.$inferInsert;

export type DatasetMetadataRow = typeof datasetMetadata.$inferSelect;
export type InsertDatasetMetadataRow = typeof datasetMetadata.$inferInsert;
