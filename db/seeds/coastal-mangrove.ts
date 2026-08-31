import {
  createSource,
  createRegion,
  createWorkspace,
  createPolicy,
  createIndicator,
  createGisLayer,
  createProject,
  createInnovationOpportunity,
  createBlueCarbonProject,
  createMrvRecord,
  createVerificationRecord,
  createIntegrityRecord,
  createDispute,
  createEvidenceItem,
  createEvidenceRelationship,
  createUser,
  createWorkspaceMembership,
} from './factories.js';

const DEMO_PASSWORD_HASH =
  'scrypt$a1b2c3d4e5f60718293a4b5c6d7e8f90$438c062e91bacdab8078a85985cc028a14f8535572f1a7d6bfa22e0f10afa5823033937a364bb3d1ad7c1b864dda98228d4efeaf89fbb89268a5d6bf4745971f';

export const coastalMangroveSeedData = {
  sources: [
    createSource({
      id: 'SAMPLE-SRC-001',
      title: 'National Coastal Zone Baseline Survey 2024',
      sourceType: 'GOVERNMENT_RECORD',
      publisher: 'Ministry of Environment, Forest and Climate Change',
      uri: 'https://example.gov.in/surveys/coastal-mangrove-2024',
      attribution: 'Government of India - National Coastal Zone Survey',
      obtainedAt: new Date('2024-06-15T00:00:00.000Z'),
    }),
    createSource({
      id: 'SAMPLE-SRC-002',
      title: 'Sentinel-2 Coastal Mangrove Biomass Index',
      sourceType: 'SATELLITE_OBSERVATION',
      publisher: 'Space Applications Centre',
      uri: 'https://example.gov.in/satellite/sentinel-mangrove-2025',
      attribution: 'ISRO Earth Observation System',
      obtainedAt: new Date('2025-03-01T00:00:00.000Z'),
    }),
  ],

  regions: [
    createRegion({
      id: 'SAMPLE-REG-KR-001',
      code: 'IN-AP-CORINGA',
      name: 'Coringa Mangrove Estuarine Zone',
      level: 'DISTRICT',
      parentCode: undefined,
    }),
  ],

  workspaces: [
    createWorkspace({
      id: 'SAMPLE-WS-001',
      name: 'Coringa Blue Carbon Policy & Governance Pilot Workspace',
      description:
        'Collaborative governance and policy workspace for mangrove estuarine land restoration.',
      ownerId: 'INST-MOEFCC-01',
      ownerType: 'INSTITUTION',
      visibility: 'INTERNAL',
    }),
  ],

  policies: [
    createPolicy({
      id: 'SAMPLE-POL-001',
      code: 'POL-MANGROVE-2024',
      title: 'National Coastal Mangrove Restoration Guidelines 2024',
      description:
        'Policy framework defining conservation covenants, biomass retention standards, and local community benefits.',
      lifecycleStatus: 'PUBLISHED',
      visibility: 'PUBLIC',
      regionId: 'SAMPLE-REG-KR-001',
      sourceId: 'SAMPLE-SRC-001',
    }),
  ],

  indicators: [
    createIndicator({
      id: 'SAMPLE-IND-001',
      code: 'IND-CANOPY-DENSITY-01',
      name: 'Mangrove Canopy Density & Sequestration Index',
      category: 'BIOMASS_DENSITY',
      unit: 'tCO2e/ha/yr',
      policyId: 'SAMPLE-POL-001',
    }),
  ],

  gisLayers: [
    createGisLayer({
      id: 'SAMPLE-GIS-001',
      name: 'Coringa High-Resolution Mangrove Canopy Boundary 2025',
      layerType: 'MANGROVE_CANOPY_POLYGON',
      regionId: 'SAMPLE-REG-KR-001',
      sourceId: 'SAMPLE-SRC-002',
    }),
  ],

  projects: [
    createProject({
      id: 'SAMPLE-PROJ-001',
      code: 'PROJ-CORINGA-BC-01',
      name: 'Coringa Estuarine Blue Carbon Restoration Pilot',
      description:
        'Targeted coastal wetland restoration project covering 12,500 hectares of degraded mangrove forest.',
      regionId: 'SAMPLE-REG-KR-001',
      workspaceId: 'SAMPLE-WS-001',
      lifecycleStatus: 'PUBLISHED',
      visibility: 'PUBLIC',
    }),
  ],

  innovationOpportunities: [
    createInnovationOpportunity({
      id: 'SAMPLE-INN-001',
      title: 'Community Nursery & Drone-Assisted MRV Incentive Model',
      summary:
        'Participatory community conservation program providing livelihood incentives for coastal seedling nurseries.',
      projectId: 'SAMPLE-PROJ-001',
      policyId: 'SAMPLE-POL-001',
      status: 'IN_REVIEW',
    }),
  ],

  blueCarbonProjects: [
    createBlueCarbonProject({
      id: 'SAMPLE-BC-001',
      projectId: 'SAMPLE-PROJ-001',
      ecosystemType: 'MANGROVE',
      estimatedHectares: '12500.00',
      targetCo2SequesterTpy: '62500.00',
    }),
  ],

  mrvRecords: [
    createMrvRecord({
      id: 'SAMPLE-MRV-001',
      blueCarbonProjectId: 'SAMPLE-BC-001',
      reportingPeriodStart: new Date('2025-01-01T00:00:00.000Z'),
      reportingPeriodEnd: new Date('2025-12-31T23:59:59.000Z'),
      measuredBiomassDensity: '142.5000',
      estimatedSequestrationTonnes: '62500.00',
      status: 'VERIFIED',
    }),
  ],

  verificationRecords: [
    createVerificationRecord({
      id: 'SAMPLE-VER-001',
      mrvId: 'SAMPLE-MRV-001',
      verifierIdentity: 'National Coastal Research Consortium',
      verificationStatus: 'VERIFIED',
      verifiedAt: new Date('2026-01-15T00:00:00.000Z'),
      methodology: 'IPCC Tier 3 Wetland Biomass Estimation & High-Res Sentinel-2 Spectral Indices',
    }),
  ],

  integrityRecords: [
    createIntegrityRecord({
      id: 'SAMPLE-INT-001',
      verificationId: 'SAMPLE-VER-001',
      checksum: 'd7a8fbb307d7809469ca933b02d1145129cb23dc9c7c419add4f67ac3a5cc7b4',
      algorithm: 'SHA-256',
      integrityStatus: 'VERIFIED',
    }),
  ],

  disputes: [
    createDispute({
      id: 'SAMPLE-DISP-001',
      title: 'Estuarine Community Fishing Boundary Overlap Consultation',
      description:
        'Tenure demarcation review regarding artisanal fishing access in the western mangrove regeneration sector.',
      projectId: 'SAMPLE-PROJ-001',
      lifecycleStatus: 'IN_REVIEW',
      visibility: 'INTERNAL',
      resolutionSummary:
        'Joint consultative committee designated seasonal fishing corridors outside active planting zones.',
    }),
  ],

  evidenceItems: [
    createEvidenceItem({
      id: 'SAMPLE-EV-001',
      title: 'Sentinel-2 Multispectral Surface Reflectance Canopy Density Scan',
      category: 'REMOTE_SENSING_OBSERVATION',
      sourceId: 'SAMPLE-SRC-002',
      projectId: 'SAMPLE-PROJ-001',
      policyId: 'SAMPLE-POL-001',
    }),
    createEvidenceItem({
      id: 'SAMPLE-EV-002',
      title: 'Field Biomass Core Sampling & Ground-Truth Allometric Survey',
      category: 'EMPIRICAL_FIELD_SAMPLE',
      sourceId: 'SAMPLE-SRC-001',
      projectId: 'SAMPLE-PROJ-001',
      policyId: 'SAMPLE-POL-001',
    }),
  ],

  evidenceRelationships: [
    createEvidenceRelationship({
      id: 'SAMPLE-REL-001',
      sourceEvidenceId: 'SAMPLE-EV-002',
      targetEvidenceId: 'SAMPLE-EV-001',
      relationshipType: 'CORROBORATES',
    }),
  ],

  users: [
    createUser({
      id: 'SAMPLE-USR-001',
      email: 'admin@bluetrace.gov.in',
      name: 'Admin User',
      role: 'ADMIN',
      passwordHash: DEMO_PASSWORD_HASH,
    }),
    createUser({
      id: 'SAMPLE-USR-002',
      email: 'policy.officer@bluetrace.gov.in',
      name: 'Dr. Priya Sharma',
      role: 'POLICY_OFFICER',
      passwordHash: DEMO_PASSWORD_HASH,
    }),
    createUser({
      id: 'SAMPLE-USR-003',
      email: 'researcher@bluetrace.gov.in',
      name: 'Dr. Anand Rao',
      role: 'RESEARCHER',
      passwordHash: DEMO_PASSWORD_HASH,
    }),
    createUser({
      id: 'SAMPLE-USR-004',
      email: 'analyst@bluetrace.gov.in',
      name: 'Sunita Patel',
      role: 'ANALYST',
      passwordHash: DEMO_PASSWORD_HASH,
    }),
    createUser({
      id: 'SAMPLE-USR-005',
      email: 'verifier@coastal-audit.org',
      name: 'Marcus Chen',
      role: 'VERIFIER',
      passwordHash: DEMO_PASSWORD_HASH,
    }),
    createUser({
      id: 'SAMPLE-USR-006',
      email: 'community.lead@coringa-council.org',
      name: 'K. Someswara Rao',
      role: 'COMMUNITY_LEAD',
      passwordHash: DEMO_PASSWORD_HASH,
    }),
    createUser({
      id: 'SAMPLE-USR-007',
      email: 'mediator@land-tribunal.gov.in',
      name: 'Justice R. Murthy',
      role: 'DISPUTE_MEDIATOR',
      passwordHash: DEMO_PASSWORD_HASH,
    }),
    createUser({
      id: 'SAMPLE-USR-008',
      email: 'public.viewer@citizens.in',
      name: 'Citizen Observer',
      role: 'VIEWER',
      passwordHash: DEMO_PASSWORD_HASH,
    }),
  ],

  workspaceMemberships: [
    createWorkspaceMembership({
      id: 'SAMPLE-MEM-001',
      workspaceId: 'SAMPLE-WS-001',
      userId: 'SAMPLE-USR-003',
      role: 'RESEARCHER',
    }),
  ],
};
