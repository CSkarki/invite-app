-- Multi-tenant invitation platform: invitations table and invite_rsvps.invitation_id
-- Run in Supabase SQL Editor after enabling Supabase Auth.

-- Invitations table (owned by auth.users.id)
create table if not exists invitations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  slug text not null unique,
  event_name text not null,
  event_date timestamptz,
  event_time text,
  location_or_link text,
  message text,
  image_url text,
  theme_id text,
  theme_config jsonb,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists invitations_user_id_idx on invitations(user_id);
create index if not exists invitations_slug_idx on invitations(slug);

-- Add invitation_id to invite_rsvps (nullable for migration; backfill or leave null for legacy rows)
alter table invite_rsvps
  add column if not exists invitation_id uuid references invitations(id) on delete cascade;

create index if not exists invite_rsvps_invitation_id_idx on invite_rsvps(invitation_id);

-- Optional: RLS on invitations (users see only their own)
alter table invitations enable row level security;

create policy "Users can CRUD own invitations"
  on invitations for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Public can read published invitations by slug (for /i/[slug])
create policy "Public can read published invitations"
  on invitations for select
  using (published = true);

-- RLS on invite_rsvps: insert allowed for anyone (with valid invitation_id); select for invitation owner
alter table invite_rsvps enable row level security;

create policy "Anyone can insert RSVP for an invitation"
  on invite_rsvps for insert
  with check (
    invitation_id is not null
    and exists (select 1 from invitations i where i.id = invitation_id and i.published = true)
  );

create policy "Invitation owners can read their RSVPs"
  on invite_rsvps for select
  using (
    exists (
      select 1 from invitations i
      where i.id = invite_rsvps.invitation_id and i.user_id = auth.uid()
    )
  );
