# SIH26019 — National Land Governance Research & Policy Innovation Platform

[![CI](https://github.com/sih26019/platform/actions/workflows/ci.yml/badge.svg)](https://github.com/sih26019/platform/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![pnpm](https://img.shields.io/badge/pnpm-9.15.4-orange.svg)](https://pnpm.io/)

## Project Overview

The **National Land Governance Research & Policy Innovation Platform (SIH26019)** is an institutional platform designed to facilitate research, spatial data analytics, policy simulation, and decision-support for national land governance.

---

## Current Status: Phase 0 (Foundation)

> **Phase 0 — Foundation & Monorepo Initialization**  
> Status: **Under Active Development / Foundation Initialized**

Phase 0 establishes the production-grade TypeScript monorepo architecture, application shells, developer tooling, database migration scaffolding, shared packages, CI automation, and verification workflows.

### Phase 0 Scope Boundaries

This phase explicitly **does NOT contain business functionality**. The following capabilities are reserved for future phases:

- ❌ Authentication / Authorization / User Accounts
- ❌ Land Record Repositories & Domain Entities
- ❌ Dashboards & Business Visualizations
- ❌ GIS / Spatial Mapping / Geo-processing
- ❌ Blue Carbon & Environmental Metric Calculations
- ❌ AI / LLM / Policy Recommendation Engines
- ❌ External Government Integrations
- ❌ Mock Business Datasets & Fake Domain Records

---

## Repository Architecture

```text
/
├── apps/
│   ├── api/                 # Express HTTP API service (exposes GET /health)
│   └── web/                 # React 19 + Vite accessible landing page
│
├── packages/
│   ├── shared-types/        # Shared TypeScript contracts (e.g. HealthCheckResponse)
│   ├── validation/          # Centralized validation schemas using Zod
│   └── config/              # Centralized environment parsing & validation
│
├── db/
│   ├── migrations/          # SQL migrations directory
│   ├── seeds/               # Database seed scaffolding (zero business data)
│   └── src/                 # Drizzle ORM schema & client initialization
│
├── docs/                    # Architecture, environment, testing, and boundary docs
├── scripts/                 # Monorepo maintenance and migration utility scripts
├── .github/workflows/       # Continuous Integration workflows
├── .env.example             # Safe environment variable configuration template
├── pnpm-workspace.yaml      # pnpm workspace definition
├── tsconfig.base.json       # Base strict TypeScript compiler options
└── package.json             # Root monorepo orchestration scripts
```

---

## Prerequisites

Ensure the following tools are installed on your workstation:

- **Node.js**: `v20.0.0` or higher (tested on Node `v22.x` and `v25.x`)
- **pnpm**: `v9.0.0` or higher (tested on pnpm `v9.15.4`)

---

## Getting Started

### 1. Clone & Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment

Copy the example environment template to create your local `.env`:

```bash
cp .env.example .env
```

Safe local defaults are pre-configured:

- `NODE_ENV=development`
- `API_PORT=3001`
- `WEB_PORT=5173`
- `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sih26019_dev`

---

## Development

Start both the Web client and API server concurrently in development mode:

```bash
pnpm dev
```

Or start individual services independently:

```bash
# Start Web client on http://localhost:5173
pnpm --filter @sih26019/web dev

# Start API service on http://localhost:3001
pnpm --filter @sih26019/api dev
```

### Health Check Endpoint

When the API service is running, verify its status:

```bash
curl http://localhost:3001/health
```

Expected JSON response:

```json
{
  "status": "ok",
  "service": "api",
  "version": "0.1.0"
}
```

---

## Quality & Verification Commands

All quality gates are runnable from the repository root:

```bash
# Typecheck all packages with strict TypeScript compiler
pnpm typecheck

# Run ESLint across all packages and apps
pnpm lint

# Check formatting compliance with Prettier
pnpm format:check

# Auto-format all code
pnpm format

# Run all automated tests (Vitest)
pnpm test

# Build all packages and applications for production
pnpm build
```

---

## Database Commands

Database tooling is powered by Drizzle ORM and node-postgres:

```bash
# Check local migration files and readiness
pnpm db:migrate:status

# Run migrations against DATABASE_URL
pnpm db:migrate

# Run seed scaffolding (Phase 0 contains zero business records)
pnpm db:seed
```

---

## Documentation

Detailed documentation is available in the [`docs/`](./docs/) directory:

- [`docs/architecture.md`](./docs/architecture.md) — Monorepo design and package boundaries
- [`docs/development.md`](./docs/development.md) — Local developer setup and workflows
- [`docs/environment.md`](./docs/environment.md) — Environment variables and security rules
- [`docs/database.md`](./docs/database.md) — Database schema, migration, and seed structure
- [`docs/testing.md`](./docs/testing.md) — Testing strategy and test suites
- [`docs/boundaries.md`](./docs/boundaries.md) — Explicit phase boundaries and exclusions
