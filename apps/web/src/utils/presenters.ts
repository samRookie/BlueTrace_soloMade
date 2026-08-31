import type {
  LifecycleStatus,
  IntegrityStatus,
  Visibility,
  SourceType,
  Role,
} from '@sih26019/shared-types';

export function getLifecycleStatusLabel(status: LifecycleStatus): string {
  switch (status) {
    case 'DRAFT':
      return 'Draft';
    case 'IN_REVIEW':
      return 'In Review';
    case 'PUBLISHED':
      return 'Published';
    case 'ARCHIVED':
      return 'Archived';
    case 'DEPRECATED':
      return 'Deprecated';
  }
}

export function getIntegrityStatusLabel(status: IntegrityStatus): string {
  switch (status) {
    case 'UNVERIFIED':
      return 'Unverified';
    case 'VERIFIED':
      return 'Verified';
    case 'FLAGGED':
      return 'Flagged for Review';
    case 'INVALID':
      return 'Invalid';
  }
}

export function getVisibilityLabel(visibility: Visibility): string {
  switch (visibility) {
    case 'PUBLIC':
      return 'Public Access';
    case 'RESTRICTED':
      return 'Restricted Access';
    case 'INTERNAL':
      return 'Internal Only';
  }
}

export function getSourceTypeLabel(sourceType: SourceType): string {
  switch (sourceType) {
    case 'GOVERNMENT_RECORD':
      return 'Government Record';
    case 'SATELLITE_OBSERVATION':
      return 'Satellite Observation';
    case 'RESEARCH_PUBLICATION':
      return 'Research Publication';
    case 'OFFICIAL_SURVEY':
      return 'Official Survey';
    case 'COMMUNITY_REPORT':
      return 'Community Report';
    case 'OTHER':
      return 'Other Source';
  }
}

export function getRoleLabel(role: Role): string {
  switch (role) {
    case 'ADMIN':
      return 'Administrator';
    case 'POLICY_OFFICER':
      return 'Land Policy Officer';
    case 'RESEARCHER':
      return 'Geospatial Researcher';
    case 'ANALYST':
      return 'Data & Evidence Analyst';
    case 'VERIFIER':
      return 'Blue Carbon Verifier';
    case 'COMMUNITY_LEAD':
      return 'Community Representative';
    case 'DISPUTE_MEDIATOR':
      return 'Dispute Resolution Mediator';
    case 'VIEWER':
      return 'Public Viewer';
  }
}
