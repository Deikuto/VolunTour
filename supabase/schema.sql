-- ============================================================
-- VolOnTour — Supabase schema
-- Run this in the Supabase Dashboard → SQL Editor → New query → Run
-- ============================================================

-- PROFILES (1:1 with auth.users) ----------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null default '',
  role        text not null default 'tourist' check (role in ('local_volunteer','tourist')),
  city_id     text,
  phone       text,
  avatar      text,
  created_at  timestamptz not null default now()
);

-- EVENTS ----------------------------------------------------
create table if not exists public.events (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  title_en         text,
  cause            text not null,
  cause_en         text,
  description      text not null,
  description_en   text,
  city_id          text not null,
  leader_id        uuid not null references public.profiles(id) on delete cascade,
  date             date not null,
  time             text not null,
  max_participants int  not null default 15,
  tags             text[] not null default '{}',
  lat              double precision,
  lng              double precision,
  created_at       timestamptz not null default now()
);

-- EVENT PARTICIPANTS (join) ---------------------------------
create table if not exists public.event_participants (
  event_id   uuid references public.events(id) on delete cascade,
  user_id    uuid references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

-- GUIDE REQUESTS --------------------------------------------
create table if not exists public.guide_requests (
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid not null references public.events(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  status     text not null default 'pending' check (status in ('pending','accepted','declined')),
  created_at timestamptz not null default now(),
  unique (event_id, user_id)
);

-- ISSUES ----------------------------------------------------
create table if not exists public.issues (
  id                uuid primary key default gen_random_uuid(),
  title             text not null,
  title_en          text,
  description       text not null,
  description_en    text,
  city_id           text not null,
  reporter_id       uuid references public.profiles(id) on delete set null,
  image_url         text,
  location_text     text not null,
  location_text_en  text,
  lat               double precision,
  lng               double precision,
  status            text not null default 'open' check (status in ('open','in_progress','resolved')),
  created_at        timestamptz not null default now()
);

-- AUTO-CREATE PROFILE ON SIGNUP -----------------------------
-- Pulls name/role/city_id/avatar from the metadata passed to supabase.auth.signUp.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, role, city_id, phone, avatar)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'tourist'),
    new.raw_user_meta_data->>'city_id',
    new.phone,
    new.raw_user_meta_data->>'avatar'
  )
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ROW LEVEL SECURITY ----------------------------------------
alter table public.profiles            enable row level security;
alter table public.events              enable row level security;
alter table public.event_participants  enable row level security;
alter table public.guide_requests      enable row level security;
alter table public.issues              enable row level security;

-- profiles: world-readable, owner-writable
drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles for select using (true);
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update using (auth.uid() = id);

-- events: world-readable; leader manages own
drop policy if exists events_read on public.events;
create policy events_read on public.events for select using (true);
drop policy if exists events_insert on public.events;
create policy events_insert on public.events for insert with check (auth.uid() = leader_id);
drop policy if exists events_update_leader on public.events;
create policy events_update_leader on public.events for update using (auth.uid() = leader_id);
drop policy if exists events_delete_leader on public.events;
create policy events_delete_leader on public.events for delete using (auth.uid() = leader_id);

-- participants: world-readable; user manages own membership
drop policy if exists participants_read on public.event_participants;
create policy participants_read on public.event_participants for select using (true);
drop policy if exists participants_insert_own on public.event_participants;
create policy participants_insert_own on public.event_participants for insert with check (auth.uid() = user_id);
drop policy if exists participants_delete_own on public.event_participants;
create policy participants_delete_own on public.event_participants for delete using (auth.uid() = user_id);

-- guide requests: world-readable; requester creates own; event leader updates status
drop policy if exists guides_read on public.guide_requests;
create policy guides_read on public.guide_requests for select using (true);
drop policy if exists guides_insert_own on public.guide_requests;
create policy guides_insert_own on public.guide_requests for insert with check (auth.uid() = user_id);
drop policy if exists guides_update_leader on public.guide_requests;
create policy guides_update_leader on public.guide_requests for update using (
  auth.uid() = (select e.leader_id from public.events e where e.id = event_id)
);

-- issues: world-readable; only authenticated users can report
drop policy if exists issues_read on public.issues;
create policy issues_read on public.issues for select using (true);
drop policy if exists issues_insert_auth on public.issues;
create policy issues_insert_auth on public.issues for insert with check (auth.uid() = reporter_id);
