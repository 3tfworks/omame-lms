-- YouTube research automation run history and evidence linkage.

CREATE TABLE IF NOT EXISTS public.youtube_research_runs (
  id              uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  status          text        NOT NULL DEFAULT 'queued',
  trigger_source  text        NOT NULL DEFAULT 'manual',
  current_step    text        NOT NULL DEFAULT 'queued',
  workflow_run_id text,
  seed_keywords   text[]      NOT NULL DEFAULT '{}'::text[],
  config          jsonb       NOT NULL DEFAULT '{}'::jsonb,
  stats           jsonb       NOT NULL DEFAULT '{}'::jsonb,
  insights        jsonb       NOT NULL DEFAULT '{}'::jsonb,
  error_message   text        NOT NULL DEFAULT '',
  created_by      uuid,
  started_at      timestamptz,
  completed_at    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at      timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT chk_youtube_research_run_status CHECK (
    status IN ('queued', 'running', 'completed', 'failed')
  ),
  CONSTRAINT chk_youtube_research_trigger CHECK (
    trigger_source IN ('manual', 'schedule')
  )
);

ALTER TABLE public.youtube_research_videos
  ADD COLUMN IF NOT EXISTS source_run_id uuid REFERENCES public.youtube_research_runs(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS search_keyword text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS description text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS channel_id text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS like_count bigint NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS comment_count bigint NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS duration_seconds integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS thumbnail_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS collected_at timestamptz;

ALTER TABLE public.youtube_research_ideas
  ADD COLUMN IF NOT EXISTS source_run_id uuid REFERENCES public.youtube_research_runs(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS score_reason text NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_youtube_research_runs_created
  ON public.youtube_research_runs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_youtube_research_videos_source_run
  ON public.youtube_research_videos (source_run_id);
CREATE INDEX IF NOT EXISTS idx_youtube_research_ideas_source_run
  ON public.youtube_research_ideas (source_run_id);

DROP TRIGGER IF EXISTS trg_touch_youtube_research_runs ON public.youtube_research_runs;
CREATE TRIGGER trg_touch_youtube_research_runs
  BEFORE UPDATE ON public.youtube_research_runs
  FOR EACH ROW EXECUTE FUNCTION public.touch_youtube_research_updated_at();

ALTER TABLE public.youtube_research_runs ENABLE ROW LEVEL SECURITY;
