-- Create exercises table
-- This table stores unique exercise names. 
-- It allows any authenticated user to select, but inserting might be restricted or open depending on policy.
-- For simplicity, we allow authenticated users to insert new exercises if they don't exist.

create table exercises (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on RLS
alter table exercises enable row level security;

-- Policy: Everyone can view exercises
create policy "Exercises are viewable by everyone" 
  on exercises for select 
  using ( true );

-- Policy: Authenticated users can create exercises
create policy "Authenticated users can create exercises" 
  on exercises for insert 
  with check ( auth.role() = 'authenticated' );


-- Create training_history table
-- This stores the actual sets performed by users.

create table training_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  exercise_id uuid references exercises(id) not null,
  date timestamp with time zone not null,
  weight numeric not null,
  reps integer not null,
  memo text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on RLS
alter table training_history enable row level security;

-- Policy: Users can only see their own training history
create policy "Users can see their own training history" 
  on training_history for select 
  using ( auth.uid() = user_id );

-- Policy: Users can insert their own training history
create policy "Users can insert their own training history" 
  on training_history for insert 
  with check ( auth.uid() = user_id );

-- Policy: Users can update their own training history
create policy "Users can update their own training history" 
  on training_history for update 
  using ( auth.uid() = user_id );

-- Policy: Users can delete their own training history
create policy "Users can delete their own training history" 
  on training_history for delete 
  using ( auth.uid() = user_id );

-- Create profiles table
create table profiles (
  id uuid references auth.users not null primary key,
  username text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on RLS
alter table profiles enable row level security;

-- Policy: Public profiles are viewable by everyone
create policy "Public profiles are viewable by everyone" 
  on profiles for select 
  using ( true );

-- Policy: Users can update their own profile
create policy "Users can update own profile" 
  on profiles for update 
  using ( auth.uid() = id );

-- Function to handle new user creation
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data->>'username');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function on new user creation
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create training_templates table
-- Stores user-defined exercise templates with sets as JSONB
create table training_templates (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  sets jsonb not null default '[]'::jsonb,
  interval_seconds integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on RLS
alter table training_templates enable row level security;

-- Policy: Users can see their own templates
create policy "Users can see their own templates"
  on training_templates for select using (auth.uid() = user_id);

-- Policy: Users can insert their own templates
create policy "Users can insert their own templates"
  on training_templates for insert with check (auth.uid() = user_id);

-- Policy: Users can delete their own templates
create policy "Users can delete their own templates"
  on training_templates for delete using (auth.uid() = user_id);

-- Index for efficient user-based template lookups
create index idx_templates_user on training_templates(user_id);
