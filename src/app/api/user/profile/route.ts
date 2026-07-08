import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { validateDisplayName, validateLegalName } from "@/lib/displayName";

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
      .select("id, email, role, legal_name, display_name, referral_display_name, referral_prompt_shown")
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

// 登録情報の更新。
// SECURITY DEFINER RPC 経由で、自分の行の許可された列のみ更新する。
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const updates: { legalName?: string; displayName?: string } = {};

    if (Object.prototype.hasOwnProperty.call(body ?? {}, "legalName")) {
      const validation = validateLegalName(body?.legalName);
      if (!validation.ok) {
        return NextResponse.json({ error: validation.message }, { status: 400 });
      }
      const { error } = await supabase.rpc("update_my_legal_name", {
        new_name: validation.value,
      });
      if (error) {
        console.error("[User Profile API] Legal Name Update Error:", error);
        return NextResponse.json({ error: "本名の保存に失敗しました。" }, { status: 500 });
      }
      updates.legalName = validation.value;
    }

    if (Object.prototype.hasOwnProperty.call(body ?? {}, "displayName")) {
      const validation = validateDisplayName(body?.displayName);
      if (!validation.ok) {
        return NextResponse.json({ error: validation.message }, { status: 400 });
      }
      const { error } = await supabase.rpc("update_my_display_name", {
        new_name: validation.value,
      });
      if (error) {
        console.error("[User Profile API] Display Name Update Error:", error);
        return NextResponse.json({ error: "ニックネームの保存に失敗しました。" }, { status: 500 });
      }
      updates.displayName = validation.value;
    }

    if (!("legalName" in updates) && !("displayName" in updates)) {
      return NextResponse.json({ error: "更新する項目がありません。" }, { status: 400 });
    }

    return NextResponse.json({ success: true, ...updates });
  } catch (error) {
    console.error("[User Profile API] Unhandled Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
