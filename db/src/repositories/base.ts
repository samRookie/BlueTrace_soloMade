import { sql } from 'drizzle-orm';
import { db, type AppDatabase } from '../client.js';
import * as schema from '../schema.js';

export interface DatabaseHealthStatus {
  connected: boolean;
  timestamp: string;
  error?: string;
}

export interface EntityCounts {
  sources: number;
  regions: number;
  workspaces: number;
  policies: number;
  indicators: number;
  gisLayers: number;
  projects: number;
  innovationOpportunities: number;
  blueCarbonProjects: number;
  mrvRecords: number;
  verificationRecords: number;
  integrityRecords: number;
  disputes: number;
  evidenceItems: number;
  evidenceRelationships: number;
  users: number;
  sessions: number;
  auditEvents: number;
  workspaceMemberships: number;
  evidenceAttachments: number;
  datasetMetadata: number;
}

/**
 * Checks connectivity to the PostgreSQL instance.
 */
export async function checkDatabaseHealth(
  database: AppDatabase = db,
): Promise<DatabaseHealthStatus> {
  try {
    await database.execute(sql`SELECT 1 as ping`);
    return {
      connected: true,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      connected: false,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Database unreachable',
    };
  }
}

/**
 * Runs a callback inside a PostgreSQL database transaction.
 */
export async function withTransaction<T>(
  callback: (tx: Parameters<Parameters<AppDatabase['transaction']>[0]>[0]) => Promise<T>,
  database: AppDatabase = db,
): Promise<T> {
  return database.transaction(callback);
}

/**
 * Retrieves row counts for all core domain tables.
 */
export async function getEntityCounts(database: AppDatabase = db): Promise<EntityCounts> {
  const [
    sourcesCount,
    regionsCount,
    workspacesCount,
    policiesCount,
    indicatorsCount,
    gisLayersCount,
    projectsCount,
    innovationOpportunitiesCount,
    blueCarbonProjectsCount,
    mrvRecordsCount,
    verificationRecordsCount,
    integrityRecordsCount,
    disputesCount,
    evidenceItemsCount,
    evidenceRelationshipsCount,
    usersCount,
    sessionsCount,
    auditEventsCount,
    workspaceMembershipsCount,
    evidenceAttachmentsCount,
    datasetMetadataCount,
  ] = await Promise.all([
    database.select({ count: sql<number>`cast(count(*) as integer)` }).from(schema.sources),
    database.select({ count: sql<number>`cast(count(*) as integer)` }).from(schema.regions),
    database.select({ count: sql<number>`cast(count(*) as integer)` }).from(schema.workspaces),
    database.select({ count: sql<number>`cast(count(*) as integer)` }).from(schema.policies),
    database.select({ count: sql<number>`cast(count(*) as integer)` }).from(schema.indicators),
    database.select({ count: sql<number>`cast(count(*) as integer)` }).from(schema.gisLayers),
    database.select({ count: sql<number>`cast(count(*) as integer)` }).from(schema.projects),
    database
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(schema.innovationOpportunities),
    database
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(schema.blueCarbonProjects),
    database.select({ count: sql<number>`cast(count(*) as integer)` }).from(schema.mrvRecords),
    database
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(schema.verificationRecords),
    database
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(schema.integrityRecords),
    database.select({ count: sql<number>`cast(count(*) as integer)` }).from(schema.disputes),
    database.select({ count: sql<number>`cast(count(*) as integer)` }).from(schema.evidenceItems),
    database
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(schema.evidenceRelationships),
    database.select({ count: sql<number>`cast(count(*) as integer)` }).from(schema.users),
    database.select({ count: sql<number>`cast(count(*) as integer)` }).from(schema.sessions),
    database.select({ count: sql<number>`cast(count(*) as integer)` }).from(schema.auditEvents),
    database
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(schema.workspaceMemberships),
    database
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(schema.evidenceAttachments),
    database.select({ count: sql<number>`cast(count(*) as integer)` }).from(schema.datasetMetadata),
  ]);

  return {
    sources: sourcesCount[0]?.count ?? 0,
    regions: regionsCount[0]?.count ?? 0,
    workspaces: workspacesCount[0]?.count ?? 0,
    policies: policiesCount[0]?.count ?? 0,
    indicators: indicatorsCount[0]?.count ?? 0,
    gisLayers: gisLayersCount[0]?.count ?? 0,
    projects: projectsCount[0]?.count ?? 0,
    innovationOpportunities: innovationOpportunitiesCount[0]?.count ?? 0,
    blueCarbonProjects: blueCarbonProjectsCount[0]?.count ?? 0,
    mrvRecords: mrvRecordsCount[0]?.count ?? 0,
    verificationRecords: verificationRecordsCount[0]?.count ?? 0,
    integrityRecords: integrityRecordsCount[0]?.count ?? 0,
    disputes: disputesCount[0]?.count ?? 0,
    evidenceItems: evidenceItemsCount[0]?.count ?? 0,
    evidenceRelationships: evidenceRelationshipsCount[0]?.count ?? 0,
    users: usersCount[0]?.count ?? 0,
    sessions: sessionsCount[0]?.count ?? 0,
    auditEvents: auditEventsCount[0]?.count ?? 0,
    workspaceMemberships: workspaceMembershipsCount[0]?.count ?? 0,
    evidenceAttachments: evidenceAttachmentsCount[0]?.count ?? 0,
    datasetMetadata: datasetMetadataCount[0]?.count ?? 0,
  };
}
