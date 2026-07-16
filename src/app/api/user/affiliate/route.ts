import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getAffiliateRewardRate } from "@/lib/affiliateRate";
import { AFFILIATE_TERMS_VERSION, isReferralDiscountActive } from "@/lib/affiliateProgram";

// 振込先口座情報のサーバ側バリデーション。
// クライアントの HTML5 検証は API 直叩きで回避できるため、保存前にサーバでも必ず検査する。
type BankInfoInput = {
  bankName: unknown;
  branchName: unknown;
  accountType: unknown;
  accountNumber: unknown;
  accountName: unknown;
};

const ACCOUNT_TYPES = ["普通", "当座", "貯蓄"];
// 口座名義（カナ）: 全角/半角カタカナ・長音記号・各種スペース・括弧/ピリオドなど一般的な記号のみ許容
const ACCOUNT_NAME_RE = /^[ァ-ヶｦ-ﾟー・（）()．.　\s]+$/;
const ACCOUNT_NUMBER_RE = /^[0-9]+$/;

function validateBankInfo(input: unknown): { ok: true; value: {
  bankName: string; branchName: string; accountType: string; accountNumber: string; accountName: string;
} } | { ok: false; message: string } {
  if (!input || typeof input !== "object") {
    return { ok: false, message: "口座情報の形式が正しくありません。" };
  }
  const b = input as BankInfoInput;

  // 必須キーの存在・型チェック（文字列であること）
  const fields: [keyof BankInfoInput, string][] = [
    ["bankName", "金融機関名"],
    ["branchName", "支店名"],
    ["accountType", "口座種別"],
    ["accountNumber", "口座番号"],
    ["accountName", "口座名義（カナ）"],
  ];
  for (const [key, label] of fields) {
    const v = b[key];
    if (typeof v !== "string" || v.trim() === "") {
      return { ok: false, message: `${label}を入力してください。` };
    }
  }

  const bankName = (b.bankName as string).trim();
  const branchName = (b.branchName as string).trim();
  const accountType = (b.accountType as string).trim();
  const accountNumber = (b.accountNumber as string).trim();
  const accountName = (b.accountName as string).trim();

  // 文字列長の上限（DB肥大・悪用防止）
  if (bankName.length > 50) return { ok: false, message: "金融機関名が長すぎます（50文字以内）。" };
  if (branchName.length > 50) return { ok: false, message: "支店名が長すぎます（50文字以内）。" };
  if (accountName.length > 100) return { ok: false, message: "口座名義が長すぎます（100文字以内）。" };

  // 口座種別: 想定値のみ許可
  if (!ACCOUNT_TYPES.includes(accountType)) {
    return { ok: false, message: "口座種別が正しくありません。" };
  }

  // 口座番号: 半角数字のみ・妥当な桁数（日本の口座番号は概ね7桁、ゆうちょ等を考慮し1〜10桁）
  if (!ACCOUNT_NUMBER_RE.test(accountNumber)) {
    return { ok: false, message: "口座番号は半角数字のみで入力してください。" };
  }
  if (accountNumber.length < 1 || accountNumber.length > 10) {
    return { ok: false, message: "口座番号の桁数が正しくありません（1〜10桁）。" };
  }

  // 口座名義: カタカナ＋スペース＋一般的な記号のみ
  if (!ACCOUNT_NAME_RE.test(accountName)) {
    return { ok: false, message: "口座名義はカタカナで入力してください（例：ヤマダ タロウ）。" };
  }

  return { ok: true, value: { bankName, branchName, accountType, accountNumber, accountName } };
}

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
      .select("id, role, bank_info, display_name, referral_display_name")
      .eq("id", user.id)
      .single();

    if (!profile || !["salon_member", "owner", "admin"].includes(profile.role)) {
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

    const totalReferrals = rewards ? rewards.filter(r => r.status !== "cancelled").length : 0;
    // 「これまでに受け取ったギフト」= 振込済（paid）のみを集計する。
    const totalEarned = rewards
      ? rewards.filter(r => r.status === 'paid').reduce((sum, r) => sum + r.amount, 0)
      : 0;
    // 「お届け予定のギフト額」= 未払い（pending）のみを集計する。
    const unpaidAmount = rewards
      ? rewards.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.amount, 0)
      : 0;

    // 現在の報酬率（紹介者ダッシュボードの動的表示用）。
    const currentRate = await getAffiliateRewardRate();

    const { data: acceptance, error: acceptanceError } = await supabase
      .from("affiliate_terms_acceptances")
      .select("accepted_at")
      .eq("user_id", user.id)
      .eq("terms_version", AFFILIATE_TERMS_VERSION)
      .maybeSingle();
    if (acceptanceError) {
      console.error("[Affiliate API] Terms acceptance read error:", acceptanceError);
    }

    return NextResponse.json({
      userId: user.id,
      bankInfo: profile.bank_info || null,
      displayName: profile.display_name ?? null,
      referralDisplayName: profile.referral_display_name ?? null,
      terms: {
        version: AFFILIATE_TERMS_VERSION,
        accepted: Boolean(acceptance),
        acceptedAt: acceptance?.accepted_at ?? null,
      },
      referralDiscountActive: isReferralDiscountActive(),
      stats: {
        totalReferrals,
        totalEarned,
        unpaidAmount
      },
      currentRate: {
        rate: currentRate.rate,
        source: currentRate.source,
        campaign: currentRate.campaign
          ? {
              id: currentRate.campaign.id,
              name: currentRate.campaign.name,
              endAt: currentRate.campaign.endAt.toISOString(),
            }
          : null,
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

    if (!profile || !["salon_member", "owner", "admin"].includes(profile.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { bankInfo } = body;

    // サーバ側バリデーション（不正値は 400 で拒否）
    const validation = validateBankInfo(bankInfo);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.message }, { status: 400 });
    }

    // SECURITY DEFINER RPC 経由で、自分の行の bank_info カラムのみを更新する。
    // service role を使わず、DBレベルで「他人の行・他カラムは触れない」ことを担保する。
    const { error } = await supabase.rpc("update_my_bank_info", {
      new_bank_info: validation.value,
    });

    if (error) {
      console.error("[Affiliate API] Update Error:", error);
      return NextResponse.json({ error: "口座情報の保存に失敗しました。" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Affiliate API] Unhandled Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
