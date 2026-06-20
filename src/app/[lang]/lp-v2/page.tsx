import { getProductPricing, type PriceType } from "@/lib/pricing";

import { Section01Hero } from "./sections/Section01Hero";
import { Section02Empathy } from "./sections/Section02Empathy";
import { Section03Problem } from "./sections/Section03Problem";
import { Section04Story } from "./sections/Section04Story";
import { Section04cChanges } from "./sections/Section04cChanges";
import { Section04bBridge } from "./sections/Section04bBridge";
import { Section05WhatItIs } from "./sections/Section05WhatItIs";
import { Section07Voices } from "./sections/Section07Voices";
import { Section07bMidCta } from "./sections/Section07bMidCta";
import { Section08Structure } from "./sections/Section08Structure";
import { Section09Course } from "./sections/Section09Course";
import { Section10System } from "./sections/Section10System";
import { Section11Price } from "./sections/Section11Price";
import { Section12Faq } from "./sections/Section12Faq";
import { Section13Message } from "./sections/Section13Message";
import { Section14FinalCta } from "./sections/Section14FinalCta";

// お豆奏法 基礎講座 販売LP v2（補強型 LP）。
// 価格は system_settings（getProductPricing）から取得し、ハードコードしない。
// 最新の価格設定を反映するため動的レンダリングにする。
export const dynamic = "force-dynamic";

// priceType="salon" 時は salon 価格・表示で描画する（/[lang]/lp-salon から渡る）。
// /[lang]/lp は無引数の再エクスポートのため priceType は未指定＝"general"（後方互換）。
export default async function LpV2Page({
  params,
  priceType = "general",
}: {
  params: Promise<{ lang: string }>;
  priceType?: PriceType;
}) {
  const { lang } = await params;
  const pricing = await getProductPricing(priceType);

  return (
    <main className="w-full overflow-x-hidden bg-omame-bg text-omame-text">
      <Section01Hero priceType={priceType} />
      <Section02Empathy />
      <Section03Problem />
      <Section04Story />
      <Section04cChanges />
      <Section04bBridge />
      <Section07Voices />
      <Section07bMidCta />
      <Section05WhatItIs />
      <Section08Structure />
      <Section09Course />
      <Section10System />
      <Section11Price
        priceType={priceType}
        regularPrice={pricing.regularPrice}
        salePrice={pricing.salePrice}
        campaignLabel={pricing.campaignLabel}
        showCampaign={pricing.showCampaign}
      />
      <Section12Faq />
      <Section13Message />
      <Section14FinalCta
        lang={lang}
        priceType={priceType}
        regularPrice={pricing.regularPrice}
        salePrice={pricing.salePrice}
        campaignLabel={pricing.campaignLabel}
        showCampaign={pricing.showCampaign}
      />
    </main>
  );
}
