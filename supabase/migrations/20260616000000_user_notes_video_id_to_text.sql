-- user_notes.video_id を uuid(FK→videos) から text へ変更する。
--
-- 背景: フロントの動画IDは "video-1188101067" 形式の文字列で、public.videos マスタは
--   アプリから未使用。実稼働中の video_bookmarks / action_item_progress と同様に
--   video_id を text にそろえ、文字列IDを直接保存できるようにする。
-- 安全性: user_notes はアプリから未配線で空のため、型変更・制約再作成は無害。
--   RLS ポリシー（自分の行のみ read/write）は変更しない。

-- 1) videos マスタへの外部キーを外す（uuid 前提の制約を撤去）
alter table public.user_notes
  drop constraint if exists user_notes_video_id_fkey;

-- 2) unique(user_id, video_id) を一旦外す（列型変更のため）
alter table public.user_notes
  drop constraint if exists user_notes_user_id_video_id_key;

-- 3) 列型を text へ変更（空テーブルなので USING の値変換は不要だが明示）
alter table public.user_notes
  alter column video_id type text using video_id::text;

-- 4) 動画ごと1ノートの一意制約を貼り直す（upsert の onConflict 対象）
alter table public.user_notes
  add constraint user_notes_user_id_video_id_key unique (user_id, video_id);
