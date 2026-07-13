-- Keep standard video research and classical Shorts research independent.

UPDATE public.youtube_research_videos AS video
SET content_format = run.research_mode
FROM public.youtube_research_runs AS run
WHERE video.source_run_id = run.id
  AND video.content_format IS DISTINCT FROM run.research_mode;

UPDATE public.youtube_research_ideas AS idea
SET content_format = run.research_mode
FROM public.youtube_research_runs AS run
WHERE idea.source_run_id = run.id
  AND idea.content_format IS DISTINCT FROM run.research_mode;

ALTER TABLE public.youtube_research_videos
  DROP CONSTRAINT IF EXISTS youtube_research_videos_url_key;

DROP INDEX IF EXISTS public.idx_youtube_research_videos_url_format;
CREATE UNIQUE INDEX idx_youtube_research_videos_url_format
  ON public.youtube_research_videos (url, content_format);

CREATE INDEX IF NOT EXISTS idx_youtube_research_videos_format_created
  ON public.youtube_research_videos (content_format, created_at DESC);
