import { getProductPricing } from "@/lib/pricing";

import { Section01Hero } from "./sections/Section01Hero";
import { Section02Empathy } from "./sections/Section02Empathy";
import { Section03Problem } from "./sections/Section03Problem";
import { Section04Story } from "./sections/Section04Story";
import { Section04cChanges } from "./sections/Section04cChanges";
import { Section04bBridge } from "./sections/Section04bBridge";
import { Section05WhatItIs } from "./sections/Section05WhatItIs";
import { Section07Voices } from "./sections/Section07Voices";
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

export default async function LpV2Page({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const pricing = await getProductPricing();

  return (
    <main className="w-full overflow-x-hidden bg-omame-bg text-omame-text">
      <Section01Hero />
      <Section02Empathy />
      <Section03Problem />
      <Section04Story />
      <Section04cChanges />
      <Section04bBridge />
      <Section07Voices />
      <Section05WhatItIs />
      <Section08Structure />
      <Section09Course />
      <Section10System />
      <Section11Price
        lang={lang}
        regularPrice={pricing.regularPrice}
        salePrice={pricing.salePrice}
        campaignLabel={pricing.campaignLabel}
        showCampaign={pricing.showCampaign}
      />
      <Section12Faq />
      <Section13Message />
      <Section14FinalCta
        lang={lang}
        regularPrice={pricing.regularPrice}
        salePrice={pricing.salePrice}
        campaignLabel={pricing.campaignLabel}
        showCampaign={pricing.showCampaign}
      />
    </main>
  );
}
