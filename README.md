# PlanMyDay — Wedding Planner SaaS

A production-ready, multi-tenant wedding planning platform. Every couple gets an
isolated workspace to manage guests, seating, budget, suppliers, timeline,
invitations, and a configurable public wedding website.

Built with **Next.js (App Router) · React 19 · TypeScript · Tailwind · shadcn/ui ·
PostgreSQL · Prisma · Auth.js · React Hook Form · Zod · TanStack Query · Framer
Motion · Recharts · Lucide**.

## Features

- **Auth** — email/password, Google OAuth, email verification, password reset,
  role-aware sessions (Couple / Admin).
- **Multi-tenancy** — every record is scoped to a wedding; users can own/switch
  between multiple weddings.
- **Dashboard** — live stats, RSVP breakdown, budget & task progress, countdown.
- **Guests** — CRUD, search, filters, pagination, CSV import/export, bulk delete
  & bulk invite.
- **Seating** — tables with capacity, drag-and-drop assignment, over-capacity
  detection.
- **Suppliers** — vendors, categories, contracts, payment tracking.
- **Budget** — categories, items, estimated/actual/paid, spend chart.
- **Tasks** — checklist with priorities, deadlines, and a starter template.
- **Timeline** — wedding-day schedule builder.
- **Invitations & RSVP** — secure per-guest tokens, QR codes, an extensible
  placeholder engine, and a tokenized public RSVP page.
- **Email** — templates, delivery logs (Gmail SMTP via Nodemailer, console fallback in dev).
- **Website config** — theme, SEO, domain, sections & visibility (rendering is
  intentionally deferred to a separate public-site implementation).
- **Media** — uploads for images/video/audio/documents.
- **Notifications, global search, activity logs**, dark mode, mobile-first UI.

## Getting started

### 1. Prerequisites

- Node.js 20+
- A PostgreSQL database

### 2. Install

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

Set at least `DATABASE_URL` and `AUTH_SECRET` (generate with `npx auth secret`).
Google OAuth and Gmail SMTP are optional — without them, Google login is hidden and
emails are logged to the console.

### 4. Set up the database

```bash
npm run db:push      # or: npm run db:migrate
npm run db:seed      # optional: task templates + demo account
```

Demo login (after seeding): `demo@planmyday.app` / `password123`.

### 5. Run

```bash
npm run dev
```

Open http://localhost:3000.

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Generate Prisma client + production build |
| `npm run start` | Start the production server |
| `npm run lint` | Lint |
| `npm run typecheck` | Type-check without emitting |
| `npm run db:push` | Push schema to the database |
| `npm run db:migrate` | Create/apply a migration |
| `npm run db:seed` | Seed templates and a demo account |
| `npm run db:studio` | Open Prisma Studio |

## Architecture

```
src/
  app/                      App Router
    (auth)/                 login, register, verify, forgot/reset
    (dashboard)/            authenticated planner workspace
    (platform-admin)/       platform admin
    invite/[token]/         public tokenized RSVP boundary
    api/                    auth, search, notifications, media, guests export
  components/               shared UI (shadcn/ui), layout, providers
  features/                 domain modules (guests, budget, seating, ...)
  lib/                      db, auth, authz, tokens, email, storage, rate-limit
  types/                    global type augmentation
prisma/                     schema + seed
```

Each feature module contains its own `schemas`, `actions`, `service`, and
`components`, keeping the codebase scalable and decoupled.

### Multi-tenant isolation

- Every wedding-owned model carries `weddingId`.
- `getCurrentWedding()` resolves the active tenant (cookie + membership).
- `requireWeddingAccess()` guards all tenant-scoped mutations.
- Soft deletes (`deletedAt`) preserve history.

### Invitation / RSVP boundary

Invitation tokens are random, stored **hashed**, and never expose guest data in
URLs. The `/invite/[token]` route is the stable integration point for a future
rich, animated public wedding-website & RSVP experience — the admin app already
supplies all dynamic data (settings, sections, media, placeholders) without
schema changes.

## Deployment

1. Host on **Vercel** (or any Node platform).
2. Provision managed **PostgreSQL** (Neon, Supabase, Railway, Render).
3. Set environment variables from `.env.example`.
4. Run `prisma migrate deploy` in CI before deploy (`npm run build` also runs
   `prisma generate`).
5. For production file storage, swap `src/lib/storage.ts` for S3/R2/Supabase.
6. For production rate limiting, swap `src/lib/rate-limit.ts` for Redis/Upstash.

## License

Proprietary — all rights reserved.
