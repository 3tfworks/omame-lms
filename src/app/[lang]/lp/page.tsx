import LpV2Page from "../lp-v2/page";

// 販売LP本番URL（/[lang]/lp）。
// 中身は lp-v2 を正本として再利用する（URL は /lp を維持したまま v2 を表示）。
// 価格は system_settings 由来のため、v2 同様に動的レンダリングにする。
export const dynamic = "force-dynamic";

export default LpV2Page;
