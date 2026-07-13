import { NextResponse } from "next/server";
import {
  RESEARCH_PILLARS,
  RESEARCH_STATUSES,
  analyzeResearchComments,
  extractYouTubeVideoId,
  normalizeIdeaScores,
} from "@/lib/youtubeResearch";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

type Resource = "keyword" | "video" | "idea";

const TABLES: Record<Resource, string> = {
  keyword: "youtube_research_keywords",
  video: "youtube_research_videos",
  idea: "youtube_research_ideas",
};

async function authorizeAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

  const supabaseAdmin = createAdminClient();
  const { data: requester } = await supabaseAdmin
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!requester || !["owner", "admin"].includes(requester.role)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { supabaseAdmin };
}

function isResource(value: unknown): value is Resource {
  return typeof value === "string" && value in TABLES;
}

function text(value: unknown, maxLength = 10_000): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function nonNegativeNumber(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

function nullableDate(value: unknown): string | null {
  if (typeof value !== "string" || !value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function normalizeCreate(resource: Resource, data: Record<string, unknown>) {
  if (resource === "keyword") {
    const keyword = text(data.keyword, 200);
    if (!keyword) return { error: "キーワードを入力してください" } as const;
    return {
      value: {
        keyword,
        source_seed: text(data.source_seed, 200) || null,
        status: ["candidate", "adopted", "rejected"].includes(String(data.status))
          ? data.status
          : "candidate",
        notes: text(data.notes, 2_000),
      },
    } as const;
  }

  if (resource === "video") {
    const url = text(data.url, 1_000);
    const title = text(data.title, 500);
    if (!url || !title) return { error: "動画URLとタイトルを入力してください" } as const;
    try {
      new URL(url);
    } catch {
      return { error: "動画URLの形式が正しくありません" } as const;
    }

    const commentsText = text(data.comments_text, 100_000);
    return {
      value: {
        url,
        video_id: extractYouTubeVideoId(url),
        title,
        channel_name: text(data.channel_name, 300),
        published_at: nullableDate(data.published_at),
        view_count: Math.round(nonNegativeNumber(data.view_count)),
        channel_subscribers: Math.round(nonNegativeNumber(data.channel_subscribers)),
        duration_minutes: nonNegativeNumber(data.duration_minutes),
        notes: text(data.notes, 10_000),
        comments_text: commentsText,
        comment_analysis: analyzeResearchComments(commentsText),
      },
    } as const;
  }

  const title = text(data.title, 500);
  if (!title) return { error: "企画タイトルを入力してください" } as const;

  const pillar = RESEARCH_PILLARS.includes(data.pillar as (typeof RESEARCH_PILLARS)[number])
    ? data.pillar
    : "pain";
  const status = RESEARCH_STATUSES.includes(data.status as (typeof RESEARCH_STATUSES)[number])
    ? data.status
    : "candidate";
  const scores = normalizeIdeaScores({
    demand_score: nonNegativeNumber(data.demand_score),
    fit_score: nonNegativeNumber(data.fit_score),
    proof_score: nonNegativeNumber(data.proof_score),
    conversion_score: nonNegativeNumber(data.conversion_score),
    ease_score: nonNegativeNumber(data.ease_score),
  });

  return {
    value: {
      title,
      pillar,
      status,
      target_audience: text(data.target_audience, 2_000),
      problem: text(data.problem, 4_000),
      hook: text(data.hook, 4_000),
      demonstration: text(data.demonstration, 4_000),
      cta: text(data.cta, 2_000),
      source_keyword: text(data.source_keyword, 300),
      source_url: text(data.source_url, 1_000),
      thumbnail_a: text(data.thumbnail_a, 100),
      thumbnail_b: text(data.thumbnail_b, 100),
      thumbnail_c: text(data.thumbnail_c, 100),
      ...scores,
      scheduled_at: nullableDate(data.scheduled_at),
    },
  } as const;
}

function normalizePatch(resource: Resource, data: Record<string, unknown>) {
  if (resource === "keyword") {
    const value: Record<string, unknown> = {};
    if ("status" in data && ["candidate", "adopted", "rejected"].includes(String(data.status))) {
      value.status = data.status;
    }
    if ("notes" in data) value.notes = text(data.notes, 2_000);
    return value;
  }

  if (resource === "video") {
    const value: Record<string, unknown> = {};
    if ("notes" in data) value.notes = text(data.notes, 10_000);
    if ("comments_text" in data) {
      const commentsText = text(data.comments_text, 100_000);
      value.comments_text = commentsText;
      value.comment_analysis = analyzeResearchComments(commentsText);
    }
    return value;
  }

  const value: Record<string, unknown> = {};
  if ("status" in data && RESEARCH_STATUSES.includes(data.status as (typeof RESEARCH_STATUSES)[number])) {
    value.status = data.status;
  }
  if ("scheduled_at" in data) value.scheduled_at = nullableDate(data.scheduled_at);
  if ("title" in data && text(data.title, 500)) value.title = text(data.title, 500);
  return value;
}

export async function GET() {
  try {
    const auth = await authorizeAdmin();
    if (auth.error) return auth.error;
    const { supabaseAdmin } = auth;

    const [keywordsResult, videosResult, ideasResult] = await Promise.all([
      supabaseAdmin.from(TABLES.keyword).select("*").order("created_at", { ascending: false }),
      supabaseAdmin.from(TABLES.video).select("*").order("created_at", { ascending: false }),
      supabaseAdmin.from(TABLES.idea).select("*").order("score_total", { ascending: false }),
    ]);

    const error = keywordsResult.error || videosResult.error || ideasResult.error;
    if (error) {
      console.error("[YouTube Research API] Fetch Error:", error);
      return NextResponse.json(
        { error: "リサーチデータを取得できません。DBマイグレーションの適用状況を確認してください。" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      keywords: keywordsResult.data ?? [],
      videos: videosResult.data ?? [],
      ideas: ideasResult.data ?? [],
    });
  } catch (error) {
    console.error("[YouTube Research API] Unhandled Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await authorizeAdmin();
    if (auth.error) return auth.error;
    const { supabaseAdmin } = auth;
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    if (!isResource(body.resource) || !body.data || typeof body.data !== "object") {
      return NextResponse.json({ error: "resource と data が必要です" }, { status: 400 });
    }

    const normalized = normalizeCreate(body.resource, body.data as Record<string, unknown>);
    if ("error" in normalized) return NextResponse.json({ error: normalized.error }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from(TABLES[body.resource])
      .insert(normalized.value)
      .select()
      .single();

    if (error) {
      const duplicate = error.code === "23505";
      console.error("[YouTube Research API] Insert Error:", error);
      return NextResponse.json(
        { error: duplicate ? "同じデータがすでに登録されています" : "保存に失敗しました" },
        { status: duplicate ? 409 : 500 },
      );
    }

    return NextResponse.json({ item: data }, { status: 201 });
  } catch (error) {
    console.error("[YouTube Research API] Unhandled Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await authorizeAdmin();
    if (auth.error) return auth.error;
    const { supabaseAdmin } = auth;
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    if (!isResource(body.resource) || typeof body.id !== "string" || !body.data || typeof body.data !== "object") {
      return NextResponse.json({ error: "resource、id、data が必要です" }, { status: 400 });
    }

    const value = normalizePatch(body.resource, body.data as Record<string, unknown>);
    if (Object.keys(value).length === 0) {
      return NextResponse.json({ error: "更新できる項目がありません" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from(TABLES[body.resource])
      .update(value)
      .eq("id", body.id)
      .select()
      .single();

    if (error) {
      console.error("[YouTube Research API] Update Error:", error);
      return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
    }
    return NextResponse.json({ item: data });
  } catch (error) {
    console.error("[YouTube Research API] Unhandled Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await authorizeAdmin();
    if (auth.error) return auth.error;
    const { supabaseAdmin } = auth;
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    if (!isResource(body.resource) || typeof body.id !== "string") {
      return NextResponse.json({ error: "resource と id が必要です" }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from(TABLES[body.resource]).delete().eq("id", body.id);
    if (error) {
      console.error("[YouTube Research API] Delete Error:", error);
      return NextResponse.json({ error: "削除に失敗しました" }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[YouTube Research API] Unhandled Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
