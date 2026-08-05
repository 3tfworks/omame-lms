import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ infoBar: null }, { headers: { "Cache-Control": "no-store" } });

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("announcements")
    .select("id, title, body, info_bar_variant, info_bar_ends_at, info_bar_dismissible, published_at")
    .eq("show_in_info_bar", true)
    .or(`info_bar_ends_at.is.null,info_bar_ends_at.gt.${now}`)
    .order("is_important", { ascending: false })
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[Info Bar API] Failed to load:", error);
    return NextResponse.json({ error: "インフォバーを取得できませんでした" }, { status: 500 });
  }
  return NextResponse.json({ infoBar: data ?? null }, { headers: { "Cache-Control": "no-store" } });
}
