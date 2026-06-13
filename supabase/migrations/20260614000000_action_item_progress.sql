-- 行動リスト（チェックリスト）の進捗をユーザー×動画×項目単位で保存する。
--
-- presence 方式: 行が存在＝チェック済み / 行を削除＝チェック解除。
-- （boolean 列を持たず「存在/非存在」で表すため、トグルが insert / delete に一対一で対応する）
--
-- item_key は「行動リスト内の並び順インデックス」を採用（例: "action-0"）。
-- 動画 ID はフロント側の文字列 ID（例: "video-1188099921"）で、video_bookmarks と同じ text 型に揃える。
create table public.action_item_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  video_id text not null,            -- フロントの動画ID（例: "video-1188099921"）
  item_key text not null,            -- 行動リスト内の項目識別子（例: "action-0"）
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, video_id, item_key)
);

-- RLS: 必ず有効化し、自分の行だけ読み書きできるようにする
alter table public.action_item_progress enable row level security;

-- 自分の進捗だけ閲覧できる
create policy "Users can view their own action item progress" on public.action_item_progress
  for select using (auth.uid() = user_id);

-- 自分の進捗だけ作成できる（チェックON）
create policy "Users can insert their own action item progress" on public.action_item_progress
  for insert with check (auth.uid() = user_id);

-- 自分の進捗だけ削除できる（チェックOFF）
create policy "Users can delete their own action item progress" on public.action_item_progress
  for delete using (auth.uid() = user_id);

-- ユーザー×動画での読み込みを高速化
create index action_item_progress_user_video_idx
  on public.action_item_progress (user_id, video_id);
