import { createAdminClient } from "@/utils/supabase/admin";

/**
 * 決済完了時にアフィリエイト報酬を計算して記録するヘルパー関数
 * @param buyerId 購入者のユーザーID
 * @param amount 支払われた金額（例: 24800）
 * @returns 処理結果
 */
export async function recordAffiliateReward(buyerId: string, amount: number) {
  const supabase = createAdminClient();

  try {
    // 1. 購入者のユーザー情報を取得（紹介者 referred_by がいるか確認）
    const { data: buyer, error: buyerError } = await supabase
      .from("users")
      .select("referred_by")
      .eq("id", buyerId)
      .single();

    if (buyerError || !buyer || !buyer.referred_by) {
      console.log("[Affiliate] No referrer found for buyer:", buyerId);
      return { success: true, message: "No referrer" };
    }

    const referrerId = buyer.referred_by;

    // 2. 現在アクティブなキャンペーン期間を取得
    const { data: campaign } = await supabase
      .from("campaign_settings")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    let rewardRate = 35; // 基本報酬 35%

    if (campaign) {
      const now = new Date();
      const start = new Date(campaign.start_date);
      const end = new Date(campaign.end_date);
      
      // 現在がキャンペーン期間内なら 50%
      if (now >= start && now <= end) {
        rewardRate = 50;
      }
    }

    // 3. 報酬金額の計算
    const rewardAmount = Math.floor(amount * (rewardRate / 100));

    // 4. 報酬テーブルに記録
    const { error: insertError } = await supabase
      .from("affiliate_rewards")
      .insert([
        {
          referrer_id: referrerId,
          buyer_id: buyerId,
          amount: rewardAmount,
          reward_rate: rewardRate,
          status: "pending" // 初期ステータスは未払い
        }
      ]);

    if (insertError) {
      console.error("[Affiliate] Failed to record reward:", insertError);
      return { success: false, error: insertError };
    }

    console.log(`[Affiliate] Reward recorded. Referrer: ${referrerId}, Rate: ${rewardRate}%, Amount: ¥${rewardAmount}`);
    return { success: true, rewardAmount, rewardRate };

  } catch (error) {
    console.error("[Affiliate] Unhandled Error:", error);
    return { success: false, error };
  }
}
