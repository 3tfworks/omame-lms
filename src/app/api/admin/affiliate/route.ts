import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { AFFILIATE_TERMS_VERSION, MINIMUM_PAYOUT_YEN } from "@/lib/affiliateProgram";

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
        id, amount, reward_rate, status, created_at, eligible_for_payout_at, paid_at, cancelled_at, cancellation_reason,
        referrer:referrer_id (id, email, display_name, bank_info),
        buyer:buyer_id (email, display_name)
      `)
      .order("created_at", { ascending: false });

    if (rewardsError) {
      console.error("[Admin Affiliate API] Fetch Rewards Error:", rewardsError);
      return NextResponse.json({ error: "Failed to fetch rewards" }, { status: 500 });
    }

    const { data: termsAcceptances, error: acceptancesError } = await supabaseAdmin
      .from("affiliate_terms_acceptances")
      .select("user_id, terms_version, accepted_at, user:user_id (email, display_name)")
      .eq("terms_version", AFFILIATE_TERMS_VERSION)
      .order("accepted_at", { ascending: false });
    if (acceptancesError) {
      console.error("[Admin Affiliate API] Terms acceptance fetch error:", acceptancesError);
    }

    // 報酬率は「通常報酬率（default）」のみを保持する（キャンペーンは campaign_periods が担当）。
    const { data: rateSetting } = await supabaseAdmin
      .from("system_settings")
      .select("value")
      .eq("id", "affiliate_reward_rate")
      .single();

    let defaultRate = 35;
    try {
      const parsed = rateSetting?.value ? JSON.parse(rateSetting.value as string) : null;
      if (typeof parsed?.default === "number") defaultRate = parsed.default;
    } catch {
      /* フォールバック維持 */
    }

    return NextResponse.json({
      rewards,
      rewardRateConfig: { default: defaultRate },
      termsVersion: AFFILIATE_TERMS_VERSION,
      termsAcceptances: termsAcceptances ?? [],
    });
  } catch (error) {
    console.error("[Admin Affiliate API] Unhandled Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// 報酬率設定の更新
export async function PUT(request: Request) {
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
    const { defaultRate } = body;

    if (typeof defaultRate !== "number" || defaultRate < 1 || defaultRate > 100) {
      return NextResponse.json({ error: "Rate must be between 1 and 100" }, { status: 400 });
    }

    // 日付スケジュール方式へ移行済みのため、保持するのは通常報酬率（default）のみ。
    const { error } = await supabaseAdmin
      .from("system_settings")
      .upsert(
        {
          id: "affiliate_reward_rate",
          value: JSON.stringify({ default: defaultRate }),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

    if (error) {
      console.error("[Admin Affiliate API] Rate update error:", error);
      return NextResponse.json({ error: "Failed to update rate" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
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
    const { rewardId, newStatus, cancellationReason } = body;

    if (!rewardId || !newStatus) {
      return NextResponse.json({ error: "rewardId and newStatus are required" }, { status: 400 });
    }

    if (!["pending", "paid", "cancelled"].includes(newStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const { data: reward } = await supabaseAdmin
      .from("affiliate_rewards")
      .select("status, eligible_for_payout_at, referrer_id")
      .eq("id", rewardId)
      .single();
    if (!reward) return NextResponse.json({ error: "Reward not found" }, { status: 404 });
    if (newStatus === "paid" && new Date(reward.eligible_for_payout_at).getTime() > Date.now()) {
      return NextResponse.json(
        { error: "購入後30日間の確認期間が終わるまで支払済みにできません" },
        { status: 409 },
      );
    }
    if (newStatus === "paid") {
      const now = new Date().toISOString();
      const [{ data: payableRewards }, { data: referrer }] = await Promise.all([
        supabaseAdmin
          .from("affiliate_rewards")
          .select("amount")
          .eq("referrer_id", reward.referrer_id)
          .eq("status", "pending")
          .lte("eligible_for_payout_at", now),
        supabaseAdmin.from("users").select("bank_info").eq("id", reward.referrer_id).single(),
      ]);
      const payableTotal = (payableRewards ?? []).reduce((sum, item) => sum + item.amount, 0);
      if (payableTotal < MINIMUM_PAYOUT_YEN) {
        return NextResponse.json(
          { error: `支払可能な報酬の合計が${MINIMUM_PAYOUT_YEN.toLocaleString("ja-JP")}円未満です` },
          { status: 409 },
        );
      }
      if (!referrer?.bank_info) {
        return NextResponse.json({ error: "紹介者の振込先口座が未登録です" }, { status: 409 });
      }
    }

    const updates: Record<string, string | null> = { status: newStatus };
    if (newStatus === "paid") updates.paid_at = new Date().toISOString();
    if (newStatus === "pending") {
      updates.paid_at = null;
      updates.cancelled_at = null;
      updates.cancellation_reason = null;
    }
    if (newStatus === "cancelled") {
      updates.cancelled_at = new Date().toISOString();
      updates.cancellation_reason =
        typeof cancellationReason === "string" && cancellationReason.trim()
          ? cancellationReason.trim().slice(0, 200)
          : "返金・決済取消・規約違反等のため";
    }

    const { error } = await supabaseAdmin
      .from("affiliate_rewards")
      .update(updates)
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
