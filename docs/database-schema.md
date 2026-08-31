# PostgreSQL Database Schema & Evidence Graph (Phase 2)

## 1. Overview

The **National Land Governance Research & Policy Innovation Platform (SIH26019)** database persistence layer models a connected, traversable relational evidence graph.

It supports:

- Authoritative and synthetic sources with provenance attribution
- Administrative regional hierarchy and GIS layer metadata
- Policies, governance guidelines, and measurable indicators
- Projects, workspaces, disputes, and innovation opportunities
- Blue Carbon project metadata, MRV (Monitoring, Reporting, Verification) records, third-party verifications, and cryptographic integrity records
- Evidence items and bidirectional evidence relationships (`SUPPORTS`, `DERIVED_FROM`, `REFERENCES`, `SUPERSEDES`, `CORROBORATES`, `CONTRADICTS`)

---

## 2. High-Level Relational Graph Structure

```text
Sources (Provenance)
   │
   ├── Policies ───────────── Indicators
   │     │
   │     └── Regions ──────── GIS Layer Metadata
   │           │
   │           └── Projects ──────── Workspaces
   │                 ├── Disputes
   │                 ├── Innovation Opportunities
   │                 └── Blue Carbon Projects
   │                           │
   │                          MRV Records
   │                           │
   │                     Verification Records
   │                           │
   │                     Integrity Records
   │
   └── Evidence Items
         └── Evidence Relationships (Self-Referential Bi-directional Graph)
```

---

## 3. Entity Table Inventory

| Table                      | Primary Key | Foreign Keys                                                                                   | Unique Constraints       | Check Constraints  | Purpose                                                         |
| :------------------------- | :---------- | :--------------------------------------------------------------------------------------------- | :----------------------- | :----------------- | :-------------------------------------------------------------- |
| `sources`                  | `id`        | None                                                                                           | None                     | None               | Catalog of evidence sources, publishers, and citations.         |
| `regions`                  | `id`        | `parent_code -> regions.code`                                                                  | `code`                   | None               | Administrative boundaries (country, state, district, local).    |
| `workspaces`               | `id`        | None                                                                                           | None                     | None               | Institutional collaboration and context containers.             |
| `policies`                 | `id`        | `region_id -> regions.id`, `source_id -> sources.id`                                           | `code`                   | None               | Governance frameworks, regulations, and land policies.          |
| `indicators`               | `id`        | `policy_id -> policies.id` (CASCADE)                                                           | `code`                   | None               | Quantifiable metrics linked to policies.                        |
| `gis_layers`               | `id`        | `region_id -> regions.id` (RESTRICT), `source_id -> sources.id`                                | None                     | None               | Spatial layer metadata (boundaries, canopy maps).               |
| `projects`                 | `id`        | `region_id -> regions.id` (RESTRICT), `workspace_id -> workspaces.id`                          | `code`                   | None               | Land restoration, pilot, and research projects.                 |
| `innovation_opportunities` | `id`        | `project_id -> projects.id` (CASCADE), `policy_id -> policies.id`                              | None                     | None               | Community and policy innovation proposals.                      |
| `blue_carbon_projects`     | `id`        | `project_id -> projects.id` (CASCADE)                                                          | `project_id`             | None               | Coastal mangrove, seagrass, and wetland carbon pilots.          |
| `mrv_records`              | `id`        | `blue_carbon_project_id -> blue_carbon_projects.id` (CASCADE)                                  | None                     | `start <= end`     | Monitoring, reporting, and biomass measurements.                |
| `verification_records`     | `id`        | `mrv_id -> mrv_records.id` (CASCADE)                                                           | None                     | None               | Third-party verification assessments and audits.                |
| `integrity_records`        | `id`        | `verification_id -> verification_records.id` (CASCADE)                                         | `verification_id`        | None               | Cryptographic SHA-256 hash proofs and integrity flags.          |
| `disputes`                 | `id`        | `project_id -> projects.id` (CASCADE)                                                          | None                     | None               | Land tenure, boundary overlap, and community disputes.          |
| `evidence_items`           | `id`        | `source_id -> sources.id` (RESTRICT), `project_id -> projects.id`, `policy_id -> policies.id`  | None                     | None               | Discrete evidence objects (remote sensing, field samples).      |
| `evidence_relationships`   | `id`        | `source_evidence_id -> evidence_items.id`, `target_evidence_id -> evidence_items.id` (CASCADE) | `(source, target, type)` | `source <> target` | Graph edges connecting corroborating or contradicting evidence. |

---

## 4. Deterministic Demonstration Dataset

The local development environment seeds a compact, connected demonstration dataset representing a **coastal mangrove restoration scenario** in the Coringa estuary (`IN-AP-CORINGA`).

All demonstration records explicitly set `sample_flag = true`.

### Seed Graph Summary:

- **Region**: `SAMPLE-REG-KR-001` (_Coringa Mangrove Estuarine Zone_, District Level)
- **Sources**: `SAMPLE-SRC-001` (National Coastal Zone Survey) & `SAMPLE-SRC-002` (Sentinel-2 Canopy Index)
- **GIS Layer**: `SAMPLE-GIS-001` (_Coringa Mangrove Canopy Boundary 2025_)
- **Policy**: `SAMPLE-POL-001` (_National Coastal Mangrove Restoration Guidelines 2024_)
- **Indicator**: `SAMPLE-IND-001` (_Mangrove Canopy Density & Sequestration Index_)
- **Workspace**: `SAMPLE-WS-001` (_Coringa Blue Carbon Policy & Governance Pilot Workspace_)
- **Project**: `SAMPLE-PROJ-001` (_Coringa Estuarine Blue Carbon Restoration Pilot_)
- **Innovation Opportunity**: `SAMPLE-INN-001` (_Community Nursery & Drone-Assisted MRV Incentive Model_)
- **Blue Carbon Project**: `SAMPLE-BC-001` (12,500 ha Mangrove Ecosystem)
- **MRV Record**: `SAMPLE-MRV-001` (62,500 tonnes CO2 sequestered in 2025)
- **Verification Record**: `SAMPLE-VER-001` (_National Coastal Research Consortium_, Verified)
- **Integrity Record**: `SAMPLE-INT-001` (SHA-256 Checksum `d7a8fbb307d7809469ca933b...`)
- **Dispute**: `SAMPLE-DISP-001` (_Estuarine Community Fishing Boundary Overlap Consultation_)
- **Evidence Items**: `SAMPLE-EV-001` (Satellite Canopy Scan) & `SAMPLE-EV-002` (Field Biomass Sample)
- **Evidence Relationship**: `SAMPLE-REL-001` (`SAMPLE-EV-002` `CORROBORATES` `SAMPLE-EV-001`)

---

## 5. Database Commands & Lifecycle

```bash
# Apply pending migrations to PostgreSQL database
pnpm db:migrate

# Inspect migration status and detected SQL files
pnpm db:migrate:status

# Deterministically seed coastal/mangrove sample graph
pnpm db:seed

# Safely reset development database (recreate schema + migrate + seed)
pnpm db:reset
```

> [!CAUTION]
> `pnpm db:reset` drops the public schema and will refuse to execute when `NODE_ENV=production`.
