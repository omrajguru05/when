# WHEN

> Open-source scheduling that respects your time.
> Self-host on Vercel free tier. Bring your own Supabase, Resend, and Google credentials. No paid dependencies. Ever.

WHEN is a lightweight Calendly / Cal.com alternative built for indie devs, designers, and solopreneurs who want full design control and zero vendor lock-in. The whole thing fits on a Vercel Hobby plan.

- **Stack:** Next.js 14 (App Router), Supabase (Postgres + Auth), Resend, Google Calendar API, Tailwind CSS.
- **License:** MIT.
- **Status:** v1.0 MVP (April 2026).

---

## Table of contents

1. [Features](#features)
2. [Architecture at a glance](#architecture-at-a-glance)
3. [Self-hosting in 5 minutes](#self-hosting-in-5-minutes)
4. [Local development](#local-development)
5. [Environment variables](#environment-variables)
6. [Vercel free-tier compliance](#vercel-free-tier-compliance)
7. [Project structure](#project-structure)
8. [API reference](#api-reference)
9. [AI prompts](#ai-prompts), drop-in prompts for Claude Code / Cursor / etc.
10. [Roadmap](#roadmap)
11. [Contributing](#contributing)
12. [License](#license)

---

## Features

- **Magic-link and Google sign-in** via Supabase Auth, no extra auth service required.
- **Public booking pages** at `/[username]` and `/[username]/[event-slug]`, in the visitor's timezone.
- **Real availability rules**: weekly hours, blocked dates, buffer time, minimum notice.
- **Multiple event types** with their own slug, duration, color, description, and custom questions.
- **Google Calendar sync** (read busy plus write events, with auto refresh-token handling).
- **Email** confirmations, host notifications, and cancellations via Resend.
- **One-click cancel** via signed URL, no login required.
- **Dashboard** with bookings, availability editor, event-type CRUD, and settings.
- **Design system** built on CSS variables, easy to re-skin (see `CLAUDE.md`).
- **Pixel-perfect skeleton loading** via [boneyard-js](https://www.npmjs.com/package/boneyard-js) shimmer skeletons.

---

## Architecture at a glance

```
┌──────────────────────┐  HTTP   ┌────────────────────────────┐
│  Public booking page │────────▶│ Next.js route handlers     │
│  /[username]/[slug]  │         │ (run on Vercel functions)  │
└──────────────────────┘         │                            │
                                 │  /api/slots                │
┌──────────────────────┐         │  /api/bookings             │
│ Dashboard            │────────▶│  /api/event-types          │
│ /dashboard/*         │         │  /api/availability         │
└──────────────────────┘         │  /api/blocked-slots        │
                                 │  /api/user                 │
                                 │  /api/google/*             │
                                 │  /auth/callback            │
                                 │  /auth/sign-out            │
                                 └─────────────┬──────────────┘
                                               │
                                  ┌────────────┼─────────────┐
                                  ▼            ▼             ▼
                            ┌──────────┐ ┌──────────┐ ┌──────────────┐
                            │ Supabase │ │  Resend  │ │ Google Cal.  │
                            │ Postgres │ │  email   │ │   API        │
                            │  + Auth  │ │          │ │              │
                            └──────────┘ └──────────┘ └──────────────┘
```

**No background workers.** Everything is request-driven via Next.js route handlers, so there is nothing for Vercel cron or queues to bill against.

---

## Self-hosting in 5 minutes

You will create three free accounts, paste a few env vars, and click Deploy. No paid plan is required for any of them.

### Step 1. Fork and clone

```bash
gh repo fork omrajguru05/when --clone
cd when
cp .env.example .env.local
```

### Step 2. Create a Supabase project (free)

1. Go to [supabase.com](https://supabase.com), then **New project**. Pick any region close to your users.
2. From **Project Settings, then API**, copy:
   - `Project URL` to `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key to `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key (keep secret) to `SUPABASE_SERVICE_ROLE_KEY`
3. Open **SQL Editor, then New query**, paste the contents of `supabase/migrations/0001_initial_schema.sql`, and run it.
4. (Optional but recommended) **Authentication, then URL Configuration**:
   - Site URL: `https://your-vercel-deployment.vercel.app`
   - Additional Redirect URLs: `https://your-vercel-deployment.vercel.app/auth/callback`, `http://localhost:3000/auth/callback`
5. (Optional) **Authentication, then Providers, then Google**: enable it and paste your Google client ID and secret if you want Google sign-in.

> The migration file installs `pgcrypto`, creates all tables, sets up row-level security, and adds a trigger that auto-creates a `profiles` row whenever a new auth user signs up.

### Step 3. Create a Resend account (free, 100 emails per day)

1. Sign up at [resend.com](https://resend.com).
2. **API Keys, then Create API Key**. Copy it to `RESEND_API_KEY`.
3. Verify a domain (or use the default `onboarding@resend.dev` for testing).
4. Set `RESEND_FROM_EMAIL` to e.g. `WHEN <hello@yourdomain.com>`.

### Step 4. Set up Google Calendar OAuth (free, optional)

Skip this if you do not need calendar sync. WHEN works fine without it.

1. Open the [Google Cloud Console](https://console.cloud.google.com), then create or pick a project.
2. **APIs and Services, then Library**, enable **Google Calendar API**.
3. **APIs and Services, then OAuth consent screen**, External, add yourself as a test user.
4. **Credentials, then Create Credentials, then OAuth client ID**:
   - Type: Web application
   - Authorized redirect URI: `https://your-deployment.vercel.app/api/google/callback`
   - Also add `http://localhost:3000/api/google/callback` for local dev.
5. Copy the client ID and secret to `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

### Step 5. Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fomrajguru05%2Fwhen)

1. Click the button (or run `vercel` from the CLI in your fork).
2. Paste every env var from `.env.example` into Vercel project settings.
3. Set `NEXT_PUBLIC_SITE_URL` to your final domain (e.g. `https://when.yourdomain.com`).
4. Deploy. First build takes about two minutes.

That is it. Visit `/login`, sign in, set a username under **Settings**, create your first event type, and share `/[username]`.

---

## Local development

```bash
# Node 18+
npm install
npm run dev          # http://localhost:3000
npm run typecheck
npm run lint
npm run build
npm run bones        # capture pixel-perfect skeletons (dev server must be running)
```

Make sure `.env.local` is filled in. For the Supabase auth callback to work locally, add `http://localhost:3000/auth/callback` to the Supabase **Redirect URLs** allowlist.

If you are testing email locally, use the default Resend test sender (`onboarding@resend.dev`). It ships fine without domain verification.

### Pixel-perfect skeleton loading

WHEN uses **[boneyard-js](https://www.npmjs.com/package/boneyard-js)** to generate skeleton loading screens that match the real DOM exactly.

- Configuration lives in `boneyard.config.json` (shimmer animation, slate colors, 1.8s speed, 110 degree angle).
- The `bones/registry.js` file is auto-imported in `app/layout.tsx`. Until you generate bones it ships empty, so every `<Skeleton>` renders its `fallback` (a basic shimmer block).
- To capture pixel-perfect bones:

  ```bash
  npm run dev      # in one terminal
  npm run bones    # in another
  ```

  This crawls every internal route, finds every `<Skeleton name="...">` (including the time-slot picker and any future widgets), captures bones at 375, 768, and 1280 px viewports, and overwrites `bones/registry.js`.
- Each `<Skeleton>` component takes a `fixture` prop with mock content so the build can capture realistic shapes even when there is no live data (e.g. you are not logged in). See `components/booking/time-slots.tsx` for an example.
- Re-run `npm run bones` whenever you change the layout. It uses content-hash incremental builds, so unchanged components are skipped.

---

## Environment variables

All variables live in `.env.example`. Copy it to `.env.local` for development and paste the same set into Vercel for production.

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Yes | Public origin without trailing slash. Used for OAuth redirects and email links. |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon (browser-safe) key. |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-only key used for public booking lookups. **Never expose to the browser.** |
| `RESEND_API_KEY` | No | Skip to disable emails (booking still works). |
| `RESEND_FROM_EMAIL` | No | E.g. `WHEN <hello@yourdomain.com>`. Defaults to `onboarding@resend.dev`. |
| `GOOGLE_CLIENT_ID` | No | Required only for Google Calendar sync. |
| `GOOGLE_CLIENT_SECRET` | No | Same. |

---

## Vercel free-tier compliance

The Hobby plan limits you to **12 serverless functions** per deployment. WHEN currently uses **11**:

| # | Route | Method(s) |
|---|---|---|
| 1 | `/api/slots` | `GET` |
| 2 | `/api/bookings` | `POST`, `DELETE` |
| 3 | `/api/event-types` | `GET`, `POST`, `PATCH`, `DELETE` |
| 4 | `/api/availability` | `GET`, `PUT` |
| 5 | `/api/blocked-slots` | `POST`, `DELETE` |
| 6 | `/api/user` | `PATCH` |
| 7 | `/api/google/connect` | `GET` |
| 8 | `/api/google/callback` | `GET` |
| 9 | `/api/google/disconnect` | `POST` |
| 10 | `/auth/callback` | `GET` |
| 11 | `/auth/sign-out` | `POST` |

When you add features, prefer collapsing CRUD into a single route handler (one file is one function on Vercel). Avoid background jobs. Every operation is request-driven.

If you outgrow the 12-function limit, see **Prompt 7** below for migrating heavy routes to Supabase Edge Functions.

---

## Project structure

```
when/
├── app/
│   ├── api/                     # 9 API route handlers
│   │   ├── slots/
│   │   ├── bookings/
│   │   ├── event-types/
│   │   ├── availability/
│   │   ├── blocked-slots/
│   │   ├── user/
│   │   └── google/{connect,callback,disconnect}/
│   ├── auth/
│   │   ├── callback/            # Supabase OAuth/magic-link exchange
│   │   └── sign-out/
│   ├── booking/
│   │   ├── confirmed/
│   │   └── cancel/[token]/
│   ├── dashboard/
│   │   ├── page.tsx             # Bookings overview
│   │   ├── event-types/
│   │   ├── availability/
│   │   └── settings/
│   ├── [username]/              # Public host page
│   │   └── [slug]/              # Specific event type booking
│   ├── login/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                 # Landing
├── components/
│   ├── ui/                      # Button, Input, Card, Badge, Alert, ...
│   ├── booking/                 # Calendar, TimeSlots, BookingFlow, PublicShell
│   └── dashboard/               # Sidebar, Topbar, PageHeader
├── lib/
│   ├── supabase/                # browser, server, admin, middleware
│   ├── google/                  # OAuth helpers, freebusy, event create/delete
│   ├── email/                   # Resend client + HTML templates
│   ├── slots.ts                 # Slot computation engine
│   ├── timezone.ts              # date-fns-tz wrappers
│   ├── types.ts                 # Domain types + Supabase Database type
│   └── utils.ts                 # cn(), slugify(), color palette, validators
├── middleware.ts                # Refreshes Supabase session, gates /dashboard
├── supabase/
│   └── migrations/0001_initial_schema.sql
├── bones/
│   └── registry.js              # Generated by `npm run bones` (boneyard-js)
├── boneyard.config.json         # Shimmer skeleton settings
├── CLAUDE.md                    # Design system spec
├── SECURITY.md                  # Vulnerability reporting and threat model
└── README.md                    # You are here
```

---

## API reference

All routes return JSON unless marked otherwise. Auth is enforced via Supabase session cookies (handled by middleware).

### Public

#### `GET /api/slots?username=...&event=...&date=YYYY-MM-DD`
Returns available slots in UTC.
```json
{ "timezone": "America/New_York", "date": "2026-05-01", "duration_mins": 30,
  "slots": [{ "start": "2026-05-01T13:00:00.000Z", "end": "2026-05-01T13:30:00.000Z" }] }
```

#### `POST /api/bookings`
Create a booking. Re-validates the slot server-side before inserting and returns the cancellation token.
```json
{ "username": "ada", "event_slug": "30min",
  "start_at": "2026-05-01T13:00:00.000Z", "end_at": "2026-05-01T13:30:00.000Z",
  "invitee_name": "Grace", "invitee_email": "grace@...",
  "invitee_note": "...", "custom_answers": {}, "invitee_timezone": "America/New_York" }
```

#### `DELETE /api/bookings?token=<cancellation_token>`
Cancel a booking from a public link. The dashboard variant uses `?id=...` and requires auth.

### Authenticated

| Method + Route | Body / Query | Notes |
|---|---|---|
| `GET /api/event-types` | (none) | List host's event types. |
| `POST /api/event-types` | `{ title, duration_mins, ... }` | Auto-deduplicates slugs. |
| `PATCH /api/event-types` | `{ id, ...updates }` | Partial update. |
| `DELETE /api/event-types?id=...` | (none) | Cascades to bookings via FK. |
| `GET /api/availability` | (none) | Returns weekly hours. |
| `PUT /api/availability` | `{ windows: [...] }` | Replace-all semantics. |
| `POST /api/blocked-slots` | `{ date, start_time, end_time, reason? }` | Times in host TZ. |
| `DELETE /api/blocked-slots?id=...` | (none) | |
| `PATCH /api/user` | `{ name?, username?, bio?, timezone?, avatar_url?, accent_color? }` | Reserved usernames blocked. |
| `GET /api/google/connect` | (none) | 302 to Google's consent screen. |
| `GET /api/google/callback` | (none) | Stores tokens on `integrations`. |
| `POST /api/google/disconnect` | (none) | Removes the row. |

---

## AI prompts

WHEN was scaffolded with Claude Code. The prompts below have been polished from the actual session. Paste them into Claude Code, Cursor, or the Anthropic SDK to extend or fork the project. Each one assumes the **`CLAUDE.md`** file at the repo root is loaded as context (it is, by default, in Claude Code).

### Prompt 1. Bootstrap from scratch

> **Use when:** You are starting a fresh fork and want to regenerate the codebase using the design system.

```
You are scaffolding "WHEN", an MIT-licensed Calendly alternative that runs on Vercel's Hobby tier. The repo currently contains only LICENSE, .git, CLAUDE.md, and README.md. Build the entire MVP per the README's "Architecture at a glance" and the design system in CLAUDE.md.

Constraints:
- Next.js 14 App Router, TypeScript strict, Tailwind CSS.
- Supabase (Postgres + Auth) for data and login.
- Resend for email; Google Calendar API for sync.
- boneyard-js for pixel-perfect skeleton loading screens (shimmer animation).
- Maximum 12 serverless route handlers (Vercel Hobby limit).
- No background jobs, no external queues, no paid services.
- No images committed; use inline SVG and CSS only.
- All animations must respect prefers-reduced-motion.
- All routes that read public data (slots, public booking page) use the service-role key on the server.
- All host CRUD goes through RLS-backed user-session queries.

Deliverables:
1. package.json (Next 14, supabase-ssr, supabase-js, googleapis, resend, date-fns + date-fns-tz, geist, tailwind-merge, clsx, boneyard-js). Include `"bones": "boneyard-js build"` script.
2. tsconfig with @/* path alias.
3. tailwind.config.ts wired to CSS variables (no hardcoded hex).
4. app/globals.css declaring every variable in CLAUDE.md.
5. supabase/migrations/0001_initial_schema.sql for: profiles, event_types, availability, blocked_slots, bookings (with cancellation_token + google_event_id), integrations. Include RLS, indexes, updated_at trigger, and a handle_new_user trigger that creates a profile from auth.users.
6. lib/ files: types, slot engine (computeAvailableSlots respecting buffer + min_notice + RLS), timezone helpers, supabase clients, google calendar helpers, resend client + HTML templates.
7. middleware.ts to refresh Supabase session and gate /dashboard.
8. UI primitives matching CLAUDE.md exactly.
9. Pages: /, /login, /auth/callback, /auth/sign-out, /[username], /[username]/[slug], /booking/confirmed, /booking/cancel/[token], /dashboard (+ /event-types, /availability, /settings).
10. boneyard.config.json with shimmer + slate-200/slate-100 colors, 1.8s speed, 110 degree angle. bones/registry.js placeholder. Import the registry in app/layout.tsx. Use boneyard-js's <Skeleton name="..." fixture={...} fallback={...} animate="shimmer"> for every loading state (start with the time-slot picker).
11. README, CLAUDE.md, and SECURITY.md left untouched.

Use TodoWrite to track phases. Commit nothing. Leave changes uncommitted for review.
```

### Prompt 2. Add a feature

> **Use when:** You want to add something cleanly without breaking the function-count budget.

```
Add <FEATURE> to WHEN. Before writing any code:
1. Re-read CLAUDE.md and follow the design tokens, component primitives, and animation rules.
2. Re-read README's "Vercel free-tier compliance" section. The current function count is 11/12. If your feature would add a new route handler, propose collapsing CRUD into an existing route (single file, multiple methods) so we stay at or below 12.
3. Sketch the data model change as a new file in supabase/migrations/. Never edit 0001_initial_schema.sql.
4. List every file you will touch with a one-line reason. Wait for the user to confirm before editing.

Implementation rules:
- TypeScript strict, no `any` unless wrapping an external SDK.
- All slot/availability math goes through lib/slots.ts.
- Public reads use createSupabaseAdminClient; host writes use createSupabaseServerClient (RLS).
- Email side effects are best-effort (await Promise.all, never throw).
- New env vars must appear in .env.example AND in README's Environment variables table.
```

### Prompt 3. Re-skin the design system

> **Use when:** You want to keep the codebase but change the brand identity.

```
Re-skin WHEN with this new brand:
- Primary accent: <hex>
- Display font: <font name>
- Heading/body font: <font name>
- Border radius preference: <sharp | medium | rounded>
- Mood: <e.g. warm and editorial / clinical and sharp>

Steps:
1. Update app/globals.css CSS variables only. Do not touch component classNames.
2. Update CLAUDE.md to reflect the new tokens, including a new "Design Decisions" section explaining each choice.
3. If a font swap requires a new next/font import, update app/layout.tsx accordingly.
4. Run `npm run build` and confirm no Tailwind warnings appear.
5. Take screenshots (manual) of /, /login, /[username], /[username]/[slug], /booking/confirmed, /dashboard. Diff them against the previous theme.

Do not change behavior, copy, or component APIs. The booking flow must remain identical.
```

### Prompt 4. Audit Vercel free-tier compliance

> **Use when:** You suspect a PR will push you over a limit.

```
Audit this branch for Vercel Hobby compatibility. Check:

1. Function count. Walk app/api/**/route.ts AND app/auth/**/route.ts. Count distinct route files. Hard limit: 12. List each function and its methods.
2. Edge vs Node runtime. Confirm anything using googleapis or resend has `export const runtime = 'nodejs'`.
3. Dynamic flag. Server pages that touch cookies or Supabase auth should declare `export const dynamic = 'force-dynamic'` to avoid build-time data-fetch errors.
4. No cron, no queues, no WebSockets. Grep for vercel.json `crons`, `setInterval`, `WebSocket`, `EventSource`. Flag any hits.
5. Bundle size. `npm run build` and check if any single function bundle exceeds 50 MB.
6. Cold start surface. Identify any route that imports the entire googleapis bundle when only one API is used; suggest narrower imports.

Output a bulleted report. No code changes, recommendations only.
```

### Prompt 5. Migrate to a different email provider

> **Use when:** You want to swap Resend for SES, Postmark, etc.

```
Replace Resend with <PROVIDER> in WHEN. Constraints:

- Keep the public function shape of lib/email/send.ts identical (sendBookingConfirmation, sendHostNotification, sendCancellation). Only the implementation changes.
- Templates in lib/email/templates.ts must NOT change. They output HTML strings.
- Add the new SDK to package.json. Remove `resend` if there are no other usages.
- Update .env.example and the Environment variables table in README.md.
- Add a graceful fallback: if the API key is missing, log and return without throwing (so booking creation never fails on email errors).
- Verify by running through the booking flow locally. Confirmation email and host notification both deliver, cancellation deletes from Google Calendar and emails both parties.
```

### Prompt 6. Build a custom dashboard widget

> **Use when:** You want to add a new card to /dashboard without disturbing the layout.

```
Add a "<WIDGET>" card to the dashboard overview page (app/dashboard/page.tsx).

Design rules from CLAUDE.md:
- Wrap content in <Card>. Use 1.5rem padding (already the default).
- Title is font-heading, text-lg, font-semibold, slate-900.
- Numbers/stats use font-display (Geist Mono) with tracking-tight.
- Icons are 1rem inline SVG with currentColor.
- Animations: respect .stagger-children if part of a grid; otherwise no entrance animation.

Data:
- Query Supabase via createSupabaseServerClient. RLS will scope to the current host.
- Page is already `export const dynamic = 'force-dynamic'`.
- Avoid client-side data fetching for the widget; render on the server.

Wire it in between the <Stat> grid and the "Upcoming" section. Update screenshots in the README if there are any.
```

### Prompt 7. Migrate Vercel route handlers to Supabase Edge Functions

> **Use when:** You are about to hit Vercel's 12-function ceiling, or you want heavy work (Google Calendar, Resend, slot math) running closer to the database.

```
Migrate WHEN's heavy Vercel route handlers to Supabase Edge Functions. The goals:
- Free up Vercel function slots so the 12-function ceiling stops driving design decisions.
- Move work closer to the database. Edge Functions run in Supabase's region, not on Vercel's edge.
- Keep auth flows on Vercel, since they depend on cookie handling that Edge Functions do not natively do.

Migrate these routes to supabase/functions/:
- /api/slots             -> slots
- /api/bookings          -> bookings
- /api/event-types       -> event-types
- /api/availability      -> availability
- /api/blocked-slots     -> blocked-slots
- /api/user              -> user

Keep these on Vercel:
- /auth/callback         (sets the Supabase session cookie via Next.js cookies())
- /auth/sign-out
- /api/google/connect    (302 redirect to Google with access_type=offline)
- /api/google/callback   (exchanges code, persists tokens, redirects with cookies())
- /api/google/disconnect

Steps:
1. Scaffold one function per migrated route: `supabase functions new <name>`. Each lives at supabase/functions/<name>/index.ts and is a Deno script that calls Deno.serve().
2. Convert dependencies to Deno-compatible imports:
   - `import { createClient } from "https://esm.sh/@supabase/supabase-js@2"`
   - `import { google } from "npm:googleapis@144"`
   - `import { Resend } from "npm:resend@4"`
   - `import { fromZonedTime, formatInTimeZone } from "npm:date-fns-tz@3"`
3. Move shared logic into supabase/functions/_shared/. Copy lib/slots.ts, lib/timezone.ts, lib/email/templates.ts. Adjust imports so the same code compiles in both Node and Deno.
4. Auth pattern. The browser calls `supabase.functions.invoke('bookings', { body, method })` which automatically attaches the user's JWT as `Authorization: Bearer <token>`. Inside the function, build a request-scoped client:

   ```ts
   const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
     global: { headers: { Authorization: req.headers.get("Authorization")! } },
   });
   ```

   RLS will enforce per-user access. Public reads (slots) use SUPABASE_SERVICE_ROLE_KEY directly, exactly like the current Vercel handler does.
5. CORS. Edge Functions do not get the same-origin pass that Vercel routes do. Add explicit headers and respond to OPTIONS:

   ```ts
   const corsHeaders = {
     "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") ?? "*",
     "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
     "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
   };
   if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
   ```
6. Update client code. Replace every `fetch('/api/<name>', { method, body })` with `await supabase.functions.invoke('<name>', { body, method })`. Touch:
   - components/booking/booking-flow.tsx
   - app/booking/cancel/[token]/cancel-form.tsx
   - app/dashboard/event-types/event-types-manager.tsx
   - app/dashboard/availability/availability-editor.tsx
   - app/dashboard/availability/blocked-slot-manager.tsx
   - app/dashboard/settings/profile-form.tsx
   - app/dashboard/settings/integrations-panel.tsx
   - app/dashboard/bookings/booking-row.tsx
7. Environment. Each function needs SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, RESEND_FROM_EMAIL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXT_PUBLIC_SITE_URL. Set them with `supabase secrets set --env-file .env.local`. Re-run after every credential rotation.
8. Local testing. Run `supabase start` then `supabase functions serve --env-file .env.local`. Verify each function returns the same shape as the Vercel route it replaced.
9. Deploy. `supabase functions deploy slots bookings event-types availability blocked-slots user`. Smoke-test in production with the dashboard before the next step.
10. Delete the migrated Vercel route files. Update the README "Vercel free-tier compliance" table to show the new split. The Vercel function count drops from 11 to 5; only those 5 count against the 12-function limit.

Acceptance:
- Public booking flow still works. Slot fetch, booking creation, confirmation email, host notification, Google Calendar event create.
- Dashboard CRUD still works. Event types, availability, blocked dates, profile updates.
- Cancellation by token still works (route stays on Vercel) and triggers cancellation emails plus Google event delete via the bookings Edge Function.
- The Vercel build still succeeds with five Vercel functions plus middleware.
- No client code calls `/api/slots`, `/api/bookings`, `/api/event-types`, `/api/availability`, `/api/blocked-slots`, or `/api/user` after the migration. Grep to confirm.
```

---

## Roadmap

The MVP intentionally excludes:

- Stripe and paid bookings
- Team scheduling, round-robin
- Outlook and Apple Calendar
- Embeddable widget
- Analytics
- Multi-tenant subdomains

Track progress in [GitHub Issues](https://github.com/omrajguru05/when/issues). PRs welcome.

---

## Contributing

1. Fork the repo, create a branch.
2. `npm install`, then `npm run dev`.
3. Follow `CLAUDE.md` for any UI work. Primitives only, no ad-hoc styles.
4. Run `npm run typecheck && npm run lint && npm run build` before opening a PR.
5. Keep the function count at or below 12. If your change adds a route, justify it in the PR description.

See [SECURITY.md](SECURITY.md) for vulnerability reporting.

---

## License

MIT, Om Rajguru. See [LICENSE](LICENSE).
