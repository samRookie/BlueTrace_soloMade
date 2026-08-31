# Development Guide — Phase 0

## Prerequisites

- **Node.js**: `v20.0.0` or higher (tested with v22 / v25)
- **pnpm**: `v9.0.0` or higher (tested with v9.15.4)

## Installation

Install all workspace dependencies:

```bash
pnpm install
```

## Running Development Servers

To start all applications (API and Web) simultaneously:

```bash
pnpm dev
```

To start individual applications:

```bash
# Start Web client on http://localhost:5173
pnpm --filter @sih26019/web dev

# Start API service on http://localhost:3001
pnpm --filter @sih26019/api dev
```

## Checking Health Endpoint

Once the API is running, verify the health status:

```bash
curl http://localhost:3001/health
```

Expected output:

```json
{
  "status": "ok",
  "service": "api",
  "version": "0.1.0"
}
```

## Available Commands

| Command                  | Description                                                     |
| :----------------------- | :-------------------------------------------------------------- |
| `pnpm dev`               | Start development servers across apps                           |
| `pnpm build`             | Build all packages and applications for production              |
| `pnpm typecheck`         | Run strict TypeScript compiler verification across all packages |
| `pnpm lint`              | Run ESLint across the entire monorepo                           |
| `pnpm format`            | Auto-format all files using Prettier                            |
| `pnpm format:check`      | Check code formatting compliance with Prettier                  |
| `pnpm test`              | Run all automated unit and integration tests                    |
| `pnpm db:migrate`        | Execute pending database migrations                             |
| `pnpm db:migrate:status` | Inspect local migration files and status                        |
| `pnpm db:seed`           | Run database seed scaffolding                                   |
