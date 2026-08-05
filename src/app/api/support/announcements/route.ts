import { NextResponse } from "next/server";
import { validateAnnouncementInput } from "@/lib/announcements";
import { getSupportAccess } from "@/lib/supportAuth";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET() {
  const access = await getSupportAccess();
  if (!access?.canManageAnnouncements) {
    return NextResponse.json({ error: "お知らせ管理の権限がありません" }, { status: access ? 403 : 401 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("announcements")
    .select("id, title, body, audience, is_important, is_published, published_at, show_in_info_bar, info_bar_variant, info_bar_ends_at, info_bar_dismissible, created_at, updated_at")
    .order("published_at", { ascending: false });
  if (error) return NextResponse.json({ error: "お知らせを取得できませんでした" }, { status: 500 });
  return NextResponse.json({ announcements: data });
}

export async function POST(request: Request) {
  const access = await getSupportAccess();
  if (!access?.canManageAnnouncements) {
    return NextResponse.json({ error: "お知らせ管理の権限がありません" }, { status: access ? 403 : 401 });
  }

  const validation = validateAnnouncementInput(await request.json().catch(() => ({})));
  if ("error" in validation) return NextResponse.json({ error: validation.error }, { status: 400 });
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("announcements")
    .insert({ ...validation.value, created_by: access.userId })
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: "お知らせを作成できませんでした" }, { status: 500 });
  return NextResponse.json({ id: data.id }, { status: 201 });
}
