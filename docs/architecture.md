# Architecture Overview — Phase 0

## Monorepo Layout

The SIH26019 repository is structured as a TypeScript monorepo managed via `pnpm` workspaces.

```text
/
├── apps/
│   ├── api/                 # Express HTTP API service & /health endpoint
│   └── web/                 # React 19 + Vite frontend landing application
│
├── packages/
│   ├── shared-types/        # Shared TypeScript contracts and interfaces
│   ├── validation/          # Centralized validation schemas (Zod)
│   └── config/              # Centralized environment parsing & configuration
│
├── db/
│   ├── migrations/          # SQL migration files
│   ├── seeds/               # Seed scaffolding scripts
│   └── src/                 # Drizzle schema and client initialization
│
├── docs/                    # Architectural and developer documentation
├── scripts/                 # Monorepo maintenance and migration utility scripts
├── .github/workflows/       # Continuous Integration workflows
├── .env.example             # Safe environment variable template
├── pnpm-workspace.yaml      # Monorepo workspace configuration
├── tsconfig.base.json       # Base strict TypeScript compiler settings
└── package.json             # Root monorepo orchestration scripts
```

## Architectural Boundaries

### 1. Web Application (`apps/web`)

- **Role**: Client interface only.
- **Dependencies**: May depend on `packages/shared-types`.
- **Prohibitions**: Must not contain database drivers, server secrets, or backend business logic.

### 2. API Application (`apps/api`)

- **Role**: HTTP service layer, request routing, server bootstrap.
- **Dependencies**: May depend on `packages/shared-types`, `packages/validation`, `packages/config`, and `db`.
- **Prohibitions**: Must not leak raw credentials, unhandled stack traces, or internal infrastructure details.

### 3. Shared Packages (`packages/*`)

- **Role**: Cross-cutting libraries for typing, validation, and configuration.
- **Prohibitions**: Must not depend on application-specific code (`apps/*`).

### 4. Database Layer (`db/`)

- **Role**: Schema definitions, migration tooling, seed scaffolding, connection pooling.
- **Phase 0 State**: Contains 0 business tables. Provides extension points for future phases.
