-- Create users table (extends auth.users)
create table public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  role text not null default 'user' check (role in ('sys_admin', 'instructor', 'user', 'salon_member')),
  stripe_customer_id text,
  stripe_subscription_id text,
  affiliate_code text unique, -- For VIP Affiliate
  referred_by text references public.users(affiliate_code),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create videos table (Master data)
create table public.videos (
  id uuid default gen_random_uuid() primary key,
  vimeo_id text not null,
  title text not null,
  chapter_number integer not null, -- 1:第1章, 2:第2章...
  sort_order integer not null, -- Order within the chapter
  leverage_memo text, -- Text or markdown content
  checklist text, -- Text or JSON content
  is_locked boolean default false, -- For secret/locked videos
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create video_chapters table (For Omame Navi Search - Timestamp jumps)
create table public.video_chapters (
  id uuid default gen_random_uuid() primary key,
  video_id uuid references public.videos on delete cascade not null,
  timestamp_seconds integer not null, -- e.g., 150 for 02:30
  title text not null, -- "手が痛い時の対処法"
  keywords text, -- For search indexing
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create user_progress table
create table public.user_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users on delete cascade not null,
  video_id uuid references public.videos on delete cascade not null,
  is_completed boolean default false,
  last_watched_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, video_id) -- A user can only have one progress record per video
);

-- Create user_notes table (My Note feature)
create table public.user_notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users on delete cascade not null,
  video_id uuid references public.videos on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, video_id)
);

-- RLS (Row Level Security) Policies
alter table public.users enable row level security;
alter table public.videos enable row level security;
alter table public.video_chapters enable row level security;
alter table public.user_progress enable row level security;
alter table public.user_notes enable row level security;

-- Policies for users
create policy "Users can view their own data." on public.users for select using (auth.uid() = id);
create policy "Admins can view all users." on public.users for select using (
  exists (select 1 from public.users where id = auth.uid() and role in ('sys_admin', 'instructor'))
);

-- Policies for videos (Everyone logged in can view, only sys_admin can edit)
create policy "Authenticated users can view videos" on public.videos for select using (auth.role() = 'authenticated');
create policy "Sys_admin can manage videos" on public.videos for all using (
  exists (select 1 from public.users where id = auth.uid() and role = 'sys_admin')
);

-- Policies for video_chapters
create policy "Authenticated users can view video chapters" on public.video_chapters for select using (auth.role() = 'authenticated');

-- Policies for user_progress
create policy "Users can view their own progress" on public.user_progress for select using (auth.uid() = user_id);
create policy "Users can insert their own progress" on public.user_progress for insert with check (auth.uid() = user_id);
create policy "Users can update their own progress" on public.user_progress for update using (auth.uid() = user_id);
create policy "Instructors can view all progress" on public.user_progress for select using (
  exists (select 1 from public.users where id = auth.uid() and role in ('sys_admin', 'instructor'))
);

-- Policies for user_notes
create policy "Users can view their own notes" on public.user_notes for select using (auth.uid() = user_id);
create policy "Users can insert their own notes" on public.user_notes for insert with check (auth.uid() = user_id);
create policy "Users can update their own notes" on public.user_notes for update using (auth.uid() = user_id);
create policy "Users can delete their own notes" on public.user_notes for delete using (auth.uid() = user_id);
