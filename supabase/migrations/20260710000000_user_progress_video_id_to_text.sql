-- The LMS uses stable string IDs such as "video-1188100383".
-- Align user_progress with the other user-owned LMS tables.
alter table public.user_progress
  drop constraint if exists user_progress_video_id_fkey;

alter table public.user_progress
  drop constraint if exists user_progress_user_id_video_id_key;

alter table public.user_progress
  alter column video_id type text using video_id::text;

alter table public.user_progress
  add constraint user_progress_user_id_video_id_key unique (user_id, video_id);
