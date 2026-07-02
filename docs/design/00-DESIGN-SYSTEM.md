# Jenca Aesthetics — Design System

> Single source of truth for visual identity, typography, spacing, components,
> and interaction patterns. All pages and components reference this document.

---

## 1. Brand Identity

### Brand Personality
- **Premium yet approachable** — medical-aesthetic clinic, not a hospital.
- **Clean and calming** — whitespace-forward, soft accents, no clutter.
- **Trustworthy** — clear information hierarchy, no dark patterns.
- **Filipino-local** — PHP pricing, PH mobile formats, local cultural cues.

### Brand Voice
- Warm, professional, concise.
- "Your skin, our expertise." (proposed tagline)
- Avoid medical jargon; use accessible language.

### Logo
- **Primary**: Wordmark "Jenca Aesthetics" in display font.
- **Compact**: "JA" monogram for favicon, sidebar, mobile header.
- **Color**: Brand primary on light backgrounds; white on dark/brand backgrounds.
- *(future: upload via branding customizer)*

---

## 2. Color System

### Primary Palette
| Token | Hex | Usage |
|-------|-----|-------|
| `brand-50` | `#fdf8f7` | Page backgrounds, subtle tints |
| `brand-100` | `#faeeeC` | Hover states, selected backgrounds |
| `brand-200` | `#f5d9d5` | Borders on brand elements |
| `brand-300` | `#edb8b1` | Disabled brand elements |
| `brand-400` | `#e08e84` | Secondary brand accents |
| `brand-500` | `#d06a5e` | Primary buttons, key accents |
| `brand-600` | `#be4e41` | **Primary brand color** — CTAs, links |
| `brand-700` | `#a83e33` | Hover on primary buttons, prices |
| `brand-800` | `#8c342b` | Active states, pressed |
| `brand-900` | `#722e27` | Dark brand text on light bg |
| `brand-950` | `#3f1714` | Deepest brand, rare use |

> **Design note:** The brand color is a warm terracotta-rose — evokes skin,
> warmth, and clinical cleanliness without being sterile blue.

### Neutral Palette
| Token | Hex | Usage |
|-------|-----|-------|
| `neutral-50` | `#fafafa` | App background |
| `neutral-100` | `#f5f5f5` | Card backgrounds, dividers |
| `neutral-200` | `#e5e5e5` | Borders, disabled states |
| `neutral-300` | `#d4d4d4` | Placeholder text, icons |
| `neutral-400` | `#a3a3a3` | Secondary icons |
| `neutral-500` | `#737373` | Secondary text |
| `neutral-600` | `#525252` | Body text |
| `neutral-700` | `#404040` | Headings (light weight) |
| `neutral-800` | `#262626` | Headings (bold) |
| `neutral-900` | `#171717` | Primary headings |
| `neutral-950` | `#0a0a0a` | Max contrast text |

### Semantic Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `green-100` / `green-700` | `#dcfce7` / `#15803d` | Active status, success |
| `red-50` / `red-600` | `#fef2f2` / `#dc2626` | Errors, delete, cancel |
| `amber-100` / `amber-700` | `#fef3c7` / `#b45309` | Pending status, warnings |
| `blue-100` / `blue-700` | `#dbeafe` / `#1d4ed8` | Info, calendar highlights |

### CSS Variables (Tailwind config)
```js
// tailwind.config.ts — extend.colors
brand: {
  50:  '#fdf8f7',
  100: '#faeeec',
  200: '#f5d9d5',
  300: '#edb8b1',
  400: '#e08e84',
  500: '#d06a5e',
  600: '#be4e41',  // primary
  700: '#a83e33',
  800: '#8c342b',
  900: '#722e27',
  950: '#3f1714',
},
```

---

## 3. Typography

### Font Stack
| Role | Font | Weights | Usage |
|------|------|---------|-------|
| Display | `Poppins` | 600, 700, 800 | Headlines, page titles, logo |
| Body | `Inter` | 400, 500, 600 | Paragraphs, forms, UI text |
| Mono | `JetBrains Mono` | 400 | Code, debug, API examples |

### Font Loading (next/font)
```typescript
import { Poppins, Inter } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
});
```

### Type Scale
| Token | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| `text-4xl` | 36px | 1.1 | 800 | Hero headlines |
| `text-3xl` | 30px | 1.2 | 700 | Page titles (h1) |
| `text-2xl` | 24px | 1.25 | 700 | Section titles (h2) |
| `text-xl` | 20px | 1.4 | 600 | Card titles (h3) |
| `text-lg` | 18px | 1.5 | 600 | Subtitles, admin nav |
| `text-base` | 16px | 1.6 | 400 | Body text, form labels |
| `text-sm` | 14px | 1.5 | 400 | Secondary text, captions |
| `text-xs` | 12px | 1.5 | 500 | Badges, micro-labels |

### Text Utilities (Tailwind classes)
```css
.font-display { font-family: var(--font-display); }
.font-body    { font-family: var(--font-body); }
```

---

## 4. Spacing & Layout

### Spacing Scale (Tailwind default)
`0 · 0.5(2px) · 1(4px) · 2(8px) · 3(12px) · 4(16px) · 5(20px) · 6(24px) · 8(32px) · 10(40px) · 12(48px) · 16(64px) · 20(80px) · 24(96px)`

### Container Widths
| Breakpoint | Max width | Padding |
|------------|-----------|---------|
| mobile (<640px) | 100% | `px-4` (16px) |
| sm (≥640px) | 640px | `px-6` (24px) |
| md (≥768px) | 768px | `px-6` |
| lg (≥1024px) | 1024px | `px-8` (32px) |
| xl (≥1280px) | 1280px | `px-8` |

### Page Layout Patterns
- **Public pages**: centered `max-w-7xl` container, vertical padding `py-12` (48px).
- **Admin pages**: sidebar (240px) + main content `max-w-7xl`, padding `py-8`.
- **Forms**: `max-w-2xl` centered, `max-w-md` for login.

### Grid System
- Default: 12-column CSS grid.
- Card grids: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` for services/gallery.
- Form grids: `grid-cols-1 sm:grid-cols-2` for paired fields.

---

## 5. Breakpoints

| Name | Width | Target |
|------|-------|--------|
| `sm` | 640px | Large phones, small tablets (portrait) |
| `md` | 768px | Tablets (portrait) |
| `lg` | 1024px | Tablets (landscape), small laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large desktops |

### Mobile-First Rules
1. Start at mobile layout; add complexity at each breakpoint.
2. Admin sidebar collapses to hamburger menu below `lg`.
3. Booking form steps stack vertically on mobile; wizard sidebar hidden.
4. Calendar becomes scrollable day-list on mobile.

---

## 6. Component Specifications

### 6.1 Button

| Variant | Background | Text | Border | Padding | Radius |
|---------|-----------|------|--------|---------|--------|
| Primary | `brand-600` | white | none | `px-5 py-2.5` | `rounded-lg` |
| Primary hover | `brand-700` | white | none | — | — |
| Secondary | `neutral-100` | `neutral-700` | `neutral-200` | `px-5 py-2.5` | `rounded-lg` |
| Secondary hover | `neutral-200` | `neutral-800` | `neutral-300` | — | — |
| Ghost | transparent | `neutral-600` | none | `px-3 py-2` | `rounded-lg` |
| Ghost hover | `neutral-100` | `neutral-900` | none | — | — |
| Danger | `red-600` | white | none | `px-5 py-2.5` | `rounded-lg` |
| Danger hover | `red-700` | white | none | — | — |

| Size | Height | Font | Icon |
|------|--------|------|------|
| `sm` | 32px | `text-sm` | 16px |
| `md` (default) | 40px | `text-sm` | 16px |
| `lg` | 48px | `text-base` | 20px |

**States**: default → hover → active(pressed) → disabled(50% opacity, no pointer) → loading(spinner + disabled)

### 6.2 Input / Textarea / Select

```
Label (text-sm, neutral-700, font-medium)
┌─────────────────────────────────────┐
│  placeholder / value                │  ← height 40px, border neutral-200
└─────────────────────────────────────┘  ← focus: border brand-500, ring-2 brand-100
```

| State | Border | Ring | Background |
|-------|--------|------|------------|
| Default | `neutral-200` | none | white |
| Focus | `brand-500` | `brand-100` (2px) | white |
| Error | `red-500` | `red-100` (2px) | `red-50` |
| Disabled | `neutral-200` | none | `neutral-50` |

- Error message: `text-xs text-red-600 mt-1`
- Helper text: `text-xs text-neutral-500 mt-1`
- Required indicator: red asterisk after label

### 6.3 Card

```
┌──────────────────────────────────┐
│                                  │  ← padding: p-5 or p-6
│  [Image — optional, 4:3 ratio]   │  ← image: rounded-t-lg, object-cover
│                                  │
│  Title (font-display, text-xl)   │
│  Description (text-sm, neutral)  │
│  Meta row (text-sm)              │
│                                  │
│  [Action row — border-t pt-3]    │
└──────────────────────────────────┘
```

- Background: white
- Border: `neutral-100` (1px)
- Radius: `rounded-xl` (12px)
- Shadow: `shadow-sm` default, `shadow-md` on hover
- Padding: `p-5` (compact) or `p-6` (standard)

### 6.4 Badge / Status Pill

| Status | Background | Text | Example |
|--------|-----------|------|---------|
| Active / Confirmed | `green-100` | `green-700` | "Active" |
| Inactive / Cancelled | `neutral-100` | `neutral-500` | "Inactive" |
| Pending | `amber-100` | `amber-700` | "Pending" |
| Completed | `blue-100` | `blue-700` | "Completed" |
| No-show | `red-100` | `red-700` | "No-show" |
| Error | `red-100` | `red-700` | "Failed" |

- Shape: `rounded-full`, `px-2 py-0.5`, `text-xs font-medium`
- Inline-flex, items-center

### 6.5 Modal / Dialog

```
        ┌─────────────────────────────┐
        │  Title              [X]     │  ← p-6, border-b
        ├─────────────────────────────┤
        │                             │
        │  Content / form             │  ← p-6, max-h with scroll
        │                             │
        ├─────────────────────────────┤
        │  [Cancel]      [Confirm]    │  ← p-4, border-t, flex justify-end
        └─────────────────────────────┘
```

- Overlay: `bg-black/40`, `backdrop-blur-sm`
- Container: `bg-white rounded-xl shadow-xl max-w-md w-full mx-auto`
- Animation: fade-in + scale-up (150ms ease-out)
- Close: X button, overlay click, Escape key

### 6.6 Toast / Notification

| Type | Icon | Background | Border | Text |
|------|------|-----------|--------|------|
| Success | CheckCircle | `green-50` | `green-200` | `green-800` |
| Error | AlertCircle | `red-50` | `red-200` | `red-800` |
| Info | Info | `blue-50` | `blue-200` | `blue-800` |
| Warning | AlertTriangle | `amber-50` | `amber-200` | `amber-800` |

- Position: top-right, `fixed top-4 right-4 z-50`
- Width: `max-w-sm`
- Animation: slide-in-right (200ms)
- Auto-dismiss: 4s (success/info), 6s (error/warning)
- Stack: vertical, `gap-2`

### 6.7 Calendar Cell

```
┌──────┐
│  15  │  ← date number (text-sm)
│      │  ← dot indicators for booking count
│  ●●● │  ← 1 dot: 1-3 bookings, 2 dots: 4-7, 3 dots: 8+
└──────┘
```

| State | Background | Text | Border |
|-------|-----------|------|--------|
| Default | white | `neutral-700` | `neutral-100` |
| Hover | `neutral-50` | `neutral-900` | `neutral-200` |
| Selected | `brand-600` | white | `brand-600` |
| Has bookings | `brand-50` | `brand-900` | `brand-100` |
| Disabled (past/closed) | `neutral-50` | `neutral-300` | `neutral-100` |
| Today | white | `brand-600` | `brand-600` (2px) |
| Full | `neutral-100` | `neutral-400` | `neutral-200` |

### 6.8 Time Slot Pill

```
[ 09:00 ]  [ 09:30 ]  [ 10:00 ]  [ 10:30 ]
   ✓          ✓          ✗          ✓
```

| State | Background | Text | Border | Cursor |
|-------|-----------|------|--------|--------|
| Available | white | `neutral-700` | `neutral-200` | pointer |
| Available hover | `brand-50` | `brand-700` | `brand-300` | pointer |
| Selected | `brand-600` | white | `brand-600` | pointer |
| Unavailable | `neutral-50` | `neutral-300` | `neutral-100` | not-allowed |
| Unavailable hover | — | — | — | — (no hover effect) |

- Shape: `rounded-lg`, `px-4 py-2`, `text-sm font-medium`
- Layout: flex-wrap, `gap-2`

### 6.9 Sidebar (Admin)

```
┌──────────────────┐
│  [JA] Jenca      │  ← logo area, h-16, border-b
├──────────────────┤
│  Dashboard       │  ← nav item (active: brand-50 bg, brand-700 text)
│  Bookings        │
│  Services        │
│  Availability    │
│  Content         │
│  Branding        │
│  Gallery         │
├──────────────────┤
│  Logout          │  ← bottom, border-t
└──────────────────┘
```

- Width: 240px (desktop), hidden on mobile (hamburger menu)
- Nav item: `px-4 py-2.5 text-sm rounded-lg`
- Active: `bg-brand-50 text-brand-700 font-medium`
- Inactive: `text-neutral-600 hover:bg-neutral-100`
- Icons: Lucide, 20px, left of label

### 6.10 Data Table

```
| Date       | Time  | Client        | Service          | Status    | Actions |
|------------|-------|---------------|------------------|-----------|---------|
| 2026-07-15 | 14:00 | Maria Santos  | Deep Cleansing   | Confirmed | ⋮       |
| 2026-07-15 | 15:30 | Juan Cruz     | Diamond Peel     | Completed | ⋮       |
```

- Header: `text-xs uppercase text-neutral-500 font-medium`, `bg-neutral-50`
- Rows: `text-sm`, `border-b border-neutral-100`, `hover:bg-neutral-50`
- Actions: icon button (kebab menu or inline icons)
- Pagination: `Previous | Page 1 of 3 | Next`

### 6.11 Empty State

```
        ┌─────────┐
        │  [icon] │  ← 64px circle, neutral-100 bg, neutral-300 icon
        └─────────┘

      No services yet

  Get started by adding your first treatment.

      [ + Add service ]
```

- Centered, `text-center`, `mt-8`
- Icon: 64px in `rounded-full bg-neutral-100`
- Title: `font-display text-lg font-semibold`
- Description: `text-sm text-neutral-500`
- CTA: primary button

### 6.12 Skeleton Loader

```css
.skeleton {
  background: linear-gradient(90deg, #f5f5f5 25%, #e5e5e5 50%, #f5f5f5 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

- Card skeleton: `rounded-xl`, `h-48` (image) + `h-4` lines
- Table skeleton: `h-10` rows with `rounded`
- Text skeleton: `h-4 w-3/4 rounded`

---

## 7. Iconography

### Library: Lucide React
- Stroke width: 2 (default)
- Size: 16px (inline), 20px (nav), 24px (feature), 48px (hero/empty state)
- Color: inherit from parent text color

### Common Icons
| Icon | Usage |
|------|-------|
| `Calendar` | Booking, date pickers |
| `Clock` | Duration, time |
| `MapPin` | Location, address |
| `Phone` | Phone number |
| `Mail` | Email |
| `Sparkles` | Hero, premium features |
| `ShieldCheck` | Trust, security |
| `ArrowRight` | CTAs, next step |
| `ArrowLeft` | Back navigation |
| `Check` | Confirmation, available |
| `X` | Close, cancel, unavailable |
| `Plus` | Add, create |
| `Pencil` | Edit |
| `Trash2` | Delete |
| `Upload` | File upload |
| `Loader2` | Loading spinner (animate-spin) |
| `AlertCircle` | Error messages |
| `ImageIcon` | Image placeholders |
| `Menu` | Mobile nav toggle |
| `LogOut` | Logout |
| `LayoutDashboard` | Dashboard nav |
| `Scissors` | Services nav |

---

## 8. Animation & Motion

### Timing
| Name | Duration | Easing | Usage |
|------|----------|--------|-------|
| Fast | 150ms | `ease-out` | Hover states, button press |
| Normal | 200ms | `ease-out` | Modal open, toast slide-in |
| Slow | 300ms | `ease-in-out` | Page transitions, accordion |

### Patterns
- **Hover lift**: `transition-all duration-150 hover:shadow-md hover:-translate-y-0.5`
- **Fade in**: `animate-in fade-in duration-200`
- **Slide in right**: `translate-x-full → translate-x-0` (toasts)
- **Scale up**: `scale-95 → scale-100` (modals)
- **Shimmer**: skeleton loaders (see 6.12)
- **Spin**: `animate-spin` for loading states

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 9. Accessibility (a11y)

### Requirements
- **Contrast ratio**: minimum 4.5:1 for body text, 3:1 for large text (WCAG AA).
- **Focus visible**: all interactive elements show `focus-visible:ring-2 ring-brand-300`.
- **Keyboard nav**: Tab order follows visual order; Escape closes modals; Enter activates.
- **ARIA labels**: icon-only buttons have `aria-label`; form inputs have associated `<label>`.
- **Alt text**: all images have `alt` attribute (empty string for decorative).
- **Screen reader**: status changes announced via `aria-live="polite"` region.
- **Skip link**: "Skip to main content" link at top of every page (visually hidden until focused).

### Color Contrast Checks
| Pair | Ratio | Pass? |
|------|-------|-------|
| `neutral-900` on white | 16.1:1 | ✅ AAA |
| `neutral-600` on white | 7.3:1 | ✅ AAA |
| `neutral-500` on white | 4.7:1 | ✅ AA |
| `brand-600` on white | 4.6:1 | ✅ AA |
| `brand-700` on white | 6.1:1 | ✅ AA |
| white on `brand-600` | 4.6:1 | ✅ AA |
| `neutral-400` on white | 2.9:1 | ❌ (decorative only) |

---

## 10. Responsive Behavior

### Breakpoint Behavior Matrix

| Component | Mobile (<640) | Tablet (640-1024) | Desktop (>1024) |
|-----------|--------------|-------------------|-----------------|
| Header | Hamburger menu | Hamburger menu | Full nav inline |
| Hero | Stack vertical, 1 col | Stack vertical, 1 col | Side-by-side, 2 col |
| Services grid | 1 column | 2 columns | 3 columns |
| Booking form | Single column, stacked steps | 2-column form | Form + summary sidebar |
| Admin sidebar | Hidden (hamburger) | Hidden (hamburger) | Fixed 240px sidebar |
| Admin tables | Horizontal scroll | Horizontal scroll | Full width |
| Calendar | Day list view | Month grid | Month grid |
| Footer | Stack vertical | Stack vertical | 3-column grid |

### Touch Targets
- Minimum: 44×44px (iOS HIG) / 48×48px (Material)
- Applied to: all buttons, nav items, slot pills, calendar cells
- Gap between targets: minimum 8px

---

## 11. File Structure Reference

```
src/
├── app/
│   ├── (public)/              ← route group for public pages
│   │   ├── layout.tsx         ← public layout: header + footer
│   │   ├── page.tsx           ← homepage
│   │   ├── services/
│   │   │   ├── page.tsx       ← services grid
│   │   │   └── [id]/page.tsx  ← service detail
│   │   ├── book/
│   │   │   ├── page.tsx       ← booking wizard
│   │   │   └── confirmation/
│   │   ├── about/
│   │   ├── gallery/
│   │   └── manage/[token]/
│   ├── admin/
│   │   ├── layout.tsx         ← passthrough layout
│   │   ├── login/
│   │   └── (protected)/
│   │       ├── layout.tsx     ← auth guard + sidebar
│   │       ├── page.tsx       ← dashboard
│   │       ├── bookings/
│   │       ├── services/
│   │       ├── availability/
│   │       ├── content/
│   │       ├── branding/
│   │       └── gallery/
│   └── api/
├── components/
│   ├── ui/                    ← primitives: Button, Input, Card, Modal, Toast
│   ├── public/                ← Header, Footer, HeroSection, ServiceCard
│   └── admin/                 ← AdminSidebar, BookingsCalendar, etc.
├── lib/
│   ├── supabase/
│   ├── notifications/
│   ├── utils.ts
│   └── availability.ts
├── types/
│   └── index.ts
└── styles/
    └── globals.css
```

---

## 12. Design Tokens Export

### Tailwind Config Snippet
```js
// tailwind.config.ts
const config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { /* see section 2 */ },
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      borderRadius: {
        'xl': '12px',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      },
      animation: {
        'shimmer': 'shimmer 1.5s infinite',
      },
    },
  },
};
```

### CSS Custom Properties (globals.css)
```css
:root {
  --font-display: 'Poppins', sans-serif;
  --font-body: 'Inter', sans-serif;
  --color-brand: #be4e41;
  --color-brand-hover: #a83e33;
  --color-brand-light: #fdf8f7;
  --shadow-card: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  --radius: 12px;
}
```
