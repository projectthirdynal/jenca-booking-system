# Admin Pages — UI Specifications

> Detailed wireframes and interaction specs for every admin dashboard page.

---

## 1. Admin Login (`/admin/login`)

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│                                                                      │
│                                                                      │
│                    ┌──────────────────────┐                          │
│                    │  [JA]                │                          │
│                    │  Jenca Aesthetics    │                          │
│                    │                      │                          │
│                    │  Admin Login         │                          │
│                    │                      │                          │
│                    │  Email               │                          │
│                    │  [______________]    │                          │
│                    │                      │                          │
│                    │  Password            │                          │
│                    │  [______________]    │                          │
│                    │                      │                          │
│                    │  [  Sign In  →  ]    │                          │
│                    │                      │                          │
│                    │  ⚠ Error message     │  ← only on error
│                    │                      │                          │
│                    └──────────────────────┘                          │
│                                                                      │
│                                                                      │
│  ← Back to website                                                   │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### Spec
- Full-screen: `min-h-screen bg-neutral-50 flex items-center justify-center`
- Card: `w-full max-w-sm bg-white rounded-2xl shadow-lg p-8`
- Logo: monogram + wordmark, centered, `mb-6`
- Title: `font-display text-xl font-semibold text-center`
- Form fields: per design system 6.2
- Submit: full-width primary button, `ArrowRight` icon
- Error: `bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700`
  - "Invalid email or password"
  - "Too many attempts. Please try again later."
- Loading: button shows spinner + "Signing in..."
- Success: redirect to `/admin`
- Back link: `text-sm text-neutral-500` bottom-left, → `/`
- No "forgot password" link in v1 (admin resets via Supabase dashboard)

---

## 2. Admin Layout — Sidebar + Topbar

### Desktop (≥1024px)

```
┌────────┬─────────────────────────────────────────────────────────────┐
│        │  ☰  Dashboard                              [user@email  ▾]  │  ← topbar h-16
│        ├─────────────────────────────────────────────────────────────┤
│ [JA]   │                                                             │
│        │                                                             │
│ Dashbd │                                                             │
│ Booking│             [Page Content]                                  │
│ Service│                                                             │
│ Avail. │                                                             │
│ Content│                                                             │
│ Branding│                                                            │
│ Gallery│                                                             │
│        │                                                             │
│        │                                                             │
│ ─────  │                                                             │
│ Logout │                                                             │
└────────┴─────────────────────────────────────────────────────────────┘
```

### Sidebar
- Width: 240px, fixed, `bg-white border-r border-neutral-100`
- Logo area: `h-16 flex items-center px-6 border-b`
- Nav items: `px-4 py-2.5 text-sm rounded-lg mx-3`
  - Active: `bg-brand-50 text-brand-700 font-medium`
  - Inactive: `text-neutral-600 hover:bg-neutral-100`
  - Icons: Lucide 20px, `mr-3`
- Nav items list:
  1. Dashboard (`LayoutDashboard`)
  2. Bookings (`Calendar`)
  3. Services (`Scissors`)
  4. Availability (`Clock`)
  5. Content (`FileText`)
  6. Branding (`Palette`)
  7. Gallery (`ImageIcon`)
- Bottom: `border-t`, Logout button (`LogOut` icon, `text-neutral-600 hover:text-red-600`)

### Topbar
- Height: 64px (`h-16`), `bg-white border-b border-neutral-100`
- Left: hamburger icon (mobile only, hidden on desktop) + page title
- Right: user email dropdown (`text-sm text-neutral-600`)
  - Dropdown: "Sign Out" option

### Mobile (<1024px)
- Sidebar: hidden, slide-in drawer from left
- Hamburger in topbar toggles drawer
- Drawer: overlay `bg-black/40` + sidebar slides in `translate-x-0`
- Close: tap overlay, tap nav item, or Escape

---

## 3. Dashboard (`/admin`)

```
┌──────────────────────────────────────────────────────────────────────┐
│  Dashboard                                                           │
│  Overview of your clinic's bookings and activity.                    │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────┐│
│  │ 📅 Today's   │  │ 📆 This Week │  │ 💰 Revenue   │  │ ✂ Active ││
│  │    Bookings  │  │    Bookings  │  │    This Month│  │  Services││
│  │              │  │              │  │              │  │          ││
│  │      5       │  │      18      │  │   ₱42,500    │  │    12    ││
│  │              │  │              │  │              │  │          ││
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────┘│
│                                                                      │
│  Upcoming Appointments                          [View All →]        │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Today, 2:00 PM │ Deep Cleansing Facial │ Maria Santos  [●]  │   │
│  │  Today, 3:30 PM │ Diamond Peel          │ Juan Cruz     [●]  │   │
│  │  Tomorrow, 10:00│ Laser Hair Removal    │ Ana Reyes     [●]  │   │
│  │  Tomorrow, 11:00│ Chemical Peel         │ Pedro Santos  [●]  │   │
│  │  Jul 5, 9:00 AM │ Deep Cleansing Facial │ Liza Lim      [●]  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  Quick Actions                                                       │
│  [  + New Booking  ]   [  View Calendar  ]   [  Add Service  ]     │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### Stat Cards
- Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`
- Card: `card p-5`
  - Icon: 32px, `text-brand-600`, top-left
  - Label: `text-sm text-neutral-500`
  - Value: `text-2xl font-bold text-neutral-900 mt-2`
  - Trend indicator (future): `text-xs text-green-600` or `text-red-600`

### Upcoming Appointments
- Card: `card p-0 mt-6`
- Header: `px-5 py-4 border-b flex justify-between items-center`
  - Title: `font-display text-lg font-semibold`
  - "View All →" link: `text-sm text-brand-600`
- List: rows with `px-5 py-3 border-b border-neutral-100`
  - Date/time: `text-sm text-neutral-500`, fixed width
  - Service: `text-sm font-medium text-neutral-900`
  - Client: `text-sm text-neutral-600`
  - Status badge: per design system 6.4
- Max 5 rows
- Empty: "No upcoming appointments."

### Quick Actions
- `mt-6 flex gap-3 flex-wrap`
- Buttons: primary + secondary variants

---

## 4. Bookings Management (`/admin/bookings`)

### View Toggle: Calendar | List

```
┌──────────────────────────────────────────────────────────────────────┐
│  Bookings                                                            │
│  Manage all client appointments.                                     │
│                                                                      │
│  [📅 Calendar]  [☰ List]              [ + New Booking ]             │
│                                                                      │
│  ── Calendar View ─────────────────────────────────────────────────  │
│                                                                      │
│  ◀  July 2026                              ▶                        │
│  S    M    T    W    T    F    S                                    │
│  ─    ─    1    2    3    4    5                                    │
│   6    7    8    9   10   11   12                                    │
│  13   14   15   16   17   18   19                                    │
│  ●    ●●   ●●●  ●    ●●   ●    ─                                    │
│  20   21   22   23   24   25   26                                    │
│  ●●   ●    ●●   ●●●  ●●   ●    ─                                    │
│  27   28   29   30   31   ─    ─                                    │
│                                                                      │
│  ── Selected Day: July 15 ──                                        │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  2:00 PM │ Deep Cleansing │ Maria Santos   │ Confirmed │ ⋮  │   │
│  │  3:30 PM │ Diamond Peel   │ Juan Cruz      │ Confirmed │ ⋮  │   │
│  │  5:00 PM │ Chemical Peel  │ Ana Reyes      │ Completed │ ⋮  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### Calendar View
- Month grid: 7 columns, `gap-1`
- Cell: `aspect-square rounded-lg p-2 border border-neutral-100`
  - Date number: `text-sm`
  - Booking dots: `●` count indicators (1-3 dots based on volume)
  - Click: loads day's bookings in side panel below
- Cell states per design system 6.7
- Today: `ring-2 ring-brand-600`
- Selected: `bg-brand-600 text-white`

### List View
```
┌──────────────────────────────────────────────────────────────────────┐
│  Filters: [Date Range ▾] [Status ▾] [Service ▾] [Search: ____]     │
│                                                                      │
│  ┌────────┬──────┬───────────────┬──────────────┬──────────┬───────┐│
│  │ Date   │ Time │ Client        │ Service      │ Status   │ Actions││
│  ├────────┼──────┼───────────────┼──────────────┼──────────┼───────┤│
│  │ Jul 15 │ 14:00│ Maria Santos  │ Deep Clean   │ Confirmed│ ✎ ⋮  ││
│  │ Jul 15 │ 15:30│ Juan Cruz     │ Diamond Peel │ Confirmed│ ✎ ⋮  ││
│  │ Jul 15 │ 17:00│ Ana Reyes     │ Chemical Peel│ Completed│ ✎ ⋮  ││
│  │ Jul 16 │ 10:00│ Pedro Santos  │ Laser Hair   │ Confirmed│ ✎ ⋮  ││
│  └────────┴──────┴───────────────┴──────────────┴──────────┴───────┘│
│                                                                      │
│  ← Previous   Page 1 of 3   Next →                                  │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

- Filter bar: `flex gap-3 flex-wrap mb-4`
  - Date range: two date inputs or date picker
  - Status: select dropdown (All / Confirmed / Completed / Cancelled / No-show)
  - Service: select dropdown
  - Search: text input (client name, phone, email)
- Table: per design system 6.10
- Actions: edit (pencil), more menu (kebab) with status change options
- Pagination: 50 per page

### Booking Detail Drawer
```
                                    ┌─────────────────────────────┐
                                    │  Booking Details      [X]   │
                                    ├─────────────────────────────┤
                                    │                             │
                                    │  Deep Cleansing Facial      │
                                    │  [Confirmed]                │
                                    │                             │
                                    │  📅 July 15, 2026           │
                                    │  🕐 2:00 PM (60 min)        │
                                    │  💰 ₱1,500                  │
                                    │                             │
                                    │  ── Client ──               │
                                    │  Maria Santos               │
                                    │  📞 +63917XXXXXXX          │
                                    │  ✉ maria@example.com       │
                                    │                             │
                                    │  ── Notifications ──        │
                                    │  ✉ Email confirmation  ✓   │
                                    │  📱 SMS confirmation    ✓   │
                                    │  ✉ Email reminder      ⏳  │
                                    │                             │
                                    │  ── Actions ──              │
                                    │  [Mark Completed]           │
                                    │  [Mark No-show]             │
                                    │  [Reschedule]               │
                                    │  [Cancel Booking]           │
                                    │                             │
                                    └─────────────────────────────┘
```

- Slide-in from right: `fixed right-0 top-0 h-full w-full max-w-md`
- Overlay: `bg-black/40`
- Animation: `translate-x-full → translate-x-0` (200ms)
- Sections separated by `border-t border-neutral-100 pt-4 mt-4`
- Status change: dropdown or buttons → PATCH `/api/bookings/[id]`
- Notifications: list with icon + type + status badge
- Close: X button, overlay click, Escape

---

## 5. Services Management (`/admin/services`)

*(Already implemented — see design system and Feature 01 plan for current spec)*

```
┌──────────────────────────────────────────────────────────────────────┐
│  Services                                                            │
│  Add, edit, and manage your treatment offerings.                     │
│                                                                      │
│  12 total   10 active   2 inactive              [ + Add Service ]   │
│                                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                          │
│  │ [Image]  │  │ [Image]  │  │ No image │                          │
│  │ Name     │  │ Name     │  │ Name     │                          │
│  │ desc...  │  │ desc...  │  │ desc...  │                          │
│  │ 60m ₱1.5k│  │ 45m ₱2k  │  │ 30m ₱800 │                          │
│  │ [Active] │  │ [Active] │  │[Inactive]│                          │
│  │ ✎  🗑    │  │ ✎  🗑    │  │ ✎  🗑    │                          │
│  └──────────┘  └──────────┘  └──────────┘                          │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### Edit/Create Form (inline, above grid)
```
┌──────────────────────────────────────────────────────────────────────┐
│  New service                                              [X]        │
│                                                                      │
│  Service name              Price (PHP)                               │
│  [________________]        [________]                                │
│                                                                      │
│  Duration (minutes)        Status                                    │
│  [________]                [Active ▾]                                │
│                                                                      │
│  Description                                                         │
│  [________________________________________________________]          │
│  [________________________________________________________]          │
│                                                                      │
│  Service image                                                       │
│  ┌────────┐  [  📷 Upload image  ]                                  │
│  │ [img]  │  Max 5MB. JPG/PNG/WebP.                                │
│  └────────┘                                                          │
│                                                                      │
│  ⚠ Service name is required                                         │
│                                                                      │
│  [  Save Service  ]   [  Cancel  ]                                  │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 6. Availability Management (`/admin/availability`)

```
┌──────────────────────────────────────────────────────────────────────┐
│  Availability                                                        │
│  Set your clinic hours and block out dates.                          │
│                                                                      │
│  ── Weekly Hours ───────────────────────────────────────────────    │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Day         Open          Close         Closed?              │   │
│  │  Sunday      [09:00]       [17:00]       [✓] Closed          │   │
│  │  Monday      [09:00]       [17:00]       [ ]                 │   │
│  │  Tuesday     [09:00]       [17:00]       [ ]                 │   │
│  │  Wednesday   [09:00]       [17:00]       [ ]                 │   │
│  │  Thursday    [09:00]       [17:00]       [ ]                 │   │
│  │  Friday      [09:00]       [17:00]       [ ]                 │   │
│  │  Saturday    [09:00]       [17:00]       [ ]                 │   │
│  │                                                              │   │
│  │  [  Save Schedule  ]                                        │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ── Blackout Dates ─────────────────────────────────────────────    │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Date          [___________]   Reason [______________]       │   │
│  │  [  Block Date  ]                                            │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  Upcoming Blackouts                                                  │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Dec 24, 2026  Christmas Eve              [🗑 Remove]       │   │
│  │  Dec 25, 2026  Christmas Day              [🗑 Remove]       │   │
│  │  Dec 31, 2026  New Year's Eve             [🗑 Remove]       │   │
│  │  Jan 1, 2027   New Year's Day             [🗑 Remove]       │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### Weekly Hours
- Table: 7 rows, `border border-neutral-100 rounded-lg overflow-hidden`
- Time inputs: native `<input type="time">` styled per design system
- Closed checkbox: toggles `is_closed`; when checked, time inputs disabled
- Save: single PUT with all 7 rows
- Warning (future): "3 bookings exist on affected days" if reducing hours

### Blackout Dates
- Add form: date input + reason text + "Block Date" button
- List: `card p-0`, rows with date + reason + delete button
- Delete: confirm inline → DELETE → row removed with fade animation
- Sort: upcoming first (ascending date)

---

## 7. Content Editor (`/admin/content`)

```
┌──────────────────────────────────────────────────────────────────────┐
│  Content                                                             │
│  Edit text and images across your website.                           │
│                                                                      │
│  ── Homepage ───────────────────────────────────────────────────    │
│                                                                      │
│  Hero Headline                                                       │
│  [Your skin, our expertise.]                                        │
│                                                                      │
│  Hero Subheadline                                                    │
│  [Book premium skincare treatments in minutes.]                     │
│                                                                      │
│  Hero CTA Button Text                                                │
│  [Book Now]                                                         │
│                                                                      │
│  Hero Image                                                          │
│  ┌────────┐  [  📷 Upload  ]  [  Choose from Gallery  ]            │
│  │ [img]  │                                                        │
│  └────────┘                                                        │
│                                                                      │
│  ── About Page ────────────────────────────────────────────────    │
│                                                                      │
│  About Title                                                         │
│  [____________________________]                                     │
│                                                                      │
│  About Body (markdown)                                               │
│  [________________________________________________]                 │
│  [________________________________________________]                 │
│  [________________________________________________]                 │
│  Preview  │  Edit                                                   │
│                                                                      │
│  About Image                                                         │
│  ┌────────┐  [  📷 Upload  ]                                        │
│  └────────┘                                                        │
│                                                                      │
│  ── Footer ────────────────────────────────────────────────────    │
│                                                                      │
│  Phone          Email           Address                              │
│  [________]    [________]     [________]                            │
│                                                                      │
│  Hours Summary                                                       │
│  [Mon-Sat 9AM-5PM]                                                  │
│                                                                      │
│  [  Save All Changes  ]                                             │
│                                                                      │
│  ✅ Changes saved successfully                                      │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

- Sections: collapsible cards with section header
- Text inputs: per design system 6.2
- Textarea: for body fields, `rows=3` or `rows=6` for longer content
- Markdown preview tab (future): toggle between edit and rendered preview
- Image fields: preview thumbnail + upload button + "Choose from Gallery" link
- Save: single PUT batch upsert → success toast
- Unsaved changes warning: "You have unsaved changes" if navigating away

---

## 8. Branding Customizer (`/admin/branding`)

```
┌──────────────────────────────────────────────────────────────────────┐
│  Branding                                                            │
│  Customize your clinic's visual identity.                            │
│                                                                      │
│  ┌──────────────────────────┐  ┌──────────────────────────────┐     │
│  │  Settings                │  │  Live Preview                │     │
│  │                          │  │                              │     │
│  │  Clinic Name             │  │  ┌──────────────────────┐   │     │
│  │  [Jenca Aesthetics]      │  │  │  [JA]                │   │     │
│  │                          │  │  │  Jenca Aesthetics    │   │     │
│  │  Tagline                 │  │  └──────────────────────┘   │     │
│  │  [Your skin, our expert] │  │                              │     │
│  │                          │  │  ┌──────────────────────┐   │     │
│  │  Primary Color           │  │  │  [  Book Now  ]      │   │     │
│  │  ┌────┐                  │  │  └──────────────────────┘   │     │
│  │  │████│  #be4e41         │  │                              │     │
│  │  └────┘                  │  │  Sample text in brand color │     │
│  │  [Color Picker]          │  │                              │     │
│  │                          │  └──────────────────────────────┘     │
│  │  Logo                    │                                       │
│  │  ┌────────┐              │                                       │
│  │  │ [logo] │              │                                       │
│  │  └────────┘              │                                       │
│  │  [  📷 Upload  ]         │                                       │
│  │                          │                                       │
│  │  [  Save Branding  ]     │                                       │
│  └──────────────────────────┘                                       │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

- Two-column layout: settings (left, `max-w-md`) + live preview (right, sticky)
- Color picker: native `<input type="color">` + hex text input
- Preview updates in real-time as user types/changes color
- Save: PUT branding settings → `revalidatePath('/')` → success toast
- Logo: image upload, preview, remove button

---

## 9. Gallery Manager (`/admin/gallery`)

```
┌──────────────────────────────────────────────────────────────────────┐
│  Gallery                                                             │
│  Upload and manage your clinic photos.                               │
│                                                                      │
│  [  📷 Upload Photos  ]   24 images   20 published   4 hidden       │
│                                                                      │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐                 │
│  │      │  │      │  │      │  │      │  │      │                 │
│  │ img  │  │ img  │  │ img  │  │ img  │  │ img  │                 │
│  │      │  │      │  │      │  │      │  │      │                 │
│  │👁 ✎ 🗑│  │👁 ✎ 🗑│  │👁 ✎ 🗑│  │👁 ✎ 🗑│  │👁 ✎ 🗑│                 │
│  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘                 │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐                 │
│  │      │  │      │  │      │  │      │  │      │                 │
│  │ img  │  │ img  │  │ img  │  │ img  │  │ img  │                 │
│  │      │  │      │  │      │  │      │  │      │                 │
│  │👁 ✎ 🗑│  │👁 ✎ 🗑│  │👁 ✎ 🗑│  │👁 ✎ 🗑│  │👁 ✎ 🗑│                 │
│  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘                 │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

- Grid: `grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4`
- Each tile: `aspect-square rounded-lg overflow-hidden relative group`
  - Image: `object-cover`
  - Overlay on hover: `bg-black/40` with action icons (eye=toggle publish, pencil=edit, trash=delete)
  - Unpublished: `opacity-50` + "Hidden" badge
- Upload: multi-file input, drag-and-drop zone (future)
- Edit modal: alt text, caption, sort order, publish toggle
- Drag-to-reorder (future): dnd-kit
- Delete: confirm modal → removes from storage + table

---

## 10. Mobile Admin Behavior

| Page | Mobile Adaptation |
|------|-------------------|
| Login | Same, full-width card |
| Dashboard | Stat cards: 2×2 grid; upcoming list: full-width |
| Bookings calendar | Switch to day-list view (no month grid) |
| Bookings list | Horizontal scroll table OR card list |
| Services | 1-column card grid |
| Availability | Weekly hours: stack rows; blackout list: full-width |
| Content | All fields full-width, stacked |
| Branding | Preview below settings (no side-by-side) |
| Gallery | 2-column grid |

### Mobile Constraints
- No hover states — all actions visible (not hover-revealed)
- Touch targets: minimum 44×44px
- Modals: full-screen on mobile (`w-full h-full max-w-none`)
- Drawer: full-width slide-in
- Tables: horizontal scroll with `overflow-x-auto` or card layout
