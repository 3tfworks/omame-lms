import { NextResponse } from "next/server";
import { validateAnnouncementInput } from "@/lib/announcements";
import { getSupportAccess } from "@/lib/supportAuth";
import { createAdminClient } from "@/utils/supabase/admin";

async function authorize() {
  const access = await getSupportAccess();
  if (!access?.canManageAnnouncements) {
    return { error: NextResponse.json({ error: "お知らせ管理の権限がありません" }, { status: access ? 403 : 401 }) } as const;
  }
  return { admin: createAdminClient() } as const;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorize();
  if ("error" in auth) return auth.error;
  const validation = validateAnnouncementInput(await request.json().catch(() => ({})));
  if ("error" in validation) return NextResponse.json({ error: validation.error }, { status: 400 });
  const { id } = await params;
  const { error } = await auth.admin.from("announcements").update(validation.value).eq("id", id);
  if (error) return NextResponse.json({ error: "お知らせを更新できませんでした" }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorize();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const { error } = await auth.admin.from("announcements").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "お知らせを削除できませんでした" }, { status: 500 });
  return NextResponse.json({ success: true });
}
