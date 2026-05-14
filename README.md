# BruinLink

BruinLink is a CS35L MVP for UCLA club discovery and lightweight club listing management. It gives students a public club directory, lets prospective club representatives request new listings, gives admins a protected review dashboard, and lets approved clubs update their own public page through a per-club edit code.

The project is intentionally scoped as a database-backed MVP. It does not depend on AI APIs, student accounts, or UCLA email authentication.

## What Works

- Public homepage directory backed by Supabase club records
- Club-name search and category filtering
- Dedicated public club pages at `/clubs/[slug]`
- Freshness labels derived from `last_edited_at`
  - `fresh`: updated within 3 days
  - `current`: updated more than 3 days ago and within 14 days
  - `needs update`: updated more than 14 days ago
- Public club registration requests at `/register`
- Protected admin review at `/admin`
- Admin approve/reject flow for pending requests
- Admin hide, unhide, permanent delete, search, visibility filter, and freshness filter
- Automatic unique edit code generation in `BL-XXXX-XXXX` format
- Hashed edit-code storage only; plaintext codes are shown once to admins
- Admin-triggered edit-code regeneration for forgotten club codes
- Per-club edit mode at `/clubs/[slug]/edit`
- Editable club profile, meeting details, listed members, contact email, upcoming events, and announcements
- Immediate public-page updates after a successful club edit

## Routes

- `/` - public club directory
- `/clubs/[slug]` - public club profile
- `/clubs/[slug]/edit` - protected edit page for one club
- `/register` - new club listing request form
- `/admin` - protected admin review and club management page

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Supabase Postgres
- Supabase JavaScript client
- Tailwind CSS through the Next/Tailwind setup
- Lucide icons

## Environment Variables

Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Required values:

```bash
BRUINLINK_ADMIN_PASSWORD=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Notes:

- `BRUINLINK_ADMIN_PASSWORD` protects `/admin`.
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are used for public-safe reads.
- `SUPABASE_SERVICE_ROLE_KEY` is server-only and is used for privileged admin/club edit server actions.
- Never commit `.env` or real Supabase secrets.

## Local Development

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Open:

```bash
http://localhost:3000
```

If port `3000` is busy:

```bash
npm run dev -- --port 3001
```

Then open:

```bash
http://localhost:3001
```

## Supabase Setup

The current schema lives in:

```bash
supabase/migrations/20260513090000_init_bruinlink_schema.sql
```

The migration creates:

- `clubs`
- `club_registration_requests`
- request approval RPC
- row-level security for public visible-club reads
- seeded demo club records

For a linked Supabase project, apply migrations with the Supabase CLI workflow your team is using. After the schema is applied, make sure `.env` points at that Supabase project.

## Useful Commands

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Access Model

Admin access:

- Admins enter `BRUINLINK_ADMIN_PASSWORD` on `/admin`.
- A valid admin session is stored in an HTTP-only cookie for 4 hours.
- Changing `BRUINLINK_ADMIN_PASSWORD` invalidates existing admin session tokens after the app restarts.

Club edit access:

- Admin approval generates a unique `BL-XXXX-XXXX` edit code.
- The database stores only the hash of that code.
- Club representatives click `Manage listing` on their public club page and enter the code.
- A valid club edit session is scoped to that single club and lasts 4 hours.
- Regenerating a club code invalidates old edit sessions for that club.

## MVP Status

The core PRD success criteria are implemented:

- public club discovery
- search and category filtering
- public club pages
- database-backed registration requests
- protected admin review
- approve/reject/hide/unhide/delete
- generated edit codes
- per-club edit mode
- immediate publishing after saves

Remaining work is mostly demo readiness and optional polish:

- choose the final seeded/demo club list
- decide how demo edit codes will be distributed during presentation
- run one final end-to-end demo pass on the target Supabase project
- optionally add image uploads
- optionally add update logs
- optionally replace edit codes with UCLA email login plus club-claim verification in a future version

## Documentation

- Product requirements: `BruinLink-PRD.md`
- Implementation plan/source of truth: `docs/plans/club-registration-admin-review-plan.md`
