# Invite App — Multi-tenant SaaS

A configurable invitation platform. Users sign up, create invitations with event details and images, publish, and share a unique link (`/i/[slug]`). Guests RSVP via the public page; owners view and export RSVPs from the dashboard.

## Tech

- **Frontend:** Next.js 14 (App Router), React
- **Auth:** Supabase Auth
- **Database:** Supabase Postgres + Prisma
- **Hosting:** Vercel (serverless)

## Quick start

1. **Env**
   - Copy `.env.example` to `.env.local`
   - Set `DATABASE_URL` to the **Connection pooling** URI (Transaction mode, port **6543**) from Supabase: Project Settings → Database → Connection string → "URI" under **Connection pooling**. Append `?pgbouncer=true` if not present.
   - (Optional) Set `DIRECT_URL` to the **Direct connection** URI (port 5432) if you run Prisma migrations; otherwise use the SQL in `supabase-migrations/` and keep only `DATABASE_URL`.
   - Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Supabase → Settings → API)

2. **Database**
   - Run the SQL in `supabase-migrations/001_multi_tenant.sql` and `supabase-migrations/002_owner_plan.sql` in the Supabase SQL Editor.
   - Then run: `npx prisma generate` (and optionally `npx prisma db push` if you prefer Prisma to create tables; otherwise the SQL migration is enough).

3. **Storage (for image upload)**
   - In Supabase Dashboard: Storage → New bucket → name `invite-images`, set **Public** so invite pages can load images.
   - Run the SQL in `supabase-migrations/003_storage_invite_images.sql` in the Supabase SQL Editor so authenticated users can upload to their own folder and the public can read images.

4. **Run**
   ```bash
   npm install
   npm run dev
   ```
   - `/` → redirects to `/login` or `/dashboard`
   - `/login`, `/signup` → Supabase Auth
   - **Forgot password:** Login page has “Forgot password?” → `/forgot-password` → enter email → Supabase sends a reset link. Add your app’s reset URL to Supabase: **Authentication → URL Configuration → Redirect URLs** (e.g. `http://localhost:3000/reset-password` and `https://your-domain.com/reset-password`).
   - `/dashboard` → list invitations, create/edit, preview, RSVPs, export
   - `/i/[slug]` → public invite page (published only)

## User flow

1. Sign up / log in
2. Create invitation (event name, date, time, location, message, image URL, slug)
3. Preview, then Publish
4. Share `https://your-domain.com/i/your-slug`
5. Guests open the link and submit RSVP
6. Owner sees RSVPs under Dashboard → [Invitation] → RSVPs, and can export Excel/JSON per invitation

## Optional

- **NEXT_PUBLIC_APP_URL** — set in production to your app URL (e.g. `https://your-app.vercel.app`) for server-side redirects.
- **Plans:** Free users see 2 templates (Classic, Minimal) and "Powered by Invitations" on public invites. Set a user's `user_metadata.plan` to `premium` in Supabase Auth (or via your billing flow) to grant all templates and no branding.

## Troubleshooting

**"Can't reach database server at db.xxx.supabase.co:5432"**

1. **Restore project** — Supabase free tier pauses after inactivity. In the [Supabase Dashboard](https://supabase.com/dashboard), open your project and click **Restore** if it’s paused.
2. **Use the pooler URL** — Don’t use the direct connection (port 5432) for the app. In Supabase: Project Settings → Database → Connection string, copy the **Connection pooling** URI (Transaction mode, port **6543**), add `?pgbouncer=true` if needed, and set it as `DATABASE_URL` in `.env.local`. Keep the direct URI as `DIRECT_URL` for migrations.
3. Restart the dev server after changing env.
