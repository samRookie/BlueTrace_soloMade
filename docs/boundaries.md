# Phase Boundaries & Scope Protection — Phase 1

## Phase 1 Objective

Phase 1 establishes solely the **shared domain contracts, DTOs, validation schemas, API envelopes, error codes, and provider adapter interfaces** for SIH26019.

## Explicit Out-of-Scope Capabilities

The following capabilities belong to future implementation phases and remain **strictly excluded** from Phase 1:

- **Authentication & Authorization Enforcement**: No login endpoints, password hashing, JWT generation, session stores, or permission enforcement middleware (Roles are contracts/vocabulary only).
- **Business Database Migrations & Tables**: No database tables for land parcels, evidence, users, policies, or research projects.
- **Repositories & Business Logic**: No business services, domain logic, or persistence repositories.
- **GIS & Spatial Intelligence**: No map viewers, geospatial layers, shapefile processors, or GeoJSON engines (GISAdapter is an interface only).
- **Blue Carbon & Environmental Analytics**: No carbon credit calculations, coastal sensor models, or ecological models.
- **AI & LLM Services**: No concrete AI API connections, prompt execution engines, or vector embeddings (AIAdapter is an interface only).
- **Government System Integrations**: No external land registry APIs, municipal data ingestion, or mock state endpoints.
- **Mock & Fake Data**: No mock dashboards, fake statistics, or dummy user databases.
