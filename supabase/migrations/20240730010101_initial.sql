-- Create a table for public profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  full_name text,
  company_name text,
  avatar_url text,
  website text
);
-- Set up Row Level Security (RLS)
-- See https://supabase.com/docs/guides/auth/row-level-security for more details.
alter table profiles
  enable row level security;

create policy "Profiles are viewable by self." on profiles
  for select using (auth.uid() = id);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Create Stripe Customer Table
-- One stripe customer per user (PK enforced)
-- Limit RLS policies -- mostly only server side access
create table stripe_customers (
  user_id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  stripe_customer_id text unique
);
alter table stripe_customers enable row level security;

-- Create a table for "Contact Us" form submissions
-- Limit RLS policies -- only server side access
create table contact_requests (
  id uuid primary key default gen_random_uuid(),
  updated_at timestamp with time zone,
  first_name text,
  last_name text,
  email text,
  phone text,
  company_name text,
  message_body text
);
alter table contact_requests enable row level security;

-- This trigger automatically creates a profile entry when a new user signs up via Supabase Auth.
-- See https://supabase.com/docs/guides/auth/managing-user-data#using-triggers for more details.
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Set up Storage!
insert into storage.buckets (id, name)
  values ('avatars', 'avatars');

-- Set up access controls for storage.
-- See https://supabase.com/docs/guides/storage#policy-examples for more details.
create policy "Avatar images are publicly accessible." on storage.objects
  for select using (bucket_id = 'avatars');

create policy "Anyone can upload an avatar." on storage.objects
  for insert with check (bucket_id = 'avatars');

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS unsubscribed boolean NOT NULL DEFAULT false;

-- Create a table for user decks (1:1 relationship with profiles)
create table deck (
  profile_id uuid references profiles on delete cascade not null primary key,
  updated_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  title text,
  description text
);

-- Set up Row Level Security (RLS) for deck table
alter table deck enable row level security;

-- Add RLS policies for deck table
create policy "Decks are viewable by self." on deck
  for select using (auth.uid() = profile_id);

create policy "Users can insert their own deck." on deck
  for insert with check (auth.uid() = profile_id);

create policy "Users can update own deck." on deck
  for update using (auth.uid() = profile_id);

-- Create a table for cards (1:1 relationship with deck)
create table card (
  deck_id uuid references deck on delete cascade not null primary key,
  updated_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  question text,
  answer jsonb
);

-- Set up Row Level Security (RLS) for card table
alter table card enable row level security;

-- Add RLS policies for card table
create policy "Cards are viewable by deck owner." on card
  for select using (
    auth.uid() = (select profile_id from deck where profile_id = card.deck_id)
  );

create policy "Users can insert cards for their deck." on card
  for insert with check (
    auth.uid() = (select profile_id from deck where profile_id = card.deck_id)
  );

create policy "Users can update cards in their deck." on card
  for update using (
    auth.uid() = (select profile_id from deck where profile_id = card.deck_id)
  );

-- Drop existing card table and its policies
drop policy if exists "Cards are viewable by deck owner." on card;
drop policy if exists "Users can insert cards for their deck." on card;
drop policy if exists "Users can update cards in their deck." on card;
drop table if exists card;

-- Create a table for cards (many:1 relationship with deck)
create table card (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid references deck on delete cascade not null,
  updated_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  question text,
  answer jsonb
);

-- Set up Row Level Security (RLS) for card table
alter table card enable row level security;

-- Add RLS policies for card table
create policy "Cards are viewable by deck owner." on card
  for select using (
    auth.uid() = (select profile_id from deck where id = card.deck_id)
  );

create policy "Users can insert cards for their deck." on card
  for insert with check (
    auth.uid() = (select profile_id from deck where id = card.deck_id)
  );

create policy "Users can update cards in their deck." on card
  for update using (
    auth.uid() = (select profile_id from deck where id = card.deck_id)
  );

// ... existing code ...

-- Drop existing tables and their policies (order matters due to dependencies)
drop policy if exists "Cards are viewable by deck owner." on card;
drop policy if exists "Users can insert cards for their deck." on card;
drop policy if exists "Users can update cards in their deck." on card;
drop table if exists card;

drop policy if exists "Decks are viewable by self." on deck;
drop policy if exists "Users can insert their own deck." on deck;
drop policy if exists "Users can update own deck." on deck;
drop table if exists deck;

-- Create a table for user decks (many:1 relationship with profiles)
create table deck (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles on delete cascade not null,
  updated_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  title text,
  description text
);

-- Set up Row Level Security (RLS) for deck table
alter table deck enable row level security;

-- Add RLS policies for deck table
create policy "Decks are viewable by self." on deck
  for select using (auth.uid() = profile_id);

create policy "Users can insert their own deck." on deck
  for insert with check (auth.uid() = profile_id);

create policy "Users can update own deck." on deck
  for update using (auth.uid() = profile_id);

-- Create a table for cards (many:1 relationship with deck)
create table card (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid references deck on delete cascade not null,
  updated_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  question text,
  answer jsonb
);

-- Set up Row Level Security (RLS) for card table
alter table card enable row level security;

-- Add RLS policies for card table
create policy "Cards are viewable by deck owner." on card
  for select using (
    auth.uid() = (select profile_id from deck where id = card.deck_id)
  );

create policy "Users can insert cards for their deck." on card
  for insert with check (
    auth.uid() = (select profile_id from deck where id = card.deck_id)
  );

create policy "Users can update cards in their deck." on card
  for update using (
    auth.uid() = (select profile_id from deck where id = card.deck_id)
  );

-- Add new columns to deck table
ALTER TABLE deck 
ADD COLUMN deck_color varchar,
ADD COLUMN data_source jsonb;

-- Remove data_source column from deck table
ALTER TABLE deck 
DROP COLUMN data_source;

-- Add data_source column to card table
ALTER TABLE card
ADD COLUMN data_source jsonb;

-- Add archived column to deck table
ALTER TABLE deck 
ADD COLUMN archived boolean NOT NULL DEFAULT false;