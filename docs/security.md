# Security Architecture & Authorization Baseline (Phase 4)

## 1. Overview & Core Security Principles

Security in the **National Land Governance Research & Policy Innovation Platform (SIH26019)** is anchored on the principle:

> **The server is the single source of truth for identity, permissions, resource ownership, and auditability. The client is never trusted for authorization.**

```text
HTTP Request
      ↓
Request ID Middleware (x-request-id correlation)
      ↓
CORS & Bounded Body Parser (1MB limit)
      ↓
Session Middleware (HttpOnly Cookie / Bearer token extraction)
      ↓
CSRF Guard (Origin / Referer / X-Requested-With verification)
      ↓
Authentication Guard (requireAuth: 401 if unauthenticated)
      ↓
Authorization Guard (requirePermission: 403 if insufficient role)
      ↓
Controller ➔ Domain Service (Ownership / Membership / IDOR checks)
      ↓
Repository ➔ Database (Parameterized queries)
      ↓
Audit Service (Immutable append-only audit event logging)
```

---

## 2. The Eight Platform Personas

Phase 4 defines exactly eight platform personas mapped to institutional governance roles:

| Persona / Role         | Institutional Description                                             | Baseline Permissions                                                                                     |
| :--------------------- | :-------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------- |
| **`ADMIN`**            | System Administrator with full infrastructure and audit oversight.    | All permissions (`*`)                                                                                    |
| **`POLICY_OFFICER`**   | Government Land Governance & Policy Formulation Official.             | `regions:read`, `resources:read`, `workspaces:*`, `projects:*`, `disputes:read`, `audit:read`            |
| **`RESEARCHER`**       | Geospatial and empirical land restoration researcher.                 | `regions:read`, `resources:read`, `workspaces:*`, `projects:read`, `projects:create`, `projects:update`  |
| **`ANALYST`**          | Data analyst evaluating environmental and carbon indicators.          | `regions:read`, `resources:read`, `workspaces:read`, `projects:read`                                     |
| **`VERIFIER`**         | Independent third-party auditor validating Blue Carbon MRV records.   | `regions:read`, `resources:read`, `projects:read`, `projects:verify`, `audit:read`                       |
| **`COMMUNITY_LEAD`**   | Local community custodian and participatory stakeholder.              | `regions:read`, `resources:read`, `workspaces:read`, `projects:read`, `disputes:read`, `disputes:create` |
| **`DISPUTE_MEDIATOR`** | Legal officer arbitrating boundary and land tenure conflicts.         | `regions:read`, `resources:read`, `projects:read`, `disputes:read`, `disputes:resolve`, `audit:read`     |
| **`VIEWER`**           | Public citizen observer with access to transparent evidence catalogs. | `regions:read`, `resources:read`, `projects:read`                                                        |

---

## 3. Authentication & Password Security

- **Algorithm**: Salted `scrypt` hashing with 64-byte key derivations and unique 16-byte random salts.
- **Verification**: Constant-time comparison (`crypto.timingSafeEqual`) to prevent timing side-channel attacks.
- **Data Protection**: Plaintext passwords and hashes are strictly stripped from responses, DTOs, logs, and audit entries.
- **Normalization**: User emails are normalized to lowercase prior to persistence queries.

---

## 4. Session Management

- **Session Tokens**: Cryptographically random 256-bit hexadecimal strings.
- **Storage**: The database stores only the one-way **SHA-256 hash** of the session token.
- **Transport**: Stored in a secure `HttpOnly`, `SameSite=Lax` browser cookie (`bluetrace_session`) with `Secure` enabled in production.
- **Lifetime**: 24-hour absolute expiration, with immediate server-side revocation on logout.

---

## 5. Defense-in-Depth Protections

### 1. Insecure Direct Object Reference (IDOR)

Every resource route validates that the requester owns, is assigned to, or is a recorded member of the target entity (e.g. `/api/v1/workspaces/:id`). Unauthorized attempts return HTTP 404 to prevent revealing the existence of private records.

### 2. Privilege Escalation Prevention

- **Horizontal**: User A cannot read or mutate User B's private workspaces or disputes.
- **Vertical**: Client-submitted role fields in request bodies or headers are completely ignored; the server derives authority exclusively from the validated session.

### 3. Cross-Site Request Forgery (CSRF)

State-changing HTTP methods (`POST`, `PUT`, `DELETE`, `PATCH`) enforce strict Origin and Referer validation or require custom AJAX headers (`X-Requested-With` / `X-CSRF-Token`).

### 4. Brute-Force & Rate Limiting

Sensitive authentication endpoints (`/api/v1/auth/login`) are protected by an in-memory sliding-window rate limiter returning HTTP 429 upon threshold breach.

---

## 6. Immutable Security Audit Trail

All security-sensitive operations generate an immutable record in `audit_events`:

- **Captured Metadata**: `actorId`, `actorRole`, `action`, `targetType`, `targetId`, `requestId`, `status` (`SUCCESS`, `FAILURE`, `DENIED`), `ipAddress`, `createdAt`.
- **Traceability**: Every event contains the correlation `requestId` established by the HTTP middleware.
- **No Mutation API**: The platform exposes only read endpoints (`GET /api/v1/audit/events`) restricted to authorized compliance personas (`ADMIN`, `POLICY_OFFICER`, `VERIFIER`, `DISPUTE_MEDIATOR`).

---

## 7. Development vs. Production Safety

- **Demo Persona Selector**: Rendered exclusively in development mode; completely disabled in production.
- **Production Guard**: Demo seed accounts and debug endpoints are strictly gated by `NODE_ENV !== 'production'`.
