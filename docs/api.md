# Backend Foundation & API Architecture (Phase 4)

## 1. Overview

The backend execution layer provides a versioned, typed, and structured API boundary for the **National Land Governance Research & Policy Innovation Platform (SIH26019)**.

It strictly adheres to a clean separation of concerns:

```text
HTTP Request
      ↓
Middleware Pipeline (requestId -> cors -> session -> csrfProtection)
      ↓
Route Registry (/api/v1/...)
      ↓
Authentication & Authorization Guards (requireAuth -> requirePermission)
      ↓
Validation Middleware (Zod-powered query/params/body parsing)
      ↓
Controller Layer (HTTP orchestration, cookie handling, DTO response mapping)
      ↓
Domain Service Layer (Domain logic, IDOR assertions, audit event recording)
      ↓
Repository Layer (Parameterized Drizzle ORM queries, data access)
      ↓
Database (PostgreSQL Connection Pool)
```

---

## 2. Middleware Pipeline & Context

1. **Request ID Middleware (`requestIdMiddleware`)**:
   - Generates a UUID v4 identifier or preserves a safe incoming `x-request-id` header (`^[a-zA-Z0-9_-]{1,64}$`).
   - Attaches `req.id` to Express execution context and response headers.
   - Embeds `requestId` into all error envelopes and audit logs.

2. **CORS & Body Parser**:
   - `cors({ credentials: true })` for cross-origin security.
   - `express.json({ limit: '1mb' })` with bounded body size protection against payload abuse.

3. **Session Middleware (`sessionMiddleware`)**:
   - Extracts session token from `bluetrace_session` HttpOnly cookie or Authorization Bearer header.
   - Hydrates `req.user` and `req.session` from verified database session records.

4. **CSRF Protection (`csrfProtection`)**:
   - Enforces Origin/Referer verification and `X-Requested-With` header checks on state-changing methods (`POST`, `PUT`, `DELETE`, `PATCH`).

5. **Authentication & RBAC Guards (`requireAuth`, `requirePermission`)**:
   - `requireAuth`: Enforces active session, rejecting unauthenticated requests with HTTP 401.
   - `requirePermission`: Verifies caller role possesses requisite capability in the centralized policy matrix, rejecting unauthorized callers with HTTP 403.

6. **Validation Middleware (`validateRequest`)**:
   - Declarative validation for `query`, `params`, and `body` using Zod schemas.
   - Returns standard HTTP 400 `VALIDATION_ERROR` envelopes before reaching controller code.

7. **Centralized Error Handler (`errorHandler`)**:
   - Distinguishes operational `AppError` subclasses (`BadRequestError`, `ValidationError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`, `ConflictError`).
   - Sanitizes unexpected 500 errors to prevent credential, hostname, or stack trace leakage in client responses.

---

## 3. API Route Registry

All business routes reside under the `/api/v1` namespace.

| Method  | Route                                              | Description                               | Auth / Permission     | Parameters / Body                                 |
| :------ | :------------------------------------------------- | :---------------------------------------- | :-------------------- | :------------------------------------------------ |
| `GET`   | `/health`                                          | Unversioned health probe                  | Public                | None                                              |
| `GET`   | `/api/v1/health`                                   | Standard versioned health check           | Public                | None                                              |
| `GET`   | `/api/v1/version`                                  | Platform baseline and environment info    | Public                | None                                              |
| `POST`  | `/api/v1/auth/login`                               | Authenticate user & issue session cookie  | Public (Rate Limited) | `{ email, password }`                             |
| `POST`  | `/api/v1/auth/logout`                              | Revoke session & clear cookie             | Authenticated         | None                                              |
| `GET`   | `/api/v1/auth/me`                                  | Current authenticated user profile        | Authenticated         | None                                              |
| `GET`   | `/api/v1/audit/events`                             | Compliance security audit log             | `audit:read`          | `page`, `pageSize`, `actorId`, `action`, `status` |
| `GET`   | `/api/v1/workspaces`                               | Accessible user workspaces                | Authenticated         | `page`, `pageSize`                                |
| `GET`   | `/api/v1/workspaces/:id`                           | Single workspace by ID (IDOR protected)   | Authenticated         | `id` in path                                      |
| `GET`   | `/api/v1/regions`                                  | Paginated administrative regions          | Public / Base         | `page`, `pageSize`, `level`, `search`             |
| `GET`   | `/api/v1/regions/:id`                              | Single region by ID                       | Public / Base         | `id` in path                                      |
| `GET`   | `/api/v1/resources/counts`                         | Aggregated entity counts                  | Public / Base         | None                                              |
| `GET`   | `/api/v1/evidence`                                 | List & discover evidence resources        | Public / Filtered     | None (Filtered by persona visibility)             |
| `GET`   | `/api/v1/research`                                 | Alias for `/api/v1/evidence`              | Public / Filtered     | None (Filtered by persona visibility)             |
| `POST`  | `/api/v1/evidence`                                 | Register new evidence item                | Authenticated         | `evidence:create`                                 |
| `GET`   | `/api/v1/evidence/:id`                             | Get evidence with graph & attachments     | Public / Filtered     | None (Gated by visibility)                        |
| `POST`  | `/api/v1/evidence/:id/relationships`               | Link related evidence items (no loops)    | Authenticated         | `evidence:link`                                   |
| `POST`  | `/api/v1/evidence/:id/attachments`                 | Safe upload & attach document (max 10MB)  | Authenticated         | `evidence:upload`                                 |
| `GET`   | `/api/v1/evidence/:id/attachments/:attId/download` | Secure streaming download of attachment   | Public / Filtered     | `evidence:download`                               |
| `GET`   | `/api/v1/datasets`                                 | Search & filter dataset catalog           | Public / Filtered     | `q`, `type`, `format`, `accessLevel`, `regionId`  |
| `GET`   | `/api/v1/datasets/:id`                             | Get dataset detail with metadata & links  | Public / Filtered     | `id` in path                                      |
| `POST`  | `/api/v1/datasets`                                 | Register specialized dataset entry        | Authenticated         | `dataset:create`                                  |
| `PATCH` | `/api/v1/datasets/:id`                             | Update dataset metadata & attributes      | Authenticated         | `dataset:update`                                  |
| `POST`  | `/api/v1/datasets/:id/attachments`                 | Upload dataset file attachment (max 10MB) | Authenticated         | `dataset:create`                                  |
| `GET`   | `/api/v1/datasets/:id/attachments/:attId/download` | Enforced secure download with audit trail | Gated by Access Level | `dataset:download`                                |
| `GET`   | `/api/v1/dev/data-status`                          | Database seed & readiness diagnostics     | Dev Only              | None                                              |

---

## 4. Response Envelopes & Standard Status Codes

### Success Response (`200 OK`)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "SAMPLE-USR-001",
      "email": "admin@bluetrace.gov.in",
      "name": "Admin User",
      "role": "ADMIN",
      "status": "ACTIVE"
    }
  },
  "meta": {
    "requestId": "a0d08814-2a82-4d78-bb4f-0dfe37e4d750",
    "timestamp": "2026-08-31T19:00:00.000Z"
  }
}
```

### Error Response (`401 UNAUTHORIZED` / `403 FORBIDDEN` / `404 NOT_FOUND`)

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Forbidden: User does not possess 'audit:read' permission."
  },
  "meta": {
    "requestId": "a0d08814-2a82-4d78-bb4f-0dfe37e4d750",
    "timestamp": "2026-08-31T19:00:00.000Z"
  }
}
```
