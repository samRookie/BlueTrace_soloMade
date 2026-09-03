# National Dashboard & Analytics Overview — Phase 7

## Overview

The **National Dashboard & Analytics Overview** serves as the primary intelligence aggregation and decision-support layer for the SIH26019 National Land Governance Research & Policy Innovation Platform.

Unlike decorative analytics dashboards, every single displayed metric:

1. **Originates from Canonical Database Records**: Derived directly from underlying PostgreSQL relational tables (`evidence_items`, `dataset_metadata`, `projects`, `policies`, `indicators`, `gis_layers`, `blue_carbon_projects`, `mrv_records`, `verification_records`, `disputes`, `evidence_relationships`, and `evidence_attachments`).
2. **Eliminates Synthetic Hallucination**: No random values, no hardcoded counters, no speculative policy scores, and no fabricated carbon measurements.
3. **Transparent Provenance**: Each metric declares its source repository, unit of measurement, temporal reporting cycle, and geographic jurisdiction.
4. **Sample Data Hygiene**: When evaluated in demonstration or prototype mode against seeded models (such as the Coringa Mangrove Estuarine Zone), all metrics explicitly expose `sampleFlag: true` and display visible warning badges.
5. **Role-Aware Security**: Aggregations evaluate access control lists and visibility rules (`PUBLIC`, `INTERNAL`, `RESTRICTED`) _prior_ to calculating counts, preventing unauthorized leakage of restricted institutional records.

---

## Analytics API

### Endpoint Specification

```http
GET /api/v1/analytics/overview
```

### Query Parameters

| Parameter     | Type                | Required | Description                                                                                                                                 |
| :------------ | :------------------ | :------: | :------------------------------------------------------------------------------------------------------------------------------------------ |
| `regionId`    | `string`            |    No    | Filters aggregates to a specific geographic jurisdiction (e.g. `SAMPLE-REG-KR-001`). When omitted, aggregates represent the National scope. |
| `periodStart` | `string` (ISO-8601) |    No    | Lower bound timestamp for created/reported records (e.g. `2025-01-01T00:00:00.000Z`).                                                       |
| `periodEnd`   | `string` (ISO-8601) |    No    | Upper bound timestamp for created/reported records (e.g. `2026-12-31T23:59:59.000Z`).                                                       |
| `sampleFlag`  | `boolean`           |    No    | Filters records by sample state. Defaults to including prototype records in development mode with clear indicators.                         |

### Response Schema

```json
{
  "success": true,
  "data": {
    "context": {
      "regionId": "SAMPLE-REG-KR-001",
      "regionName": "Coringa Mangrove Estuarine Zone",
      "periodStart": "2025-01-01T00:00:00.000Z",
      "periodEnd": "2026-12-31T23:59:59.000Z",
      "sampleFlag": true,
      "generatedAt": "2026-09-03T12:00:00.000Z"
    },
    "sections": {
      "nationalSnapshot": [...],
      "evidenceActivity": [...],
      "geospatialIntelligence": [...],
      "policyIntelligence": [...],
      "implementation": [...],
      "environmental": [...]
    }
  },
  "meta": {
    "requestId": "uuid"
  }
}
```

---

## Metric Inventory & Definitions

### 1. National Snapshot

| Metric Key                   | Label                    | Unit       | Source                              | Definition                                                                                      | Detail Route  |
| :--------------------------- | :----------------------- | :--------- | :---------------------------------- | :---------------------------------------------------------------------------------------------- | :------------ |
| `total_evidence_items`       | Cataloged Evidence Items | `records`  | Knowledge & Evidence Repository     | Total count of accessible evidence records across scientific, legal, and policy categories.     | `/evidence`   |
| `total_cataloged_datasets`   | Reusable Datasets        | `datasets` | Dataset Catalog & Storage           | Count of reusable scientific and geospatial datasets cataloged with access controls.            | `/datasets`   |
| `total_projects`             | Governance Projects      | `projects` | Project Implementation Registry     | Active coastal restoration, cadastral surveying, and land-use governance projects.              | `/workspaces` |
| `total_policies`             | Governing Policies       | `records`  | National Policy Registry            | Formally cataloged national and regional land governance policies and guidelines.               | `/evidence`   |
| `total_indicators`           | Monitored Indicators     | `records`  | Policy Indicator Framework          | Quantifiable biophysical and land-use governance indicators tracked across policies.            | `/evidence`   |
| `active_regions_represented` | Administrative Regions   | `records`  | Geographic Administrative Hierarchy | Distinct administrative zones and coastal districts with cataloged evidence or active projects. | `/evidence`   |

### 2. Evidence & Research Activity

| Metric Key                      | Label                      | Unit      | Source                          | Definition                                                                               | Detail Route |
| :------------------------------ | :------------------------- | :-------- | :------------------------------ | :--------------------------------------------------------------------------------------- | :----------- |
| `evidence_items_published`      | Published Evidence Items   | `records` | Knowledge & Evidence Repository | Formally published evidence items ready for institutional citation and decision support. | `/evidence`  |
| `verified_evidence_items`       | Cryptographically Verified | `records` | Evidence Integrity Engine       | Evidence assets with verified cryptographic integrity stamps.                            | `/evidence`  |
| `evidence_relationships_mapped` | Graph Relationship Edges   | `records` | Evidence Graph Network          | Corroborating, supporting, and citing relationship edges connecting evidence items.      | `/evidence`  |
| `evidence_attachments_stored`   | Stored Attachments         | `records` | Evidence Storage Vault          | Audited downloadable documentation, GeoJSON layers, and data files attached to evidence. | `/evidence`  |

### 3. Geospatial Intelligence & Spatial Extent

| Metric Key                  | Label                  | Unit       | Source                           | Definition                                                                          | Detail Route |
| :-------------------------- | :--------------------- | :--------- | :------------------------------- | :---------------------------------------------------------------------------------- | :----------- |
| `gis_linked_datasets`       | GIS-Linked Datasets    | `datasets` | Dataset Catalog & GIS Index      | Cataloged datasets directly connected to spatial GIS layers and polygon boundaries. | `/datasets`  |
| `gis_layers_published`      | Published GIS Layers   | `records`  | Geospatial Layer Registry        | Geospatial vector boundary, cadastral, and mangrove canopy layers in repository.    | `/datasets`  |
| `spatial_coverage_datasets` | Bound Spatial Datasets | `datasets` | Dataset Spatial Coverage Catalog | Datasets with documented geographical extent and spatial bounding descriptions.     | `/datasets`  |

### 4. Policy Intelligence & Indicators

| Metric Key                    | Label                    | Unit      | Source                     | Definition                                                                          | Detail Route |
| :---------------------------- | :----------------------- | :-------- | :------------------------- | :---------------------------------------------------------------------------------- | :----------- |
| `published_policies`          | Active Policy Frameworks | `records` | National Policy Registry   | Published regulatory guidelines, conservation covenants, and land tenure rules.     | `/evidence`  |
| `policy_connected_indicators` | Policy-Bound Indicators  | `records` | Policy Indicator Framework | Standardized metrics actively linked to evaluate policy objectives and enforcement. | `/evidence`  |
| `policy_linked_evidence`      | Policy-Linked Evidence   | `records` | Policy Evidence Graph      | Scientific papers and baseline reports formally linked to supporting policies.      | `/evidence`  |

### 5. Implementation & Project Governance

| Metric Key                   | Label                       | Unit       | Source                          | Definition                                                                       | Detail Route  |
| :--------------------------- | :-------------------------- | :--------- | :------------------------------ | :------------------------------------------------------------------------------- | :------------ |
| `active_governance_projects` | Published Pilots            | `projects` | Project Implementation Registry | Formally active and published land restoration and governance pilot initiatives. | `/workspaces` |
| `project_linked_evidence`    | Project Supporting Evidence | `records`  | Project Evidence Links          | Field surveys and datasets tied to specific on-the-ground project compartments.  | `/evidence`   |
| `open_disputes`              | Logged Tenure Disputes      | `records`  | Tenure Dispute Register         | Boundary overlap or artisanal access disputes formally registered for mediation. | `/workspaces` |

### 6. Environmental & Blue Carbon Ecosystems

| Metric Key                   | Label                       | Unit          | Source                        | Definition                                                                           | Detail Route  |
| :--------------------------- | :-------------------------- | :------------ | :---------------------------- | :----------------------------------------------------------------------------------- | :------------ |
| `blue_carbon_projects`       | Blue Carbon Projects        | `projects`    | Blue Carbon Project Registry  | Coastal mangrove and wetland restoration projects under Blue Carbon MRV protocols.   | `/workspaces` |
| `total_restoration_hectares` | Restoration Area            | `hectares`    | Blue Carbon Project Baselines | Total estimated wetland and mangrove area under active ecological restoration.       | `/workspaces` |
| `target_co2_sequester_tpy`   | Annual Sequestration Target | `tonnes_co2e` | Sequestration Target Models   | Modeled carbon sequestration capacity per year based on canopy density and area.     | `/workspaces` |
| `mrv_records_logged`         | MRV Biomass Logs            | `records`     | MRV Protocol System           | Monitoring, Reporting, and Verification biomass allometry records in registry.       | `/evidence`   |
| `verified_mrv_records`       | Third-Party Verified MRV    | `records`     | MRV Verification Protocol     | Biomass and carbon sequestration reports verified by certified third-party auditors. | `/evidence`   |

---

## Security & Privacy Rules

1. **Pre-Aggregation Filtering**: Access checks are applied inside the SQL query `WHERE` clauses. Private evidence, internal dispute registers, and restricted datasets are never queried or counted for unauthorized roles.
2. **No Data Leakage Through Sums**: Counts and aggregations for restricted categories evaluate to zero or omit restricted subsets rather than revealing the existence of classified records to unauthorized users.
3. **Safe Navigation Boundaries**: All detail routes point to existing functional pages (`/evidence`, `/datasets`, `/workspaces`). When accessed, each module enforces its own row-level access controls.
