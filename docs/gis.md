# GIS Explorer & Regional Context — Phase 8

## Overview

The **GIS Explorer & Regional Context** capability serves as the spatial indexing and geographic intelligence layer for the SIH26019 National Land Governance Research & Policy Innovation Platform.

Rather than operating as an isolated mapping subsystem, GIS functions as the **spatial backbone** connecting geographic regions (`RegionReference`) and geospatial layers/features to the platform's broader governance artifacts:

```text
Region (e.g. Coringa Mangrove Estuarine Zone)
  │
  ├── GIS Layers (Coastal, Forest, Land Use, Disputes, Climate)
  │     └── Spatial Features (Polygons, Lines, Points)
  │
  └── Regional Evidence Ecosystem:
        ├── Field & Satellite Evidence Records
        ├── Scientific & Cadastral Datasets
        ├── Statutory Policies & CRZ Directives
        ├── Conservation & Restoration Projects
        ├── Ecological Indicators
        ├── Active Disputes & Mediation Zones
        └── Blue Carbon Ecosystem Sequestration Models
```

Selecting a region or clicking any spatial feature exposes its linked evidence items, datasets, policies, projects, indicators, disputes, and blue carbon models through a single, coherent regional view.

---

## Architecture Principles

### 1. Pure Native Platform Rendering (Ponytail Ultra)

- **Zero External Heavyweight Mapping Libraries**: Rendered using pure native SVG GeoJSON vector graphics. No dependencies on Leaflet, OpenLayers, Mapbox, or Google Maps.
- **Zero External API Tokens or Tiling Servers**: Completely self-contained, air-gapped, deterministic, and instant-loading without network calls to third-party commercial tile providers.
- **Accessible Table Fallback**: Includes a first-class `<GisFeatureTable>` alternative designed for screen readers, keyboard-only navigation, low-bandwidth networks, and simulated map engine outages.
- **Simulated Provider Outage Mode**: Built-in toggle to simulate mapping engine failures with graceful fallback instructions and quick-switching to tabular spatial inspection.

### 2. Pre-Aggregation Visibility & Security

- **Role-Aware Layer and Feature Filtering**: Layer `SAMPLE-GIS-004` (Artisanal Fishing Buffer Mediation Zone) is marked `visibility: 'INTERNAL'`. Unauthenticated users and external viewers receive a 404/filtered response.
- **Sensitive Location Protection**: Sensitive coordinates on dispute and mediation layers (`SAMPLE-FEAT-005`) are generalized and stripped (`coordinates: []`, `coordinatesGeneralized: true`) for non-administrative roles to prevent exposing confidential negotiation zones.

### 3. Transparent Synthetic Data Labeling

- Every GIS layer, spatial feature, and regional metric carries an explicit `sampleFlag: true` attribute.
- A persistent warning banner indicates: `"⚠️ Prototype / Sample GIS Data — Synthetic Coordinates for Research Demonstration"`.
- No live national GIS infrastructure or authoritative survey boundaries are claimed.

---

## API Endpoints

### 1. List GIS Layers

```http
GET /api/v1/gis/layers
```

#### Query Parameters

| Parameter    | Type      | Required | Description                                                          |
| :----------- | :-------- | :------: | :------------------------------------------------------------------- |
| `regionId`   | `string`  |    No    | Filter layers by region ID (e.g. `SAMPLE-REG-KR-001`)                |
| `layerType`  | `string`  |    No    | Filter by type (`COASTAL`, `LAND_USE`, `PROJECTS`, `DISPUTES`, etc.) |
| `sampleFlag` | `boolean` |    No    | Filter by sample data flag                                           |

#### Visibility Behavior

- Public/Viewer roles receive only `visibility: 'PUBLIC'` layers.
- Admin/Researcher/Policy Officer roles receive accessible `INTERNAL` layers.

---

### 2. Get GIS Layer Detail

```http
GET /api/v1/gis/layers/:id
```

Returns single layer metadata including legend styling and bounding box information.

---

### 3. List GIS Features for a Layer

```http
GET /api/v1/gis/layers/:id/features
```

#### Query Parameters

| Parameter  | Type      | Required | Description                                                 |
| :--------- | :-------- | :------: | :---------------------------------------------------------- |
| `regionId` | `string`  |    No    | Filter features by region ID                                |
| `bbox`     | `string`  |    No    | Spatial bounding box filter (`minLon,minLat,maxLon,maxLat`) |
| `page`     | `integer` |    No    | Pagination page (default `1`)                               |
| `limit`    | `integer` |    No    | Features per page (default `50`, max `100`)                 |

#### Sensitive Coordinate Sanitization

If a feature belongs to an internal/restricted dispute zone and the requester is unauthenticated or a viewer, coordinates are masked:

```json
{
  "id": "SAMPLE-FEAT-005",
  "layerId": "SAMPLE-GIS-004",
  "geometry": {
    "type": "Polygon",
    "coordinates": []
  },
  "coordinatesGeneralized": true
}
```

---

### 4. Get GIS Feature Detail & Cross-Module Context

```http
GET /api/v1/gis/features/:id
```

Returns spatial feature attributes and direct links to connected platform entities:

```json
{
  "success": true,
  "data": {
    "id": "SAMPLE-FEAT-001",
    "layerId": "SAMPLE-GIS-001",
    "layerName": "Coringa Mangrove Forest Canopy & Core Reserve",
    "layerType": "COASTAL",
    "regionId": "SAMPLE-REG-KR-001",
    "type": "Feature",
    "geometry": {
      "type": "Polygon",
      "coordinates": [[[82.32, 16.92], ...]]
    },
    "properties": {
      "name": "Core Mangrove Parcel A",
      "canopyCover": "88%",
      "healthIndex": 0.92
    },
    "linkedEntities": {
      "evidence": {
        "id": "SAMPLE-EVD-001",
        "title": "Mangrove Carbon Stock Assessment 2024",
        "category": "SCIENTIFIC_STUDY"
      },
      "dataset": {
        "id": "SAMPLE-DTS-001",
        "title": "Coringa Estuary Blue Carbon Baseline Dataset",
        "technicalFormat": "GeoTIFF"
      },
      "project": {
        "id": "SAMPLE-PRJ-001",
        "name": "Coringa Estuary Blue Carbon Restoration",
        "code": "PRJ-CRG-001"
      },
      "policy": {
        "id": "SAMPLE-POL-001",
        "title": "National Coastal Zone Management Policy 2025",
        "code": "POL-CRZ-2025"
      },
      "indicator": {
        "id": "SAMPLE-IND-001",
        "name": "Canopy Density Index",
        "unit": "Percentage"
      },
      "dispute": null,
      "blueCarbon": {
        "id": "SAMPLE-BC-001",
        "ecosystemType": "Mangrove",
        "estimatedHectares": "124.5"
      }
    }
  }
}
```

---

### 5. Get Regional Governance Context

```http
GET /api/v1/regions/:id/context
```

Returns synthesized cross-module regional intelligence including total layers, feature count, metric totals, and preview lists of connected evidence, datasets, policies, projects, indicators, and disputes.

---

## UI Components

| Component         | Path                                          | Responsibility                                                                                                   |
| :---------------- | :-------------------------------------------- | :--------------------------------------------------------------------------------------------------------------- |
| `GisExplorer`     | `apps/web/src/components/GisExplorer.tsx`     | Main regional container with controls, layer sidebar, map/table switch, and regional context summary.            |
| `GisMap`          | `apps/web/src/components/GisMap.tsx`          | Pure native SVG GeoJSON canvas with pan/zoom, bounding box auto-fit, tooltip hover, and simulated outage mode.   |
| `GisLegend`       | `apps/web/src/components/GisLegend.tsx`       | Interactive layer toggle controls with symbol swatches, visibility badges, and feature count indicators.         |
| `GisFeatureTable` | `apps/web/src/components/GisFeatureTable.tsx` | Accessible table fallback for screen readers and offline fallback, providing search and inspect actions.         |
| `GisFeatureModal` | `apps/web/src/components/GisFeatureModal.tsx` | Detailed inspector showing feature attributes, geometry coordinates, and direct cross-module navigation buttons. |
