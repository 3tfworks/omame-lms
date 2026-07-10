-- 「みんなの付箋」を承認制・ユーザー単位リアクション対応にする。
--
-- 移行方針:
--   * 既存の付箋は、現在の公開状態を変えないよう approved として扱う。
--   * 新規付箋は pending で作成し、投稿者本人と管理者だけが承認前に閲覧できる。
--   * 「助かった！」は集計カウンターの直接更新をやめ、1ユーザー1件の行で管理する。

alter table public.video_bookmarks
  add column if not exists status text not null default 'approved',
  add column if not exists reviewed_by uuid references public.users(id) on delete set null,
  add column if not exists reviewed_at timestamp with time zone,
  add column if not exists rejection_reason text,
  add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now()) not null;

alter table public.video_bookmarks
  drop constraint if exists video_bookmarks_status_check;

alter table public.video_bookmarks
  add constraint video_bookmarks_status_check
  check (status in ('pending', 'approved', 'rejected'));

-- このマイグレーションより前から存在する行は公開済みとして維持する。
update public.video_bookmarks
set status = 'approved'
where status is null;

-- 以後、クライアントが status を省略した新規投稿は承認待ちになる。
alter table public.video_bookmarks
  alter column status set default 'pending';

create index if not exists video_bookmarks_video_status_timestamp_idx
  on public.video_bookmarks (video_id, status, timestamp_seconds);

create index if not exists video_bookmarks_status_created_at_idx
  on public.video_bookmarks (status, created_at desc);

create table if not exists public.bookmark_likes (
  id uuid default gen_random_uuid() primary key,
  bookmark_id uuid references public.video_bookmarks(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (bookmark_id, user_id)
);

create index if not exists bookmark_likes_bookmark_id_idx
  on public.bookmark_likes (bookmark_id);

alter table public.bookmark_likes enable row level security;

-- video_bookmarks の旧ポリシーを、承認状態を考慮する定義へ置き換える。
drop policy if exists "Authenticated users can view bookmarks" on public.video_bookmarks;
create policy "Authenticated users can view available bookmarks"
  on public.video_bookmarks
  for select
  using (
    auth.role() = 'authenticated'
    and (
      status = 'approved'
      or user_id = auth.uid()
      or exists (
        select 1
        from public.users
        where users.id = auth.uid()
          and users.role in ('owner', 'admin')
      )
    )
  );

drop policy if exists "Users can insert their own bookmarks" on public.video_bookmarks;
create policy "Users can submit pending bookmarks"
  on public.video_bookmarks
  for insert
  with check (
    auth.uid() = user_id
    and status = 'pending'
    and reviewed_by is null
    and reviewed_at is null
  );

-- 投稿者が status 等を直接書き換えられないよう、旧 update ポリシーは削除する。
drop policy if exists "Users can update their own bookmarks" on public.video_bookmarks;

drop policy if exists "Users can delete their own bookmarks" on public.video_bookmarks;
create policy "Users can delete their own bookmarks"
  on public.video_bookmarks
  for delete
  using (auth.uid() = user_id);

-- リアクションはログインユーザーが閲覧できる。
create policy "Authenticated users can view bookmark likes"
  on public.bookmark_likes
  for select
  using (auth.role() = 'authenticated');

-- 承認済みかつ他人の付箋にだけ、本人名義でリアクションできる。
create policy "Users can like approved bookmarks once"
  on public.bookmark_likes
  for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.video_bookmarks
      where video_bookmarks.id = bookmark_id
        and video_bookmarks.status = 'approved'
        and video_bookmarks.user_id <> auth.uid()
    )
  );

create policy "Users can remove their own bookmark likes"
  on public.bookmark_likes
  for delete
  using (auth.uid() = user_id);

comment on column public.video_bookmarks.likes_count is
  'Legacy counter. New code derives likes from public.bookmark_likes.';
