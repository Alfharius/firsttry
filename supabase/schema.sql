-- Enable UUID generation
create extension if not exists "pgcrypto";

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text not null check (type in ('Конференция', 'Мастер-класс', 'Встреча', 'Conference', 'Workshop', 'Meetup')),
  category text not null,
  organizer_name text not null default '',
  location text not null,
  participants_count integer not null default 0,
  start_at timestamptz not null,
  end_at timestamptz not null,
  price_without_vat numeric(12, 2) not null default 0,
  vat numeric(12, 2) not null default 0,
  price_with_vat numeric(12, 2) not null default 0,
  estimate text not null default '',
  extra_services text[] not null default '{}',
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  specialization text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.event_participants (
  event_id uuid not null references public.events(id) on delete cascade,
  participant_id uuid not null references public.participants(id) on delete cascade,
  primary key (event_id, participant_id)
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  position text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_events_start_at on public.events(start_at);
create index if not exists idx_events_end_at on public.events(end_at);
create index if not exists idx_events_category on public.events(category);
create index if not exists idx_events_type on public.events(type);

alter table public.events enable row level security;
alter table public.participants enable row level security;
alter table public.event_participants enable row level security;
alter table public.profiles enable row level security;

drop policy if exists "events_select_authenticated" on public.events;
create policy "events_select_authenticated"
  on public.events
  for select
  to authenticated
  using (true);

drop policy if exists "participants_select_authenticated" on public.participants;
create policy "participants_select_authenticated"
  on public.participants
  for select
  to authenticated
  using (true);

drop policy if exists "event_participants_select_authenticated" on public.event_participants;
create policy "event_participants_select_authenticated"
  on public.event_participants
  for select
  to authenticated
  using (true);

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "profiles_upsert_own" on public.profiles;
create policy "profiles_upsert_own"
  on public.profiles
  for all
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, position)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    ''
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
