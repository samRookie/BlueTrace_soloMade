# Testing Strategy — Phase 0

## Testing Architecture

The monorepo uses **Vitest** for fast, native TypeScript testing across packages and applications.

## Test Suites

### 1. Web Application (`apps/web/tests/`)

- **Framework**: Vitest + `@testing-library/react` + `jsdom`.
- **Coverage**: Root component initialization, landing page semantic structure, accessibility headings, and status badge verification.

### 2. API Service (`apps/api/tests/`)

- **Framework**: Vitest + `supertest`.
- **Coverage**: Server boot, HTTP 200 status code verification on `GET /health`, deterministic response format, absence of leaked credentials or stack traces, and 404 handler for invalid routes.

### 3. Validation Package (`packages/validation/tests/`)

- **Framework**: Vitest.
- **Coverage**: Schema validation parsing, correct payload acceptance, invalid structure rejection.

### 4. Config Package (`packages/config/tests/`)

- **Framework**: Vitest.
- **Coverage**: Default value resolution, environment variable overrides, and invalid port/environment error handling.

## Running Tests

Run all workspace tests:

```bash
pnpm test
```

Run tests for a specific workspace member:

```bash
pnpm --filter @sih26019/api test
pnpm --filter @sih26019/web test
pnpm --filter @sih26019/validation test
pnpm --filter @sih26019/config test
```
