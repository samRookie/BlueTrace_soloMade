import { db, pool, type AppDatabase } from '../src/client.js';
import * as schema from '../src/schema.js';
import { coastalMangroveSeedData } from './coastal-mangrove.js';

/**
 * Seeds the database with deterministic sample records in strict dependency order.
 * Safe and idempotent for multiple executions.
 */
export async function seedDatabase(database: AppDatabase = db): Promise<void> {
  console.log('[Seed Engine] Starting deterministic seed execution...');

  // 1. Sources
  for (const item of coastalMangroveSeedData.sources) {
    await database
      .insert(schema.sources)
      .values(item)
      .onConflictDoUpdate({
        target: schema.sources.id,
        set: {
          title: item.title,
          sourceType: item.sourceType,
          publisher: item.publisher,
          uri: item.uri,
          attribution: item.attribution,
          obtainedAt: item.obtainedAt,
          sampleFlag: item.sampleFlag,
          updatedAt: new Date(),
        },
      });
  }
  console.log(`[Seed Engine] Seeded ${coastalMangroveSeedData.sources.length} sources.`);

  // 2. Regions
  for (const item of coastalMangroveSeedData.regions) {
    await database
      .insert(schema.regions)
      .values(item)
      .onConflictDoUpdate({
        target: schema.regions.id,
        set: {
          code: item.code,
          name: item.name,
          level: item.level,
          parentCode: item.parentCode,
          sampleFlag: item.sampleFlag,
          updatedAt: new Date(),
        },
      });
  }
  console.log(`[Seed Engine] Seeded ${coastalMangroveSeedData.regions.length} regions.`);

  // 3. Workspaces
  for (const item of coastalMangroveSeedData.workspaces) {
    await database
      .insert(schema.workspaces)
      .values(item)
      .onConflictDoUpdate({
        target: schema.workspaces.id,
        set: {
          name: item.name,
          description: item.description,
          visibility: item.visibility,
          ownerId: item.ownerId,
          ownerType: item.ownerType,
          sampleFlag: item.sampleFlag,
          updatedAt: new Date(),
        },
      });
  }
  console.log(`[Seed Engine] Seeded ${coastalMangroveSeedData.workspaces.length} workspaces.`);

  // 4. Policies
  for (const item of coastalMangroveSeedData.policies) {
    await database
      .insert(schema.policies)
      .values(item)
      .onConflictDoUpdate({
        target: schema.policies.id,
        set: {
          code: item.code,
          title: item.title,
          description: item.description,
          lifecycleStatus: item.lifecycleStatus,
          visibility: item.visibility,
          regionId: item.regionId,
          sourceId: item.sourceId,
          sampleFlag: item.sampleFlag,
          updatedAt: new Date(),
        },
      });
  }
  console.log(`[Seed Engine] Seeded ${coastalMangroveSeedData.policies.length} policies.`);

  // 5. Indicators
  for (const item of coastalMangroveSeedData.indicators) {
    await database
      .insert(schema.indicators)
      .values(item)
      .onConflictDoUpdate({
        target: schema.indicators.id,
        set: {
          code: item.code,
          name: item.name,
          category: item.category,
          unit: item.unit,
          policyId: item.policyId,
          sampleFlag: item.sampleFlag,
          updatedAt: new Date(),
        },
      });
  }
  console.log(`[Seed Engine] Seeded ${coastalMangroveSeedData.indicators.length} indicators.`);

  // 6. GIS Layers
  for (const item of coastalMangroveSeedData.gisLayers) {
    await database
      .insert(schema.gisLayers)
      .values(item)
      .onConflictDoUpdate({
        target: schema.gisLayers.id,
        set: {
          name: item.name,
          layerType: item.layerType,
          regionId: item.regionId,
          sourceId: item.sourceId,
          visibility: item.visibility,
          status: item.status,
          sampleFlag: item.sampleFlag,
          updatedAt: new Date(),
        },
      });
  }
  console.log(`[Seed Engine] Seeded ${coastalMangroveSeedData.gisLayers.length} GIS layers.`);

  // 7. Projects
  for (const item of coastalMangroveSeedData.projects) {
    await database
      .insert(schema.projects)
      .values(item)
      .onConflictDoUpdate({
        target: schema.projects.id,
        set: {
          code: item.code,
          name: item.name,
          description: item.description,
          regionId: item.regionId,
          workspaceId: item.workspaceId,
          lifecycleStatus: item.lifecycleStatus,
          visibility: item.visibility,
          sampleFlag: item.sampleFlag,
          updatedAt: new Date(),
        },
      });
  }
  console.log(`[Seed Engine] Seeded ${coastalMangroveSeedData.projects.length} projects.`);

  // 8. Innovation Opportunities
  for (const item of coastalMangroveSeedData.innovationOpportunities) {
    await database
      .insert(schema.innovationOpportunities)
      .values(item)
      .onConflictDoUpdate({
        target: schema.innovationOpportunities.id,
        set: {
          title: item.title,
          summary: item.summary,
          projectId: item.projectId,
          policyId: item.policyId,
          status: item.status,
          sampleFlag: item.sampleFlag,
          updatedAt: new Date(),
        },
      });
  }
  console.log(
    `[Seed Engine] Seeded ${coastalMangroveSeedData.innovationOpportunities.length} innovation opportunities.`,
  );

  // 9. Blue Carbon Projects
  for (const item of coastalMangroveSeedData.blueCarbonProjects) {
    await database
      .insert(schema.blueCarbonProjects)
      .values(item)
      .onConflictDoUpdate({
        target: schema.blueCarbonProjects.id,
        set: {
          projectId: item.projectId,
          ecosystemType: item.ecosystemType,
          estimatedHectares: item.estimatedHectares,
          targetCo2SequesterTpy: item.targetCo2SequesterTpy,
          sampleFlag: item.sampleFlag,
          updatedAt: new Date(),
        },
      });
  }
  console.log(
    `[Seed Engine] Seeded ${coastalMangroveSeedData.blueCarbonProjects.length} Blue Carbon projects.`,
  );

  // 10. MRV Records
  for (const item of coastalMangroveSeedData.mrvRecords) {
    await database
      .insert(schema.mrvRecords)
      .values(item)
      .onConflictDoUpdate({
        target: schema.mrvRecords.id,
        set: {
          blueCarbonProjectId: item.blueCarbonProjectId,
          reportingPeriodStart: item.reportingPeriodStart,
          reportingPeriodEnd: item.reportingPeriodEnd,
          measuredBiomassDensity: item.measuredBiomassDensity,
          estimatedSequestrationTonnes: item.estimatedSequestrationTonnes,
          status: item.status,
          sampleFlag: item.sampleFlag,
          updatedAt: new Date(),
        },
      });
  }
  console.log(`[Seed Engine] Seeded ${coastalMangroveSeedData.mrvRecords.length} MRV records.`);

  // 11. Verification Records
  for (const item of coastalMangroveSeedData.verificationRecords) {
    await database
      .insert(schema.verificationRecords)
      .values(item)
      .onConflictDoUpdate({
        target: schema.verificationRecords.id,
        set: {
          mrvId: item.mrvId,
          verifierIdentity: item.verifierIdentity,
          verificationStatus: item.verificationStatus,
          verifiedAt: item.verifiedAt,
          methodology: item.methodology,
          sampleFlag: item.sampleFlag,
          updatedAt: new Date(),
        },
      });
  }
  console.log(
    `[Seed Engine] Seeded ${coastalMangroveSeedData.verificationRecords.length} verification records.`,
  );

  // 12. Integrity Records
  for (const item of coastalMangroveSeedData.integrityRecords) {
    await database
      .insert(schema.integrityRecords)
      .values(item)
      .onConflictDoUpdate({
        target: schema.integrityRecords.id,
        set: {
          verificationId: item.verificationId,
          checksum: item.checksum,
          algorithm: item.algorithm,
          integrityStatus: item.integrityStatus,
          recordedAt: item.recordedAt,
          sampleFlag: item.sampleFlag,
          updatedAt: new Date(),
        },
      });
  }
  console.log(
    `[Seed Engine] Seeded ${coastalMangroveSeedData.integrityRecords.length} integrity records.`,
  );

  // 13. Disputes
  for (const item of coastalMangroveSeedData.disputes) {
    await database
      .insert(schema.disputes)
      .values(item)
      .onConflictDoUpdate({
        target: schema.disputes.id,
        set: {
          title: item.title,
          description: item.description,
          projectId: item.projectId,
          lifecycleStatus: item.lifecycleStatus,
          visibility: item.visibility,
          resolutionSummary: item.resolutionSummary,
          sampleFlag: item.sampleFlag,
          updatedAt: new Date(),
        },
      });
  }
  console.log(`[Seed Engine] Seeded ${coastalMangroveSeedData.disputes.length} disputes.`);

  // 14. Evidence Items
  for (const item of coastalMangroveSeedData.evidenceItems) {
    await database
      .insert(schema.evidenceItems)
      .values(item)
      .onConflictDoUpdate({
        target: schema.evidenceItems.id,
        set: {
          title: item.title,
          category: item.category,
          sourceId: item.sourceId,
          projectId: item.projectId,
          policyId: item.policyId,
          lifecycleStatus: item.lifecycleStatus,
          integrityStatus: item.integrityStatus,
          visibility: item.visibility,
          sampleFlag: item.sampleFlag,
          updatedAt: new Date(),
        },
      });
  }
  console.log(
    `[Seed Engine] Seeded ${coastalMangroveSeedData.evidenceItems.length} evidence items.`,
  );

  // 15. Evidence Relationships
  for (const item of coastalMangroveSeedData.evidenceRelationships) {
    await database
      .insert(schema.evidenceRelationships)
      .values(item)
      .onConflictDoUpdate({
        target: [
          schema.evidenceRelationships.sourceEvidenceId,
          schema.evidenceRelationships.targetEvidenceId,
          schema.evidenceRelationships.relationshipType,
        ],
        set: {
          createdAt: item.createdAt,
        },
      });
  }
  console.log(
    `[Seed Engine] Seeded ${coastalMangroveSeedData.evidenceRelationships.length} evidence relationships.`,
  );

  // 16. Users (Phase 4 Eight Personas)
  for (const item of coastalMangroveSeedData.users) {
    await database
      .insert(schema.users)
      .values(item)
      .onConflictDoUpdate({
        target: schema.users.id,
        set: {
          email: item.email,
          name: item.name,
          role: item.role,
          status: item.status,
          passwordHash: item.passwordHash,
          sampleFlag: item.sampleFlag,
          updatedAt: new Date(),
        },
      });
  }
  console.log(`[Seed Engine] Seeded ${coastalMangroveSeedData.users.length} users.`);

  // 17. Workspace Memberships
  for (const item of coastalMangroveSeedData.workspaceMemberships) {
    await database
      .insert(schema.workspaceMemberships)
      .values(item)
      .onConflictDoUpdate({
        target: [schema.workspaceMemberships.workspaceId, schema.workspaceMemberships.userId],
        set: {
          role: item.role,
        },
      });
  }
  console.log(
    `[Seed Engine] Seeded ${coastalMangroveSeedData.workspaceMemberships.length} workspace memberships.`,
  );

  console.log('[Seed Engine] Deterministic seed execution completed successfully.');
}

// When invoked directly via CLI (`tsx seeds/index.ts`)
if (process.argv[1] && process.argv[1].endsWith('seeds/index.ts')) {
  seedDatabase()
    .then(async () => {
      await pool.end();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('[Seed Engine Error]', err);
      await pool.end();
      process.exit(1);
    });
}
