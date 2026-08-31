# Shared Domain Contracts Specification — Phase 1

## Overview

The **`@sih26019/shared-types`** and **`@sih26019/validation`** packages establish the authoritative contract layer for the SIH26019 platform. All future modules and pillars must consume these types directly without inventing competing definitions.

---

## 1. Core Domain Types

### 1.1 Timestamps (`timestamp.ts`)

- **Format**: ISO 8601 UTC string (`YYYY-MM-DDTHH:mm:ss.sssZ`).
- **Contract**: `IsoTimestamp = string`
- **Auditing**: `Timestamps` interface provides optional `createdAt` and `updatedAt`.

### 1.2 Sample Flag (`sample.ts`)

- **Semantic Contract**: `sampleFlag: boolean` on `WithSampleFlag`.
- **Purpose**: Distinguishes illustrative/demo records from authoritative evidence.

### 1.3 Lifecycle & Integrity Status (`status.ts`)

- **`LifecycleStatus`**: `'DRAFT' | 'IN_REVIEW' | 'PUBLISHED' | 'ARCHIVED' | 'DEPRECATED'`
- **`IntegrityStatus`**: `'UNVERIFIED' | 'VERIFIED' | 'FLAGGED' | 'INVALID'`
- **`EntityStatus`**: Composite object holding both dimensions.

### 1.4 Visibility Classification (`visibility.ts`)

- **`Visibility`**: `'PUBLIC' | 'RESTRICTED' | 'INTERNAL'`
  - `PUBLIC`: Accessible to all platform viewers.
  - `RESTRICTED`: Accessible only to authorized institutions or researchers.
  - `INTERNAL`: Internal system and administrative operations only.

### 1.5 Ownership (`owner.ts`)

- **`OwnerType`**: `'INDIVIDUAL' | 'ORGANIZATION' | 'INSTITUTION' | 'SYSTEM'`
- **`OwnerReference`**: `{ ownerId: string; ownerType: OwnerType; displayName?: string }`

### 1.6 Sources & Provenance (`source.ts`, `provenance.ts`)

- **`SourceType`**: `'GOVERNMENT_RECORD' | 'SATELLITE_OBSERVATION' | 'RESEARCH_PUBLICATION' | 'OFFICIAL_SURVEY' | 'COMMUNITY_REPORT' | 'OTHER'`
- **`SourceReference`**: `{ sourceId, title, sourceType, publisher?, uri?, attribution?, obtainedAt? }`
- **`ProvenanceMetadata`**: `{ originSource, producedBy?, capturedAt, transformationContext?, checksum? }`

### 1.7 Regional & Period Dimensions (`region.ts`, `period.ts`)

- **`RegionLevel`**: `'COUNTRY' | 'STATE' | 'DISTRICT' | 'SUB_DISTRICT' | 'LOCAL'`
- **`RegionReference`**: `{ code: string; name: string; level: RegionLevel; parentCode?: string }`
- **`PeriodType`**: `'POINT_IN_TIME' | 'DATE_RANGE' | 'ANNUAL' | 'QUARTERLY' | 'MONTHLY'`
- **`EvidencePeriod`**: `{ type: PeriodType; startDate: IsoTimestamp; endDate?: IsoTimestamp; year?: number; quarter?: number; month?: number }`

### 1.8 Evidence Relationships (`relationship.ts`)

- **`EvidenceRelationshipType`**: `'SUPPORTS' | 'DERIVED_FROM' | 'REFERENCES' | 'SUPERSEDES' | 'CORROBORATES' | 'CONTRADICTS'`
- **`EvidenceRelationship`**: `{ relationshipId, sourceId, targetId, type, createdAt, metadata? }`

### 1.9 Platform Roles (`role.ts`)

- **`Role`**: `'ADMIN' | 'RESEARCHER' | 'ANALYST' | 'REVIEWER' | 'PUBLISHER' | 'VIEWER'`
- **Note**: Roles are vocabulary contracts only in Phase 1; access-control enforcement is implemented in future phases.

---

## 2. API Response Envelope & Error Model (`api.ts`)

### Success Response

```json
{
  "success": true,
  "data": {
    "key": "value"
  },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "timestamp": "2026-08-31T12:00:00.000Z"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed.",
    "details": {
      "sourceId": ["sourceId is required"]
    }
  }
}
```

### Standard Error Codes

- `VALIDATION_ERROR`: Schema validation failures.
- `UNAUTHORIZED`: Unauthenticated access.
- `FORBIDDEN`: Insufficient permissions.
- `NOT_FOUND`: Resource does not exist.
- `CONFLICT`: State or identity conflict.
- `BAD_REQUEST`: Malformed request syntax.
- `INTERNAL_ERROR`: Sanitized server error.
- `SERVICE_UNAVAILABLE`: External dependency unavailable.

---

## 3. Provider Adapter Interfaces

All provider interfaces represent contracts only. **Credentials and secrets must never be passed in domain requests.**

- **`AIAdapter`**: Provider-neutral text synthesis and analysis (`generateText`, `summarize`).
- **`StorageAdapter`**: Provider-neutral object storage (`upload`, `getDownloadUrl`, `delete`, `exists`).
- **`GISAdapter`**: Provider-neutral spatial verification (`validateCoordinates`, `resolveRegion`).
- **`IntegrityAdapter`**: Cryptographic hash calculation and checksum verification (`calculateChecksum`, `verifyChecksum`).
