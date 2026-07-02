# Public Pages — UI Specifications

> Detailed wireframes, layout specs, and interaction notes for every
> client-facing page. Each spec is implementation-ready.

---

## 1. Shared Layout — Header + Footer

### Header (`src/components/public/Header.tsx`)

```
┌──────────────────────────────────────────────────────────────────────┐
│  [JA]  Jenca Aesthetics        Home  Services  About  Gallery  [Book] │
│  ─────                                                            ▓▓▓ │
└──────────────────────────────────────────────────────────────────────┘
```

**Desktop (≥1024px):**
- Height: 64px (`h-16`), sticky top, `bg-white/95 backdrop-blur`, `border-b border-neutral-100`
- Left: Logo (monogram + wordmark), `font-display font-bold text-lg`
- Center/Right: Nav links (`text-sm text-neutral-600 hover:text-brand-600`), gap-8
- Far right: "Book Now" primary button (`size-sm`)
- Active link: `text-brand-600 font-medium` with underline indicator

**Mobile (<1024px):**
- Height: 56px (`h-14`)
- Left: Logo only (monogram + wordmark)
- Right: Hamburger icon (`Menu` from Lucide)
- Hamburger opens slide-down menu:
  ```
  ┌──────────────────────────┐
  │  Home                    │
  │  Services                │
  │  About                   │
  │  Gallery                 │
  │  [    Book Now     ]     │  ← full-width primary button
  └──────────────────────────┘
  ```
- Animation: `max-h-0 → max-h-96` transition (300ms ease-in-out)
- Close: tap hamburger again, tap any link, or tap outside

### Footer (`src/components/public/Footer.tsx`)

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  Jenca Aesthetics          Quick Links          Contact               │
│  Premium skincare          Home                 📞 0917-XXX-XXXX      │
│  treatments in Manila.     Services             ✉ hello@jenca...      │
│                             About               📍 Taguig, Metro       │
│                             Gallery              Manila                │
│                             Book Now                                   │
│                                                                      │
│  ──────────────────────────────────────────────────────────────      │
│  © 2026 Jenca Aesthetics. All rights reserved.                      │
└──────────────────────────────────────────────────────────────────────┘
```

- Background: `neutral-900`, text: `neutral-400`
- 3-column grid on desktop, stack on mobile
- Column 1: Brand name (`font-display text-lg text-white`), tagline, social icons (future)
- Column 2: Quick links (`text-sm`, `hover:text-white`)
- Column 3: Contact info with icons (`text-sm`)
- Bottom bar: `border-t border-neutral-800`, `py-4`, copyright text
- Content sourced from `content_blocks` (footer_phone, footer_email, footer_address)

---

## 2. Homepage (`/`)

### Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│                         [Header]                                      │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌──────────────────────────┐    ┌──────────────────────┐          │
│   │  H1: Your skin,          │    │                      │          │
│   │  our expertise.          │    │   [Hero Image]       │          │
│   │                          │    │   aspect-[4/3]       │          │
│   │  Sub: Book premium       │    │   rounded-2xl        │          │
│   │  skincare treatments     │    │   shadow-lg          │          │
│   │  in minutes.             │    │                      │          │
│   │                          │    │                      │          │
│   │  [  Book Now  →  ]       │    │                      │          │
│   │  [ Browse Services ]     │    │                      │          │
│   └──────────────────────────┘    └──────────────────────┘          │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│                    Featured Treatments                               │
│           Our most popular skincare services                         │
│                                                                      │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐                         │
│   │ [Image]  │  │ [Image]  │  │ [Image]  │                         │
│   │ Service  │  │ Service  │  │ Service  │                         │
│   │ 1        │  │ 2        │  │ 3        │                         │
│   │ 60m ₱1.5k│  │ 45m ₱2k  │  │ 30m ₱800 │                         │
│   │ [Book →] │  │ [Book →] │  │ [Book →] │                         │
│   └──────────┘  └──────────┘  └──────────┘                         │
│                                                                      │
│              [ View All Services → ]                                 │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │
│   │ ✨ Premium  │  │ 🛡️ Trusted │  │ ⚡ Instant  │                │
│   │ Treatments │  │ & Safe      │  │ Booking     │                │
│   │ text...    │  │ text...     │  │ text...     │                │
│   └─────────────┘  └─────────────┘  └─────────────┘                │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌──────────────────────────────────────────────────────────────┐  │
│   │  Ready to book your appointment?                              │  │
│   │  [  Book Now  →  ]                                            │  │
│   └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│                         [Footer]                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### Sections

#### Hero
- Container: `max-w-7xl`, `py-16 sm:py-24`
- Grid: `grid-cols-1 lg:grid-cols-2`, `gap-12`, `items-center`
- Left column:
  - H1: `font-display text-4xl sm:text-5xl font-bold text-neutral-900`
  - Subheadline: `mt-4 text-lg text-neutral-600`
  - CTA row: `mt-8 flex gap-3`
    - Primary: "Book Now" with `ArrowRight` icon → `/book`
    - Secondary: "Browse Services" → `/services`
- Right column:
  - Image: `aspect-[4/3] rounded-2xl shadow-lg object-cover`
  - Fallback: gradient placeholder if no hero image
- Content from `content_blocks`: `hero_headline`, `hero_subheadline`, `hero_cta_text`, `hero_image_url`

#### Featured Services
- Container: `max-w-7xl`, `py-16`
- Header: centered, H2 `font-display text-3xl font-bold`, subtitle `text-lg text-neutral-600`
- Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`, `gap-6`, `mt-10`
- Shows first 3 active services (or 6 if available)
- Each card: `ServiceCard` component (see design system 6.3)
- Below grid: centered "View All Services →" ghost button → `/services`

#### Trust Indicators
- Container: `max-w-7xl`, `py-16`, `bg-brand-50` section
- 3-column grid: `grid-cols-1 sm:grid-cols-3`, `gap-8`
- Each column: icon (48px, `text-brand-600`), title (`font-display text-lg font-semibold`), description (`text-sm text-neutral-600`)
- Icons: `Sparkles`, `ShieldCheck`, `Calendar`

#### CTA Banner
- Container: `max-w-7xl`, `py-16`
- Card: `bg-brand-600 text-white rounded-2xl p-8 sm:p-12 text-center`
- H2: `font-display text-2xl sm:text-3xl font-bold text-white`
- Button: white variant on brand background → `/book`

---

## 3. Services List (`/services`)

```
┌──────────────────────────────────────────────────────────────────────┐
│  [Header]                                                            │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│                    Our Treatments                                    │
│      Browse our services and book the one that's right for you.      │
│                                                                      │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐                         │
│   │ [Image]  │  │ [Image]  │  │ [Image]  │                         │
│   │ Name     │  │ Name     │  │ Name     │                         │
│   │ desc...  │  │ desc...  │  │ desc...  │                         │
│   │ 60m ₱1.5k│  │ 45m ₱2k  │  │ 30m ₱800 │                         │
│   │ [Book →] │  │ [Book →] │  │ [Book →] │                         │
│   └──────────┘  └──────────┘  └──────────┘                         │
│                                                                      │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐                         │
│   │ ...      │  │ ...      │  │ ...      │                         │
│   └──────────┘  └──────────┘  └──────────┘                         │
│                                                                      │
│  [Footer]                                                            │
└──────────────────────────────────────────────────────────────────────┘
```

- Container: `max-w-7xl px-4 py-12`
- Header: centered, H1 + subtitle
- Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10`
- Empty state: "Services are being updated. Please check back soon."
- *(future: category filter tabs above grid, search input)*

---

## 4. Service Detail (`/services/[id]`)

```
┌──────────────────────────────────────────────────────────────────────┐
│  [Header]                                                            │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ← Back to all treatments                                            │
│                                                                      │
│  ┌────────────────┐    ┌────────────────────────────────┐           │
│  │                │    │  Deep Cleansing Facial          │           │
│  │   [Image]      │    │  ⏱ 60 min    ₱1,500             │           │
│  │   aspect-4/3   │    │                                │           │
│  │   rounded-xl   │    │  A deep-cleansing treatment    │           │
│  │                │    │  that unclogs pores and...      │           │
│  │                │    │                                │           │
│  └────────────────┘    │  ✓ Instant email & SMS         │           │
│                        │  ✓ Free cancellation up to 2h  │           │
│                        │  ✓ 24h reminder                │           │
│                        │                                │           │
│                        │  [  📅 Book this treatment  → ]│           │
│                        └────────────────────────────────┘           │
│                                                                      │
│  [Footer]                                                            │
└──────────────────────────────────────────────────────────────────────┘
```

- Container: `max-w-4xl px-4 py-12`
- Back link: `text-sm text-neutral-500 hover:text-brand-600`, `ArrowLeft` icon
- Grid: `grid-cols-1 sm:grid-cols-2 gap-8 mt-6`
- Left: image (`aspect-[4/3] rounded-xl object-cover`)
- Right: flex-col
  - H1: `font-display text-3xl font-bold`
  - Meta row: `Clock` icon + duration, price (`text-2xl font-bold text-brand-700`)
  - Description: `text-neutral-600 leading-relaxed mt-6`
  - Feature checklist: 3 items with `Check` icon (`text-green-600`)
  - CTA: full-width on mobile, auto-width on `sm+`, `size-lg`
- 404 if service inactive or not found

---

## 5. Booking Wizard (`/book`)

### Full Page Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│  [Header]                                                            │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────┐  ┌──────────────────┐     │
│  │                                      │  │  Booking Summary │     │
│  │  Step 1: Choose treatment            │  │                  │     │
│  │  ┌──────────────────────────────┐    │  │  Service:        │     │
│  │  │ Deep Cleansing Facial    ▼   │    │  │  Deep Cleansing  │     │
│  │  └──────────────────────────────┘    │  │  Facial          │     │
│  │                                      │  │                  │     │
│  │  Step 2: Pick a date                 │  │  Date: Jul 15    │     │
│  │  ┌──────────────────────────────┐    │  │  Time: 2:00 PM   │     │
│  │  │  ◀  July 2026          ▶   │    │  │  Duration: 60min │     │
│  │  │  S  M  T  W  T  F  S        │    │  │  Price: ₱1,500   │     │
│  │  │  ·  ·  1  2  3  4  5        │    │  │                  │     │
│  │  │  6  7  8  9 10 11 12        │    │  │  ──────────────  │     │
│  │  │ 13 14[15]16 17 18 19        │    │  │  Total: ₱1,500   │     │
│  │  │ 20 21 22 23 24 25 26        │    │  │                  │     │
│  │  │ 27 28 29 30 31  ·  ·        │  ← sticky on desktop
│  │  └──────────────────────────────┘    │  │  By booking,    │     │
│  │                                      │  │  you agree to... │     │
│  │  Step 3: Available times            │  │                  │     │
│  │  [09:00] [09:30] [10:00] [10:30]    │  └──────────────────┘     │
│  │  [11:00] [11:30] [13:00] [13:30]    │                           │
│  │  [14:00 ✓] [14:30] [15:00] [15:30]  │                           │
│  │                                      │                           │
│  │  Step 4: Your details               │                           │
│  │  Full name    [____________]        │                           │
│  │  Phone (PH)   [____________]        │                           │
│  │  Email        [____________]        │                           │
│  │                                      │                           │
│  │  [    Confirm Booking    ]           │                           │
│  └──────────────────────────────────────┘                           │
│                                                                      │
│  [Footer]                                                            │
└──────────────────────────────────────────────────────────────────────┘
```

### Step Details

#### Step 1 — Service Selection
- Dropdown/select: `select` styled per design system
- Pre-selected if `?service=` query param present
- On change: update URL param, refresh availability
- Shows service name + price + duration in dropdown option

#### Step 2 — Date Picker
- Month grid calendar (custom component, not native date input)
- Header: month name + ◀ ▶ navigation buttons
- Weekday row: S M T W T F S (`text-xs text-neutral-400`)
- Days: 6 rows × 7 cols, `aspect-square` cells
- Cell states per design system 6.7
- Disabled days: past, closed weekday, blackout, full
- Selected day: `bg-brand-600 text-white rounded-lg`
- Today: `ring-2 ring-brand-600`
- On select: fetch availability for that date → update Step 3

#### Step 3 — Time Slots
- Label: "Available times for {date}"
- Slot pills per design system 6.8
- Fetched from `/api/availability?service_id=&date=`
- Loading: skeleton pills (8 grey rectangles)
- Empty: "No available slots on this day. Please pick another date."
- On select: update summary sidebar, scroll to Step 4

#### Step 4 — Contact Details
- Form fields per design system 6.2:
  - Full name (required, text)
  - Phone (required, tel, placeholder `09XX XXX XXXX`)
  - Email (required, email)
- Inline validation on blur:
  - Name: min 2 chars
  - Phone: PH format `^(\+?63|0)9\d{9}$`
  - Email: basic RFC regex
- Error messages: `text-xs text-red-600` below field
- Submit button: "Confirm Booking", full-width on mobile
- Loading state: spinner + "Booking..." text, button disabled

#### Summary Sidebar
- Position: sticky `top-24` on desktop, static on mobile (below form)
- Card: `bg-neutral-50 rounded-xl p-5`
- Shows: service name, date, time, duration, price, total
- T&C note: `text-xs text-neutral-500`
- Hidden until service + date selected (shows placeholder: "Select a treatment to begin")

### Interaction States
- **No service selected**: Steps 2–4 disabled (greyed, not interactable)
- **No date selected**: Steps 3–4 disabled
- **No time selected**: Step 4 disabled
- **409 on submit**: Toast "That slot was just taken" → refresh slots → keep form data
- **422 on submit**: Inline error on relevant field
- **Success**: Redirect to `/book/confirmation?token={token}`

---

## 6. Booking Confirmation (`/book/confirmation`)

```
┌──────────────────────────────────────────────────────────────────────┐
│  [Header]                                                            │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│                    ✅  Booking Confirmed!                            │
│                                                                      │
│           We've sent a confirmation to your email and phone.         │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Deep Cleansing Facial                                        │   │
│  │  📅 July 15, 2026 at 2:00 PM                                 │   │
│  │  ⏱ 60 minutes · ₱1,500                                       │   │
│  │                                                               │   │
│  │  Booked for: Maria Santos                                     │   │
│  │  📞 +63917XXXXXXX                                            │   │
│  │  ✉ maria@example.com                                         │   │
│  │                                                               │   │
│  │  Booking ID: #a1b2c3d4                                       │   │
│  │                                                               │   │
│  │  ──────────────────────────────────────────────────────       │   │
│  │                                                               │   │
│  │  Manage your booking:                                         │   │
│  │  /manage/a1b2c3d4-...                                         │   │
│  │  [  Manage Booking  →  ]                                      │   │
│  │                                                               │   │
│  │  We've sent a confirmation email with a link to manage        │   │
│  │  your booking. You can cancel or reschedule anytime.          │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  [  Book Another Appointment  ]     [  Back to Home  ]              │
│                                                                      │
│  [Footer]                                                            │
└──────────────────────────────────────────────────────────────────────┘
```

- Container: `max-w-2xl mx-auto py-12 px-4`
- Success icon: `CheckCircle2` 64px, `text-green-600`, centered
- H1: `font-display text-3xl font-bold text-center`
- Subtitle: `text-neutral-600 text-center mt-2`
- Booking card: `card p-6 mt-8`
  - Service name: `font-display text-xl font-semibold`
  - Details: icon + text rows, `text-sm text-neutral-600`
  - Booking ID: `text-xs text-neutral-400`, short hash
  - Divider: `border-t border-neutral-100 my-4`
  - Manage section: link + button + policy note
- Action buttons: centered, `gap-3 mt-8`
- If no token in URL or booking not found: "We couldn't find your booking" message

---

## 7. Manage Booking (`/manage/[token]`)

```
┌──────────────────────────────────────────────────────────────────────┐
│  [Header]                                                            │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Deep Cleansing Facial                          [Confirmed]   │   │
│  │  📅 July 15, 2026 at 2:00 PM                                 │   │
│  │  ⏱ 60 minutes · ₱1,500                                       │   │
│  │  Maria Santos · +63917XXXXXXX · maria@example.com            │   │
│  │                                                               │   │
│  │  ─────────────────────────────────────────────────────       │   │
│  │                                                               │   │
│  │  [  Reschedule  ]    [  Cancel Booking  ]                    │   │
│  │                                                               │   │
│  │  Cancellation policy: You can cancel or reschedule up to     │   │
│  │  2 hours before your appointment. Late cancellations may     │   │
│  │  be subject to a fee at the clinic's discretion.             │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  [Footer]                                                            │
└──────────────────────────────────────────────────────────────────────┘
```

### States
- **Confirmed**: shows both buttons (if > 2h before appointment)
- **Confirmed, within 2h**: buttons disabled, note "Cancellation period has passed"
- **Cancelled**: red banner "This booking was cancelled on {date}", no action buttons
- **Completed**: blue banner "This appointment was completed", no action buttons
- **No_show**: amber banner "This appointment was marked as no-show"
- **Invalid token**: centered "Booking not found" + link to `/services`

### Reschedule Inline Flow
```
┌──────────────────────────────────────────────────────────────┐
│  Reschedule Booking                                           │
│                                                               │
│  ◀  July 2026          ▶                                     │
│  S  M  T  W  T  F  S                                         │
│  ·  ·  1  2  3  4  5                                         │
│  6  7  8  9 10 11 12                                         │
│ 13 14 15 16 17[18]19                                         │
│ 20 21 22 23 24 25 26                                         │
│                                                               │
│  [09:00] [09:30] [10:00] [10:30]                             │
│  [11:00] [11:30] [13:00 ✓]                                  │
│                                                               │
│  [  Confirm Reschedule  ]    [  Cancel  ]                    │
└──────────────────────────────────────────────────────────────┘
```
- Replaces the action button area with calendar + slots
- On confirm: POST reschedule → update card → toast "Booking rescheduled"
- On 409: toast "That slot is taken" → refresh slots

### Cancel Modal
```
┌─────────────────────────────────────────┐
│  Cancel Booking                  [X]    │
├─────────────────────────────────────────┤
│                                         │
│  Are you sure you want to cancel your   │
│  appointment on July 15 at 2:00 PM?     │
│                                         │
│  This action cannot be undone.          │
│                                         │
├─────────────────────────────────────────┤
│  [  Keep Booking  ]   [  Yes, Cancel ]  │
└─────────────────────────────────────────┘
```
- Danger button for confirm
- On success: card updates to cancelled state + toast "Booking cancelled"

---

## 8. About Page (`/about`)

```
┌──────────────────────────────────────────────────────────────────────┐
│  [Header]                                                            │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│                    About Jenca Aesthetics                            │
│                                                                      │
│  ┌────────────────┐    ┌────────────────────────────────┐           │
│  │                │    │  Our story...                  │           │
│  │   [Image]      │    │                                │           │
│  │   aspect-4/3   │    │  Founded in 2024, Jenca        │           │
│  │   rounded-xl   │    │  Aesthetics was born from...   │           │
│  │                │    │                                │           │
│  └────────────────┘    └────────────────────────────────┘           │
│                                                                      │
│  ── Our Values ──────────────────────────────────────────────       │
│                                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                          │
│  │ ✨       │  │ 🛡️      │  │ 💝       │                          │
│  │ Quality  │  │ Safety   │  │ Care     │                          │
│  │ text...  │  │ text...  │  │ text...  │                          │
│  └──────────┘  └──────────┘  └──────────┘                          │
│                                                                      │
│  ── Ready to visit? ────────────────────────────────────────       │
│                                                                      │
│  [  Book an Appointment  →  ]                                       │
│                                                                      │
│  [Footer]                                                            │
└──────────────────────────────────────────────────────────────────────┘
```

- Content from `content_blocks`: `about_title`, `about_body`, `about_image_url`
- Body renders as markdown (future) or plain text with paragraph breaks
- Values section: 3 cards, same pattern as homepage trust indicators

---

## 9. Gallery (`/gallery`)

```
┌──────────────────────────────────────────────────────────────────────┐
│  [Header]                                                            │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│                    Gallery                                           │
│           See our clinic and treatment results.                      │
│                                                                      │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐                            │
│  │      │  │      │  │      │  │      │                            │
│  │ img  │  │ img  │  │ img  │  │ img  │                            │
│  │      │  │      │  │      │  │      │                            │
│  └──────┘  └──────┘  └──────┘  └──────┘                            │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐                            │
│  │      │  │      │  │      │  │      │                            │
│  │ img  │  │ img  │  │ img  │  │ img  │                            │
│  │      │  │      │  │      │  │      │                            │
│  └──────┘  └──────┘  └──────┘  └──────┘                            │
│                                                                      │
│  [Footer]                                                            │
└──────────────────────────────────────────────────────────────────────┘
```

- Container: `max-w-7xl px-4 py-12`
- Grid: `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4`
- Each image: `aspect-square rounded-lg overflow-hidden`
- Hover: `scale-105` + shadow (subtle zoom)
- Click: lightbox modal (future — full image + caption + prev/next)
- Empty: "No photos yet. Check back soon!"
- Images from `media_assets WHERE asset_type = 'gallery' AND is_published = true`

---

## 10. Loading & Error States

### Page Loading
- Skeleton screens matching page layout (not spinners)
- Services grid: 3–6 skeleton cards
- Booking page: skeleton calendar + skeleton slots
- Detail page: skeleton image + skeleton text lines

### Error States
| Error | UI |
|-------|-----|
| 404 page | Centered: "Page not found" + illustration + link home |
| 500 page | Centered: "Something went wrong" + retry button |
| API failed | Toast: "Failed to load. Please try again." + retry button |
| Booking not found | Centered: "Booking not found" + link to `/services` |
| Service not found | Centered: "Service not available" + link to `/services` |
| Network offline | Banner: "You're offline. Please check your connection." |

### 404 Page Design
```
┌──────────────────────────────────────┐
│                                      │
│            404                       │  ← font-display text-6xl
│                                      │
│      Page not found                  │  ← text-xl
│                                      │
│  The page you're looking for         │  ← text-sm text-neutral-500
│  doesn't exist or has moved.         │
│                                      │
│  [  Back to Home  →  ]              │
│                                      │
└──────────────────────────────────────┘
```
