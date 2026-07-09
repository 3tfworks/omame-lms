import { createAdminClient } from "@/utils/supabase/admin";

// 招待を出せる紹介者の role（invite/register の検証条件・アフィリエイトページ表示条件と一致させる）
const VALID_REFERRER_ROLES = ["salon_member", "owner", "admin"];

export type ValidReferrer = {
  id: string;
  displayName: string | null;
};

// 空文字・空白のみは「未設定」として null に正規化する
function normalize(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

// 招待状ヒーローに表示する紹介者名をサーバ側で取得する（サーバ専用ヘルパー）。
//
// ・admin client（service role・サーバ専用 env）で users を id 一致で引く。
// ・取得列は display_name / referral_display_name / role のみ。email 等は取得しない。
// ・role 検証（invite/register と同条件）を通った場合だけ名前を返す。
// ・referral_display_name（上書き）→ display_name の順に採用。どちらも無効なら null。
// ・無効な UUID・未存在・role 不適合・エラー時はすべて null（フォールバック表示）。
export async function getValidReferrer(userId: string): Promise<ValidReferrer | null> {
  if (!userId) return null;
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("users")
      .select("id, display_name, referral_display_name, role")
      .eq("id", userId)
      .single();

    if (error || !data) return null;
    if (!VALID_REFERRER_ROLES.includes(data.role)) return null;

    return {
      id: data.id,
      displayName: normalize(data.referral_display_name) ?? normalize(data.display_name),
    };
  } catch {
    // 不正な UUID 形式などで例外が投げられた場合もフォールバック
    return null;
  }
}

export async function getReferrerInviteName(userId: string): Promise<string | null> {
  const referrer = await getValidReferrer(userId);
  return referrer?.displayName ?? null;
}
