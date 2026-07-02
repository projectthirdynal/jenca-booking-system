# Feature 07 — Content & Branding CMS

Priority: **P2** · Status: **planned** · Depends on: —

## Overview

A lightweight built-in CMS so the clinic owner can update website text, hero
images, color scheme, and gallery photos without touching code or hiring a
developer. Uses Supabase `content_blocks` for text, `media_assets` for images,
and a `branding_settings` table for visual identity.

## User Stories

- **C1** — As an admin, I can edit the homepage hero headline, subheadline, and CTA text.
- **C2** — As an admin, I can edit the about page text and team bios.
- **C3** — As an admin, I can update the clinic name, tagline, and contact info shown in the footer.
- **C4** — As an admin, I can upload and manage gallery images with alt text and captions.
- **C5** — As an admin, I can change the brand primary color and logo.
- **C6** — As an admin, I can reorder gallery images via drag-and-drop.
- **C7** — As a client, I see the updated content immediately on the public site (ISR or on-demand revalidation).

## Data Model

### `content_blocks` (exists)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| block_key | TEXT UNIQUE | e.g., `hero_headline`, `about_body`, `footer_phone` |
| content | TEXT | markdown or plain text |
| updated_at | TIMESTAMPTZ | |

### `media_assets` (exists)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| file_path | TEXT | public URL in Supabase Storage |
| asset_type | TEXT | `gallery` \| `hero` \| `logo` \| `service` |
| alt_text | TEXT | for accessibility |
| uploaded_at | TIMESTAMPTZ | |

### Future migration: branding + gallery metadata
```sql
-- 0000X_branding_gallery.sql (DO NOT APPLY YET)
CREATE TABLE branding_settings (
    key TEXT PRIMARY KEY,           -- 'primary_color', 'logo_url', 'clinic_name', 'tagline'
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE media_assets ADD COLUMN caption TEXT;
ALTER TABLE media_assets ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE media_assets ADD COLUMN is_published BOOLEAN NOT NULL DEFAULT true;
```

## Content Block Keys (registry)

| Key | Page | Purpose |
|-----|------|---------|
| `hero_headline` | `/` | Main headline |
| `hero_subheadline` | `/` | Subtext below headline |
| `hero_cta_text` | `/` | Button label (default: "Book Now") |
| `hero_image_url` | `/` | Hero background image |
| `about_title` | `/about` | About page title |
| `about_body` | `/about` | About page body (markdown) |
| `about_image_url` | `/about` | About page image |
| `footer_phone` | all | Phone number |
| `footer_email` | all | Contact email |
| `footer_address` | all | Clinic address |
| `footer_hours` | all | Operating hours summary |
| `gallery_intro` | `/gallery` | Gallery page intro text |

## API Contract

| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| GET | `/api/content` | public | all content blocks (key→content map) |
| PUT | `/api/admin/content` | admin | upsert multiple blocks at once |
| GET | `/api/media?asset_type=gallery` | public | list published media by type |
| POST | `/api/media` | admin | upload image (exists) |
| DELETE | `/api/media/[id]` | admin | delete image + storage file |
| PUT | `/api/media/[id]` | admin | update alt_text, caption, sort_order, is_published |
| GET | `/api/admin/branding` | admin | all branding settings |
| PUT | `/api/admin/branding` | admin | upsert branding settings |

## UI Spec

### `/admin/content`
- **Content editor** (`ContentEditor` component — exists as stub).
- Form sections grouped by page: Homepage, About, Footer.
- Rich text for body fields (markdown editor or simple textarea with preview).
- Image picker for image fields (select from uploaded media or upload new).
- Save button → PUT batch upsert.
- Live preview panel (optional v2).

### `/admin/branding`
- **Branding customizer** (`BrandingCustomizer` — exists as stub).
- Color picker for primary brand color (updates CSS variable).
- Logo upload (replaces header logo).
- Clinic name, tagline inputs.
- Live preview of color changes.

### `/admin/gallery`
- **Gallery manager** (new page).
- Grid of uploaded images with drag-to-reorder.
- Per-image: alt text, caption, publish toggle, delete.
- Upload button (multi-file).
- Filter by asset_type.

## Edge Cases

| # | Case | Handling |
|---|------|----------|
| E1 | Content block missing from DB | Fallback to hardcoded defaults in component |
| E2 | Logo image deleted | Fallback to text clinic name |
| E3 | Gallery has 0 images | Show "No photos yet" empty state |
| E4 | Color value invalid | Validate hex format; reject non-`#RRGGBB` |
| E5 | Large images uploaded | Client-side resize before upload (max 1920px wide) |
| E6 | Content updated but page cached | Use `revalidatePath()` or `revalidateTag()` after save |

## Implementation Phases

### Phase 1 — Content blocks CRUD
- [ ] Seed default content blocks via migration
- [ ] GET /api/content (public) + PUT /api/admin/content
- [ ] Wire ContentEditor to real API
- [ ] Replace hardcoded text in public pages with content block lookups
- [ ] revalidatePath on save

### Phase 2 — Gallery management
- [ ] Gallery manager page with upload + reorder
- [ ] DELETE /api/media/[id] (storage + table)
- [ ] Wire /gallery page to published media

### Phase 3 — Branding
- [ ] branding_settings migration
- [ ] Branding customizer wired to API
- [ ] CSS variable injection from branding settings
- [ ] Logo in header from branding

### Phase 4 — Polish
- [ ] Image optimization (next/image)
- [ ] Drag-and-drop reorder (dnd-kit)
- [ ] Markdown rendering for body fields
- [ | Live preview panels

## Test Plan

| Test | Type | Assertion |
|------|------|-----------|
| Missing block falls back to default | unit | default string rendered |
| Save content updates public page | E2E | new text visible after revalidate |
| Invalid hex color | API | 422 |
| Delete gallery image | integration | row + storage file removed |
| Reorder gallery | API | sort_order persisted |
| Unpublished image hidden | API | excluded from public GET |

## Open Questions

1. **Q1** — Markdown or rich-text (TipTap) for body content? Markdown is simpler for v1.
2. **Q2** — Should branding support multiple color presets (light/dark themes)? v2.
3. **Q3** — Custom domain email for contact? Depends on domain setup.
