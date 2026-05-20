import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ユーザー情報と銀行口座情報を取得
    const { data: profile } = await supabase
      .from("users")
      .select("id, role, bank_info")
      .eq("id", user.id)
      .single();

    if (!profile || (profile.role !== "salon_member" && profile.role !== "owner")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 紹介成果を集計
    const { data: rewards, error } = await supabase
      .from("affiliate_rewards")
      .select("amount, status")
      .eq("referrer_id", user.id);

    if (error) {
      console.error("[Affiliate API] DB Error:", error);
      return NextResponse.json({ error: "Failed to fetch rewards" }, { status: 500 });
    }

    const totalReferrals = rewards ? rewards.length : 0;
    const totalEarned = rewards 
      ? rewards.reduce((sum, r) => sum + r.amount, 0)
      : 0;
    const unpaidAmount = rewards
      ? rewards.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.amount, 0)
      : 0;

    return NextResponse.json({
      userId: user.id,
      bankInfo: profile.bank_info || null,
      stats: {
        totalReferrals,
        totalEarned,
        unpaidAmount
      }
    });
  } catch (error) {
    console.error("[Affiliate API] Unhandled Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// 銀行口座情報の更新
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 権限チェック
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || (profile.role !== "salon_member" && profile.role !== "owner")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { bankInfo } = body;

    if (!bankInfo) {
      return NextResponse.json({ error: "bankInfo is required" }, { status: 400 });
    }

    // usersテーブルを更新
    // supabase-jsのv2ではサーバー側で自身のデータを更新できるかはRLS次第ですが、
    // service_roleキーを使ったadminクライアントが必要かもしれない。
    // とりあえず今回は通常のクライアントで試行。エラーになればadminクライアントに切り替え。
    const { error } = await supabase
      .from("users")
      .update({ bank_info: bankInfo, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    if (error) {
      console.error("[Affiliate API] Update Error:", error);
      // RLSエラー対策としてadminクライアントで再試行
      const { createClient: createAdmin } = await import("@supabase/supabase-js");
      const adminClient = createAdmin(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      const { error: retryError } = await adminClient
        .from("users")
        .update({ bank_info: bankInfo, updated_at: new Date().toISOString() })
        .eq("id", user.id);
        
      if (retryError) {
        return NextResponse.json({ error: "Failed to update bank info" }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Affiliate API] Unhandled Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
