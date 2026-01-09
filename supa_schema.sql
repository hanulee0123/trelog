-- Reset Tables
drop table if exists training_history;
drop table if exists exercises;
drop table if exists profiles;

-- 1. Profiles (Public User Data)
-- Passwords/Emails are managed securely by Supabase Auth (auth.users).
-- This table is for displaying names to other users (e.g. rankings).
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  display_name text,
  created_at timestamptz default now()
);

-- 2. Exercises (Global Master)
-- Shared by ALL users. No user_id.
create table exercises (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  created_at timestamptz default now()
);

-- 3. Training History (Personal Data)
-- Links a User + Global Exercise + Results
create table training_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  exercise_id uuid references exercises(id) not null,
  date timestamptz not null,
  weight numeric not null,
  reps integer not null,
  memo text,
  created_at timestamptz default now()
);

-- RLS Policies
alter table profiles enable row level security;
alter table exercises enable row level security;
alter table training_history enable row level security;

-- Profiles: Viewable by everyone, Editable by owner
create policy "Public profiles are viewable by everyone" on profiles
  for select using (true);
create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

-- Exercises: Viewable by everyone, Createable by authenticated users (Shared)
create policy "Exercises are viewable by everyone" on exercises
  for select using (true);
create policy "Authenticated users can create exercises" on exercises
  for insert with check (auth.role() = 'authenticated');

-- History: Private to user
create policy "Users manage their own history" on training_history
  for all using (auth.uid() = user_id);

-- Trigger for Profile Creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, split_part(new.email, '@', 1)); -- Default name from email
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Indexes for Analytics
create index idx_history_user_exercise on training_history(user_id, exercise_id);
create index idx_history_date on training_history(date);
