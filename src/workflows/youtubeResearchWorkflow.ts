import { analyzeResearchComments } from "@/lib/youtubeResearch";
import { generateYouTubeResearchPlan } from "@/lib/youtubeResearchAI";
import {
  collectYouTubeVideos,
  rankResearchVideos,
  type CollectedYouTubeVideo,
  type YouTubeResearchConfig,
} from "@/lib/youtubeDataApi";
import { createAdminClient } from "@/utils/supabase/admin";

async function updateRun(
  runId: string,
  value: Record<string, unknown>,
) {
  "use step";
  console.log(`[YouTube Research] run ${runId}:`, value.current_step ?? value.status);
  const { error } = await createAdminClient()
    .from("youtube_research_runs")
    .update(value)
    .eq("id", runId);
  if (error) throw new Error(`実行履歴の更新に失敗しました: ${error.message}`);
}

async function collectEvidence(config: YouTubeResearchConfig) {
  "use step";
  console.log(`[YouTube Research] collecting ${config.keywords.length} keywords`);
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) throw new Error("YOUTUBE_API_KEY が設定されていません");
  return collectYouTubeVideos(config, apiKey);
}

async function persistEvidence(
  runId: string,
  videos: CollectedYouTubeVideo[],
  config: YouTubeResearchConfig,
) {
  "use step";
  console.log(`[YouTube Research] persisting ${videos.length} videos`);
  if (videos.length === 0) return;
  const rows = videos.map((video) => {
    const commentsText = video.comments.join("\n");
    return {
      source_run_id: runId,
      content_format: config.researchMode,
      url: video.url,
      video_id: video.videoId,
      title: video.title,
      description: video.description,
      channel_id: video.channelId,
      channel_name: video.channelName,
      published_at: video.publishedAt,
      view_count: video.viewCount,
      like_count: video.likeCount,
      comment_count: video.commentCount,
      channel_subscribers: video.channelSubscribers,
      duration_minutes: Math.round((video.durationSeconds / 60) * 100) / 100,
      duration_seconds: video.durationSeconds,
      thumbnail_url: video.thumbnailUrl,
      search_keyword: video.searchKeyword,
      comments_text: commentsText,
      comment_analysis: analyzeResearchComments(commentsText),
      collected_at: new Date().toISOString(),
    };
  });
  const { error } = await createAdminClient()
    .from("youtube_research_videos")
    .upsert(rows, { onConflict: "url" });
  if (error) throw new Error(`動画データの保存に失敗しました: ${error.message}`);
}

async function generatePlan(videos: CollectedYouTubeVideo[], config: YouTubeResearchConfig) {
  "use step";
  console.log(`[YouTube Research] generating ${config.ideaCount} ${config.researchMode} ideas`);
  return generateYouTubeResearchPlan(
    rankResearchVideos(videos, config.researchMode),
    config,
  );
}

async function persistPlan(
  runId: string,
  plan: Awaited<ReturnType<typeof generateYouTubeResearchPlan>>,
) {
  "use step";
  console.log(`[YouTube Research] persisting ${plan.ideas.length} ideas`);
  const supabase = createAdminClient();
  const titles = plan.ideas.map((idea) => idea.title);
  const { data: existing } = await supabase
    .from("youtube_research_ideas")
    .select("title, content_format")
    .eq("content_format", plan.ideas[0]?.content_format ?? "standard")
    .in("title", titles);
  const existingTitles = new Set((existing ?? []).map((idea) => idea.title));
  const rows = plan.ideas.filter((idea) => !existingTitles.has(idea.title)).map((idea) => ({
    source_run_id: runId,
    status: "candidate",
    ...idea,
  }));
  if (rows.length === 0) return 0;
  const { error } = await supabase.from("youtube_research_ideas").insert(rows);
  if (error) throw new Error(`企画案の保存に失敗しました: ${error.message}`);
  return rows.length;
}

async function failRun(runId: string, error: unknown) {
  "use step";
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[YouTube Research] run ${runId} failed: ${message}`);
  await createAdminClient()
    .from("youtube_research_runs")
    .update({
      status: "failed",
      current_step: "failed",
      error_message: message.slice(0, 4_000),
      completed_at: new Date().toISOString(),
    })
    .eq("id", runId);
}

export async function youtubeResearchWorkflow(
  runId: string,
  config: YouTubeResearchConfig,
) {
  "use workflow";
  console.log(`[YouTube Research] workflow started: ${runId}`);
  try {
    await updateRun(runId, {
      status: "running",
      current_step: "collecting_youtube",
      started_at: new Date().toISOString(),
    });
    const videos = await collectEvidence(config);
    if (videos.length === 0) throw new Error("YouTube検索結果が0件でした");

    await updateRun(runId, { current_step: "saving_evidence" });
    await persistEvidence(runId, videos, config);

    await updateRun(runId, { current_step: "generating_ideas" });
    const plan = await generatePlan(videos, config);

    await updateRun(runId, { current_step: "saving_ideas" });
    const savedIdeaCount = await persistPlan(runId, plan);
    await updateRun(runId, {
      status: "completed",
      current_step: "completed",
      completed_at: new Date().toISOString(),
      insights: {
        audience: plan.audience_insights,
        content_gaps: plan.content_gaps,
      },
      stats: {
        keyword_count: config.keywords.length,
        video_count: videos.length,
        comment_count: videos.reduce((sum, video) => sum + video.comments.length, 0),
        idea_count: savedIdeaCount,
      },
    });
    return { runId, videoCount: videos.length, ideaCount: savedIdeaCount };
  } catch (error) {
    await failRun(runId, error);
    throw error;
  }
}
