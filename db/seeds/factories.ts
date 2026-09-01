import type {
  InsertSourceRow,
  InsertRegionRow,
  InsertWorkspaceRow,
  InsertPolicyRow,
  InsertIndicatorRow,
  InsertGisLayerRow,
  InsertProjectRow,
  InsertInnovationOpportunityRow,
  InsertBlueCarbonProjectRow,
  InsertMrvRecordRow,
  InsertVerificationRecordRow,
  InsertIntegrityRecordRow,
  InsertDisputeRow,
  InsertEvidenceItemRow,
  InsertEvidenceRelationshipRow,
  InsertUserRow,
  InsertWorkspaceMembershipRow,
  InsertEvidenceAttachmentRow,
} from '../src/schema.js';

export function createSource(
  overrides: Partial<InsertSourceRow> & {
    id: string;
    title: string;
    sourceType: InsertSourceRow['sourceType'];
  },
): InsertSourceRow {
  return {
    publisher: 'National Land Authority',
    sampleFlag: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

export function createRegion(
  overrides: Partial<InsertRegionRow> & {
    id: string;
    code: string;
    name: string;
    level: InsertRegionRow['level'];
  },
): InsertRegionRow {
  return {
    sampleFlag: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

export function createWorkspace(
  overrides: Partial<InsertWorkspaceRow> & { id: string; name: string; ownerId: string },
): InsertWorkspaceRow {
  return {
    visibility: 'INTERNAL',
    ownerType: 'INSTITUTION',
    sampleFlag: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

export function createPolicy(
  overrides: Partial<InsertPolicyRow> & { id: string; code: string; title: string },
): InsertPolicyRow {
  return {
    lifecycleStatus: 'PUBLISHED',
    visibility: 'PUBLIC',
    sampleFlag: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

export function createIndicator(
  overrides: Partial<InsertIndicatorRow> & {
    id: string;
    code: string;
    name: string;
    unit: string;
    category: string;
  },
): InsertIndicatorRow {
  return {
    sampleFlag: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

export function createGisLayer(
  overrides: Partial<InsertGisLayerRow> & {
    id: string;
    name: string;
    layerType: string;
    regionId: string;
  },
): InsertGisLayerRow {
  return {
    visibility: 'PUBLIC',
    status: 'PUBLISHED',
    sampleFlag: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

export function createProject(
  overrides: Partial<InsertProjectRow> & {
    id: string;
    code: string;
    name: string;
    regionId: string;
  },
): InsertProjectRow {
  return {
    lifecycleStatus: 'PUBLISHED',
    visibility: 'PUBLIC',
    sampleFlag: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

export function createInnovationOpportunity(
  overrides: Partial<InsertInnovationOpportunityRow> & {
    id: string;
    title: string;
    summary: string;
    projectId: string;
  },
): InsertInnovationOpportunityRow {
  return {
    status: 'IN_REVIEW',
    sampleFlag: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

export function createBlueCarbonProject(
  overrides: Partial<InsertBlueCarbonProjectRow> & {
    id: string;
    projectId: string;
    ecosystemType: string;
    estimatedHectares: string;
  },
): InsertBlueCarbonProjectRow {
  return {
    sampleFlag: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

export function createMrvRecord(
  overrides: Partial<InsertMrvRecordRow> & {
    id: string;
    blueCarbonProjectId: string;
    reportingPeriodStart: Date;
    reportingPeriodEnd: Date;
    estimatedSequestrationTonnes: string;
  },
): InsertMrvRecordRow {
  return {
    status: 'VERIFIED',
    sampleFlag: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

export function createVerificationRecord(
  overrides: Partial<InsertVerificationRecordRow> & {
    id: string;
    mrvId: string;
    verifierIdentity: string;
    methodology: string;
  },
): InsertVerificationRecordRow {
  return {
    verificationStatus: 'VERIFIED',
    verifiedAt: new Date('2026-01-15T00:00:00.000Z'),
    sampleFlag: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

export function createIntegrityRecord(
  overrides: Partial<InsertIntegrityRecordRow> & {
    id: string;
    verificationId: string;
    checksum: string;
  },
): InsertIntegrityRecordRow {
  return {
    algorithm: 'SHA-256',
    integrityStatus: 'VERIFIED',
    recordedAt: new Date('2026-02-01T00:00:00.000Z'),
    sampleFlag: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

export function createDispute(
  overrides: Partial<InsertDisputeRow> & {
    id: string;
    title: string;
    description: string;
    projectId: string;
  },
): InsertDisputeRow {
  return {
    lifecycleStatus: 'IN_REVIEW',
    visibility: 'INTERNAL',
    sampleFlag: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

export function createEvidenceItem(
  overrides: Partial<InsertEvidenceItemRow> & {
    id: string;
    title: string;
    category: string;
    sourceId: string;
  },
): InsertEvidenceItemRow {
  return {
    lifecycleStatus: 'PUBLISHED',
    integrityStatus: 'VERIFIED',
    visibility: 'PUBLIC',
    sampleFlag: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

export function createEvidenceRelationship(overrides: {
  id: string;
  sourceEvidenceId: string;
  targetEvidenceId: string;
  relationshipType: InsertEvidenceRelationshipRow['relationshipType'];
}): InsertEvidenceRelationshipRow {
  return {
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

export function createUser(
  overrides: Partial<InsertUserRow> & {
    id: string;
    email: string;
    name: string;
    role: InsertUserRow['role'];
    passwordHash: string;
  },
): InsertUserRow {
  return {
    status: 'ACTIVE',
    sampleFlag: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

export function createWorkspaceMembership(
  overrides: Partial<InsertWorkspaceMembershipRow> & {
    id: string;
    workspaceId: string;
    userId: string;
    role: InsertWorkspaceMembershipRow['role'];
  },
): InsertWorkspaceMembershipRow {
  return {
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

export function createEvidenceAttachment(
  overrides: Partial<InsertEvidenceAttachmentRow> & {
    id: string;
    evidenceId: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    storageKey: string;
  },
): InsertEvidenceAttachmentRow {
  return {
    sampleFlag: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}
