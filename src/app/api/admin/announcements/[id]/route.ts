import { NextResponse } from "next/server";
import { authorizeAdminApi } from "@/lib/adminApiAuth";
import { validateAnnouncementInput } from "@/lib/announcements";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorizeAdminApi();
  if ("error" in auth) return auth.error;
  const validation = validateAnnouncementInput(await request.json().catch(() => ({})));
  if ("error" in validation) return NextResponse.json({ error: validation.error }, { status: 400 });
  const { id } = await params;
  const { error } = await auth.supabaseAdmin.from("announcements").update(validation.value).eq("id", id);
  if (error) return NextResponse.json({ error: "お知らせを更新できませんでした" }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorizeAdminApi();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const { error } = await auth.supabaseAdmin.from("announcements").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "お知らせを削除できませんでした" }, { status: 500 });
  return NextResponse.json({ success: true });
}
