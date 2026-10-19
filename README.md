# ClearLine Investigations

A private investigation platform. Clients submit cases and follow progress in a secure portal. Investigators manage every case from an admin console.

**Stack:** Next.js 14 (App Router, TypeScript, Tailwind CSS), Supabase (Auth, Postgres, Storage), deployed on Vercel.

The brand name lives in [`src/config/site.ts`](src/config/site.ts). Change it there and it updates everywhere.

---

## Features

| Route | Who | What |
| --- | --- | --- |
| `/` | Public | Landing page centred on relationship & infidelity investigations, with a browser-only red-flag self-check, services and process |
| `/start` | Public | Intake form (`?type=infidelity\|scam_recovery\|background_check` preselects the service): choose a service, describe the situation, attach files, then create an account or log in. The case is submitted once the visitor is signed in. |
| `/login`, `/signup` | Public | Email and password auth |
| `/dashboard` | Clients | The client's own cases with a progress bar and the latest update |
| `/dashboard/cases/[id]` | Clients | Status, updates timeline, messages, files, payment milestones, and the final report download once the case is **Report ready** or **Closed** |
| `/admin` | Investigators | All cases, with status counts and filters for status, service and text search |
| `/admin/cases/[id]` | Investigators | Change status, post updates, upload the final report, manage payment milestones |

### Access control

Access is enforced in three layers:

1. **Middleware** (`src/middleware.ts`) refreshes the Supabase session and routes users by role. Signed-out users are sent to `/login`, clients can only reach `/dashboard`, and investigators can only reach `/admin`.
2. **Server-side page guards** (`requireRole` in `src/lib/auth.ts`) check the role again on every protected page.
3. **Row Level Security** in Postgres and Storage is the actual security boundary. The app only uses the public anon key.

### Data model

Tables: `profiles`, `cases`, `case_updates`, `case_files`, `payments`. See [`supabase/migrations`](supabase/migrations).

Some behaviours worth knowing:

- A `profiles` row is created automatically for every new auth user, always with the `client` role. Signup cannot set the role.
- Users can change only their own `full_name`. They cannot change their `role` or `email`.
- Clients can create cases and edit the title and description while the case is still `received`. Only investigators can change the status.
- `case_files.kind` is either `supporting` or `report`. Report files, and the storage objects under `{case_id}/reports/`, are hidden from the client until the case is `report_ready` or `closed`. Clients cannot upload reports.
- Payment milestones are records only (`pending`/`paid`). The investigator marks a milestone paid; no card payments are processed.
- New updates and files bump `cases.updated_at`, so lists sort by most recent activity.

Files are stored in a **private** Storage bucket named `case-files` and downloaded through signed URLs that expire after 60 seconds.

---

## Local setup

### 1. Prerequisites

- Node.js 18.17 or later
- A Supabase project (the free tier is fine)
- Optional: the [Supabase CLI](https://supabase.com/docs/guides/cli)

### 2. Install

```bash
npm install
```

### 3. Environment variables

```bash
cp .env.example .env.local
```

Fill in both values from **Supabase Dashboard → Project Settings → API**:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (the anon / publishable key)

Do **not** use the service role key. The app does not need it.

### 4. Run the database migration

Use **either** option.

**Option A: SQL editor.** Open Supabase Dashboard → SQL Editor, paste the contents of `supabase/migrations/20261017000000_initial_schema.sql`, and run it once.

**Option B: Supabase CLI.**

```bash
supabase login
supabase link --project-ref <your-project-ref>
supabase db push
```

The migration creates the tables, RLS policies, triggers, and the private `case-files` storage bucket with its policies.

### 5. Configure Auth

In **Supabase Dashboard → Authentication**:

- **URL Configuration**
  - Site URL: `http://localhost:3000` (change it to your production URL later)
  - Redirect URLs: add `http://localhost:3000/auth/callback` and, later, `https://<your-domain>/auth/callback`
- **Providers → Email**: enabled.
  - With **Confirm email** turned on (recommended for production), new users confirm by email. The link returns them to the app. Intake text is kept in the browser, but files must be attached again after confirming.
  - With **Confirm email** turned off (convenient for local testing), new users can submit a case straight away.

### 6. Start the app

```bash
npm run dev
```

Open http://localhost:3000.

### 7. Create an investigator account

Every signup is a client. To make someone an investigator, sign them up normally, then run this in the SQL editor:

```sql
update public.profiles
set role = 'investigator'
where email = 'investigator@example.com';
```

The user should sign out and sign back in. They will then be routed to `/admin`.

---

## Deploying to Vercel

1. Push this repository to GitHub, GitLab or Bitbucket.
2. In Vercel, choose **Add New → Project** and import the repository. The framework preset is detected as Next.js.
3. Add the environment variables `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for Production and Preview.
4. Deploy.
5. In Supabase → Authentication → URL Configuration, set the **Site URL** to your Vercel domain and add `https://<your-domain>/auth/callback` to **Redirect URLs**.

---

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |

## Project structure

```
src/
  app/
    page.tsx                  Landing page
    start/                    Intake form
    login/, signup/           Auth pages
    auth/callback/            Email confirmation handler
    auth/signout/             Sign-out (POST)
    dashboard/                Client portal
    admin/                    Investigator console
  components/                 Shared UI
  config/site.ts              Brand name and app settings
  lib/
    supabase/                 Browser, server and middleware clients
    auth.ts                   getCurrentUser / requireRole
    constants.ts              Services and statuses
    files.ts                  Upload helpers and limits
  middleware.ts               Session refresh and role routing
supabase/migrations/          SQL schema, RLS and storage policies
```

## Content guidelines

The platform must not promise guaranteed results or recovery of funds. Keep that in mind when you edit copy in `src/lib/constants.ts` and `src/app/page.tsx`. The `scam_recovery` service type is an internal identifier only. It is shown to users as "Scam & Fraud Tracing".
