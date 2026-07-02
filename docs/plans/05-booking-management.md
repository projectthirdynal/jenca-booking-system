# Feature 05 — Booking Self-Management

Priority: **P1** · Status: **planned** · Depends on: 02 Booking Engine, 04 Notifications

## Overview

Clients manage their own booking through a secure token-based link — no login required. They can view details, cancel, or reschedule. The token is a UUID generated at booking time and included in every notification email/SMS.

## User Stories

- **M1** — As a client, I open my manage link and see full booking details (service, date, time, price, status).
- **M2** — As a client, I can cancel my booking from the manage page.
- **M3** — As a client, I can reschedule to a different date/time from the manage page.
- **M4** — As a client, I cannot modify a completed or no-show booking.
- **M5** — As a client, I cannot cancel within 2 hours of the appointment (policy).
- **M6** — As a client, if my token is invalid/expired, I see a friendly "booking not found" page.

## Data Model

No new tables. Uses existing `bookings.booking_token` (UUID, unique index).

### Token rules
- Generated server-side on booking creation (`gen_random_uuid()`).
- Never expires (no TTL) — simple for v1.
- Not guessable (UUID v4 = 122 bits entropy).
- Transmitted only via notification messages and confirmation page URL.

## API Contract

| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| GET | `/api/bookings/token/[token]` | token | fetch booking + service details |
| POST | `/api/bookings/token/[token]/cancel` | token | cancel booking |
| POST | `/api/bookings/token/[token]/reschedule` | token | reschedule to new date/time |

### POST /api/bookings/token/[token]/reschedule
```json
{ "booking_date": "2026-07-20", "booking_time": "15:00" }
```

### Validation rules
1. Token must match an existing booking.
2. Booking status must be `confirmed` (not completed/cancelled/no_show).
3. Cancel: `booking_date + booking_time` must be > now + 2h (cancellation policy).
4. Reschedule: new slot must pass all availability checks (Feature 02 validation).
5. Reschedule: old slot freed (status stays `confirmed`, date/time updated).
6. Both actions trigger notifications (Feature 04).

## UI Spec

### `/manage/[token]`
- **Booking summary card** — service name, image, date, time, price, status badge.
- **Actions** — "Cancel booking" and "Reschedule" buttons (disabled if policy blocks).
- **Cancel flow** — confirmation modal → POST cancel → success state with "Book a new appointment" link.
- **Reschedule flow** — inline DatePicker + TimeSlotPicker (reuse from booking flow) → POST reschedule → updated summary.
- **Policy notice** — "You can cancel or reschedule up to 2 hours before your appointment."
- **Invalid token** — friendly "Booking not found" with link to `/services`.

## Edge Cases

| # | Case | Handling |
|---|------|----------|
| E1 | Token tampered | No match → 404 page |
| E2 | Cancel after appointment time | Button disabled; show "This appointment has passed" |
| E3 | Reschedule to a taken slot | 409 → show error, refresh slots |
| E4 | Reschedule to past date | 422 validation |
| E5 | Booking already cancelled | Show cancelled state; no action buttons |
| E6 | Multiple reschedules | Allowed; each triggers reschedule notification |
| E7 | Token leaked | v1: no mitigation. v2: add "regenerate token" admin action |

## Implementation Phases

### Phase 1 — View + Cancel
- [ ] Wire `/manage/[token]` page to fetch from API
- [ ] Cancel button with confirmation modal
- [ ] Policy enforcement (2h rule)
- [ | Invalid token handling

### Phase 2 — Reschedule
- [ ] Inline date/time picker reuse
- [ ] Reschedule API with availability validation
- [ ] Notification dispatch on reschedule

### Phase 3 — Polish
- [ ] Status-aware UI (completed/no_show states)
- [ ] "Book new appointment" post-cancel CTA
- [ ] Mobile-responsive layout

## Test Plan

| Test | Type | Assertion |
|------|------|-----------|
| Valid token shows booking | E2E | 200 with details |
| Invalid token | E2E | 404 friendly page |
| Cancel within 2h | API | 422 policy violation |
| Cancel outside 2h | API | 200, status = cancelled |
| Reschedule to taken slot | API | 409 |
| Reschedule to past | API | 422 |
| Cancel completed booking | API | 422 |

## Open Questions

1. **Q1** — Cancellation fee? Owner says "clinic's discretion" — do we need a fee field? v2.
2. **Q2** — Max reschedules per booking? Unlimited for v1.
3. **Q3** — Should the manage link expire after the appointment date? Consider for v2.
