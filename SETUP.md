# PlanMyDay — Step-by-step setup guide

This guide gets you running **locally** (using Supabase as the database) and
**deployed** on **Vercel + Supabase**.

You do **not** need Postgres installed on your PC.

---

## Part A — Local testing (about 10 minutes)

### Step 1 — Create a free Supabase project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard) and sign in.
2. Click **New project**.
3. Fill in:
   - **Name:** `planmyday` (or anything)
   - **Database password:** invent a strong password and **save it** (you need it once)
   - **Region:** pick the closest to you (e.g. Southeast Asia)
4. Wait until the project status is **Healthy**.

### Step 2 — Copy the database connection string

1. In Supabase: **Project Settings** (gear icon) → **Database**.
2. Under **Connection string**, choose **URI**.
3. Prefer **Session mode** / port **5432** (works best with Prisma `db push`).
4. Copy the string. It looks like one of these:

```text
postgresql://postgres.[PROJECT_REF]:[YOUR-PASSWORD]@aws-0-REGION.pooler.supabase.com:5432/postgres
```

or

```text
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
```

5. Replace `[YOUR-PASSWORD]` with the password you set in Step 1 (URL-encode special characters if needed, e.g. `@` → `%40`).

### Step 3 — Fill in your local `.env`

Open [`.env`](.env) in the project root and set **only** `DATABASE_URL` to the string from Step 2.

Example:

```env
DATABASE_URL="postgresql://postgres:MyPass123@db.abcdefghijklmnop.supabase.co:5432/postgres"
```

Leave the rest as-is for local testing:

| Variable | Local value | Notes |
| --- | --- | --- |
| `AUTH_SECRET` | Already generated | Keep it |
| `NEXTAUTH_URL` | `http://localhost:3000` | Required for auth |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Invitation links |
| `AUTH_GOOGLE_*` | empty | Optional |
| `SMTP_USER` / `SMTP_PASS` | empty | Emails print in the terminal |

### Step 4 — Install dependencies

In the project folder:

```bash
npm install --legacy-peer-deps
```

(`--legacy-peer-deps` avoids a Next.js / next-auth peer warning.)

### Step 5 — Create tables and seed demo data

```bash
npm run db:push
npm run db:seed
```

You should see `Seed complete.`

Demo account:

| Field | Value |
| --- | --- |
| Email | `demo@planmyday.app` |
| Password | `password123` |

### Step 6 — Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → **Log in** with the demo account.

### Step 7 — Quick smoke test

1. Log in → you should land on the **Dashboard**.
2. Open **Guests** → **Add guest**.
3. Open **Invitations & RSVP** → generate an invite link.
4. Open that link in a private window and submit an RSVP.

Emails (invites, verify, reset) appear in the **terminal** while `SMTP_USER` and `SMTP_PASS` are empty.

---

## Part B — Deploy to Vercel + Supabase

Use the **same** Supabase project as local, or create a second project for production.

### Step 1 — Push your code to GitHub

If you have not already:

```bash
git add .
git commit -m "Initial PlanMyDay app"
git push -u origin main
```

Do **not** commit `.env` (it is already in `.gitignore`).

### Step 2 — Create a Vercel project

1. Go to [https://vercel.com](https://vercel.com) and sign in with GitHub.
2. **Add New… → Project** → import `PlanMyDay`.
3. Framework: **Next.js** (auto-detected).
4. **Do not deploy yet** — add env vars first (or deploy once, then add vars and redeploy).

### Step 3 — Add environment variables on Vercel

Open [`.env.vercel.example`](.env.vercel.example) as a checklist.

In Vercel: **Project → Settings → Environment Variables**, add:

| Name | Value | Environment |
| --- | --- | --- |
| `DATABASE_URL` | Same Supabase URI as local (or a prod project URI) | Production |
| `AUTH_SECRET` | **New** secret (do not reuse local) | Production |
| `NEXTAUTH_URL` | `https://YOUR-PROJECT.vercel.app` | Production |
| `NEXT_PUBLIC_APP_URL` | `https://YOUR-PROJECT.vercel.app` | Production |
| `EMAIL_FROM` | optional | Production |
| `SMTP_HOST` | `smtp.gmail.com` | Production |
| `SMTP_PORT` | `587` | Production |
| `SMTP_USER` | optional | Production |
| `SMTP_PASS` | optional | Production |
| `AUTH_GOOGLE_ID` | optional | Production |
| `AUTH_GOOGLE_SECRET` | optional | Production |
| `STORAGE_DRIVER` | `local` | Production |

Generate a production secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

After the first deploy, if Vercel gives you a custom domain, update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to that domain and redeploy.

### Step 4 — Apply the database schema (once)

From your laptop (with production `DATABASE_URL` temporarily in `.env`, or using the same Supabase project you already pushed):

```bash
npm run db:push
```

If you already ran `db:push` against this Supabase project for local, **skip this** — tables already exist.

Optional production seed (only if you want the demo account in prod):

```bash
npm run db:seed
```

### Step 5 — Deploy

In Vercel click **Deploy**, or push to `main`:

```bash
git push
```

Open `https://YOUR-PROJECT.vercel.app`.

### Step 6 — (Optional) Google login in production

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → create OAuth client (Web).
2. Authorized JavaScript origins:
   - `https://YOUR-PROJECT.vercel.app`
3. Authorized redirect URIs:
   - `https://YOUR-PROJECT.vercel.app/api/auth/callback/google`
4. Paste Client ID / Secret into Vercel as `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`.
5. Redeploy.

### Step 7 — (Optional) Real email with Gmail

1. Enable **2-Step Verification** on your Google account.
2. Create an **App Password** at [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords).
3. Set on Vercel (and in local `.env` for testing):
   - `SMTP_USER=your@gmail.com`
   - `SMTP_PASS=xxxx xxxx xxxx xxxx` (the 16-character app password)
   - `EMAIL_FROM=PlanMyDay <your@gmail.com>` (must match `SMTP_USER`)
   - `SMTP_HOST=smtp.gmail.com`
   - `SMTP_PORT=587`
4. Redeploy.

**Notes:** Free Gmail accounts can send ~500 emails/day. Never use your normal Gmail password — only an App Password.

---

## Env file map

| File | Purpose | Commit to Git? |
| --- | --- | --- |
| [`.env`](.env) | Your real local secrets | **No** |
| [`.env.example`](.env.example) | Template for other developers | Yes |
| [`.env.vercel.example`](.env.vercel.example) | Checklist for Vercel dashboard | Yes |

---

## Common errors

### `P1000: Authentication failed`

- Wrong database password in `DATABASE_URL`.
- Password has special characters — URL-encode them (`@` → `%40`, `#` → `%23`).
- You used the **anon/service role** key instead of the **database password**.

### `P1001: Can't reach database server`

- Supabase project is paused (free tier pauses after inactivity) — open the dashboard and restore it.
- Firewall / VPN blocking outbound Postgres.

### Auth redirects to wrong host after deploy

- `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` must match your live Vercel URL exactly (including `https://`).

### `npm install` peer dependency error

Use:

```bash
npm install --legacy-peer-deps
```

### Uploads disappear on Vercel

`STORAGE_DRIVER=local` writes to the server filesystem, which is ephemeral on Vercel. Fine for demos; for real media, add S3 / R2 / Supabase Storage later.

---

## Minimal command cheat sheet

```bash
# Local
npm install --legacy-peer-deps
# edit .env → set DATABASE_URL
npm run db:push
npm run db:seed
npm run dev

# After code changes
npm run typecheck
npm run build
```

You only need to fill **`DATABASE_URL`** in `.env` to start testing locally.
