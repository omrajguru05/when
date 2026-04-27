-- WHEN: initial schema
-- All host data is keyed to the authenticated user (auth.users.id).
-- Row-level security keeps each host's data isolated; public booking
-- pages and slot lookups go through the service-role key in route handlers.

create extension if not exists "pgcrypto";

-- ============================================================
-- profiles: extends auth.users with host-facing fields
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  email text not null,
  name text,
  avatar_url text,
  bio text,
  timezone text not null default 'UTC',
  accent_color text not null default '#3b82f6',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_username_idx on public.profiles (username);

-- ============================================================
-- event_types
-- ============================================================
create table if not exists public.event_types (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  slug text not null,
  duration_mins integer not null check (duration_mins between 5 and 480),
  description text,
  color text not null default '#3b82f6',
  is_active boolean not null default true,
  buffer_mins integer not null default 0 check (buffer_mins >= 0),
  min_notice_mins integer not null default 120 check (min_notice_mins >= 0),
  custom_questions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, slug)
);

create index if not exists event_types_user_idx on public.event_types (user_id);

-- ============================================================
-- availability: weekly recurring hours
-- day_of_week: 0 = Sunday ... 6 = Saturday
-- start_time / end_time: time-of-day in the host's timezone
-- ============================================================
create table if not exists public.availability (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now(),
  check (start_time < end_time)
);

create index if not exists availability_user_day_idx on public.availability (user_id, day_of_week);

-- ============================================================
-- blocked_slots: one-off blocks
-- ============================================================
create table if not exists public.blocked_slots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  start_at timestamptz not null,
  end_at timestamptz not null,
  reason text,
  created_at timestamptz not null default now(),
  check (start_at < end_at)
);

create index if not exists blocked_slots_user_range_idx
  on public.blocked_slots (user_id, start_at, end_at);

-- ============================================================
-- bookings
-- ============================================================
create type booking_status as enum ('confirmed', 'cancelled');

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  event_type_id uuid not null references public.event_types(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  invitee_name text not null,
  invitee_email text not null,
  invitee_note text,
  custom_answers jsonb not null default '{}'::jsonb,
  start_at timestamptz not null,
  end_at timestamptz not null,
  status booking_status not null default 'confirmed',
  cancellation_token uuid not null default gen_random_uuid(),
  google_event_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (start_at < end_at)
);

create index if not exists bookings_user_range_idx
  on public.bookings (user_id, start_at, end_at);
create index if not exists bookings_token_idx on public.bookings (cancellation_token);
create index if not exists bookings_status_idx on public.bookings (status, start_at);

-- ============================================================
-- integrations: per-user OAuth tokens (currently Google only)
-- ============================================================
create type integration_provider as enum ('google');

create table if not exists public.integrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider integration_provider not null,
  access_token text not null,
  refresh_token text,
  expires_at timestamptz,
  scope text,
  calendar_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, provider)
);

-- ============================================================
-- updated_at trigger helper
-- ============================================================
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at on public.profiles;
create trigger set_updated_at before update on public.profiles
for each row execute function public.tg_set_updated_at();

drop trigger if exists set_updated_at on public.event_types;
create trigger set_updated_at before update on public.event_types
for each row execute function public.tg_set_updated_at();

drop trigger if exists set_updated_at on public.bookings;
create trigger set_updated_at before update on public.bookings
for each row execute function public.tg_set_updated_at();

drop trigger if exists set_updated_at on public.integrations;
create trigger set_updated_at before update on public.integrations
for each row execute function public.tg_set_updated_at();

-- ============================================================
-- handle_new_user: auto-create a profile row when auth.users gets a new entry.
-- Generates a username from email local-part with a numeric suffix on conflict.
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  base_username text;
  candidate text;
  attempt int := 0;
begin
  base_username := lower(regexp_replace(split_part(new.email, '@', 1), '[^a-z0-9]+', '-', 'g'));
  if base_username = '' or base_username is null then
    base_username := 'user';
  end if;
  candidate := base_username;
  while exists (select 1 from public.profiles where username = candidate) loop
    attempt := attempt + 1;
    candidate := base_username || '-' || attempt::text;
  end loop;

  insert into public.profiles (id, username, email, name, avatar_url)
  values (
    new.id,
    candidate,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Row-Level Security
-- Hosts read/write only their own rows. Public reads (booking pages, slot
-- lookups) go through the service-role key on the server.
-- ============================================================
alter table public.profiles        enable row level security;
alter table public.event_types     enable row level security;
alter table public.availability    enable row level security;
alter table public.blocked_slots   enable row level security;
alter table public.bookings        enable row level security;
alter table public.integrations    enable row level security;

-- profiles: a user can read/update their own row
drop policy if exists "profiles_self_read" on public.profiles;
create policy "profiles_self_read" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update" on public.profiles
  for update using (auth.uid() = id);

-- event_types: owner-only
drop policy if exists "event_types_owner_all" on public.event_types;
create policy "event_types_owner_all" on public.event_types
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- availability
drop policy if exists "availability_owner_all" on public.availability;
create policy "availability_owner_all" on public.availability
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- blocked_slots
drop policy if exists "blocked_owner_all" on public.blocked_slots;
create policy "blocked_owner_all" on public.blocked_slots
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- bookings
drop policy if exists "bookings_owner_all" on public.bookings;
create policy "bookings_owner_all" on public.bookings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- integrations
drop policy if exists "integrations_owner_all" on public.integrations;
create policy "integrations_owner_all" on public.integrations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
