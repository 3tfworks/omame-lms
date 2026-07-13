import { generateText, Output } from "ai";
import { z } from "zod";
import type { CollectedYouTubeVideo, YouTubeResearchConfig } from "@/lib/youtubeDataApi";

const pillarSchema = z.enum(["pain", "principle", "practice", "story", "teacher"]);

const ideaSchema = z.object({
  title: z.string().describe("YouTube動画タイトル。具体的で誇張しない"),
  pillar: pillarSchema,
  target_audience: z.string(),
  problem: z.string(),
  hook: z.string().describe("冒頭15秒の台詞または展開"),
  demonstration: z.string().describe("動画内で見せる比較・演奏・検証"),
  cta: z.string(),
  source_keyword: z.string(),
  source_url: z.string(),
  thumbnail_a: z.string(),
  thumbnail_b: z.string(),
  thumbnail_c: z.string(),
  demand_score: z.number().int().min(0).max(30),
  fit_score: z.number().int().min(0).max(30),
  proof_score: z.number().int().min(0).max(20),
  conversion_score: z.number().int().min(0).max(15),
  ease_score: z.number().int().min(0).max(5),
  score_reason: z.string(),
  content_format: z.enum(["standard", "classical_shorts"]),
  composer: z.string(),
  piece_title: z.string(),
  difficult_passage: z.string(),
  opening_overlay: z.string().describe("画面冒頭に表示する短いテロップ"),
  performance_segment: z.string().describe("演奏する小節・場面・クライマックス"),
  shot_plan: z.array(z.string()).describe("時系列の撮影カット割り"),
  target_duration_seconds: z.number().int().min(0).max(180),
  rights_note: z.string().describe("作品・編曲・楽譜・録音の権利確認メモ"),
});

const researchOutputSchema = z.object({
  audience_insights: z.array(z.string()),
  content_gaps: z.array(z.string()),
  ideas: z.array(ideaSchema),
});

export type GeneratedResearchPlan = z.infer<typeof researchOutputSchema>;

function compactEvidence(videos: CollectedYouTubeVideo[]) {
  return videos.slice(0, 30).map((video) => ({
    title: video.title,
    url: video.url,
    keyword: video.searchKeyword,
    views: video.viewCount,
    likes: video.likeCount,
    commentCount: video.commentCount,
    subscribers: video.channelSubscribers,
    durationSeconds: video.durationSeconds,
    publishedAt: video.publishedAt,
    comments: video.comments.slice(0, 12),
  }));
}

export async function generateYouTubeResearchPlan(
  videos: CollectedYouTubeVideo[],
  config: YouTubeResearchConfig,
): Promise<GeneratedResearchPlan> {
  const model = process.env.YOUTUBE_RESEARCH_AI_MODEL || "openai/gpt-5.4-mini";
  const result = await generateText({
    model,
    output: Output.object({
      name: "YouTubeResearchPlan",
      description: "実データを根拠にした、お豆奏法向けYouTube企画案",
      schema: researchOutputSchema,
    }),
    maxRetries: 2,
    system: [
      "あなたは日本のピアノ教育・YouTube集客に詳しい編集長です。",
      "対象サービスは、力まず自然に弾く『お豆奏法』です。",
      "データにない事実は断定せず、検索結果とコメントを根拠に企画してください。",
      "公開原稿ではなく、編集者が確認する企画ドラフトを作ります。",
    ].join("\n"),
    prompt: [
      `企画案をちょうど${config.ideaCount}件作成してください。`,
      config.researchMode === "classical_shorts"
        ? [
            "すべてcontent_formatをclassical_shortsにしてください。",
            "クラシック曲の弾いてみたShorts専用です。曲名、作曲家、難所、演奏区間、冒頭テロップ、15〜45秒を基本とするカット割りを具体化してください。",
            "最初の1〜2秒に完成演奏または音の違いを置き、純粋な演奏・ビフォーアフター・一言解説を混ぜてください。",
            "CTAは短く自然にし、演奏の余韻を壊さないでください。権利切れを断定せず、rights_noteに作品・編曲・楽譜・録音の確認事項を書いてください。",
            "サムネイル案には、Shortsのタイトル候補・冒頭コピーの別案を入れてください。",
          ].join("\n")
        : [
            "すべてcontent_formatをstandardにしてください。",
            "同じ切り口を重複させず、初心者・再開組・指導者を適切に分けてください。",
            "Shorts専用項目は空文字・空配列・0にしてください。",
          ].join("\n"),
      "採点は需要30、適合30、実演証明20、導線15、制作容易性5の合計100点です。",
      "CTAは診断・無料解説・講座案内など、企画内容に自然に接続してください。",
      `調査データ:\n${JSON.stringify(compactEvidence(videos))}`,
    ].join("\n\n"),
  });
  if (!result.output) throw new Error("AIから構造化された企画案を取得できませんでした");
  if (result.output.ideas.length !== config.ideaCount) {
    throw new Error(`AI企画数が不正です（期待${config.ideaCount}件、実際${result.output.ideas.length}件）`);
  }
  return result.output;
}
