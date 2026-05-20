-- Create video_bookmarks table for "Minna no Fusen" (Everyone's Bookmarks)
create table public.video_bookmarks (
  id uuid default gen_random_uuid() primary key,
  video_id text not null,
  user_id uuid references public.users(id) on delete cascade not null,
  timestamp_seconds integer not null, -- 04:15 = 255
  content text not null,
  likes_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table public.video_bookmarks enable row level security;

-- ログインユーザーは誰でも見れる
create policy "Authenticated users can view bookmarks" on public.video_bookmarks
  for select using (auth.role() = 'authenticated');

-- 自分のものだけ作成できる
create policy "Users can insert their own bookmarks" on public.video_bookmarks
  for insert with check (auth.uid() = user_id);

-- 自分のものだけ更新できる
create policy "Users can update their own bookmarks" on public.video_bookmarks
  for update using (auth.uid() = user_id);

-- 自分のものだけ削除できる
create policy "Users can delete their own bookmarks" on public.video_bookmarks
  for delete using (auth.uid() = user_id);
