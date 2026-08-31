# Environment Configuration Guide

## Configuration Overview

All configuration is managed centrally via `@sih26019/config` and validated using Zod schemas.

## Configuration Template (`.env.example`)

Copy `.env.example` to create your local `.env` file:

```bash
cp .env.example .env
```

## Environment Variables

| Variable       | Type                                    | Default                                                      | Description                                                      |
| :------------- | :-------------------------------------- | :----------------------------------------------------------- | :--------------------------------------------------------------- |
| `NODE_ENV`     | `development` \| `test` \| `production` | `development`                                                | Application runtime environment.                                 |
| `API_PORT`     | `number` (1-65535)                      | `3001`                                                       | Port on which the API Express service listens.                   |
| `WEB_PORT`     | `number` (1-65535)                      | `5173`                                                       | Port on which the Vite development server serves the web client. |
| `DATABASE_URL` | `string` (Postgres URL)                 | `postgresql://postgres:postgres@localhost:5432/sih26019_dev` | PostgreSQL connection string.                                    |

## Security Rules

1. **Never commit `.env` files**: `.env` and `.env.*` are ignored by git in `.gitignore`.
2. **Use safe local defaults**: Default variables must allow local testing without connecting to production infrastructure.
3. **No credentials in code**: Do not hardcode passwords, API keys, or database connection credentials in source code.
