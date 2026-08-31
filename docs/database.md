# Database Tooling & Migrations — Phase 0

## Database Foundation Overview

In Phase 0, the database layer provides tooling, configuration, and migration structure with **zero business tables**.

## Database Package (`@sih26019/db`)

- **ORM / Tooling**: Drizzle ORM + Drizzle Kit + `pg` (node-postgres).
- **Schema Location**: `db/src/schema.ts`
- **Migrations Location**: `db/migrations/`
- **Seed Scaffolding**: `db/seeds/index.ts`

## Database Commands

### Checking Migration Status

```bash
pnpm db:migrate:status
```

Inspects `db/migrations/` and displays the count of local migration files. In Phase 0, 0 migration files are present.

### Running Migrations

```bash
pnpm db:migrate
```

Runs any `.sql` migrations in `db/migrations/` against the configured `DATABASE_URL`.

### Running Seeds

```bash
pnpm db:seed
```

Executes the seed scaffolding script. In Phase 0, zero business records are seeded.

## Adding Future Migrations

In future development phases:

1. Define table schemas in `db/src/schema.ts`.
2. Generate migration SQL files using `drizzle-kit generate`.
3. Apply migrations using `pnpm db:migrate`.
