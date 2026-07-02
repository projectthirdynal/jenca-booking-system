# Feature 01 — Services Catalog

Priority: **P0** · Status: **in-progress** · Depends on: —

## Overview

The services catalog is the storefront of the clinic. Admins manage treatment
offerings (name, price, duration, description, images, status); clients browse
active services and start bookings from them.

## User Stories

### Client
- **C1** — As a client, I can browse all active treatments in a card grid so I can compare offerings.
- **C2** — As a client, I can open a service detail page with full description, price, duration, and photos so I can decide before booking.
- **C3** — As a client, I can jump straight into booking from any service card or detail page.
- **C4** — As a client, I can filter/search services by name or category so I can find a treatment fast. *(future)*

### Admin
- **A1** — As an admin, I can create a service with name, description, duration, price, image, and status.
- **A2** — As an admin, I can edit any field of an existing service.
- **A3** — As an admin, I can deactivate a service so it disappears from the public site without deleting its booking history.
- **A4** — As an admin, I can delete a service that has no bookings.
- **A5** — As an admin, I can upload multiple images per service and reorder them. *(future — `service_images` table already exists)*
- **A6** — As an admin, I can group services under categories (e.g., Facials, Peels, Laser). *(future)*

## Data Model

### `services` (exists)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | `gen_random_uuid()` |
| name | TEXT NOT NULL | |
| description | TEXT | nullable |
| duration_minutes | INTEGER | CHECK > 0 |
| price_php | DECIMAL(10,2) | CHECK >= 0 |
| is_active | BOOLEAN | default true |
| image_url | TEXT | primary/cover image |
| created_at / updated_at | TIMESTAMPTZ | |

### `service_images` (exists, not yet wired to UI)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| service_id | UUID FK → services | CASCADE delete |
| file_path | TEXT | public URL |
| alt_text | TEXT | |
| sort_order | INTEGER | for gallery ordering |

### Future migration: categories
```sql
-- 0000X_service_categories.sql (DO NOT APPLY YET)
CREATE TABLE service_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    sort_order INTEGER NOT NULL DEFAULT 0
);
ALTER TABLE services ADD COLUMN category_id UUID REFERENCES service_categories(id);
```

## API Contract

| Method | Route | Auth | Purpose | Status |
|--------|-------|------|---------|--------|
| GET | `/api/services` | public | list active services | ✅ done |
| POST | `/api/services` | admin | create service (validated) | ✅ done |
| PUT | `/api/services/[id]` | admin | update service | ✅ done |
| DELETE | `/api/services/[id]` | admin | delete service | ✅ done — needs booking-guard |
| POST | `/api/media` | admin | upload image to storage | ✅ done |

### Error envelope (all routes)
```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Human readable" } }
```
Codes: `UNAUTHORIZED` (401), `VALIDATION_ERROR` (422), `CONFLICT` (409), `INTERNAL_ERROR` (500).

## UI Spec

### Public
- `/services` — card grid (done). Add: category filter tabs, search input *(future)*.
- `/services/[id]` — detail page (done). Add: image carousel from `service_images` *(future)*.

### Admin `/admin/services`
- Stats row: total / active / inactive (done).
- Card grid with status badge, edit, delete (done).
- Inline create/edit form with image upload (done).
- **To add:** drag-to-reorder, duplicate-service action, bulk activate/deactivate.

## Edge Cases

| # | Case | Handling |
|---|------|----------|
| E1 | Delete a service with existing bookings | DB `ON DELETE RESTRICT` blocks it → API must return 409 with friendly message ("Deactivate instead") |
| E2 | Price set to 0 | Allowed (free consult) — display "Free" instead of ₱0.00 |
| E3 | Duration not divisible by slot interval | Round slot grid up to next interval in availability engine |
| E4 | Image upload fails mid-save | Form keeps state; user retries upload; save is independent of upload |
| E5 | Two admins edit the same service | Last-write-wins for v1; consider `updated_at` optimistic lock later |
| E6 | Deactivating a service with future bookings | Allowed — existing bookings stay valid; warn admin with count of upcoming bookings |
| E7 | Very long names/descriptions | UI clamps with `line-clamp`; DB has no limit — add 200-char UI validation |

## Implementation Phases

### Phase 1 — Core CRUD ✅ (done)
- [x] GET/POST/PUT/DELETE routes with validation
- [x] Admin manager with image upload, error states, empty state
- [x] Public list + detail pages

### Phase 2 — Robustness (next)
- [ ] E1: catch FK violation on delete → 409 + "deactivate instead" UI hint
- [ ] E6: warn on deactivation when future bookings exist
- [ ] "Free" price display for ₱0 services
- [ ] Character limits on name (100) and description (1000)

### Phase 3 — Rich media
- [ ] Multi-image gallery per service using `service_images`
- [ ] Image carousel on the detail page
- [ ] Replace `<img>` with `next/image` for optimization

### Phase 4 — Organization
- [ ] Categories migration + admin CRUD
- [ ] Category filter tabs on `/services`
- [ ] Search by name
- [ ] Manual sort order for services

## Test Plan

| Test | Type | Assertion |
|------|------|-----------|
| Create service without name | API | 422 VALIDATION_ERROR |
| Create service with negative price | API | 422 |
| Create as unauthenticated | API | 401 |
| Delete service with bookings | API | 409 CONFLICT |
| Deactivate hides from public list | E2E | GET /api/services excludes it |
| Detail page of inactive service | E2E | 404 |
| Image > 5MB | UI | client-side rejection message |

## Open Questions

1. Should services support variable pricing (e.g., per-area laser pricing)? → affects data model.
2. Do we need service add-ons (e.g., "add LED mask +₱500")? → v2 candidate.
3. Max number of services expected? (impacts pagination decision — currently unpaginated)
