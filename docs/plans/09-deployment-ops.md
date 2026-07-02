# Feature 09 — Deployment & Operations

Priority: **P1** · Status: **planned** · Depends on: all features

## Overview

Production deployment on Vercel with Supabase, environment variable management,
CI/CD via GitHub, monitoring, and operational runbooks for common incidents.

## Architecture Diagram (text)

```
┌─────────────────────────────────────────────────────┐
│  Client Browser                                      │
│  (public site + admin dashboard)                     │
└───────────────┬─────────────────────────────────────┘
                │ HTTPS
                ▼
┌─────────────────────────────────────────────────────┐
│  Vercel (Next.js 14)                                 │
│  ├── Edge Network (CDN)                              │
│  ├── Serverless Functions (API routes)               │
│  ├── ISR / On-demand Revalidation                    │
│  └── Vercel Cron (reminder job)                      │
└──────┬───────────────┬───────────────┬──────────────┘
       │               │               │
       ▼               ▼               ▼
┌──────────┐   ┌──────────────┐   ┌──────────────┐
│ Supabase │   │ Resend API   │   │ Semaphore API│
│ Postgres │   │ (email)      │   │ (SMS)        │
│ Auth     │   └──────────────┘   └──────────────┘
│ Storage  │
└──────────┘
```

## Deployment Steps

### Prerequisites
- [ ] GitHub repo: `projectthirdynal/jenca-booking-system` ✅
- [ ] Supabase project: `jenca-aesthetics` (ref: `rfnpefrxkqnizoctulom`) ✅
- [ ] Supabase migration applied ✅
- [ ] Resend account + verified sending domain
- [ ] Semaphore account + API key

### Vercel Setup
1. Go to [vercel.com](https://vercel.com) → New Project → Import GitHub repo.
2. Framework preset: Next.js (auto-detected).
3. Root directory: `/` (repo root).
4. Build command: `next build` (default).
5. Output directory: `.next` (default).
6. Node version: 20.x.

### Environment Variables (Vercel)
| Variable | Value | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://rfnpefrxkqnizoctulom.supabase.co` | public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (from Supabase dashboard) | public |
| `SUPABASE_SERVICE_ROLE_KEY` | (from Supabase dashboard) | server-only |
| `RESEND_API_KEY` | (from Resend) | server-only |
| `EMAIL_FROM` | `Jenca Aesthetics <noreply@jencaaesthetics.com>` | server-only |
| `SEMAPHORE_API_KEY` | (from Semaphore) | server-only |
| `SEMAPHORE_SENDER_NAME` | `JencaAesthetics` | server-only |
| `NEXT_PUBLIC_APP_URL` | `https://jenca-booking.vercel.app` (update after domain) | public |
| `NEXT_PUBLIC_SITE_NAME` | `Jenca Aesthetics` | public |
| `MIN_LEAD_TIME_HOURS` | `2` | server |
| `MAX_BOOKINGS_PER_DAY` | `20` | server |
| `REMINDER_HOURS_BEFORE` | `24` | server |
| `CRON_SECRET` | (generate random) | server-only, for cron auth |

### Post-Deploy
1. Update Supabase Auth settings → add Vercel URL to redirect URLs.
2. Update `NEXT_PUBLIC_APP_URL` to custom domain once configured.
3. Test booking flow end-to-end on production URL.
4. Set up Vercel Cron for reminders (add `vercel.json`).

### Custom Domain
1. Vercel → Project → Settings → Domains → Add `jencaaesthetics.com`.
2. Add DNS records as instructed (A record or CNAME).
3. Wait for SSL provisioning (automatic).
4. Update `NEXT_PUBLIC_APP_URL` env var.
5. Update Supabase Auth redirect URLs.

## CI/CD Pipeline

### Current (GitHub + Vercel auto-deploy)
```
git push origin main
    → Vercel detects push
    → Runs `next build`
    → Deploys to preview URL
    → Promotes to production (if main branch)
```

### Future: GitHub Actions CI
```yaml
# .github/workflows/ci.yml (future)
name: CI
on: [push, pull_request]
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run lint
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build
```

## Vercel Cron Configuration

### `vercel.json`
```json
{
  "crons": [
    {
      "path": "/api/cron/reminders",
      "schedule": "0 * * * *"
    }
  ]
}
```

- Runs hourly; route checks for bookings needing 24h reminder.
- Protected by `CRON_SECRET` Bearer token header.
- Only runs on production deployment.

## Monitoring & Alerting

| Layer | Tool | What to monitor |
|-------|------|-----------------|
| App errors | Vercel logs + Sentry (future) | 500 errors, API failures |
| DB health | Supabase dashboard | connection pool, slow queries, disk usage |
| Email delivery | Resend dashboard | bounce rate, delivery rate |
| SMS delivery | Semaphore dashboard | delivery status, credit balance |
| Uptime | Vercel status page + UptimeRobot (future) | site reachable |
| Cron | Vercel cron logs | reminder job ran, notifications sent |

## Operational Runbooks

### RB1 — Booking created but no confirmation email
1. Check `/admin` → Notifications log for the booking.
2. If status `failed` → check error_message → verify Resend API key.
3. Click "Resend" in admin → monitor.
4. If Resend down → switch to SendGrid fallback (future).

### RB2 — SMS not delivered
1. Check notifications log → status + error.
2. Verify Semaphore API key + credit balance.
3. Check phone number format (must be `+639…`).
4. Resend from admin.

### RB3 — Double booking reported
1. Query `bookings` for the disputed date/time.
2. Check if unique index exists: `\d bookings_no_double_booking`.
3. If index missing → apply immediately.
4. Contact affected client → offer reschedule.

### RB4 — Site down
1. Check Vercel status → vercel.com/status.
2. Check Supabase status → status.supabase.com.
3. Check last deployment in Vercel → rollback if needed.
4. Check env vars (especially Supabase URL/key).

### RB5 — Supabase project paused (free tier)
1. Supabase free tier pauses after 7 days inactivity.
2. Go to Supabase dashboard → click "Restore project".
3. Consider upgrading to Pro ($25/mo) for always-on.

## Backup & Recovery

| Data | Backup method | Frequency |
|------|--------------|-----------|
| Database | Supabase automated backups (daily on Pro) | daily |
| Storage | Supabase storage replication | continuous |
| Code | GitHub repo | per-push |
| Env vars | Vercel dashboard (export manually) | on change |

### Recovery
1. Database: Supabase dashboard → Database → Backups → select date → restore.
2. Storage: Supabase handles replication; no manual action needed.
3. Code: `git revert` bad commit or redeploy previous Vercel deployment.
4. Env vars: Re-enter from `.env.example` template + secrets store.

## Implementation Phases

### Phase 1 — Initial deploy
- [ ] Import repo to Vercel
- [ ] Configure all env vars
- [ ] Deploy + smoke test
- [ ] Update Supabase Auth redirect URLs

### Phase 2 — Custom domain + cron
- [ ] Configure custom domain DNS
- [ ] Add `vercel.json` cron config
- [ ] Test reminder cron on production
- [ ] Update `NEXT_PUBLIC_APP_URL`

### Phase 3 — CI + monitoring
- [ ] GitHub Actions CI (lint + build)
- [ ] Sentry integration for error tracking
- [ ] Uptime monitoring (UptimeRobot)
- [ ] Supabase Pro upgrade (always-on)

### Phase 4 — Hardening
- [ ] Automated DB backup verification
- [ ] Disaster recovery drill
- [ ] Security audit (dependencies, env vars, RLS)
- [ ] Load testing (k6 or similar)

## Test Plan

| Test | Type | Assertion |
|------|------|-----------|
| Production deploy succeeds | manual | site loads without errors |
| Booking flow on production | E2E | end-to-end works |
| Cron job fires | manual | reminder notifications sent |
| Custom domain resolves | manual | HTTPS, correct content |
| Env var missing | manual | graceful error, not crash |
| Rollback deployment | manual | previous version active |

## Open Questions

1. **Q1** — Custom domain name? `jencaaesthetics.com`? Need to register/purchase.
2. **Q2** — Supabase Pro plan? Required for always-on + daily backups ($25/mo).
3. **Q3** — Vercel Pro plan? Required for cron jobs + more bandwidth ($20/mo).
4. **Q4** — Sentry for error tracking? Free tier sufficient for v1.
5. **Q5** — When to set up GitHub Actions CI? Before multi-contributor or now?
