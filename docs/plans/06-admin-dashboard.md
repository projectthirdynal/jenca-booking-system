# Feature 06 — Admin Dashboard

Priority: **P1** · Status: **planned** · Depends on: 02 Booking Engine

## Overview

The operational command center for clinic staff. Provides a calendar view of bookings, list/table management, manual booking creation, status updates, and notification logs. Accessible only to authenticated Supabase users.

## User Stories

- **AD1** — As an admin, I see a dashboard with today's bookings count, upcoming appointments, and revenue summary.
- **AD2** — As an admin, I can view all bookings in a calendar (month/week view) to visualize capacity.
- **AD3** — As an admin, I can view bookings in a filterable table (by date, status, service, client name).
- **AD4** — As an admin, I can click a booking to see full details + notification history.
- **AD5** — As an admin, I can change a booking status (confirm → completed, mark no_show).
- **AD6** — As an admin, I can create a walk-in/phone booking manually.
- **AD7** — As an admin, I can cancel or reschedule any booking on behalf of a client.
- **AD8** — As an admin, I can see a notification log per booking.
- **AD9** — As an admin, I can export bookings as CSV for accounting. *(future)*

## Dashboard Metrics

| Metric | Source | Refresh |
|--------|--------|---------|
| Today's bookings count | `bookings WHERE booking_date = today AND status != cancelled` | on load |
| This week's bookings count | `bookings WHERE booking_date BETWEEN monday AND sunday` | on load |
| Revenue this month | `SUM(price_php) WHERE status = completed AND booking_date in current month` | on load |
| Upcoming appointments (next 5) | `bookings WHERE booking_date + time >= now AND status = confirmed ORDER BY datetime LIMIT 5` | on load |
| Active services count | `services WHERE is_active = true` | on load |

## UI Spec

### `/admin` (Dashboard)
- **Stat cards row** — 4 cards: Today's Bookings, This Week, Monthly Revenue, Active Services.
- **Upcoming appointments list** — next 5 bookings with client name, service, time, status badge.
- **Quick actions** — "New booking" button, "View calendar" link.

### `/admin/bookings`
- **View toggle** — Calendar | List
- **Calendar view** (`BookingsCalendar`) — month grid; each cell shows count + color intensity; click day → side panel with that day's bookings.
- **List view** — table: Date, Time, Client, Service, Status, Actions (view/edit/cancel).
- **Filters** — date range picker, status dropdown, service dropdown, search by client name/phone.
- **Booking detail drawer** — slide-in panel: full details, notification log, status changer, cancel/reschedule actions.

### `/admin/bookings/new` *(future — or modal)*
- Manual booking form: select service, date, time (from availability), client details.
- Bypasses lead-time rule (admin override) but not slot conflicts.
- Pre-fills client info if phone/email matches an existing booking.

## API Contract

| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| GET | `/api/bookings?date=&status=&service=&search=&page=` | admin | paginated list with filters |
| GET | `/api/bookings/[id]` | admin | single booking with service + notifications |
| PATCH | `/api/bookings/[id]` | admin | update status / reschedule |
| POST | `/api/bookings` | admin | manual booking (with admin override flag) |
| GET | `/api/bookings/calendar?year=&month=` | admin | calendar cell data: `{date, count, statuses}` |
| GET | `/api/admin/stats` | admin | dashboard metrics |

### GET /api/bookings/calendar — response
```json
{
  "year": 2026, "month": 7,
  "days": [
    { "date": "2026-07-01", "count": 5, "has_cancelled": false },
    { "date": "2026-07-02", "count": 0, "has_cancelled": false }
  ]
}
```

## Edge Cases

| # | Case | Handling |
|---|------|----------|
| E1 | Admin marks booking completed but client never showed | Separate `no_show` status; both are terminal |
| E2 | Admin reschedules to a taken slot | 409 → error toast in drawer |
| E3 | Calendar shows cancelled bookings | Dimmed/greyed cells or filter toggle "show cancelled" |
| E4 | Very large booking history | Paginate list (50/page); calendar only loads current month |
| E5 | Two admins update same booking | Last-write-wins v1; optimistic lock in v2 |
| E6 | Admin creates booking for past date | Allow (recording walk-in) with warning |

## Implementation Phases

### Phase 1 — Dashboard + stats
- [ ] `/api/admin/stats` endpoint
- [ ] Stat cards + upcoming appointments UI
- [ ] Wire to existing `/admin` page

### Phase 2 — Bookings list
- [ ] `/api/bookings` with filters + pagination
- [ ] Table view with filter controls
- [ ] Booking detail drawer

### Phase 3 — Calendar view
- [ ] `/api/bookings/calendar` endpoint
- [ ] Month grid component with booking counts
- [ ] Day click → side panel

### Phase 4 — Manual booking + status management
- [ ] Admin booking form (with override)
- [ ] Status change actions in drawer
- [ ] Cancel/reschedule from drawer

## Test Plan

| Test | Type | Assertion |
|------|------|-----------|
| Stats reflect today's bookings | integration | count matches DB |
| Calendar data for empty month | API | all days count=0 |
| Filter by status | API | only matching rows returned |
| Pagination | API | 50 per page, total count correct |
| Admin booking on taken slot | API | 409 |
| Status change confirmed→completed | API | 200, status updated |

## Open Questions

1. **Q1** — Week view in addition to month? (more useful for daily operations)
2. **Q2** — Drag-and-drop reschedule on calendar? (nice but complex — v2)
3. **Q3** — Multi-staff calendar? (depends on Feature 03 Q3)
