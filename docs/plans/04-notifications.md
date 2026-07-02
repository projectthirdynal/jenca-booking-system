# Feature 04 — Notifications (Email + SMS)

Priority: **P1** · Status: **planned** · Depends on: 02 Booking Engine

## Overview

Automated multi-channel notifications triggered by booking lifecycle events.
Every notification attempt is recorded in the `notifications` table for audit,
retry, and debugging. Providers are abstracted behind a unified interface so
they can be swapped without touching business logic.

## User Stories

- **N1** — As a client, I receive an email confirmation immediately after booking with all details and a manage link.
- **N2** — As a client, I receive an SMS confirmation with date/time and a short manage URL.
- **N3** — As a client, I receive a reminder 24h before my appointment via email + SMS.
- **N4** — As a client, I receive a cancellation confirmation when I or the admin cancels.
- **N5** — As a client, I receive a reschedule confirmation with the new date/time.
- **N6** — As an admin, I can see a log of all notifications sent/failed in the dashboard.
- **N7** — As an admin, I can manually resend a failed notification.
- **N8** — As an admin, I can toggle which channels (email/SMS) are active.

## Notification Triggers

| Event | Type | Channels | Timing |
|-------|------|----------|--------|
| Booking created | `confirmation` | email + sms | immediate |
| Booking cancelled | `cancellation` | email + sms | immediate |
| Booking rescheduled | `reschedule` | email + sms | immediate |
| Upcoming appointment | `reminder` | email + sms | 24h before (cron) |

## Data Model

### `notifications` (exists)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| booking_id | UUID FK → bookings | CASCADE |
| type | notification_type | `confirmation \| reminder \| cancellation \| reschedule` |
| channel | notification_channel | `email \| sms` |
| status | notification_status | `queued \| sent \| failed \| delivered` |
| sent_at | TIMESTAMPTZ | nullable |
| created_at | TIMESTAMPTZ | |

### Future columns (additive migration)
```sql
-- 0000X_notifications_enhancements.sql (DO NOT APPLY YET)
ALTER TABLE notifications ADD COLUMN provider_message_id TEXT;
ALTER TABLE notifications ADD COLUMN error_message TEXT;
ALTER TABLE notifications ADD COLUMN attempts INTEGER NOT NULL DEFAULT 0;
ALTER TABLE notifications ADD COLUMN next_retry_at TIMESTAMPTZ;
```

## Architecture

### Provider abstraction
```
src/lib/notifications/
  ├── types.ts          — NotificationProvider interface
  ├── email.ts          — ResendProvider (primary), SendGridProvider (fallback)
  ├── sms.ts            — SemaphoreProvider (primary), TwilioProvider (fallback)
  ├── dispatcher.ts     — picks provider, sends, records result
  └── templates.ts      — subject/body builders per notification type
```

### NotificationProvider interface
```typescript
interface NotificationProvider {
  sendEmail(to: string, subject: string, html: string): Promise<{ id: string }>;
  sendSMS(to: string, message: string): Promise<{ id: string }>;
}
```

### Dispatch flow
```
1. Booking event occurs (create/cancel/reschedule)
2. API route calls dispatcher.queueNotifications(booking, type)
3. For each channel (email, sms):
   a. INSERT notifications row (status = 'queued')
   b. Attempt send via provider
   c. On success: UPDATE status = 'sent', sent_at = now, provider_message_id
   d. On failure: UPDATE status = 'failed', error_message, attempts++
4. Reminder: separate cron job (see below)
```

### Reminder cron
- **Vercel Cron** — `vercel.json` schedules `POST /api/cron/reminders` at `0 * * * *` (hourly).
- Route queries bookings where `booking_date = tomorrow AND status = 'confirmed' AND no reminder notification exists`.
- Sends reminder notifications, marks them sent.
- Protected by `CRON_SECRET` env var (Bearer token).

## API Contract

| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| POST | `/api/cron/reminders` | CRON_SECRET | send 24h reminders |
| GET | `/api/admin/notifications` | admin | list notifications (filter: status, type, booking) |
| POST | `/api/admin/notifications/[id]/resend` | admin | retry a failed notification |

## Email Templates

### Confirmation email
- **Subject**: `Booking Confirmed — {service_name} on {date} at {time}`
- **Body**: clinic logo, service name, date/time, price, client name, manage link (`/manage/{token}`), cancellation policy note.
- **From**: `Jenca Aesthetics <noreply@jencaaesthetics.com>`

### Reminder email
- **Subject**: `Reminder: Your appointment tomorrow at {time}`
- **Body**: service name, date/time, manage link, "Reply to this email if you need to reschedule."

### Cancellation email
- **Subject**: `Booking Cancelled — {service_name}`
- **Body**: cancellation confirmed, original date/time, "Book a new appointment" link.

## SMS Templates

### Confirmation SMS
```
Jenca Aesthetics: Your booking for {service_name} on {date} at {time} is confirmed. Manage: {short_url}
```

### Reminder SMS
```
Jenca Aesthetics: Reminder — appointment tomorrow {time} for {service_name}. Manage: {short_url}
```

### Cancellation SMS
```
Jenca Aesthetics: Your booking on {date} {time} has been cancelled. Book again at {site_url}
```

> SMS must be ≤ 160 chars (single segment). Use URL shortener for manage link.

## Edge Cases

| # | Case | Handling |
|---|------|----------|
| E1 | Email provider down | Catch error → status `failed` → admin can resend; booking still valid |
| E2 | SMS provider down | Same as E1 |
| E3 | Invalid email format passes client validation | Provider rejects → `failed` status; admin sees error |
| E4 | Phone number not PH mobile | Skip SMS, log `failed` with "non-PH number" |
| E5 | Double-send (event fires twice) | Check if `notifications` row with same booking_id+type+channel+status='sent' exists before sending |
| E6 | Reminder cron runs twice same hour | Idempotent: checks for existing `reminder` notification before sending |
| E7 | Booking cancelled after reminder already sent | No "un-send" — acceptable; cancellation notification follows |
| E8 | Client marks email as spam | Out of scope for v1; monitor bounce webhooks in v2 |

## Implementation Phases

### Phase 1 — Email (Resend)
- [ ] Create `src/lib/notifications/templates.ts` with email body builders
- [ ] Implement Resend provider in `email.ts`
- [ ] Wire dispatcher into `POST /api/bookings` (confirmation email)
- [ ] Wire into cancel/reschedule flows
- [ ] Admin notifications list view

### Phase 2 — SMS (Semaphore)
- [ ] Implement Semaphore provider in `sms.ts`
- [ ] SMS templates (≤160 chars)
- [ ] URL shortening for manage links (use `is.gd` API or custom short path)
- [ ] Wire dispatcher for SMS channel

### Phase 3 — Reminder cron
- [ ] `POST /api/cron/reminders` route with CRON_SECRET
- [ ] `vercel.json` cron schedule
- [ ] Idempotency guard
- [ ] Test with mock bookings

### Phase 4 — Resilience
- [ ] Retry queue: `next_retry_at` with exponential backoff (max 3 attempts)
- [ ] Admin resend button
- [ ] Provider fallback (Resend→SendGrid, Semaphore→Twilio)
- [ ] Bounce/failure webhook handlers

## Test Plan

| Test | Type | Assertion |
|------|------|-----------|
| Confirmation email sent on booking | integration | notifications row status='sent' |
| SMS skipped for non-PH number | unit | status='failed', error='non-PH number' |
| Reminder cron idempotent | integration | second run sends 0 new notifications |
| Failed notification resend | API | status transitions failed→sent |
| SMS > 160 chars | unit | template truncated or split |
| Provider timeout | integration | status='failed', error captured |

## Open Questions

1. **Q1** — Which email domain to send from? Need Resend domain verification for `jencaaesthetics.com`.
2. **Q2** — Semaphore vs Twilio for SMS? Semaphore is cheaper for PH; Twilio for international. Recommend Semaphore primary.
3. **Q3** — URL shortener for SMS links? Custom `/m/{token}` short route vs third-party?
4. **Q4** — Should clients opt out of SMS/email? (v2 preference center)
5. **Q5** — WhatsApp Business as additional channel? (v2 — popular in PH)
