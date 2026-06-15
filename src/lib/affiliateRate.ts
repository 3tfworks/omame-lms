import { createAdminClient } from "@/utils/supabase/admin";
import type { SupabaseClient } from "@supabase/supabase-js";

// アフィリエイト報酬率の判定（日付スケジュール方式）。
//
// 決済成立日時 `at` が campaign_periods の [start_at, end_at) に入る is_active=true の行が
// あれば、その reward_rate を適用する。無ければ system_settings/affiliate_reward_rate.default
// にフォールバックする。3経路（stripe / kaihipay webhook・invite redeem）と紹介者画面が
// この単一関数を参照することで、率の判定ロジックを一本化する。
export type AffiliateRewardRate = {
  rate: number;
  source: "campaign" | "default";
  campaign?: { id: string; name: string; endAt: Date };
};

// DB が完全に読めない場合の最終フォールバック。
const DEFAULT_RATE = 35;

// クライアント方針: pricing.ts: getProductPricing() に倣い、既定では内部で admin クライアントを
// 生成（カプセル化）。テストや既存クライアント再利用のため任意 DI も受け付ける。
export async function getAffiliateRewardRate(
  at: Date = new Date(),
  client?: SupabaseClient,
): Promise<AffiliateRewardRate> {
  const supabase = client ?? createAdminClient();
  const iso = at.toISOString();

  // 1. at を含む有効キャンペーン（半開区間 [start, end)）。
  //    DB の EXCLUDE 制約で重複は防がれているが、万一複数ヒットしても start_at 最新を採用し
  //    例外を投げない防御設計（二重の安全網）。
  const { data: c } = await supabase
    .from("campaign_periods")
    .select("id, name, end_at, reward_rate")
    .eq("is_active", true)
    .lte("start_at", iso)
    .gt("end_at", iso)
    .order("start_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (c) {
    return {
      rate: c.reward_rate,
      source: "campaign",
      campaign: { id: c.id, name: c.name, endAt: new Date(c.end_at) },
    };
  }

  // 2. ミス → system_settings/affiliate_reward_rate.default
  const { data: s } = await supabase
    .from("system_settings")
    .select("value")
    .eq("id", "affiliate_reward_rate")
    .single();

  let rate = DEFAULT_RATE;
  try {
    const parsed = s?.value ? JSON.parse(s.value as string) : null;
    if (typeof parsed?.default === "number") rate = parsed.default;
  } catch {
    /* パース失敗時は DEFAULT_RATE を維持 */
  }

  return { rate, source: "default" };
}
