import type { Metadata } from "next";
import LpV2Page from "../lp-v2/page";

// お豆奏法 基礎講座 サロンメンバー特別価格 LP（/[lang]/lp-salon）。
// 中身は lp-v2 を正本として再利用し、priceType="salon" で salon 価格・表示に切り替える。
// 価格は system_settings 由来のため動的レンダリングにする。
// 限定配布のため検索エンジンには載せない（noindex）。
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "お豆奏法 基礎講座｜サロンメンバー特別価格",
  description:
    "お豆奏法 基礎講座を、サロンメンバー特別価格でご案内する限定ページです。",
  robots: { index: false, follow: false },
};

export default async function LpSalonPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  return <LpV2Page params={params} priceType="salon" />;
}
