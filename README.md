# Orbit Admin Gateway

The security guard for the internal Admin Control Panel - the same role
`orbit-gateway` plays for the tenant-facing Frontend, but for platform
operators instead of tenants, and talking to the **same Kernel**.

```
ORBIT ADMIN FRONTEND (the display)
              │
              ▼
ORBIT ADMIN GATEWAY (this repo - the security guard)
              │
              ▼
        ORBIT KERNEL (the SAME brain the tenant Gateway uses)
              │
              ▼
          POSTGRES (same self-hosted database, read for
                     usage/health/errors, written only for
                     admin_users, is_active flags, error_log,
                     security_alerts, company_usage_events)
```

It is a **separate deployment** from `orbit-gateway` on purpose:
- separate shared secret (`ADMIN_GATEWAY_SHARED_SECRET`, distinct from
  `GATEWAY_SHARED_SECRET`)
- separate session cookie (`orbit_admin_session`, distinct from
  `orbit_session`)
- separate authentication system entirely - admin operators are never
  Supabase identities, see the Kernel's `kernel/admin/auth.py`.

It never touches Supabase and never decides who an admin is or what
they can do - identical philosophy to `orbit-gateway`: shape-check the
request, forward it to the Kernel with the admin shared secret, relay
the Kernel's response verbatim, store the session token in an httpOnly
cookie.

## Local setup

1. `cp .env.example .env` and fill in:
   - `KERNEL_URL` - the same Kernel `orbit-gateway` points at
   - `ADMIN_GATEWAY_SHARED_SECRET` - must exactly match the Kernel's
     `ADMIN_GATEWAY_SHARED_SECRET` (see the kernel admin patch)
2. `npm install`
3. `npm run dev` (defaults to `http://localhost:3002`)
4. `curl -X POST http://localhost:3002/api/admin/auth/login -H "Content-Type: application/json" -d '{"username":"admin374512","password":"Admin1234"}'`

## Repository structure

```
admin-gateway/
├── middleware.ts                        # "is a credential present" check
├── src/
│   ├── app/api/admin/
│   │   ├── auth/login|logout|session|change-password/route.ts
│   │   ├── overview/route.ts             # usage + kernel health + open alerts
│   │   ├── companies/route.ts            # GET list (with usage %)
│   │   ├── companies/[id]/status/route.ts # POST activate/deactivate
│   │   ├── users/route.ts                # GET list
│   │   ├── users/[id]/status/route.ts    # POST activate/deactivate
│   │   ├── health/route.ts               # kernel + python process health
│   │   ├── errors/route.ts               # GET list + code summary
│   │   ├── errors/[id]/route.ts          # GET one error's full detail
│   │   └── security-alerts/route.ts,
│   │       security-alerts/[id]/resolve/route.ts
│   └── gateway/
│       ├── kernel/kernel.client.ts        # the ONLY thing that calls the Kernel
│       ├── kernel/kernel.types.ts
│       ├── kernel/kernel.errors.ts
│       ├── auth/cookies.ts                # stores/forwards the admin token
│       ├── middleware/require-admin-token.ts
│       └── config/env.ts
```
