import { createAdminClient } from "@/utils/supabase/admin";
import type { SupabaseClient } from "@supabase/supabase-js";

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

// 価格種別。general=通常販売、salon=サロンメンバー特別価格（フェーズ2）。
export type PriceType = "general" | "salon";

// DB 上の生 JSON 形（salon 2キーは general の戻り型 ProductPricing には含めず、
// ここでのみ参照する。getProductPricing("salon") 時に salePrice/stripePriceId へ差し替える）。
type ProductPricingRaw = Partial<
  ProductPricing & {
    salonPrice: number;
    salonStripePriceId: string;
  }
>;

// system_settings 上のキー
export const PRODUCT_PRICING_SETTINGS_ID = "product_pricing";

// DB に値が無い場合のフォールバック（環境変数 + デフォルト値）。
// 既存のテスト決済を壊さないため、general の stripePriceId は STRIPE_PRICE_ID_OMAME_BASIC を使う。
// salon は env STRIPE_PRICE_ID_SALON（未設定なら ""）。空 ID は checkout 側で fail-closed になる。
function getFallbackPricing(priceType: PriceType = "general"): ProductPricing {
  if (priceType === "salon") {
    return {
      regularPrice: 34800,
      salePrice: 9800,
      stripePriceId: process.env.STRIPE_PRICE_ID_SALON ?? "",
      campaignLabel: "発売記念キャンペーン特別価格",
      showCampaign: true,
    };
  }
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
//
// priceType="salon" の場合、戻り値の salePrice/stripePriceId を salon 値（salonPrice/
// salonStripePriceId）へ差し替える。regularPrice/campaignLabel/showCampaign は共通。
// 戻り型は ProductPricing のまま（呼び出し側非破壊）。デフォルトは "general"（後方互換）。
export async function getProductPricing(
  priceType: PriceType = "general",
  client?: SupabaseClient,
): Promise<ProductPricing> {
  const fallback = getFallbackPricing(priceType);

  try {
    const supabaseAdmin = client ?? createAdminClient();
    const { data, error } = await supabaseAdmin
      .from("system_settings")
      .select("value")
      .eq("id", PRODUCT_PRICING_SETTINGS_ID)
      .single();

    if (error || !data?.value) {
      return fallback;
    }

    const parsed = JSON.parse(data.value as string) as ProductPricingRaw;

    // 共通項目
    const regularPrice =
      typeof parsed.regularPrice === "number" ? parsed.regularPrice : fallback.regularPrice;
    const campaignLabel =
      typeof parsed.campaignLabel === "string" ? parsed.campaignLabel : fallback.campaignLabel;
    const showCampaign =
      typeof parsed.showCampaign === "boolean" ? parsed.showCampaign : fallback.showCampaign;

    if (priceType === "salon") {
      const salePrice = typeof parsed.salonPrice === "number" ? parsed.salonPrice : fallback.salePrice;
      const stripePriceId =
        typeof parsed.salonStripePriceId === "string" && parsed.salonStripePriceId
          ? parsed.salonStripePriceId
          : fallback.stripePriceId;

      // fail-closed: salon の Price ID が解決できない場合、運用トラブルシュート用に明示ログ。
      // 空 ID のまま返すと checkout 側が 500（Server misconfiguration）で安全に止まる。
      if (!stripePriceId) {
        console.error(
          "[pricing] salonStripePriceId が DB(system_settings.product_pricing) にも env(STRIPE_PRICE_ID_SALON) にも存在しません。salon 決済は不可（fail-closed）。",
        );
      }

      return { regularPrice, salePrice, stripePriceId, campaignLabel, showCampaign };
    }

    // general
    return {
      regularPrice,
      salePrice: typeof parsed.salePrice === "number" ? parsed.salePrice : fallback.salePrice,
      stripePriceId:
        typeof parsed.stripePriceId === "string" && parsed.stripePriceId
          ? parsed.stripePriceId
          : fallback.stripePriceId,
      campaignLabel,
      showCampaign,
    };
  } catch (e) {
    console.error("[pricing] Failed to load product_pricing:", e);
    return fallback;
  }
}
