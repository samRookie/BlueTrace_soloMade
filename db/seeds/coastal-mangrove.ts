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
  createEvidenceAttachment,
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
    createSource({
      id: 'SAMPLE-SRC-003',
      title: 'Digital Land Records Modernization Program (DILRMP)',
      sourceType: 'GOVERNMENT_RECORD',
      publisher: 'Department of Land Resources, Ministry of Rural Development',
      uri: 'https://dilrmp.gov.in/reports/title-modernization-2025',
      attribution: 'Government of India - Land Title Modernization Initiative',
      obtainedAt: new Date('2025-01-10T00:00:00.000Z'),
    }),
    createSource({
      id: 'SAMPLE-SRC-004',
      title: 'Tribal Land Rights & FRA Demarcation Survey',
      sourceType: 'OFFICIAL_SURVEY',
      publisher: 'Ministry of Tribal Affairs',
      uri: 'https://tribal.nic.in/surveys/fra-geospatial-2024',
      attribution: 'National Cadastral Survey for Forest Dwellers',
      obtainedAt: new Date('2024-11-20T00:00:00.000Z'),
    }),
    createSource({
      id: 'SAMPLE-SRC-005',
      title: 'Journal of Coastal Land Tenure and Commons Governance',
      sourceType: 'RESEARCH_PUBLICATION',
      publisher: 'National Centre for Sustainable Coastal Management',
      uri: 'https://ncscm.res.in/publications/coastal-commons-2025',
      attribution: 'NCSCM Research Monograph Series',
      obtainedAt: new Date('2025-04-12T00:00:00.000Z'),
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
      checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      algorithm: 'SHA-256',
      integrityStatus: 'VERIFIED',
    }),
  ],

  disputes: [
    createDispute({
      id: 'SAMPLE-DSP-001',
      title: 'Artisanal Fishing Access & Boundary Buffer Overlap',
      description:
        'Local fishing cooperative petition regarding traditional fishing creek access within the newly demarcated northern restoration zone.',
      projectId: 'SAMPLE-PROJ-001',
      lifecycleStatus: 'PUBLISHED',
      visibility: 'INTERNAL',
      resolutionSummary:
        'Joint consultative committee designated seasonal fishing corridors outside active planting zones.',
    }),
  ],

  evidenceItems: [
    createEvidenceItem({
      id: 'SAMPLE-EV-001',
      title: 'Sentinel-2 Multispectral Surface Reflectance Canopy Density Scan',
      category: 'DATASET',
      sourceId: 'SAMPLE-SRC-002',
      projectId: 'SAMPLE-PROJ-001',
      policyId: 'SAMPLE-POL-001',
      lifecycleStatus: 'PUBLISHED',
      integrityStatus: 'VERIFIED',
      visibility: 'PUBLIC',
    }),
    createEvidenceItem({
      id: 'SAMPLE-EV-002',
      title: 'Field Biomass Core Sampling & Ground-Truth Allometric Survey',
      category: 'RESEARCH_PAPER',
      sourceId: 'SAMPLE-SRC-001',
      projectId: 'SAMPLE-PROJ-001',
      policyId: 'SAMPLE-POL-001',
      lifecycleStatus: 'PUBLISHED',
      integrityStatus: 'VERIFIED',
      visibility: 'PUBLIC',
    }),
    createEvidenceItem({
      id: 'SAMPLE-EV-003',
      title: 'National Coastal Mangrove Restoration Regulatory Guidelines 2024',
      category: 'POLICY_DOCUMENT',
      sourceId: 'SAMPLE-SRC-001',
      projectId: null,
      policyId: 'SAMPLE-POL-001',
      lifecycleStatus: 'PUBLISHED',
      integrityStatus: 'VERIFIED',
      visibility: 'PUBLIC',
    }),
    createEvidenceItem({
      id: 'SAMPLE-EV-004',
      title: 'Community Nursery Stewardship & Coastal Livelihood Benefit Sharing Model',
      category: 'CASE_STUDY',
      sourceId: 'SAMPLE-SRC-001',
      projectId: 'SAMPLE-PROJ-001',
      policyId: 'SAMPLE-POL-001',
      lifecycleStatus: 'PUBLISHED',
      integrityStatus: 'VERIFIED',
      visibility: 'PUBLIC',
    }),
    createEvidenceItem({
      id: 'SAMPLE-EV-005',
      title: 'Digital Land Records Modernization & Title Verification Framework',
      category: 'GOVERNMENT_REPORT',
      sourceId: 'SAMPLE-SRC-003',
      projectId: null,
      policyId: null,
      lifecycleStatus: 'PUBLISHED',
      integrityStatus: 'VERIFIED',
      visibility: 'PUBLIC',
    }),
    createEvidenceItem({
      id: 'SAMPLE-EV-006',
      title: 'Scheduled Tribes and Other Traditional Forest Dwellers (FRA 2006) Mapping Guidelines',
      category: 'LEGAL_FRAMEWORK',
      sourceId: 'SAMPLE-SRC-004',
      projectId: null,
      policyId: null,
      lifecycleStatus: 'PUBLISHED',
      integrityStatus: 'VERIFIED',
      visibility: 'PUBLIC',
    }),
    createEvidenceItem({
      id: 'SAMPLE-EV-007',
      title: 'Peri-Urban Agricultural Land Titling & Cadastral Conversion Survey',
      category: 'PROJECT_REPORT',
      sourceId: 'SAMPLE-SRC-003',
      projectId: null,
      policyId: null,
      lifecycleStatus: 'PUBLISHED',
      integrityStatus: 'VERIFIED',
      visibility: 'INTERNAL',
    }),
    createEvidenceItem({
      id: 'SAMPLE-EV-008',
      title: 'Comparative Resilience of Community vs Statutory Land Tenures in Coastal Habitats',
      category: 'ACADEMIC_PUBLICATION',
      sourceId: 'SAMPLE-SRC-005',
      projectId: null,
      policyId: null,
      lifecycleStatus: 'PUBLISHED',
      integrityStatus: 'VERIFIED',
      visibility: 'PUBLIC',
    }),
  ],

  evidenceRelationships: [
    createEvidenceRelationship({
      id: 'SAMPLE-REL-001',
      sourceEvidenceId: 'SAMPLE-EV-002',
      targetEvidenceId: 'SAMPLE-EV-001',
      relationshipType: 'CORROBORATES',
    }),
    createEvidenceRelationship({
      id: 'SAMPLE-REL-002',
      sourceEvidenceId: 'SAMPLE-EV-001',
      targetEvidenceId: 'SAMPLE-EV-003',
      relationshipType: 'SUPPORTS',
    }),
    createEvidenceRelationship({
      id: 'SAMPLE-REL-003',
      sourceEvidenceId: 'SAMPLE-EV-004',
      targetEvidenceId: 'SAMPLE-EV-003',
      relationshipType: 'REFERENCES',
    }),
    createEvidenceRelationship({
      id: 'SAMPLE-REL-004',
      sourceEvidenceId: 'SAMPLE-EV-007',
      targetEvidenceId: 'SAMPLE-EV-005',
      relationshipType: 'DERIVED_FROM',
    }),
    createEvidenceRelationship({
      id: 'SAMPLE-REL-005',
      sourceEvidenceId: 'SAMPLE-EV-008',
      targetEvidenceId: 'SAMPLE-EV-006',
      relationshipType: 'REFERENCES',
    }),
  ],

  evidenceAttachments: [
    createEvidenceAttachment({
      id: 'SAMPLE-ATT-001',
      evidenceId: 'SAMPLE-EV-001',
      fileName: 'coringa_sentinel2_canopy_2025.geojson',
      fileSize: 4829104,
      mimeType: 'application/geo+json',
      storageKey: 'evidence/coringa_sentinel2_canopy_2025.geojson',
      checksumSha256: '9a5f2231b6e4d2847c0bbf234e402b8b64e0a7249339e802315a6b0cf89078de',
    }),
    createEvidenceAttachment({
      id: 'SAMPLE-ATT-002',
      evidenceId: 'SAMPLE-EV-002',
      fileName: 'coringa_mangrove_allometric_cores.csv',
      fileSize: 124590,
      mimeType: 'text/csv',
      storageKey: 'evidence/coringa_mangrove_allometric_cores.csv',
      checksumSha256: '8b7f3312c5e4d2847c0bbf234e402b8b64e0a7249339e802315a6b0cf89012cd',
    }),
    createEvidenceAttachment({
      id: 'SAMPLE-ATT-003',
      evidenceId: 'SAMPLE-EV-003',
      fileName: 'national_mangrove_guidelines_2024.pdf',
      fileSize: 1824100,
      mimeType: 'application/pdf',
      storageKey: 'evidence/national_mangrove_guidelines_2024.pdf',
      checksumSha256: '7c6f4423b5e4d2847c0bbf234e402b8b64e0a7249339e802315a6b0cf89034ef',
    }),
    createEvidenceAttachment({
      id: 'SAMPLE-ATT-004',
      evidenceId: 'SAMPLE-EV-005',
      fileName: 'dilrmp_title_modernization_whitepaper.pdf',
      fileSize: 3201490,
      mimeType: 'application/pdf',
      storageKey: 'evidence/dilrmp_title_modernization_whitepaper.pdf',
      checksumSha256: '6d5f5534b4e4d2847c0bbf234e402b8b64e0a7249339e802315a6b0cf89056ab',
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
