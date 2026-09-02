import type { Role } from '@sih26019/shared-types';

export const DEMO_PASSWORD = 'BlueTrace#Demo2026!';

export interface DemoPersona {
  role: Role;
  name: string;
  email: string;
  description: string;
}

export const DEMO_PERSONAS: DemoPersona[] = [
  {
    role: 'ADMIN',
    name: 'Admin User',
    email: 'admin@bluetrace.gov.in',
    description: 'Full system administration, audit inspection, and user control',
  },
  {
    role: 'POLICY_OFFICER',
    name: 'Dr. Priya Sharma',
    email: 'policy.officer@bluetrace.gov.in',
    description: 'National land policy guidelines and statutory indicator regulation',
  },
  {
    role: 'RESEARCHER',
    name: 'Dr. Anand Rao',
    email: 'researcher@bluetrace.gov.in',
    description: 'Geospatial observation layers, research workspaces, and field projects',
  },
  {
    role: 'ANALYST',
    name: 'Sunita Patel',
    email: 'analyst@bluetrace.gov.in',
    description: 'Biomass density metrics, carbon analytics, and statistical models',
  },
  {
    role: 'VERIFIER',
    name: 'Marcus Chen',
    email: 'verifier@coastal-audit.org',
    description: 'Third-party MRV audit assessments and SHA-256 integrity proofs',
  },
  {
    role: 'COMMUNITY_LEAD',
    name: 'K. Someswara Rao',
    email: 'community.lead@coringa-council.org',
    description: 'Local land tenure dispute lodging and community nursery proposals',
  },
  {
    role: 'DISPUTE_MEDIATOR',
    name: 'Justice R. Murthy',
    email: 'mediator@land-tribunal.gov.in',
    description: 'Boundary dispute arbitration, hearing logs, and mediation notes',
  },
  {
    role: 'VIEWER',
    name: 'Citizen Observer',
    email: 'public.viewer@citizens.in',
    description: 'Public observer access to transparent evidence catalogs',
  },
];
