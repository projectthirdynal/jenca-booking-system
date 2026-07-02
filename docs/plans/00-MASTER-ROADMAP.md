# Jenca Aesthetics Booking System — Master Roadmap

> Living document. Update status columns as features progress.
> Statuses: `planned` → `in-progress` → `review` → `done`

## Vision

A fully self-serve online booking platform for Jenca Aesthetics clinic:
clients can browse treatments, book/reschedule/cancel appointments, and receive
email + SMS notifications — while the clinic owner manages everything through
a secure admin dashboard without touching code.

## Feature Index

| # | Feature | Plan File | Priority | Status | Depends On |
|---|---------|-----------|----------|--------|------------|
| 1 | Services Catalog | [01-services.md](./01-services.md) | P0 | in-progress | — |
| 2 | Booking Engine | [02-booking-engine.md](./02-booking-engine.md) | P0 | planned | 1, 3 |
| 3 | Availability & Scheduling | [03-availability.md](./03-availability.md) | P0 | planned | — |
| 4 | Notifications (Email + SMS) | [04-notifications.md](./04-notifications.md) | P1 | planned | 2 |
| 5 | Booking Self-Management | [05-booking-management.md](./05-booking-management.md) | P1 | planned | 2, 4 |
| 6 | Admin Dashboard | [06-admin-dashboard.md](./06-admin-dashboard.md) | P1 | planned | 2 |
| 7 | Content & Branding CMS | [07-content-branding.md](./07-content-branding.md) | P2 | planned | — |
| 8 | Auth & Security | [08-auth-security.md](./08-auth-security.md) | P0 | in-progress | — |
| 9 | Deployment & Operations | [09-deployment-ops.md](./09-deployment-ops.md) | P1 | planned | all |

## Priority Definitions

- **P0** — Blocking. Core booking loop cannot function without it.
- **P1** — Launch requirement. Needed before real clients use the system.
- **P2** — Post-launch enhancement. Improves operations/marketing.

## Milestones

### M1 — Core Booking Loop (P0 features)
Client can browse a service, pick an available slot, and create a booking that
persists in Supabase with double-booking prevention. Admin can log in.

**Exit criteria:**
- [ ] Services CRUD complete with images (feature 1)
- [ ] Availability rules configurable (feature 3)
- [ ] End-to-end booking succeeds with slot conflict prevention (feature 2)
- [ ] Admin authentication hardened (feature 8)

### M2 — Client Communication (P1 features)
Bookings trigger confirmations; clients can self-cancel/reschedule; admin has
full operational visibility.

**Exit criteria:**
- [ ] Email confirmation delivered on booking (feature 4)
- [ ] SMS confirmation delivered on booking (feature 4)
- [ ] Manage-booking link works: cancel + reschedule (feature 5)
- [ ] Admin bookings calendar + list views functional (feature 6)
- [ ] Deployed on Vercel with production Supabase (feature 9)

### M3 — Clinic Self-Service (P2 features)
Owner can update site content, branding, and gallery without developer help.

**Exit criteria:**
- [ ] Content blocks editable and rendered live (feature 7)
- [ ] Branding (colors/logo) customizable (feature 7)
- [ ] Gallery management with image optimization (feature 7)
- [ ] 24h reminder cron job running (feature 4)

## Tech Stack Reference

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router), React 18, TypeScript |
| Styling | TailwindCSS, Lucide icons |
| Database | Supabase PostgreSQL (project: `jenca-aesthetics`, ref `rfnpefrxkqnizoctulom`) |
| Auth | Supabase Auth (admin only; clients are guest bookers) |
| Storage | Supabase Storage (`media` bucket) |
| Email | Resend (fallback: SendGrid) |
| SMS | Semaphore (PH-focused; fallback: Twilio) |
| Hosting | Vercel Pro |
| Repo | github.com/projectthirdynal/jenca-booking-system |

## Working Agreements

1. Every feature plan follows the same template: Overview → User Stories →
   Data Model → API Contract → UI Spec → Edge Cases → Implementation Phases →
   Test Plan → Open Questions.
2. Migrations are additive files in `supabase/migrations/` — never edit an
   applied migration.
3. All admin mutations require an authenticated Supabase session; all
   privileged DB writes go through the service-role client in API routes.
4. Lint must pass with zero errors before every commit.
5. Each feature is developed on `main` for now (single dev); switch to feature
   branches once a second contributor joins.
