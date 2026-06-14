import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { validateOptionalDisplayName } from "@/lib/displayName";

// 招待用表示名（referral_display_name）の更新。
// SECURITY DEFINER RPC（update_my_referral_display_name）経由で、自分の行の当該列のみ更新する。
// 空入力は null に正規化され、上書き解除（display_name にフォールバック）となる。
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const validation = validateOptionalDisplayName(body?.referralDisplayName);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.message }, { status: 400 });
    }

    // RPC には常に文字列を渡す（null/空のときは空文字 → DB 側で nullif により NULL 化＝解除）
    const { error } = await supabase.rpc("update_my_referral_display_name", {
      new_name: validation.value ?? "",
    });

    if (error) {
      console.error("[Referral Name API] Update Error:", error);
      return NextResponse.json({ error: "お名前の保存に失敗しました。" }, { status: 500 });
    }

    return NextResponse.json({ success: true, referralDisplayName: validation.value });
  } catch (error) {
    console.error("[Referral Name API] Unhandled Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
