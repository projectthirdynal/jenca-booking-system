# Feature 08 — Auth & Security

Priority: **P0** · Status: **in-progress** · Depends on: —

## Overview

Admin-only authentication via Supabase Auth. Clients are guest bookers — no
account needed. Security model ensures only authenticated admins can mutate
data, while public routes read only active/published content. Row Level
Security (RLS) policies provide defense-in-depth at the database level.

## User Stories

- **AU1** — As an admin, I log in with email + password at `/admin/login`.
- **AU2** — As an admin, I am redirected to `/admin/login` when accessing protected routes without a session.
- **AU3** — As an admin, I can log out from the sidebar.
- **AU4** — As an admin, my session persists across page refreshes (Supabase cookie).
- **AU5** — As a clinic owner, only people I invite can access the admin dashboard.
- **AU6** — As a developer, RLS policies prevent data leaks even if the anon key is compromised.

## Auth Architecture

### Supabase Auth (server-side cookies)
- Uses `@supabase/ssr` with server-side cookie storage.
- `createClient()` (server) reads cookies from `next/headers`.
- `createClient()` (client) reads cookies from browser.
- Session refresh handled automatically by Supabase SSR client.

### Route protection
- **`(protected)` route group** — `/admin/(protected)/layout.tsx` calls `supabase.auth.getUser()` and redirects to `/admin/login` if no session.
- **`/admin/login`** — outside protected group; renders login form.
- **API routes** — each admin mutation checks `supabase.auth.getUser()` and returns 401 if no session.

### Client types
| Client | File | Key | Use |
|--------|------|-----|-----|
| Server (anon) | `lib/supabase/server.ts` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | SSR data fetching, auth session |
| Client (anon) | `lib/supabase/client.ts` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser auth, login form |
| Service role | `lib/supabase/admin.ts` | `SUPABASE_SERVICE_ROLE_KEY` | Admin mutations (bypasses RLS) |

> **Critical:** Service role key is server-only. Never expose in client code or `NEXT_PUBLIC_*` env vars.

## RLS Policies

### Current state (from migration 00001)
All tables have RLS enabled with the following policy pattern:

```sql
-- Public can read active/published data
CREATE POLICY "public_read_services" ON services
    FOR SELECT USING (is_active = true);

-- Authenticated users can do everything
CREATE POLICY "admin_all_services" ON services
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
```

### Policy audit needed
| Table | Public SELECT | Public INSERT | Admin ALL | Notes |
|-------|--------------|--------------|-----------|-------|
| services | ✅ active only | ❌ | ✅ | |
| service_images | ✅ | ❌ | ✅ | |
| bookings | ❌ (token-based via API) | ✅ (via API w/ service role) | ✅ | Public INSERT needs review |
| notifications | ❌ | ❌ | ✅ | |
| content_blocks | ✅ | ❌ | ✅ | |
| media_assets | ✅ | ❌ | ✅ | |
| availability_settings | ✅ | ❌ | ✅ | |
| blackout_dates | ✅ | ❌ | ✅ | |

> **Issue:** `bookings` public INSERT policy allows anyone with the anon key
> to insert directly into the table, bypassing validation. This is by design
> (guest bookings) but the API route should use the service role client for
> inserts to ensure server-side validation runs. The anon INSERT policy can
> be removed if the API always uses service role for writes.

## Security Checklist

- [x] Service role key never in client code
- [x] `.env.local` gitignored
- [x] Admin layout redirects unauthenticated users
- [x] API routes check auth on admin endpoints
- [x] RLS enabled on all tables
- [ ] Remove public INSERT on bookings (use service role in API only)
- [ ] Add rate limiting on POST /api/bookings (anti-spam)
- [ ] Add CSRF protection on admin mutations (SameSite cookies + origin check)
- [ ] Configure Supabase Auth: disable public signups (dashboard → Auth → Providers → Email → turn off "Allow new users to sign up")
- [ ] Set email confirmations OFF for admin (manual invite only) or ON if using invite flow
- [ ] Add `Content-Security-Policy` header in `next.config.js`
- [ ] Audit env vars before production deploy

## Admin User Management

### v1 — Manual invite
1. Owner creates account in Supabase dashboard → Authentication → Users → Add user.
2. No self-signup; "Allow new users to sign up" disabled.
3. Owner shares credentials with staff.

### v2 — Invite flow
- Admin dashboard "Manage Users" page.
- Uses `supabase.auth.admin.inviteUserByEmail()`.
- Invited user sets their own password.
- Role-based access (owner vs staff) if needed.

## Edge Cases

| # | Case | Handling |
|---|------|----------|
| E1 | Session expired mid-edit | API returns 401 → client redirects to login → return to page after login |
| E2 | Service role key leaked | Rotate in Supabase dashboard immediately; update env vars + redeploy |
| E3 | Anon key compromised | Less critical (public read only); rotate + redeploy |
| E4 | User deleted in Supabase but still has cookie | `getUser()` returns null → redirect to login |
| E5 | Multiple admin users | All authenticated users have full access in v1; RBAC in v2 |

## Implementation Phases

### Phase 1 — Harden current auth ✅ (mostly done)
- [x] Protected route group separating login from dashboard
- [x] API auth checks on all admin routes
- [ ] Disable public signups in Supabase dashboard
- [ ] Remove public INSERT policy on bookings (service role only)
- [ ] Add rate limiting on booking creation

### Phase 2 — Security headers + CSRF
- [ ] CSP header in next.config.js
- [ ] Origin check on admin POST/PUT/DELETE
- [ ] Rate limiting middleware (upstash/ratelimit or simple in-memory)

### Phase 3 — User management UI
- [ ] "Manage Users" admin page
- [ ] Invite flow via service role
- [ ] Revoke access (delete user)

## Test Plan

| Test | Type | Assertion |
|------|------|-----------|
| Unauthenticated access to /admin | E2E | redirects to /admin/login |
| Unauthenticated POST /api/services | API | 401 |
| Login with valid creds | E2E | redirects to /admin |
| Login with invalid creds | E2E | error message shown |
| Logout | E2E | session cleared, redirect to login |
| Direct INSERT via anon key | DB | blocked by RLS (after policy fix) |
| Service role INSERT | DB | succeeds (bypasses RLS) |

## Open Questions

1. **Q1** — How many admin users? Just the owner, or multiple staff?
2. **Q2** — Role-based access? (e.g., receptionist can't delete services) v2.
3. **Q3** — 2FA for admin login? Recommended for production; Supabase supports TOTP.
4. **Q4** — Session timeout? Supabase default is 1 hour refresh; configurable.
