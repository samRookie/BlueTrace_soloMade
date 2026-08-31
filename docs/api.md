# Backend Foundation & API Architecture (Phase 3)

## 1. Overview

The backend execution layer provides a versioned, typed, and structured API boundary for the **National Land Governance Research & Policy Innovation Platform (SIH26019)**.

It strictly adheres to a clean separation of concerns:

```text
HTTP Request
      ↓
Middleware Pipeline (requestId -> cors -> express.json)
      ↓
Route Registry (/api/v1/...)
      ↓
Validation Middleware (Zod-powered query/params/body parsing)
      ↓
Controller Layer (HTTP orchestration, DTO response mapping)
      ↓
Domain Service Layer (Domain logic, validation, repository coordination)
      ↓
Repository Layer (Parameterized Drizzle ORM queries, data access)
      ↓
Database (PostgreSQL Connection Pool)
```

---

## 2. Middleware Pipeline & Context

1. **Request ID Middleware (`requestIdMiddleware`)**:
   - Generates a UUID v4 identifier or preserves a safe incoming `x-request-id` header (`^[a-zA-Z0-9_-]{1,64}$`).
   - Attaches `req.id` to Express execution context.
   - Sets `x-request-id` response header.
   - Embeds `requestId` into all error envelopes and success metadata.

2. **CORS & Body Parser**:
   - `cors()` for cross-origin security.
   - `express.json({ limit: '1mb' })` with bounded body size protection against payload abuse.

3. **Validation Middleware (`validateRequest`)**:
   - Declarative validation for `query`, `params`, and `body` using Zod schemas.
   - Automatically coerces valid numeric types and returns standard HTTP 400 `VALIDATION_ERROR` envelopes before reaching controller code.

4. **Centralized Error Handler (`errorHandler`)**:
   - Distinguishes operational `AppError` subclasses (`BadRequestError`, `ValidationError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`, `ConflictError`).
   - Sanitizes unexpected 500 errors to prevent credential, hostname, or stack trace leakage in client responses.

---

## 3. Foundation Route Registry

All business routes reside under the `/api/v1` namespace. Infrastructure health checks are exposed at both `/health` and `/api/v1/health`.

| Method | Route                      | Description                            | Query Parameters                      |
| :----- | :------------------------- | :------------------------------------- | :------------------------------------ |
| `GET`  | `/health`                  | Unversioned health probe               | None                                  |
| `GET`  | `/api/v1/health`           | Standard versioned health check        | None                                  |
| `GET`  | `/api/v1/version`          | Platform baseline and environment info | None                                  |
| `GET`  | `/api/v1/regions`          | Paginated administrative regions       | `page`, `pageSize`, `level`, `search` |
| `GET`  | `/api/v1/regions/:id`      | Single region details by ID            | None (`:id` route parameter)          |
| `GET`  | `/api/v1/resources/counts` | Aggregated evidence entity counts      | None                                  |
| `GET`  | `/api/v1/dev/data-status`  | Development data & DB diagnostics      | None (_Disabled in production_)       |

---

## 4. Response Envelope Conventions

### Standard Success Response Envelope

```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 1,
      "totalPages": 1
    }
  },
  "meta": {
    "requestId": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    "page": 1,
    "limit": 20,
    "total": 1
  }
}
```

### Standard Error Response Envelope

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed.",
    "details": [
      {
        "code": "too_big",
        "maximum": 100,
        "type": "number",
        "inclusive": true,
        "exact": false,
        "message": "Number must be less than or equal to 100",
        "path": ["pageSize"]
      }
    ]
  },
  "requestId": "6ba7b810-9dad-11d1-80b4-00c04fd430c8"
}
```

---

## 5. HTTP Error Code Mapping

| Error Code         | HTTP Status | Description                                                       |
| :----------------- | :---------: | :---------------------------------------------------------------- |
| `VALIDATION_ERROR` |     400     | Query, route parameter, or request body failed schema validation. |
| `BAD_REQUEST`      |     400     | Malformed request syntax or invalid parameter combinations.       |
| `UNAUTHORIZED`     |     401     | Missing or invalid authentication token.                          |
| `FORBIDDEN`        |     403     | Diagnostic endpoint or action disabled in current environment.    |
| `NOT_FOUND`        |     404     | Target entity or route does not exist.                            |
| `CONFLICT`         |     409     | Duplicate entity unique key or constraint conflict.               |
| `INTERNAL_ERROR`   |     500     | Unhandled internal exception (sanitized output).                  |

---

## 6. Pagination & Filtering Rules

- **Default Page**: `1` (1-indexed)
- **Default Page Size**: `20`
- **Max Page Size**: `100` (Enforced by `paginationQuerySchema`)
- **Safe Filtering**: Whitelisted filter fields (`level` matching `RegionLevel`, `search` matching text up to 100 characters). Raw SQL fragments in query parameters are strictly rejected.
