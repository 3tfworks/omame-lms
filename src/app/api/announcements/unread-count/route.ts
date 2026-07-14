import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ unreadCount: 0 });

  const [announcementsResult, readsResult] = await Promise.all([
    supabase.from("announcements").select("id"),
    supabase.from("announcement_reads").select("announcement_id").eq("user_id", user.id),
  ]);
  if (announcementsResult.error || readsResult.error) {
    return NextResponse.json({ error: "未読件数を取得できませんでした" }, { status: 500 });
  }
  const readIds = new Set((readsResult.data ?? []).map((row) => row.announcement_id));
  const unreadCount = (announcementsResult.data ?? []).filter((item) => !readIds.has(item.id)).length;
  return NextResponse.json({ unreadCount });
}
