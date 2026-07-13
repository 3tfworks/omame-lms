import { NextResponse } from "next/server";
import { startYoutubeResearch } from "@/lib/startYoutubeResearch";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const run = await startYoutubeResearch({
      triggerSource: "schedule",
      researchMode: "classical_shorts",
      videosPerKeyword: 8,
      commentsPerVideo: 15,
      ideaCount: 8,
    });
    return NextResponse.json({ run }, { status: 202 });
  } catch (error) {
    console.error("[YouTube Research Shorts Cron] failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 },
    );
  }
}
