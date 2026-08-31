# SIH26019 — National Land Governance Research & Policy Innovation Platform

[![CI](https://github.com/samRookie/BlueTrace_soloMade/actions/workflows/ci.yml/badge.svg)](https://github.com/samRookie/BlueTrace_soloMade/actions/workflows/ci.yml)
[![Architecture Version](https://img.shields.io/badge/Architecture%20Version-1.0-blue.svg)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![pnpm](https://img.shields.io/badge/pnpm-9.15.4-orange.svg)](https://pnpm.io/)

## Project Overview

The **National Land Governance Research & Policy Innovation Platform (SIH26019)** is an institutional platform designed to facilitate research, spatial data analytics, policy simulation, and decision-support for national land governance.

---

## Current Status: Phase 2 (PostgreSQL Evidence Graph & Deterministic Development Data)

> **Phase 2 — PostgreSQL Persistence Layer & Evidence Graph**  
> **Architecture Version: 1.0**  
> Status: **Persistence Foundation & Deterministic Seed Graph Established**

Phase 2 establishes the real PostgreSQL schema, Drizzle ORM migrations, foreign-key relationships, indexes, check constraints, base data-access utilities, development data-status diagnostics, and a connected synthetic coastal/mangrove demonstration evidence graph (`sampleFlag = true`).

### Phase 2 Scope Boundaries

This phase explicitly **does NOT contain business dashboards or full service workflows**. The following capabilities remain reserved for future phases:

- ❌ Authentication / Authorization Enforcement / Session Management
- ❌ Dashboards & UI Exploration Modules
- ❌ GIS Rendering Engines / Shapefile Processors (GIS layers are metadata-only)
- ❌ Blue Carbon Scientific Equations / Automated Carbon Accounting
- ❌ AI / LLM / Policy Recommendation Engines
- ❌ External Government Integrations
- ❌ Real-Person Data / Identifiable Landowner Records

---

## Repository Architecture

```text
/
├── apps/
│   ├── api/                 # Express HTTP API service (/health, /api/v1, /api/v1/dev)
│   └── web/                 # React 19 + Vite accessible landing page & typed client
│
├── packages/
│   ├── shared-types/        # Domain vocabulary, DTOs, API envelopes, provider interfaces
│   ├── validation/          # Centralized validation schemas using Zod
│   └── config/              # Centralized environment parsing & validation
│
├── db/
│   ├── migrations/          # SQL migrations directory (15 relational domain tables)
│   ├── seeds/               # Deterministic coastal/mangrove seed factories & datasets
│   └── src/                 # Drizzle ORM schema, client, & repository base utilities
│
├── docs/                    # Architecture, schema, contracts, testing, boundary docs
├── scripts/                 # Monorepo maintenance, migration, and reset utility scripts
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
- **PostgreSQL**: `v14+` or `v16+` (for live database connections; automated tests run against embedded in-process Postgres via `@electric-sql/pglite`)

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

### Diagnostic & Health Endpoints

When the API service is running, verify its status:

```bash
# Standard health check
curl http://localhost:3001/health

# Versioned API namespace
curl http://localhost:3001/api/v1/health

# Development diagnostic data-status (gated against production)
curl http://localhost:3001/api/v1/dev/data-status
```

---

## Database Commands

Database tooling is powered by Drizzle ORM, node-postgres, and PGLite:

```bash
# Check local migration files and readiness
pnpm db:migrate:status

# Run migrations against DATABASE_URL
pnpm db:migrate

# Seed deterministic coastal/mangrove demonstration dataset
pnpm db:seed

# Safely reset development database (recreate schema + migrate + seed)
pnpm db:reset
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

# Run all automated tests (Vitest, 53 tests across 10 suites)
pnpm test

# Build all packages and applications for production
pnpm build
```

---

## Documentation

Detailed documentation is available in the [`docs/`](./docs/) directory:

- [`docs/database-schema.md`](./docs/database-schema.md) — PostgreSQL entity inventory, constraints, indexes, and seed graph
- [`docs/contracts.md`](./docs/contracts.md) — Shared domain contracts, vocabulary, and provider interfaces
- [`docs/architecture.md`](./docs/architecture.md) — Monorepo design, layer diagrams, and package boundaries
- [`docs/development.md`](./docs/development.md) — Local developer setup and workflows
- [`docs/environment.md`](./docs/environment.md) — Environment variables and security rules
- [`docs/database.md`](./docs/database.md) — Database schema, migration, and seed structure
- [`docs/testing.md`](./docs/testing.md) — Testing strategy and test suites
- [`docs/boundaries.md`](./docs/boundaries.md) — Explicit phase boundaries and exclusions
