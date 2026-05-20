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

    // 報酬一覧を取得
    const { data: rewards, error: rewardsError } = await supabaseAdmin
      .from("affiliate_rewards")
      .select(`
        id, amount, reward_rate, status, created_at,
        referrer:referrer_id (id, email, display_name, bank_info),
        buyer:buyer_id (email, display_name)
      `)
      .order("created_at", { ascending: false });

    if (rewardsError) {
      console.error("[Admin Affiliate API] Fetch Rewards Error:", rewardsError);
      return NextResponse.json({ error: "Failed to fetch rewards" }, { status: 500 });
    }

    return NextResponse.json({ rewards });
  } catch (error) {
    console.error("[Admin Affiliate API] Unhandled Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// 支払いステータスの更新
export async function PATCH(request: Request) {
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
    const { rewardId, newStatus } = body;

    if (!rewardId || !newStatus) {
      return NextResponse.json({ error: "rewardId and newStatus are required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("affiliate_rewards")
      .update({ status: newStatus })
      .eq("id", rewardId);

    if (error) {
      console.error("[Admin Affiliate API] Update Error:", error);
      return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Admin Affiliate API] Unhandled Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
