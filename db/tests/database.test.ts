import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as schema from '../src/schema.js';
import { seedDatabase } from '../seeds/index.js';
import { getEntityCounts } from '../src/repositories/base.js';
import { eq } from 'drizzle-orm';

describe('Phase 2 PostgreSQL Evidence Graph & Persistence Layer', () => {
  let client: PGlite;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let testDb: any;

  beforeEach(async () => {
    // Spin up fresh in-memory PostgreSQL instance using PGlite
    client = new PGlite();
    testDb = drizzle(client, { schema });

    // Load and execute the generated SQL migration file
    const currentDir = path.dirname(fileURLToPath(import.meta.url));
    const migrationsFolder = path.resolve(currentDir, '../migrations');
    const migrationFiles = fs
      .readdirSync(migrationsFolder)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    for (const file of migrationFiles) {
      const sqlContent = fs.readFileSync(path.join(migrationsFolder, file), 'utf8');
      const statements = sqlContent
        .split('--> statement-breakpoint')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      for (const statement of statements) {
        await client.exec(statement);
      }
    }
  });

  afterEach(async () => {
    if (client) {
      await client.close();
    }
  });

  describe('Migration & Schema Creation', () => {
    it('creates all 15 relational tables with zero initial rows', async () => {
      const counts = await getEntityCounts(testDb);
      expect(counts.sources).toBe(0);
      expect(counts.regions).toBe(0);
      expect(counts.workspaces).toBe(0);
      expect(counts.policies).toBe(0);
      expect(counts.indicators).toBe(0);
      expect(counts.gisLayers).toBe(0);
      expect(counts.projects).toBe(0);
      expect(counts.innovationOpportunities).toBe(0);
      expect(counts.blueCarbonProjects).toBe(0);
      expect(counts.mrvRecords).toBe(0);
      expect(counts.verificationRecords).toBe(0);
      expect(counts.integrityRecords).toBe(0);
      expect(counts.disputes).toBe(0);
      expect(counts.evidenceItems).toBe(0);
      expect(counts.evidenceRelationships).toBe(0);
      expect(counts.evidenceAttachments).toBe(0);
      expect(counts.datasetMetadata).toBe(0);
    });
  });

  describe('Deterministic Seed & Idempotence', () => {
    it('seeds the coastal/mangrove demonstration dataset with expected record counts', async () => {
      await seedDatabase(testDb);
      const counts = await getEntityCounts(testDb);

      expect(counts.sources).toBe(5);
      expect(counts.regions).toBe(1);
      expect(counts.workspaces).toBe(1);
      expect(counts.policies).toBe(1);
      expect(counts.indicators).toBe(1);
      expect(counts.gisLayers).toBe(1);
      expect(counts.projects).toBe(1);
      expect(counts.innovationOpportunities).toBe(1);
      expect(counts.blueCarbonProjects).toBe(1);
      expect(counts.mrvRecords).toBe(1);
      expect(counts.verificationRecords).toBe(1);
      expect(counts.integrityRecords).toBe(1);
      expect(counts.disputes).toBe(1);
      expect(counts.evidenceItems).toBe(12);
      expect(counts.evidenceRelationships).toBe(7);
      expect(counts.evidenceAttachments).toBe(7);
      expect(counts.datasetMetadata).toBe(5);
    });

    it('is idempotent when seed is executed multiple times', async () => {
      await seedDatabase(testDb);
      const countsFirst = await getEntityCounts(testDb);

      // Re-run seed on same database
      await seedDatabase(testDb);
      const countsSecond = await getEntityCounts(testDb);

      expect(countsSecond).toEqual(countsFirst);
    });
  });

  describe('Foreign Key Constraints Enforcement', () => {
    it('rejects evidence item referencing nonexistent source_id', async () => {
      await expect(
        testDb.insert(schema.evidenceItems).values({
          id: 'TEST-EV-INVALID',
          title: 'Invalid Evidence',
          category: 'FIELD_SAMPLE',
          sourceId: 'NONEXISTENT-SOURCE',
          lifecycleStatus: 'DRAFT',
          integrityStatus: 'UNVERIFIED',
          visibility: 'PUBLIC',
          sampleFlag: true,
        }),
      ).rejects.toThrow();
    });

    it('rejects project referencing nonexistent region_id', async () => {
      await expect(
        testDb.insert(schema.projects).values({
          id: 'TEST-PROJ-INVALID',
          code: 'PROJ-INVALID',
          name: 'Invalid Project',
          regionId: 'NONEXISTENT-REGION',
          lifecycleStatus: 'DRAFT',
          visibility: 'PUBLIC',
          sampleFlag: true,
        }),
      ).rejects.toThrow();
    });

    it('rejects MRV record referencing nonexistent blue_carbon_project_id', async () => {
      await expect(
        testDb.insert(schema.mrvRecords).values({
          id: 'TEST-MRV-INVALID',
          blueCarbonProjectId: 'NONEXISTENT-BC-PROJECT',
          reportingPeriodStart: new Date('2025-01-01T00:00:00.000Z'),
          reportingPeriodEnd: new Date('2025-12-31T23:59:59.999Z'),
          estimatedSequestrationTonnes: '1000.00',
          status: 'DRAFT',
          sampleFlag: true,
        }),
      ).rejects.toThrow();
    });
  });

  describe('Check Constraints Enforcement', () => {
    it('rejects evidence relationship self-referential loop (source = target)', async () => {
      await seedDatabase(testDb);

      await expect(
        testDb.insert(schema.evidenceRelationships).values({
          id: 'TEST-REL-SELF-LOOP',
          sourceEvidenceId: 'SAMPLE-EV-001',
          targetEvidenceId: 'SAMPLE-EV-001',
          relationshipType: 'SUPPORTS',
        }),
      ).rejects.toThrow();
    });

    it('rejects MRV record with invalid date range (start > end)', async () => {
      await seedDatabase(testDb);

      await expect(
        testDb.insert(schema.mrvRecords).values({
          id: 'TEST-MRV-INVALID-DATES',
          blueCarbonProjectId: 'SAMPLE-BC-001',
          reportingPeriodStart: new Date('2026-01-01T00:00:00.000Z'),
          reportingPeriodEnd: new Date('2025-01-01T00:00:00.000Z'),
          estimatedSequestrationTonnes: '500.00',
          status: 'DRAFT',
          sampleFlag: true,
        }),
      ).rejects.toThrow();
    });
  });

  describe('Relational Graph Traversal', () => {
    it('successfully traverses Region -> Project -> Blue Carbon -> MRV -> Verification -> Integrity', async () => {
      await seedDatabase(testDb);

      const region = await testDb.query.regions.findFirst({
        where: eq(schema.regions.id, 'SAMPLE-REG-KR-001'),
        with: {
          projects: true,
          policies: true,
          gisLayers: true,
        },
      });

      expect(region).toBeDefined();
      expect(region?.name).toBe('Coringa Mangrove Estuarine Zone');
      expect(region?.projects.length).toBe(1);
      expect(region?.policies.length).toBe(1);
      expect(region?.gisLayers.length).toBe(1);

      const projectWithGraph = await testDb.query.projects.findFirst({
        where: eq(schema.projects.id, 'SAMPLE-PROJ-001'),
        with: {
          region: true,
          blueCarbonProject: {
            with: {
              mrvRecords: {
                with: {
                  verificationRecords: {
                    with: {
                      integrityRecord: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      expect(projectWithGraph).toBeDefined();
      expect(projectWithGraph?.code).toBe('PROJ-CORINGA-BC-01');
      expect(projectWithGraph?.region.code).toBe('IN-AP-CORINGA');

      const bcProject = projectWithGraph?.blueCarbonProject;
      expect(bcProject?.ecosystemType).toBe('MANGROVE');

      const mrv = bcProject?.mrvRecords[0];
      expect(Number(mrv?.estimatedSequestrationTonnes)).toBe(62500);

      const verification = mrv?.verificationRecords[0];
      expect(verification?.verifierIdentity).toBe('National Coastal Research Consortium');
      expect(verification?.verificationStatus).toBe('VERIFIED');

      const integrity = verification?.integrityRecord;
      expect(integrity?.algorithm).toBe('SHA-256');
      expect(integrity?.integrityStatus).toBe('VERIFIED');
    });

    it('successfully traverses Policy -> Indicators and Evidence Relationships', async () => {
      await seedDatabase(testDb);

      const policyWithIndicators = await testDb.query.policies.findFirst({
        where: eq(schema.policies.id, 'SAMPLE-POL-001'),
        with: {
          indicators: true,
          region: true,
        },
      });

      expect(policyWithIndicators?.code).toBe('POL-MANGROVE-2024');
      expect(policyWithIndicators?.indicators[0]?.code).toBe('IND-CANOPY-DENSITY-01');
      expect(policyWithIndicators?.region?.code).toBe('IN-AP-CORINGA');

      const evidenceItem = await testDb.query.evidenceItems.findFirst({
        where: eq(schema.evidenceItems.id, 'SAMPLE-EV-002'),
        with: {
          outgoingRelationships: {
            with: {
              targetEvidence: true,
            },
          },
        },
      });

      expect(evidenceItem).toBeDefined();
      expect(evidenceItem?.outgoingRelationships[0]?.relationshipType).toBe('CORROBORATES');
      expect(evidenceItem?.outgoingRelationships[0]?.targetEvidence.id).toBe('SAMPLE-EV-001');
    });
  });
});
