# User Flows & Interaction Patterns

> End-to-end journey maps and micro-interaction specs for the booking system.

---

## 1. Client Booking Journey (Happy Path)

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Landing  │────▶│  Services │────▶│  Service  │────▶│  Booking  │────▶│ Confirm  │
│  Page     │     │  List     │     │  Detail   │     │  Wizard   │     │  Page    │
└──────────┘     └──────────┘     └──────────┘     └──────────┘     └──────────┘
                                                          │
                                                          ▼
                                                   ┌──────────┐
                                                   │  Email +  │
                                                   │  SMS sent │
                                                   └──────────┘
                                                          │
                                                          ▼
                                                   ┌──────────┐
                                                   │  Manage   │
                                                   │  Link     │
                                                   └──────────┘
```

### Step-by-step

| Step | Page | Action | System Response | State Change |
|------|------|--------|-----------------|--------------|
| 1 | `/` | Click "Book Now" | Navigate to `/book` | — |
| 2 | `/book` | Select service from dropdown | Load availability calendar | service_id set |
| 3 | `/book` | Click a date | Fetch `/api/availability` → render slots | date set |
| 4 | `/book` | Click a time slot | Slot highlighted, summary updates | time set |
| 5 | `/book` | Enter name, phone, email | Inline validation on blur | form valid |
| 6 | `/book` | Click "Confirm Booking" | POST `/api/bookings` → 201 | booking created |
| 7 | `/book/confirmation` | Page loads with token | Fetch booking details | — |
| 8 | — | Background | Queue email + SMS notifications | notifications sent |
| 9 | Email/SMS | Client opens manage link | Navigate to `/manage/{token}` | — |
| 10 | `/manage/{token}` | View booking details | Show booking card + actions | — |

### Entry Points
| Source | Landing Page | Pre-filled |
|--------|-------------|------------|
| Homepage "Book Now" | `/book` | — |
| Service card "Book this treatment" | `/book?service={id}` | service pre-selected |
| Service detail "Book this treatment" | `/book?service={id}` | service pre-selected |
| Email manage link | `/manage/{token}` | — |
| SMS manage link | `/manage/{token}` (short URL) | — |
| Direct URL | `/book` | — |

---

## 2. Booking Conflict Flow

```
Client A and Client B both want July 15, 2:00 PM

Client A: submits first
    → POST /api/bookings → 201 Created ✓
    → Unique index inserts successfully

Client B: submits 200ms later
    → POST /api/bookings → 409 Conflict (SLOT_TAKEN)
    → UI: toast "That slot was just taken"
    → Auto-refresh time slots for selected date
    → Slot 2:00 PM now shows as unavailable
    → Client B picks a new slot
    → Submits again → 201 ✓
```

### UI Behavior on 409
1. Submit button returns to normal state (not loading)
2. Toast appears: "That time slot was just taken. Please pick another time."
3. Time slot grid refreshes automatically
4. Previously selected slot now greyed out
5. Form data (name, phone, email) is preserved
6. User selects a new available slot
7. User clicks "Confirm Booking" again

---

## 3. Cancel/Reschedule Flow

### Cancel
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Manage Page │────▶│  Click       │────▶│  Confirm     │────▶│  Cancelled   │
│  (confirmed) │     │  "Cancel"    │     │  Modal       │     │  State       │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
                                                    │                    │
                                                    │                    ▼
                                                    │             ┌──────────┐
                                                    │             │ Email +  │
                                                    │             │ SMS sent │
                                                    │             └──────────┘
                                                    │
                                              [X] or Escape
                                                    │
                                                    ▼
                                              Back to manage page
                                              (no change)
```

### Reschedule
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Manage Page │────▶│  Click       │────▶│  Inline      │────▶│  Select new  │
│  (confirmed) │     │  "Reschedule"│     │  Calendar    │     │  date + time │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
                                                                        │
                                                                        ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Updated     │◀────│  POST        │◀────│  Confirm     │
│  booking     │     │  reschedule  │     │  Reschedule  │
└──────────────┘     └──────────────┘     └──────────────┘
       │
       ▼
  ┌──────────┐
  │ Email +  │
  │ SMS sent │
  └──────────┘
```

### Policy Enforcement
| Condition | Cancel | Reschedule |
|-----------|--------|------------|
| > 2h before appointment | ✅ Allowed | ✅ Allowed |
| ≤ 2h before appointment | ❌ Disabled + "Cancellation period has passed" | ❌ Disabled |
| Appointment already past | ❌ "This appointment has passed" | ❌ |
| Status = cancelled | ❌ Already cancelled | ❌ |
| Status = completed | ❌ "Appointment completed" | ❌ |
| Status = no_show | ❌ "Marked as no-show" | ❌ |

---

## 4. Admin Daily Operations Flow

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  Admin logs in                                                       │
│       │                                                              │
│       ▼                                                              │
│  Dashboard — sees today's bookings + stats                           │
│       │                                                              │
│       ├──▶ Bookings Calendar                                         │
│       │        │                                                     │
│       │        ├──▶ Click day → see day's bookings                   │
│       │        ├──▶ Click booking → detail drawer                    │
│       │        │        ├──▶ Mark completed (after appointment)      │
│       │        │        ├──▶ Mark no-show (client didn't arrive)     │
│       │        │        ├──▶ Reschedule (client called to change)    │
│       │        │        └──▶ Cancel (client cancelled by phone)      │
│       │        │                                                     │
│       │        └──▶ "New Booking" (walk-in or phone booking)         │
│       │                 ├──▶ Select service                          │
│       │                 ├──▶ Pick date + time                        │
│       │                 ├──▶ Enter client details                    │
│       │                 └──▶ Confirm → booking created               │
│       │                                                              │
│       ├──▶ Services — manage treatments                              │
│       │        ├──▶ Add new service                                  │
│       │        ├──▶ Edit existing (price, duration, image)           │
│       │        ├──▶ Deactivate (hide from public)                    │
│       │        └──▶ Delete (if no bookings)                          │
│       │                                                              │
│       ├──▶ Availability — manage schedule                           │
│       │        ├──▶ Edit weekly hours                                │
│       │        └──▶ Add/remove blackout dates                        │
│       │                                                              │
│       └──▶ Content/Branding/Gallery — manage website                 │
│                ├──▶ Edit text content                                │
│                ├──▶ Change colors/logo                               │
│                └──│ Upload gallery photos                            │
│                                                                      │
│  Admin logs out                                                      │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 5. Notification Dispatch Flow

```
Booking Event (create / cancel / reschedule)
       │
       ▼
  ┌─────────────────────┐
  │ dispatcher.queue()  │
  └─────────┬───────────┘
            │
     ┌──────┴──────┐
     ▼             ▼
  Email          SMS
     │             │
     ▼             ▼
  INSERT         INSERT
  notifications  notifications
  (queued)       (queued)
     │             │
     ▼             ▼
  Resend         Semaphore
  .send()        .send()
     │             │
     ├─success─▶ UPDATE status='sent', sent_at=now, provider_id
     │
     └─fail────▶ UPDATE status='failed', error_message, attempts++
                    │
                    ▼
              Admin sees in
              notifications log
                    │
                    ▼
              Admin clicks "Resend"
                    │
                    ▼
              Retry send → success or fail
```

### Reminder Cron Flow
```
Every hour (Vercel Cron)
       │
       ▼
  POST /api/cron/reminders (Bearer CRON_SECRET)
       │
       ▼
  Query: bookings WHERE
    booking_date = tomorrow
    AND status = 'confirmed'
    AND no reminder notification exists
       │
       ├──▶ 0 results → exit (nothing to remind)
       │
       └──▶ N results → for each:
              │
              ▼
           Send email reminder
           Send SMS reminder
           INSERT notifications (type='reminder')
              │
              ▼
           Mark as sent
```

---

## 6. Form Validation Patterns

### Inline Validation (client-side)
```
User types in field
       │
       ▼
  Field loses focus (onBlur)
       │
       ▼
  Validate value
       │
       ├──valid──▶ remove error state, green checkmark (optional)
       │
       └──invalid─▶ show error message below field
                     border: red-500
                     bg: red-50
                     message: text-xs text-red-600
```

### Submit Validation (server-side, authoritative)
```
User clicks submit
       │
       ▼
  Button: disabled + spinner
       │
       ▼
  POST /api/...
       │
       ├──201/200──▶ Success → redirect or update UI
       │
       ├──422──────▶ Field errors
       │              │
       │              ▼
       │           Map errors to fields
       │           Show inline errors
       │           Button: re-enabled
       │
       ├──409──────▶ Conflict
       │              │
       │              ▼
       │           Toast: conflict message
       │           Refresh relevant data
       │           Button: re-enabled
       │
       ├──401──────▶ Auth expired
       │              │
       │              ▼
       │           Redirect to /admin/login
       │           Return after login
       │
       └──500──────▶ Server error
                      │
                      ▼
                   Toast: "Something went wrong. Please try again."
                   Button: re-enabled
```

### Validation Rules Summary

| Field | Rule | Message |
|-------|------|---------|
| Service name | min 1 char, max 100 | "Service name is required" |
| Price | ≥ 0 | "Price must be 0 or greater" |
| Duration | > 0 | "Duration must be greater than 0" |
| Client name | min 2 chars | "Please enter your full name" |
| Phone | `^(\+?63\|0)9\d{9}$` | "Please enter a valid PH mobile number (e.g., 09171234567)" |
| Email | RFC basic regex | "Please enter a valid email address" |
| Booking date | not in past | "Please select a future date" |
| Booking time | ≥ now + 2h | "Bookings require at least 2 hours advance notice" |

---

## 7. Empty State Patterns

| Context | Icon | Title | Description | CTA |
|---------|------|-------|-------------|-----|
| No services (admin) | ImageIcon | "No services yet" | "Get started by adding your first treatment." | "Add your first service" |
| No services (public) | — | "Services are being updated" | "Please check back soon." | — |
| No bookings (admin) | Calendar | "No bookings yet" | "Bookings will appear here once clients start booking." | — |
| No bookings today | Calendar | "No bookings today" | "Enjoy the quiet day!" | — |
| No gallery images | ImageIcon | "No photos yet" | "Upload photos to showcase your clinic." | "Upload Photos" |
| No notifications | Bell | "No notifications" | "Notifications will appear here when bookings are made." | — |
| No blackout dates | Calendar | "No blackout dates" | "Add dates when your clinic is closed." | — |
| Search no results | Search | "No results found" | "Try adjusting your filters or search term." | "Clear filters" |

---

## 8. Loading State Patterns

### Page-Level Loading
- **Skeleton screen** matching page layout (not spinner)
- Shows immediately on navigation, replaced by content when ready
- Duration > 300ms: skeleton; < 300ms: direct render (no flash)

### Component-Level Loading
| Component | Loading Pattern |
|-----------|----------------|
| Service cards | 3-6 skeleton cards (shimmer) |
| Time slots | 8 skeleton pill shapes |
| Calendar | Skeleton grid |
| Booking list | 5 skeleton rows |
| Stats cards | 4 skeleton cards with pulsing numbers |
| Form submit | Button: spinner + "Saving..." + disabled |
| Image upload | Button: spinner + "Uploading..." + disabled |
| Delete | Row: fade + spinner on delete icon |

### Optimistic Updates
| Action | Pattern |
|--------|---------|
| Toggle service active | Immediately update UI, revert on error |
| Delete service | Immediately remove card, revert on error |
| Status change | Immediately update badge, revert on error |
| Content save | Show "Saving..." → "Saved ✓" → revert to normal |

---

## 9. Error Recovery Patterns

### Network Error
```
Toast: "Network error. Please check your connection."
[ Retry ] button in toast
```

### API 500 Error
```
Toast: "Something went wrong. Please try again."
[ Retry ] button in toast
If persists: "Server is having issues. Please try again later."
```

### Session Expired (admin)
```
API returns 401
    │
    ▼
Client-side interceptor detects 401
    │
    ▼
Redirect to /admin/login?redirect={current_path}
    │
    ▼
After successful login → redirect back to {current_path}
```

### Data Not Found
```
Page renders 404 layout:
  - Large "404" or icon
  - Friendly message
  - CTA to relevant page
```

---

## 10. Responsive Interaction Differences

| Interaction | Desktop | Mobile |
|-------------|---------|--------|
| Hover effects | ✅ tooltips, lift, color change | ❌ none (no hover) |
| Right-click | ✅ context menus (future) | ❌ long-press (future) |
| Drag-and-drop | ✅ gallery reorder | ❌ tap to move (simpler UI) |
| Keyboard nav | ✅ Tab/Enter/Escape | ⚠️ limited |
| Modal close | X button, overlay click, Escape | X button, overlay tap |
| Toast position | top-right | top-center (full-width) |
| Sidebar | Fixed left | Slide-in drawer |
| Calendar | Month grid | Day list or mini month |
| Table | Full width | Horizontal scroll or cards |
