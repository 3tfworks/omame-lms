import { start } from "workflow/api";
import {
  normalizeYouTubeResearchConfig,
  type YouTubeResearchMode,
} from "@/lib/youtubeDataApi";
import { createAdminClient } from "@/utils/supabase/admin";
import { youtubeResearchWorkflow } from "@/workflows/youtubeResearchWorkflow";

const DEFAULT_KEYWORDS = ["ピアノ 脱力", "ピアノ 力を抜く", "ピアノ 音が硬い"];
const CLASSICAL_SHORTS_KEYWORDS = [
  "クラシック ピアノ shorts",
  "ピアノ 弾いてみた shorts",
  "ショパン ピアノ shorts",
  "ピアノ 難所 shorts",
  "クラシック ピアノ 脱力",
];

export async function startYoutubeResearch(input: {
  createdBy?: string;
  triggerSource: "manual" | "schedule";
  keywords?: string[];
  videosPerKeyword?: number;
  commentsPerVideo?: number;
  ideaCount?: number;
  researchMode?: YouTubeResearchMode;
}) {
  const supabase = createAdminClient();
  const researchMode = input.researchMode === "classical_shorts"
    ? "classical_shorts"
    : "standard";
  let keywords = input.keywords ?? [];
  if (keywords.length === 0 && researchMode === "standard") {
    const { data } = await supabase
      .from("youtube_research_keywords")
      .select("keyword")
      .in("status", ["adopted", "candidate"])
      .order("updated_at", { ascending: false })
      .limit(5);
    keywords = (data ?? []).map((item) => item.keyword);
  }
  if (keywords.length === 0) {
    keywords = researchMode === "classical_shorts" ? CLASSICAL_SHORTS_KEYWORDS : DEFAULT_KEYWORDS;
  }

  const config = normalizeYouTubeResearchConfig({
    researchMode,
    keywords,
    videosPerKeyword: input.videosPerKeyword,
    commentsPerVideo: input.commentsPerVideo,
    ideaCount: input.ideaCount,
  });
  const { data: runRecord, error } = await supabase
    .from("youtube_research_runs")
    .insert({
      status: "queued",
      trigger_source: input.triggerSource,
      current_step: "queued",
      research_mode: config.researchMode,
      seed_keywords: config.keywords,
      config,
      created_by: input.createdBy ?? null,
    })
    .select("id")
    .single();
  if (error || !runRecord) {
    throw new Error(`実行履歴を作成できませんでした: ${error?.message ?? "unknown"}`);
  }

  try {
    const workflowRun = await start(youtubeResearchWorkflow, [runRecord.id, config]);
    await supabase
      .from("youtube_research_runs")
      .update({ workflow_run_id: workflowRun.runId })
      .eq("id", runRecord.id);
    return { id: runRecord.id, workflowRunId: workflowRun.runId, config };
  } catch (workflowError) {
    await supabase
      .from("youtube_research_runs")
      .update({
        status: "failed",
        current_step: "failed_to_start",
        error_message:
          workflowError instanceof Error ? workflowError.message : String(workflowError),
        completed_at: new Date().toISOString(),
      })
      .eq("id", runRecord.id);
    throw workflowError;
  }
}
