# Architecture Overview — Phase 1

**Architecture Version**: `1.0`  
**Phase**: `Phase 1 — Shared Domain Contracts & Architecture Foundation`

---

## 1. Layered Architecture

```text
Web Client (apps/web)
  ↓
Typed API Client (fetchApi<T>)
  ↓
HTTP API & Versioned Router (apps/api: /api/v1 & /health)
  ↓
Shared Domain Contracts & Validation (packages/shared-types & packages/validation)
  ↓
Provider Adapters (AIAdapter, StorageAdapter, GISAdapter, IntegrityAdapter)
  ↓
Infrastructure & Database Tooling (db/)
```

---

## 2. Monorepo Package Boundaries

```text
/
├── apps/
│   ├── api/                 # Express HTTP API service (/health, /api/v1) & error mapping
│   └── web/                 # React 19 + Vite frontend shell & typed API client
│
├── packages/
│   ├── shared-types/        # Foundational contracts, DTOs, API envelopes, provider interfaces
│   ├── validation/          # Runtime Zod schemas enforcing domain contracts
│   └── config/              # Centralized environment parsing & configuration
│
├── db/
│   ├── migrations/          # SQL migration files (0 business tables in Phase 1)
│   ├── seeds/               # Seed scaffolding scripts (0 fake records)
│   └── src/                 # Drizzle schema and client initialization
│
├── docs/                    # Architectural, contract, and developer documentation
├── scripts/                 # Monorepo maintenance and migration utility scripts
├── .github/workflows/       # Continuous Integration workflows
├── .env.example             # Safe environment variable template
├── pnpm-workspace.yaml      # Monorepo workspace configuration
├── tsconfig.base.json       # Base strict TypeScript compiler settings
└── package.json             # Root monorepo orchestration scripts
```

---

## 3. Dependency Direction & Contract Rules

1. **One-Way Dependency Flow**:
   - `packages/shared-types` ➔ `packages/validation` ➔ `packages/config` ➔ `apps/*`.
   - Shared packages must never import application-specific modules (`apps/*`).
2. **Provider Security Rule**:
   - Provider adapter interfaces (`AIAdapter`, `StorageAdapter`, `GISAdapter`, `IntegrityAdapter`) describe domain operations only.
   - Provider credentials, secrets, and API keys must remain strictly in application runtime configuration and never appear in domain contracts or request payloads.
3. **Envelope & Error Serialization**:
   - All `/api/v1` routes return the unified `ApiResponse<T>` envelope (`ApiSuccessResponse<T>` or `ApiErrorResponse`).
   - Server exceptions are mapped through `errorHandler` to standard `ApiErrorCode` values without leaking stack traces or internal environment variables.

---

## 4. API Namespaces

- `/health`: Base health check route returning `{ status: 'ok', service: 'api', version: '0.1.0', architectureVersion: '1.0' }`.
- `/api/v1/health`: Standard envelope wrapped health endpoint.
- `/api/v1/version`: API version and architecture baseline endpoint.
- Future business endpoints will mount under `/api/v1/...`.
