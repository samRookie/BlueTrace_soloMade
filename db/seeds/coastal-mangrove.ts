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
} from './factories.js';

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
      title: 'National Coastal Mangrove Restoration & Governance Guidelines 2024',
      description:
        'Framework for institutional land tenure, blue carbon crediting, and community co-management in coastal mangrove zones.',
      regionId: 'SAMPLE-REG-KR-001',
      sourceId: 'SAMPLE-SRC-001',
      lifecycleStatus: 'PUBLISHED',
      visibility: 'PUBLIC',
    }),
  ],

  indicators: [
    createIndicator({
      id: 'SAMPLE-IND-001',
      code: 'IND-CANOPY-DENSITY-01',
      name: 'Mangrove Canopy Density & Sequestration Index',
      category: 'ECOLOGICAL_HEALTH',
      unit: 'tCO2e/ha/yr',
      policyId: 'SAMPLE-POL-001',
    }),
  ],

  gisLayers: [
    createGisLayer({
      id: 'SAMPLE-GIS-001',
      name: 'Coringa High-Resolution Mangrove Canopy Boundary 2025',
      layerType: 'VECTOR_POLYGON_METADATA',
      regionId: 'SAMPLE-REG-KR-001',
      sourceId: 'SAMPLE-SRC-002',
      visibility: 'PUBLIC',
      status: 'PUBLISHED',
    }),
  ],

  projects: [
    createProject({
      id: 'SAMPLE-PROJ-001',
      code: 'PROJ-CORINGA-BC-01',
      name: 'Coringa Estuarine Blue Carbon & Mangrove Restoration Pilot',
      description:
        'Demonstration land restoration project establishing verified blue carbon sequestration across 12,500 hectares.',
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
        'Incentivizing coastal community nurseries with automated drone canopy MRV verification and carbon revenue sharing.',
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
      reportingPeriodEnd: new Date('2025-12-31T23:59:59.999Z'),
      measuredBiomassDensity: '142.5000',
      estimatedSequestrationTonnes: '62500.00',
      status: 'PUBLISHED',
    }),
  ],

  verificationRecords: [
    createVerificationRecord({
      id: 'SAMPLE-VER-001',
      mrvId: 'SAMPLE-MRV-001',
      verifierIdentity: 'National Coastal Research Consortium',
      verificationStatus: 'VERIFIED',
      verifiedAt: new Date('2026-02-15T00:00:00.000Z'),
      methodology: 'IPCC Wetlands Supplement Tier 3 MRV Protocol',
    }),
  ],

  integrityRecords: [
    createIntegrityRecord({
      id: 'SAMPLE-INT-001',
      verificationId: 'SAMPLE-VER-001',
      checksum: 'd7a8fbb307d7809469ca933b02b1fced09f5bb3476f5759b688a6e9f2d014068',
      algorithm: 'SHA-256',
      integrityStatus: 'VERIFIED',
      recordedAt: new Date('2026-02-16T00:00:00.000Z'),
    }),
  ],

  disputes: [
    createDispute({
      id: 'SAMPLE-DISP-001',
      title: 'Estuarine Community Fishing Boundary Overlap Consultation',
      description:
        'Participatory boundary dispute resolution between local artisanal fishing zones and core mangrove replanting parcels.',
      projectId: 'SAMPLE-PROJ-001',
      lifecycleStatus: 'IN_REVIEW',
      visibility: 'INTERNAL',
      resolutionSummary: 'Participatory spatial boundary agreement negotiated and recorded.',
    }),
  ],

  evidenceItems: [
    createEvidenceItem({
      id: 'SAMPLE-EV-001',
      title: 'Satellite Multispectral Mangrove Canopy Density Scan',
      category: 'REMOTE_SENSING',
      sourceId: 'SAMPLE-SRC-002',
      projectId: 'SAMPLE-PROJ-001',
      policyId: 'SAMPLE-POL-001',
      lifecycleStatus: 'PUBLISHED',
      integrityStatus: 'VERIFIED',
      visibility: 'PUBLIC',
    }),
    createEvidenceItem({
      id: 'SAMPLE-EV-002',
      title: 'Field Soil & Sediment Core Carbon Stock Analysis',
      category: 'EMPIRICAL_FIELD_SAMPLE',
      sourceId: 'SAMPLE-SRC-001',
      projectId: 'SAMPLE-PROJ-001',
      policyId: 'SAMPLE-POL-001',
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
  ],
};
