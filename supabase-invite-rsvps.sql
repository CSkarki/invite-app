-- Run this in Supabase SQL Editor (same project as your other app).
-- Creates a table for invite-app RSVPs so it doesn't conflict with existing tables.

create table if not exists invite_rsvps (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  attending text not null,
  message text default ''
);

-- Optional: enable RLS and allow service_role full access (default).
-- If you use anon key, add: grant insert, select on invite_rsvps to anon;
