# Feature 03 — Availability & Scheduling

Priority: **P0** · Status: **planned** · Depends on: —

## Overview

Defines *when* the clinic accepts bookings: weekly open hours, blackout dates
(holidays, events), and global limits (lead time, daily caps). Feeds the slot
engine in Feature 02.

## User Stories

- **AV1** — As an admin, I set open/close times per weekday so slots only generate inside business hours.
- **AV2** — As an admin, I mark whole days closed (e.g., Sundays).
- **AV3** — As an admin, I add blackout dates with a reason (e.g., "Holy Week") so those days show as unavailable.
- **AV4** — As an admin, I remove a blackout date if plans change.
- **AV5** — As an admin, I configure lead time and max bookings/day without code changes. *(currently env vars — future: settings table)*
- **AV6** — As an admin, I can set lunch breaks / split shifts (e.g., 9–12, 13–17). *(future)*
- **AV7** — As a client, days that are closed/blacked-out/fully-booked are visibly disabled on the calendar.

## Data Model

### `availability_settings` (exists — one row per weekday)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| day_of_week | INTEGER 0–6 | UNIQUE; 0 = Sunday |
| open_time | TIME | default 09:00 |
| close_time | TIME | default 17:00 |
| is_closed | BOOLEAN | default false |

Seeded: Sundays closed, Mon–Sat 09:00–17:00.

### `blackout_dates` (exists)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| blocked_date | DATE UNIQUE | |
| reason | TEXT | shown only in admin |

### Future: `clinic_settings` (replaces env-var config)
```sql
-- 0000X_clinic_settings.sql (DO NOT APPLY YET)
CREATE TABLE clinic_settings (
    key TEXT PRIMARY KEY,          -- 'min_lead_time_hours', 'max_bookings_per_day', 'slot_interval_minutes'
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Future: split shifts
Replace single open/close per day with a `availability_windows` child table
(day_of_week, start_time, end_time) allowing N windows per day.

## API Contract

| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| GET | `/api/availability?service_id=&date=` | public | slot grid for a date (Feature 02) |
| GET | `/api/availability/month?service_id=&year=&month=` | public | per-day summary: `{date, status: open\|closed\|blackout\|full}` for calendar rendering |
| GET | `/api/admin/availability` | admin | weekly settings + blackouts |
| PUT | `/api/admin/availability/weekly` | admin | upsert all 7 weekday rows |
| POST | `/api/admin/availability/blackouts` | admin | add blackout date |
| DELETE | `/api/admin/availability/blackouts/[id]` | admin | remove blackout |

### GET /api/availability/month — response
```json
{
  "year": 2026, "month": 7,
  "days": [
    { "date": "2026-07-01", "status": "open" },
    { "date": "2026-07-05", "status": "closed" },
    { "date": "2026-07-10", "status": "blackout" },
    { "date": "2026-07-12", "status": "full" }
  ]
}
```

## UI Spec

### Admin `/admin/availability`
- **Weekly hours grid** — 7 rows: day name, open time picker, close time picker, "Closed" toggle. Save button persists all at once (exists as `AvailabilityManager`, needs API wiring).
- **Blackout dates panel** — date picker + reason input + "Block date" button; list of upcoming blackouts with delete buttons.
- **Settings card** *(future)* — lead time, daily cap, slot interval inputs.

### Client calendar (in `/book`)
- Disabled day styles: past (grey), closed weekday (grey), blackout (grey + strikethrough), full (grey + "Full" badge).

## Validation Rules

1. `open_time < close_time` per weekday (server-rejects inversion).
2. Blackout date must be today or future.
3. Duplicate blackout date → 409.
4. Weekly settings must always have exactly 7 rows (upsert by `day_of_week`).

## Edge Cases

| # | Case | Handling |
|---|------|----------|
| E1 | Admin closes a weekday that has future bookings | Allowed; existing bookings honored; warn with count ("3 bookings exist on affected days") |
| E2 | Blackout added on a date with bookings | Same as E1 — warn, let admin decide whether to cancel manually |
| E3 | Open hours shortened, orphaned bookings outside new hours | Bookings remain valid; only future slot generation changes |
| E4 | All 7 days closed | Legal but calendar shows nothing bookable; show admin warning banner |
| E5 | Month summary for far-future dates | Cap client calendar at +90 days (config) |
| E6 | DST | N/A — Philippines has no DST; hardcode Asia/Manila |

## Implementation Phases

### Phase 1 — Admin API + wiring
- [ ] `GET/PUT /api/admin/availability/weekly`
- [ ] Blackout POST/DELETE routes
- [ ] Wire existing `AvailabilityManager` component to the API
- [ ] Blackout dates panel UI

### Phase 2 — Client-facing summaries
- [ ] `/api/availability/month` day-status endpoint
- [ ] Warning counts for E1/E2 (bookings on affected dates)

### Phase 3 — Settings table
- [ ] `clinic_settings` migration + admin settings card
- [ ] Migrate lead-time/caps reads from env to DB with env fallback

## Test Plan

| Test | Type | Assertion |
|------|------|-----------|
| open_time >= close_time | API | 422 |
| Duplicate blackout | API | 409 |
| Past blackout date | API | 422 |
| Closed weekday produces zero slots | unit | availability lib returns [] |
| Blackout day excluded in month summary | API | status = "blackout" |
| Full day (cap reached) | API | status = "full" |

## Open Questions

1. Booking horizon: how far ahead can clients book? (propose 90 days)
2. Should blackouts support half-days / time ranges? (v2)
3. Multiple staff members with individual schedules? (major v2 scope — data model would need `staff` + per-staff availability)
