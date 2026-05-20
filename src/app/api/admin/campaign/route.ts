import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseAdmin = createAdminClient();
    const { data: requester } = await supabaseAdmin
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!requester || (requester.role !== "owner" && requester.role !== "admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // キャンペーン設定を取得（最新のもの1件）
    const { data: settings, error } = await supabaseAdmin
      .from("campaign_settings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") { // 0件エラーは無視
      console.error("[Admin Campaign API] Fetch Error:", error);
      return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
    }

    return NextResponse.json({ settings: settings || null });
  } catch (error) {
    console.error("[Admin Campaign API] Unhandled Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseAdmin = createAdminClient();
    const { data: requester } = await supabaseAdmin
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!requester || (requester.role !== "owner" && requester.role !== "admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { start_date, end_date, is_active } = body;

    if (!start_date || !end_date) {
      return NextResponse.json({ error: "start_date and end_date are required" }, { status: 400 });
    }

    // 古い設定を無効化（オプション、今回はシンプルに新しいレコードを追加）
    await supabaseAdmin
      .from("campaign_settings")
      .update({ is_active: false })
      .neq("id", "00000000-0000-0000-0000-000000000000"); // dummy condition to update all

    // 新しい設定を追加
    const { data, error } = await supabaseAdmin
      .from("campaign_settings")
      .insert([
        { start_date, end_date, is_active: is_active ?? true }
      ])
      .select()
      .single();

    if (error) {
      console.error("[Admin Campaign API] Insert Error:", error);
      return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
    }

    return NextResponse.json({ settings: data });
  } catch (error) {
    console.error("[Admin Campaign API] Unhandled Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
