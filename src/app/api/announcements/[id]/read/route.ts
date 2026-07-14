import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const { data: announcement } = await supabase.from("announcements").select("id").eq("id", id).maybeSingle();
  if (!announcement) return NextResponse.json({ error: "Not Found" }, { status: 404 });

  const { error } = await supabase.from("announcement_reads").upsert(
    { announcement_id: id, user_id: user.id, read_at: new Date().toISOString() },
    { onConflict: "announcement_id,user_id" },
  );
  if (error) return NextResponse.json({ error: "既読状態を保存できませんでした" }, { status: 500 });
  return NextResponse.json({ success: true });
}
