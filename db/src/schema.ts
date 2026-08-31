import {
  pgTable,
  varchar,
  text,
  boolean,
  timestamp,
  numeric,
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
  (table) => [
    index('indicators_policy_idx').on(table.policyId),
    index('indicators_category_idx').on(table.category),
  ],
);

/**
 * 6. GIS Layers Metadata Table
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
    status: varchar('status', { length: 32 })
      .$type<LifecycleStatus>()
      .notNull()
      .default('PUBLISHED'),
    sampleFlag: boolean('sample_flag').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('gis_layers_region_idx').on(table.regionId)],
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
      onDelete: 'set null',
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
    status: varchar('status', { length: 32 }).$type<LifecycleStatus>().notNull().default('DRAFT'),
    sampleFlag: boolean('sample_flag').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('innovation_project_idx').on(table.projectId),
    index('innovation_policy_idx').on(table.policyId),
  ],
);

/**
 * 9. Blue Carbon Projects Table
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
  (table) => [index('blue_carbon_project_idx').on(table.projectId)],
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
    status: varchar('status', { length: 32 }).$type<LifecycleStatus>().notNull().default('DRAFT'),
    sampleFlag: boolean('sample_flag').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('mrv_blue_carbon_idx').on(table.blueCarbonProjectId),
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
    index('verification_mrv_idx').on(table.mrvId),
    index('verification_status_idx').on(table.verificationStatus),
  ],
);

/**
 * 12. Integrity Records Table
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
  (table) => [index('integrity_verification_idx').on(table.verificationId)],
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
 * 15. Evidence Relationships Table
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
    check('evidence_rel_no_self_loop', sql`${table.sourceEvidenceId} <> ${table.targetEvidenceId}`),
  ],
);

/**
 * Drizzle Relations Definitions for Graph Traversal
 */
export const regionsRelations = relations(regions, ({ many, one }) => ({
  gisLayers: many(gisLayers),
  policies: many(policies),
  projects: many(projects),
  parent: one(regions, {
    fields: [regions.parentCode],
    references: [regions.code],
  }),
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
  evidenceItems: many(evidenceItems),
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
  outgoingRelationships: many(evidenceRelationships, { relationName: 'sourceRelations' }),
  incomingRelationships: many(evidenceRelationships, { relationName: 'targetRelations' }),
}));

export const evidenceRelationshipsRelations = relations(evidenceRelationships, ({ one }) => ({
  sourceEvidence: one(evidenceItems, {
    fields: [evidenceRelationships.sourceEvidenceId],
    references: [evidenceItems.id],
    relationName: 'sourceRelations',
  }),
  targetEvidence: one(evidenceItems, {
    fields: [evidenceRelationships.targetEvidenceId],
    references: [evidenceItems.id],
    relationName: 'targetRelations',
  }),
}));

export const sourcesRelations = relations(sources, ({ many }) => ({
  policies: many(policies),
  gisLayers: many(gisLayers),
  evidenceItems: many(evidenceItems),
}));

export const workspacesRelations = relations(workspaces, ({ many }) => ({
  projects: many(projects),
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
