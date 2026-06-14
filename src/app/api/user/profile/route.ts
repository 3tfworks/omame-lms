import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { validateDisplayName } from "@/lib/displayName";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // usersテーブルからプロフィールを取得
    const { data: profile, error: dbError } = await supabase
      .from("users")
      .select("id, email, role, display_name, referral_prompt_shown")
      .eq("id", user.id)
      .single();

    if (dbError) {
      console.error("[User Profile API] DB Error:", dbError);
      return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("[User Profile API] Unhandled Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// 表示名（display_name）の更新。
// SECURITY DEFINER RPC（update_my_display_name）経由で、自分の行の display_name のみ更新する。
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const validation = validateDisplayName(body?.displayName);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.message }, { status: 400 });
    }

    const { error } = await supabase.rpc("update_my_display_name", {
      new_name: validation.value,
    });

    if (error) {
      console.error("[User Profile API] Update Error:", error);
      return NextResponse.json({ error: "お名前の保存に失敗しました。" }, { status: 500 });
    }

    return NextResponse.json({ success: true, displayName: validation.value });
  } catch (error) {
    console.error("[User Profile API] Unhandled Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
