-- Classical performance Shorts research mode and production-ready idea fields.

ALTER TABLE public.youtube_research_runs
  ADD COLUMN IF NOT EXISTS research_mode text NOT NULL DEFAULT 'standard';

ALTER TABLE public.youtube_research_videos
  ADD COLUMN IF NOT EXISTS content_format text NOT NULL DEFAULT 'standard';

ALTER TABLE public.youtube_research_ideas
  ADD COLUMN IF NOT EXISTS content_format text NOT NULL DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS composer text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS piece_title text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS difficult_passage text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS opening_overlay text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS performance_segment text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS shot_plan jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS target_duration_seconds integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rights_note text NOT NULL DEFAULT '';

ALTER TABLE public.youtube_research_runs
  DROP CONSTRAINT IF EXISTS chk_youtube_research_mode;
ALTER TABLE public.youtube_research_runs
  ADD CONSTRAINT chk_youtube_research_mode
  CHECK (research_mode IN ('standard', 'classical_shorts'));

ALTER TABLE public.youtube_research_videos
  DROP CONSTRAINT IF EXISTS chk_youtube_research_video_format;
ALTER TABLE public.youtube_research_videos
  ADD CONSTRAINT chk_youtube_research_video_format
  CHECK (content_format IN ('standard', 'classical_shorts'));

ALTER TABLE public.youtube_research_ideas
  DROP CONSTRAINT IF EXISTS chk_youtube_research_idea_format;
ALTER TABLE public.youtube_research_ideas
  ADD CONSTRAINT chk_youtube_research_idea_format
  CHECK (content_format IN ('standard', 'classical_shorts'));

ALTER TABLE public.youtube_research_ideas
  DROP CONSTRAINT IF EXISTS chk_youtube_research_shorts_duration;
ALTER TABLE public.youtube_research_ideas
  ADD CONSTRAINT chk_youtube_research_shorts_duration
  CHECK (target_duration_seconds BETWEEN 0 AND 180);

CREATE INDEX IF NOT EXISTS idx_youtube_research_runs_mode_created
  ON public.youtube_research_runs (research_mode, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_youtube_research_ideas_format_score
  ON public.youtube_research_ideas (content_format, score_total DESC);
