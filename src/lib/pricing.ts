import { createAdminClient } from "@/utils/supabase/admin";

// 商品の価格設定。system_settings の id="product_pricing" に JSON 文字列で保存する。
//
// - regularPrice : 通常価格（表示用、取り消し線）
// - salePrice    : 販売価格（実際の決済額）
// - stripePriceId: 現在使用中の Stripe Price ID（Checkout で使用）
// - campaignLabel: キャンペーン文言
// - showCampaign : キャンペーン表示の ON/OFF
export type ProductPricing = {
  regularPrice: number;
  salePrice: number;
  stripePriceId: string;
  campaignLabel: string;
  showCampaign: boolean;
};

// system_settings 上のキー
export const PRODUCT_PRICING_SETTINGS_ID = "product_pricing";

// DB に値が無い場合のフォールバック（環境変数 + デフォルト値）。
// 既存のテスト決済を壊さないため、stripePriceId は STRIPE_PRICE_ID_OMAME_BASIC を使う。
function getFallbackPricing(): ProductPricing {
  return {
    regularPrice: 34800,
    salePrice: 29800,
    stripePriceId: process.env.STRIPE_PRICE_ID_OMAME_BASIC ?? "",
    campaignLabel: "発売記念キャンペーン特別価格",
    showCampaign: true,
  };
}

// system_settings から価格設定を取得する。
// レコードが無い／パースに失敗した場合はフォールバック値を返す。
// ※サーバーサイド専用（Service Role Key を使う admin クライアントを利用）。
export async function getProductPricing(): Promise<ProductPricing> {
  const fallback = getFallbackPricing();

  try {
    const supabaseAdmin = createAdminClient();
    const { data, error } = await supabaseAdmin
      .from("system_settings")
      .select("value")
      .eq("id", PRODUCT_PRICING_SETTINGS_ID)
      .single();

    if (error || !data?.value) {
      return fallback;
    }

    const parsed = JSON.parse(data.value as string) as Partial<ProductPricing>;

    return {
      regularPrice:
        typeof parsed.regularPrice === "number" ? parsed.regularPrice : fallback.regularPrice,
      salePrice:
        typeof parsed.salePrice === "number" ? parsed.salePrice : fallback.salePrice,
      stripePriceId:
        typeof parsed.stripePriceId === "string" && parsed.stripePriceId
          ? parsed.stripePriceId
          : fallback.stripePriceId,
      campaignLabel:
        typeof parsed.campaignLabel === "string" ? parsed.campaignLabel : fallback.campaignLabel,
      showCampaign:
        typeof parsed.showCampaign === "boolean" ? parsed.showCampaign : fallback.showCampaign,
    };
  } catch (e) {
    console.error("[pricing] Failed to load product_pricing:", e);
    return fallback;
  }
}
