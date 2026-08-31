# Database Architecture, Tooling & Persistence — Phase 2

## Database Foundation Overview

In Phase 2, the persistence layer provides a real PostgreSQL schema and traversable evidence graph for the **National Land Governance Research & Policy Innovation Platform (SIH26019)**.

Refer to [`docs/database-schema.md`](./database-schema.md) for full entity and relational graph definitions.

## Database Package (`@sih26019/db`)

- **ORM / Tooling**: Drizzle ORM + Drizzle Kit + `pg` (node-postgres) + `@electric-sql/pglite` (for test isolation).
- **Schema Location**: `db/src/schema.ts`
- **Migrations Location**: `db/migrations/`
- **Seed Scaffolding**: `db/seeds/`
- **Base Utilities**: `db/src/repositories/base.ts`

## Database Commands

### Checking Migration Status

```bash
pnpm db:migrate:status
```

Inspects `db/migrations/` and displays the count of local migration files.

### Running Migrations

```bash
pnpm db:migrate
```

Applies all pending `.sql` migrations in `db/migrations/` to the database configured via `DATABASE_URL`.

### Running Seeds

```bash
pnpm db:seed
```

Seeds the deterministic coastal/mangrove sample graph (`sampleFlag = true`).

### Resetting Development Database

```bash
pnpm db:reset
```

Safely drops the development schema, runs all migrations from scratch, and seeds the deterministic demonstration graph. Gated against production environments.
