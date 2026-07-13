-- =============================================================================
-- YouTube リサーチツール（管理者専用）
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.youtube_research_keywords (
  id          uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword     text        NOT NULL UNIQUE,
  source_seed text,
  status      text        NOT NULL DEFAULT 'candidate',
  notes       text        NOT NULL DEFAULT '',
  created_at  timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at  timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT chk_youtube_keyword_status CHECK (status IN ('candidate', 'adopted', 'rejected')),
  CONSTRAINT chk_youtube_keyword_not_blank CHECK (length(btrim(keyword)) > 0)
);

CREATE TABLE IF NOT EXISTS public.youtube_research_videos (
  id                  uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url                 text        NOT NULL UNIQUE,
  video_id            text,
  title               text        NOT NULL,
  channel_name        text        NOT NULL DEFAULT '',
  published_at        timestamptz,
  view_count          bigint      NOT NULL DEFAULT 0,
  channel_subscribers bigint      NOT NULL DEFAULT 0,
  duration_minutes    numeric(7,2) NOT NULL DEFAULT 0,
  notes               text        NOT NULL DEFAULT '',
  comments_text       text        NOT NULL DEFAULT '',
  comment_analysis    jsonb       NOT NULL DEFAULT '{}'::jsonb,
  created_at          timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at          timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT chk_youtube_video_title_not_blank CHECK (length(btrim(title)) > 0),
  CONSTRAINT chk_youtube_video_counts CHECK (view_count >= 0 AND channel_subscribers >= 0),
  CONSTRAINT chk_youtube_video_duration CHECK (duration_minutes >= 0)
);

CREATE TABLE IF NOT EXISTS public.youtube_research_ideas (
  id               uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title            text        NOT NULL,
  pillar           text        NOT NULL DEFAULT 'pain',
  status           text        NOT NULL DEFAULT 'candidate',
  target_audience  text        NOT NULL DEFAULT '',
  problem          text        NOT NULL DEFAULT '',
  hook             text        NOT NULL DEFAULT '',
  demonstration    text        NOT NULL DEFAULT '',
  cta              text        NOT NULL DEFAULT '',
  source_keyword   text        NOT NULL DEFAULT '',
  source_url       text        NOT NULL DEFAULT '',
  thumbnail_a      text        NOT NULL DEFAULT '',
  thumbnail_b      text        NOT NULL DEFAULT '',
  thumbnail_c      text        NOT NULL DEFAULT '',
  demand_score     integer     NOT NULL DEFAULT 0,
  fit_score        integer     NOT NULL DEFAULT 0,
  proof_score      integer     NOT NULL DEFAULT 0,
  conversion_score integer     NOT NULL DEFAULT 0,
  ease_score       integer     NOT NULL DEFAULT 0,
  score_total      integer     GENERATED ALWAYS AS
    (demand_score + fit_score + proof_score + conversion_score + ease_score) STORED,
  scheduled_at     timestamptz,
  created_at       timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at       timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT chk_youtube_idea_title_not_blank CHECK (length(btrim(title)) > 0),
  CONSTRAINT chk_youtube_idea_pillar CHECK (pillar IN ('pain', 'principle', 'practice', 'story', 'teacher')),
  CONSTRAINT chk_youtube_idea_status CHECK (
    status IN ('candidate', 'researching', 'script', 'scheduled', 'editing', 'published', 'measuring')
  ),
  CONSTRAINT chk_youtube_idea_scores CHECK (
    demand_score BETWEEN 0 AND 30 AND
    fit_score BETWEEN 0 AND 30 AND
    proof_score BETWEEN 0 AND 20 AND
    conversion_score BETWEEN 0 AND 15 AND
    ease_score BETWEEN 0 AND 5
  )
);

CREATE INDEX IF NOT EXISTS idx_youtube_research_ideas_status
  ON public.youtube_research_ideas (status, score_total DESC);
CREATE INDEX IF NOT EXISTS idx_youtube_research_videos_created
  ON public.youtube_research_videos (created_at DESC);

CREATE OR REPLACE FUNCTION public.touch_youtube_research_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at := timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_touch_youtube_research_keywords ON public.youtube_research_keywords;
CREATE TRIGGER trg_touch_youtube_research_keywords
  BEFORE UPDATE ON public.youtube_research_keywords
  FOR EACH ROW EXECUTE FUNCTION public.touch_youtube_research_updated_at();

DROP TRIGGER IF EXISTS trg_touch_youtube_research_videos ON public.youtube_research_videos;
CREATE TRIGGER trg_touch_youtube_research_videos
  BEFORE UPDATE ON public.youtube_research_videos
  FOR EACH ROW EXECUTE FUNCTION public.touch_youtube_research_updated_at();

DROP TRIGGER IF EXISTS trg_touch_youtube_research_ideas ON public.youtube_research_ideas;
CREATE TRIGGER trg_touch_youtube_research_ideas
  BEFORE UPDATE ON public.youtube_research_ideas
  FOR EACH ROW EXECUTE FUNCTION public.touch_youtube_research_updated_at();

ALTER TABLE public.youtube_research_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.youtube_research_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.youtube_research_ideas ENABLE ROW LEVEL SECURITY;

-- ポリシーは作成しない。管理APIの owner/admin 認可と service-role 経由に限定する。
