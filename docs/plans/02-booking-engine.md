# Feature 02 — Booking Engine

Priority: **P0** · Status: **planned** · Depends on: 01 Services, 03 Availability

## Overview

The heart of the system: a guest client selects a service, picks an available
date + time slot, submits contact details, and receives a confirmed booking
with a unique management token. No client account required. The engine must
guarantee **zero double-bookings** even under concurrent requests.

## User Stories

- **B1** — As a client, I select a service and see a calendar of available dates so I only pick valid days.
- **B2** — As a client, I see real-time time slots for my chosen date, with unavailable ones disabled.
- **B3** — As a client, I submit my name, PH mobile number, and email to confirm the booking without creating an account.
- **B4** — As a client, I land on a confirmation page with all booking details and a manage link.
- **B5** — As a client, I can't book a slot that was just taken by someone else — I get a clear message and fresh slots.
- **B6** — As a client, I can't book in the past or inside the minimum lead time window (2h).
- **B7** — As an admin, I can create a walk-in/phone booking manually from the dashboard.

## Booking Flow (state machine)

```
[Select service] → [Pick date] → [Pick time slot] → [Enter details]
      → [Submit] → CONFIRMED → (completed | cancelled | no_show)
```

Status enum (exists): `pending | confirmed | completed | cancelled | no_show`
- v1: bookings are created directly as `confirmed` (no payment step).
- `pending` reserved for future deposit/payment flow.

## Data Model

### `bookings` (exists)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| service_id | UUID FK → services | ON DELETE RESTRICT |
| booking_date | DATE | |
| booking_time | TIME | slot start |
| client_name | TEXT | |
| client_phone | TEXT | normalize to `+639XXXXXXXXX` |
| client_email | TEXT | lowercase before insert |
| status | booking_status | default 'confirmed' |
| booking_token | UUID | unique, for guest management |
| created_at / updated_at | TIMESTAMPTZ | |

### Concurrency guard (exists — critical)
```sql
CREATE UNIQUE INDEX bookings_no_double_booking
    ON bookings (service_id, booking_date, booking_time)
    WHERE status != 'cancelled';
```
The API must catch unique-violation (SQLSTATE 23505) and return 409.

> **Design decision needed:** the current index prevents the *same service*
> being double-booked, but two different services could book the same slot.
> Single-practitioner clinic ⇒ should the constraint span ALL services?
> See Open Question Q1.

## API Contract

| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| POST | `/api/bookings` | public | create booking |
| GET | `/api/bookings` | admin | list bookings (filters: date range, status, service) |
| GET | `/api/bookings/token/[token]` | token | fetch booking for guest management |
| PATCH | `/api/bookings/[id]` | admin | update status / reschedule |
| GET | `/api/availability?service_id=&date=` | public | list slots for a date |

### POST /api/bookings — request
```json
{
  "service_id": "uuid",
  "booking_date": "2026-07-15",
  "booking_time": "14:00",
  "client_name": "Maria Santos",
  "client_phone": "09171234567",
  "client_email": "maria@example.com"
}
```

### Validation rules (server-side, authoritative)
1. `service_id` exists AND `is_active = true`.
2. `booking_date + booking_time` is ≥ now + `MIN_LEAD_TIME_HOURS` (2h).
3. Slot falls inside `availability_settings` open hours for that weekday.
4. Date is not in `blackout_dates`.
5. Slot not already taken (rely on unique index as final guard).
6. Daily cap: bookings for that date < `MAX_BOOKINGS_PER_DAY` (20).
7. Phone matches PH format: `^(\+?63|0)9\d{9}$` → normalize to `+639…`.
8. Email RFC-basic regex; lowercase.
9. Rate limit: max 3 bookings per email/phone per day (anti-spam).

### Responses
- `201` → booking JSON incl. `booking_token`.
- `409 CONFLICT` → `SLOT_TAKEN` (client should refetch slots).
- `422` → field-level validation message.
- `429` → rate limit hit.

## UI Spec

### `/book` (client)
1. **Step 1 — Service**: preselected via `?service=` query param, or dropdown.
2. **Step 2 — Date**: month calendar (`DatePicker`); disabled = past, blackout, closed weekday, fully-booked days.
3. **Step 3 — Time**: slot pill grid (`TimeSlotPicker`); fetched from `/api/availability`; disabled slots greyed out.
4. **Step 4 — Details**: `BookingForm` with inline validation, T&C note, summary sidebar (service, date, time, price).
5. Submit → spinner → redirect `/book/confirmation?token=…`.
6. On 409 → toast "That slot was just taken" → auto-refresh slot grid, keep other inputs.

### Slot generation algorithm
```
input: service.duration_minutes, day open/close, existing bookings, interval=30min
slots = []
t = open_time
while t + duration <= close_time:
    if no overlap with existing non-cancelled bookings and t >= now+lead_time:
        slots.push({time: t, available: true})
    else:
        slots.push({time: t, available: false})
    t += interval
```

## Edge Cases

| # | Case | Handling |
|---|------|----------|
| E1 | Two clients submit same slot simultaneously | Unique index → second gets 409 → UI refreshes slots |
| E2 | Client keeps stale tab open for hours | Server re-validates everything on submit |
| E3 | Slot duration crossing close time | Disallow: slot must END before close_time |
| E4 | Admin changes availability after client loaded slots | Server validation rejects; client refreshes |
| E5 | Service deactivated mid-flow | 422 "Service no longer available" |
| E6 | Timezone mismatch | All times clinic-local (Asia/Manila); store DATE+TIME, never UTC-convert |
| E7 | Duplicate rapid double-click on submit | Disable button on first click + idempotency via unique index |
| E8 | SMS/email fails after booking created | Booking still valid; notification row marked `failed` for retry (feature 04) |

## Implementation Phases

### Phase 1 — Availability API
- [ ] `/api/availability` returns slot grid per algorithm above
- [ ] Unit-test slot generation (open/close, duration, overlaps, lead time)

### Phase 2 — Interactive booking UI
- [ ] Wire `DatePicker` with disabled-days logic
- [ ] Wire `TimeSlotPicker` to availability API
- [ ] Multi-step form state with URL-param persistence
- [ ] Booking summary sidebar

### Phase 3 — Create-booking hardening
- [ ] Full server-side validation chain (rules 1–9)
- [ ] 23505 → 409 mapping with SLOT_TAKEN code
- [ ] Phone/email normalization helpers + unit tests
- [ ] Rate limiting (per email/phone daily cap)

### Phase 4 — Admin manual booking
- [ ] "New booking" form in `/admin/bookings`
- [ ] Bypasses lead-time rule (admin override) but not slot conflicts

## Test Plan

| Test | Type | Assertion |
|------|------|-----------|
| Concurrent same-slot bookings | integration | exactly one 201, one 409 |
| Booking in the past | API | 422 |
| Booking within lead time | API | 422 |
| Booking on blackout date | API | 422 |
| Booking outside open hours | API | 422 |
| Invalid PH phone | API | 422; valid formats normalized |
| Cancelled slot rebooked | API | 201 (partial index allows) |
| Full E2E happy path | Playwright | service → date → slot → form → confirmation page shows token |

## Open Questions

1. **Q1** — Single practitioner? If yes, change unique index to `(booking_date, booking_time) WHERE status != 'cancelled'` (drop service_id) so no two services overlap. **Needs owner confirmation — affects migration.**
2. **Q2** — Slot interval: fixed 30min or per-service? (e.g., 15min consults)
3. **Q3** — Deposits/payment before confirmation? (v2 — GCash/PayMongo)
4. **Q4** — Buffer time between appointments for cleanup? (e.g., 10min gap)
