import { NextResponse } from "next/server";
import { authorizeAdminApi } from "@/lib/adminApiAuth";
import { startYoutubeResearch } from "@/lib/startYoutubeResearch";

export async function GET() {
  const auth = await authorizeAdminApi();
  if ("error" in auth) return auth.error;
  const { data, error } = await auth.supabaseAdmin
    .from("youtube_research_runs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ runs: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await authorizeAdminApi();
  if ("error" in auth) return auth.error;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  try {
    const result = await startYoutubeResearch({
      createdBy: auth.user.id,
      triggerSource: "manual",
      keywords: Array.isArray(body.keywords)
        ? body.keywords.filter((item): item is string => typeof item === "string")
        : undefined,
      videosPerKeyword: Number(body.videosPerKeyword) || undefined,
      commentsPerVideo: Number(body.commentsPerVideo) || undefined,
      ideaCount: Number(body.ideaCount) || undefined,
      researchMode: body.researchMode === "classical_shorts" ? "classical_shorts" : "standard",
    });
    return NextResponse.json({ run: result }, { status: 202 });
  } catch (error) {
    console.error("[YouTube Research] start failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "自動リサーチを開始できませんでした" },
      { status: 500 },
    );
  }
}
