-- SpeakSmart schema (Supabase Postgres)
-- Run in the Supabase SQL editor after creating a free project.

create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  level text check (level in ('beginner','intermediate','advanced')) default 'intermediate',
  target_accent text default 'US',
  created_at timestamptz default now()
);

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  scenario text not null,
  started_at timestamptz default now(),
  ended_at timestamptz,
  duration_seconds int,
  avg_pronunciation_score numeric(5,2),
  grammar_errors_count int default 0
);
create index if not exists sessions_user_started_idx on sessions(user_id, started_at desc);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  role text check (role in ('user','assistant')) not null,
  content text not null,
  pronunciation_score numeric(5,2),
  grammar_corrections jsonb,
  created_at timestamptz default now()
);
create index if not exists messages_session_idx on messages(session_id, created_at);

-- Row-level security
alter table profiles enable row level security;
alter table sessions enable row level security;
alter table messages enable row level security;

drop policy if exists "own profile read" on profiles;
create policy "own profile read" on profiles for select using (auth.uid() = id);
drop policy if exists "own profile write" on profiles;
create policy "own profile write" on profiles for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "own sessions" on sessions;
create policy "own sessions" on sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own messages" on messages;
create policy "own messages" on messages for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
