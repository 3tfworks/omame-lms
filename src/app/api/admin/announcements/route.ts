import { NextResponse } from "next/server";
import { authorizeAdminApi } from "@/lib/adminApiAuth";
import { validateAnnouncementInput } from "@/lib/announcements";

export async function GET() {
  const auth = await authorizeAdminApi();
  if ("error" in auth) return auth.error;
  const { data, error } = await auth.supabaseAdmin
    .from("announcements")
    .select("id, title, body, audience, is_important, is_published, published_at, created_at, updated_at")
    .order("published_at", { ascending: false });
  if (error) return NextResponse.json({ error: "お知らせを取得できませんでした" }, { status: 500 });
  return NextResponse.json({ announcements: data });
}

export async function POST(request: Request) {
  const auth = await authorizeAdminApi();
  if ("error" in auth) return auth.error;
  const validation = validateAnnouncementInput(await request.json().catch(() => ({})));
  if ("error" in validation) return NextResponse.json({ error: validation.error }, { status: 400 });
  const { data, error } = await auth.supabaseAdmin
    .from("announcements")
    .insert({ ...validation.value, created_by: auth.user.id })
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: "お知らせを作成できませんでした" }, { status: 500 });
  return NextResponse.json({ id: data.id }, { status: 201 });
}
