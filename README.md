# Jenca Aesthetics — Online Booking System

A simple, aesthetic web application for online appointment booking, content management, and automated client reminders — built for a skincare clinic in the Philippines.

## Tech Stack

- **Framework:** Next.js 14 (App Router) + React 18 + TypeScript
- **Styling:** TailwindCSS
- **Database:** PostgreSQL (Supabase managed)
- **Storage:** Supabase Storage (images/media)
- **Auth:** Supabase Auth (admin)
- **Email:** Resend
- **SMS:** Semaphore (PH) or Twilio (fallback)
- **Hosting:** Vercel (Pro plan)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

### 3. Set up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the migration in `supabase/migrations/00001_initial_schema.sql` via the Supabase SQL editor
3. Add your Supabase URL and anon key to `.env.local`

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
booking-system/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (public)/           # Public site routes
│   │   ├── admin/              # Admin dashboard routes
│   │   └── api/                # API route handlers
│   ├── components/             # React components
│   ├── lib/                    # Utilities, clients, helpers
│   └── types/                  # TypeScript type definitions
├── supabase/
│   └── migrations/             # SQL migration files
├── PROPOSAL.md                 # Full project proposal
└── .windsurfrules              # AI agent skill rules
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |
| `RESEND_API_KEY` | Resend API key for email |
| `EMAIL_FROM` | From address for emails |
| `SEMAPHORE_API_KEY` | Semaphore SMS API key |
| `SEMAPHORE_SENDER_NAME` | SMS sender name |
| `TWILIO_ACCOUNT_SID` | Twilio account SID (fallback) |
| `TWILIO_AUTH_TOKEN` | Twilio auth token (fallback) |
| `TWILIO_PHONE_NUMBER` | Twilio phone number (fallback) |
| `NEXT_PUBLIC_APP_URL` | Public URL of the app |
| `NEXT_PUBLIC_SITE_NAME` | Site name for branding |
| `MIN_LEAD_TIME_HOURS` | Minimum hours before appointment to book |
| `MAX_BOOKINGS_PER_DAY` | Maximum bookings allowed per day |
| `REMINDER_HOURS_BEFORE` | Hours before appointment to send reminder |
