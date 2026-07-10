-- 動画の特定時刻に結び付く「自分だけの付箋」を追加する。
-- 既存付箋は shared のまま維持し、新規付箋の既定値を private にする。

alter table public.video_bookmarks
  add column if not exists visibility text not null default 'shared';

alter table public.video_bookmarks
  drop constraint if exists video_bookmarks_visibility_check;

alter table public.video_bookmarks
  add constraint video_bookmarks_visibility_check
  check (visibility in ('private', 'shared'));

-- 以後、visibility を省略した新規行は本人専用になる。
alter table public.video_bookmarks
  alter column visibility set default 'private';

create index if not exists video_bookmarks_user_visibility_timestamp_idx
  on public.video_bookmarks (user_id, visibility, timestamp_seconds);

-- 本人は自分の全付箋を閲覧可能。他の受講生は承認済み共有付箋だけ閲覧可能。
-- 管理者がRLS経由で確認できるのも共有付箋だけとし、private の意味を守る。
drop policy if exists "Authenticated users can view available bookmarks" on public.video_bookmarks;
create policy "Authenticated users can view available bookmarks"
  on public.video_bookmarks
  for select
  using (
    auth.role() = 'authenticated'
    and (
      user_id = auth.uid()
      or (
        visibility = 'shared'
        and (
          status = 'approved'
          or exists (
            select 1
            from public.users
            where users.id = auth.uid()
              and users.role in ('owner', 'admin')
          )
        )
      )
    )
  );

-- private は即時利用できる approved、shared は承認待ち pending でのみ作成できる。
drop policy if exists "Users can submit pending bookmarks" on public.video_bookmarks;
create policy "Users can submit bookmarks with safe visibility"
  on public.video_bookmarks
  for insert
  with check (
    auth.uid() = user_id
    and reviewed_by is null
    and reviewed_at is null
    and (
      (visibility = 'private' and status = 'approved')
      or (visibility = 'shared' and status = 'pending')
    )
  );

-- 公開範囲の切り替えはAPI側で所有者確認後にservice roleで行う。
-- 利用者がDBへ直接アクセスして承認状態を変更できないよう update RLS は作らない。

drop policy if exists "Users can like approved bookmarks once" on public.bookmark_likes;
create policy "Users can like approved shared bookmarks once"
  on public.bookmark_likes
  for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.video_bookmarks
      where video_bookmarks.id = bookmark_id
        and video_bookmarks.visibility = 'shared'
        and video_bookmarks.status = 'approved'
        and video_bookmarks.user_id <> auth.uid()
    )
  );
