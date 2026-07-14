-- Record the exact moment a learner marks a video as completed.
-- Existing completed rows remain null because their completion time is unknown.
alter table public.user_progress
  add column if not exists completed_at timestamp with time zone;
