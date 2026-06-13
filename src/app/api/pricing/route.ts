import { NextResponse } from "next/server";
import { getProductPricing } from "@/lib/pricing";

// LP（offer-demo / offer-water）の価格表示用の公開 API。
// 認証不要。stripePriceId など決済内部で使う情報は返さない。
export async function GET() {
  const pricing = await getProductPricing();

  return NextResponse.json({
    regularPrice: pricing.regularPrice,
    salePrice: pricing.salePrice,
    campaignLabel: pricing.campaignLabel,
    showCampaign: pricing.showCampaign,
  });
}
