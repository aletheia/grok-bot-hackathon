# Grok Hackathon at the Museum

Landing site and participant platform for **Grok Hackathon at the Museum**. Registration for the event happens on [Luma](https://luma.com/spacexai-z1ys).

**Event facts live in one place: [`lib/event.ts`](lib/event.ts).** Landing sections, metadata, Open Graph image, JSON-LD (`lib/event-jsonld.ts`), sitemap and footer all read from it. UI copy is in `lib/i18n.ts`. The site and portal are English only. Logos and photos that are not available yet are `null` in `lib/event.ts` and render as labelled placeholders; set a path under `public/` to swap them in. Prizes (`EVENT.prizes`, podium places 1–3 plus special/track prizes), jury (`EVENT.jury`), sponsors (`EVENT.sponsors.list` (one flat grid, no tiers) and `EVENT.sponsors.contact`), evaluation criteria and the proposed tracks (`EVENT.tracks`, content in [`lib/tracks.ts`](lib/tracks.ts), shown on the landing and on `/tracks`) live in the same file, with a comment on how to fill each: empty entries render labelled placeholders or “To be announced”, and only named sponsors reach the JSON-LD. The team registration window (`EVENT.registration.registrationOpens` / `registrationCloses`, Rome time) drives the registration banner on the landing, `/rules`, `/register` and the dashboard.

The platform underneath (forked from CURSOR 48H):

Open-source platform for running **48-hour AI hackathons**: landing site, registration, teams, screening, scoring, admin tools, and partner credits — built with **Next.js** and **PostgreSQL**.

---

## Contents

- [Features](#features)
- [Stack](#stack)
- [Quick start](#quick-start)
- [Environment variables](#environment-variables)
- [Database](#database)
- [Scripts](#scripts)
- [Docker & deployment](#docker--deployment)
- [Project layout](#project-layout)
- [References](#references)

---

## Features

| Area | What it does |
|------|----------------|
| **Landing** | Hero, sponsors, prizes, schedule, criteria, requirements, tech stack, partnership page. |
| **Auth** | Participants sign in with a 6-digit code emailed to their **Luma registration email** ([Better Auth](https://www.better-auth.com/) email OTP). Only **approved** guests on the imported Luma guest list (`approval_status = approved`) get in; waitlist, pending, invited, declined and empty statuses are refused with their own message; staff and `SUPER_ADMIN_EMAILS` bypass the list. Admins keep email + password with 2FA. |
| **Luma guest list** | Admin → *Luma guest list*: upload the Luma CSV export (Guests → Export). Upserts by email, never deletes. |
| **Teams** | 4–6 people. Create a team (secret 8-char code), join with a code, or mark yourself available. Auto-closes at 6, reopens below; lead passes to the earliest member; locked on 31 Oct 2026 23:59 Europe/Rome (`EVENT.portal.teamLockAt`). Rules at `/rules`. |
| **Admission** | Admin → *Admission*: formed teams (4+ approved members) get guaranteed seats; other approved guests are queued first-come, first-served by Luma registration time up to the capacity (100). Non-approved guests are not counted. No automatic emails. |
| **Screening** | MC questions, optional team video (YouTube / Drive). Admins approve or reject teams and manage questions. |
| **Projects** | Participant projects and admin CRUD. |
| **Credits** | Super-admin pools: split by team or participant, Excel upload of per-user links, shared links, short codes, audit log. |
| **Staff** | Invites, evaluation queue, team scoring. |
| **Ranking** | Public ranking from judges; optional late penalty; admin can set final overrides. |
| **Admin** | Users, teams, screening, projects, partners, credits, staff, settings (deadlines, etc.), security / 2FA. |
| **SEO** | Sitemap, robots, Open Graph, JSON-LD, canonical URLs. |

---

## Stack

- **Next.js 16** (App Router), **React 19**, **TypeScript**
- **Tailwind CSS 4**, **Framer Motion**
- **Drizzle ORM** + **PostgreSQL**
- **Better Auth** (OAuth, sessions)

Package scripts use **`npm`** in the included **Dockerfile**; locally you can use **Bun**, **pnpm**, or **yarn** if you prefer.

---

## Quick start

### Prerequisites

- **Node.js** 20+
- **PostgreSQL** 16+ (or run Postgres via Docker)

### 1. Install

```bash
git clone <repository-url>
cd <your-project-folder>
npm install
```

### 2. Configure environment

Copy the example env file and edit values:

```bash
cp .env.example .env
```

See [Environment variables](#environment-variables) below.

### 3. Database

Start Postgres (example with Docker):

```bash
docker compose up -d postgres
npm run db:migrate
```

### 4. Run

**Development**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Production build (local)**

```bash
npm run build
npm run start
```

---

## Environment variables

Create a `.env` in the project root. Typical variables:

| Variable | Required | Notes |
|----------|----------|--------|
| `DATABASE_URL` | Yes | PostgreSQL URL, e.g. `postgresql://user:pass@localhost:5432/yourdb` |
| `BETTER_AUTH_SECRET` | Yes | Long random string in production |
| `BETTER_AUTH_URL` | Yes | App origin used by auth (e.g. `http://localhost:3000`; HTTPS in production) |
| `NEXT_PUBLIC_APP_URL` | Yes | Public URL users see |
| `SUPER_ADMIN_EMAILS` | See note | Comma-separated emails allowed for admin flows when configured |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Optional | [Google OAuth](https://console.cloud.google.com) |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | Optional | [GitHub OAuth](https://github.com/settings/developers) |
| `RESEND_API_KEY` | **Yes (production)** | Resend key used to email sign-in codes. Without it production sign-in cannot work; in `npm run dev` the code is printed in the server log instead |
| `EMAIL_FROM` | Production | Sender on a domain verified in Resend, e.g. `Grok Hackathon <portal@your-domain>`; defaults to Resend's test sender |
| `NEXT_PUBLIC_SITE_URL` | Production | Canonical URL for metadata and sitemap (e.g. `https://your-domain.com`) |

If `SUPER_ADMIN_EMAILS` is empty, restricted admin sign-up paths are effectively disabled.

### Letting participants in (Luma guest list)

1. In Luma open the event → **Guests** → **Export** (CSV).
2. Sign in as super admin → **Admin → Luma guest list** → *Upload Luma guest CSV*.
3. Headers are matched case-insensitively (`email`/`E-mail`, `name` or `first_name` + `last_name`, `approval_status`/`status`, `created_at`). Emails are trimmed and lower-cased. Re-import any time; rows are updated by email and never deleted.
4. People whose email is not on the list are told to sign in with their Luma email or register on Luma. Only approved guests can sign in. Statuses are normalised (trim, lower case, spaces/hyphens → `_`) and compared with `EVENT.portal.approvedLumaStatuses` (`approved`, plus `going`, Luma's UI label for it). Waitlist, `pending_approval`, `invited`, `declined` and empty get "Your Luma registration isn't approved yet…" (or a declined message). After approving people on Luma, re-import the CSV.

The FCFS order on the admission page uses the Luma `created_at` timestamp, then portal account creation, then import time (ties by email).

---

## Database

- **Engine:** PostgreSQL  
- **ORM:** Drizzle — schemas under `db/schema/`, migrations under `drizzle/`.  
- **Generate migrations:** `npm run db:generate`  
- **Apply migrations:** `npm run db:studio` (optional GUI) or `npm run db:migrate`

**Docker image:** the production container runs migrations on startup (`scripts/start-with-migrate.mjs`), with retries via `DB_MIGRATION_ATTEMPTS` (default `20`) and `DB_MIGRATION_DELAY_MS` (default `3000`). If you deploy without this image, run `npm run db:migrate` in CI or before switching traffic.

---

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server |
| `npm run build` | Production build (standalone) |
| `npm run start` | Production server |
| `npm run lint` | ESLint |
| `npm run test` | Vitest (once) |
| `npm run test:watch` | Vitest (watch) |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Run migrations |
| `npm run db:studio` | Drizzle Studio |

---

## Docker & deployment

### Full stack (Postgres + app)

```bash
docker compose up -d
```

- App listens on **3001** inside the compose file (mapped to the host).  
- Postgres is exposed on **5432** (adjust for your environment).  
- Ensure `.env` exists; compose may override `DATABASE_URL` for the app service.

### Production experience (Dokploy)

This codebase has been **run in production using [Dokploy](https://dokploy.com)** (Docker-based deployments, reverse proxy, env management). For the same workflow, see `docker-compose.dokploy.yml` in this repo (instead of the default `docker-compose.yml` when Dokploy expects that layout).

**You are not locked in:** deploy on any stack you like — plain Docker, Kubernetes, a VPS with `docker compose`, PaaS (Railway, Fly.io, etc.), or another panel. Use the included **Dockerfile** and your own `DATABASE_URL`, `BETTER_AUTH_URL`, and `NEXT_PUBLIC_*` values for that environment.

---

## Project layout

```
├── app/                 # Routes: marketing, dashboard, admin, API, auth, screening, ranking, staff…
├── components/          # UI and feature sections
├── db/                  # Drizzle client, schema, relations
├── lib/                 # Auth helpers, domain logic (teams, screening, credits, scoring…)
├── drizzle.config.ts
├── Dockerfile
├── docker-compose.yml
└── scripts/             # e.g. start-with-migrate.mjs
```

---

## References

- [Next.js](https://nextjs.org/docs)
- [Better Auth](https://www.better-auth.com/)
- [Drizzle ORM](https://orm.drizzle.team/)
