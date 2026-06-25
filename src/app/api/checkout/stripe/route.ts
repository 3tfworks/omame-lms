import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { stripe } from "@/lib/stripe";
import { getProductPricing, type PriceType } from "@/lib/pricing";

// Stripe Checkout Session を作成する API。
// POST { priceType?: "general" | "salon", referrerId?: string } を受け取り、
// 単発購入(mode: "payment")の Session を作成して URL を返す。
//
// 将来サブスク対応する場合は、price をサブスク用 price に切り替えて mode: "subscription" を渡せるよう拡張する。

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));

    // priceType の決定（フェーズ2）。未指定/null は "general"（後方互換）。
    // 既知の値("general"|"salon")以外は 400 で拒否し、許可値を明示する。
    let priceType: PriceType = "general";
    const rawPriceType: unknown = body.priceType;
    if (rawPriceType !== undefined && rawPriceType !== null) {
      if (rawPriceType === "general" || rawPriceType === "salon") {
        priceType = rawPriceType;
      } else {
        return NextResponse.json(
          { error: 'priceType は "general" または "salon" のいずれかを指定してください' },
          { status: 400 },
        );
      }
    }

    // 価格は DB(system_settings.product_pricing)の Price ID を使用（priceType で general/salon を切替）。
    // DB 欠落時は general→STRIPE_PRICE_ID_OMAME_BASIC / salon→STRIPE_PRICE_ID_SALON へフォールバック。
    // salon で Price ID が解決できない場合は空 ID → ここで 500（fail-closed）。詳細は pricing.ts がログ出力。
    const { stripePriceId: priceId } = await getProductPricing(priceType);
    if (!priceId) {
      console.error(`[checkout/stripe] Missing Stripe Price ID for priceType="${priceType}"`);
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    // 紹介者(referrer_id)の解決優先順位（金銭リスクP1: アフィリエイト紐付け）:
    //   1. body.referrerId      … 明示指定（招待フロー /invite/[userId]/thanks）
    //   2. cookie `referrer_id` … LP の ?ref=xxx 経路。proxy.ts が発行する httpOnly cookie の
    //                             server-side consumer（proxy.ts の cookie 発行と対になる）。
    //                             httpOnly のためクライアントJSからは読めず、ここで解決する。
    //   3. なし                  … metadata 未設定 → webhook 側の email→invite_leads フォールバックに委譲
    let referrerId: string | undefined =
      typeof body.referrerId === "string" && body.referrerId.trim()
        ? body.referrerId.trim()
        : undefined;

    if (!referrerId) {
      const cookieStore = await cookies();
      const fromCookie = cookieStore.get("referrer_id")?.value?.trim();
      if (fromCookie) referrerId = fromCookie;
    }

    // リダイレクト先のベースURL（Vercel/本番では NEXT_PUBLIC_SITE_URL を設定）
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      new URL(request.url).origin ||
      "https://omamepiano.com";

    // metadata: price_type は常に付与（webhook が salon 報酬スキップ判定に使用）。
    // referrer_id はアフィリエイト紐付け用で、存在する場合のみ付与する。
    const metadata: Record<string, string> = { price_type: priceType };
    if (referrerId) metadata.referrer_id = referrerId;

    const session = await stripe.checkout.sessions.create({
      mode: "payment", // 単発購入
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata,
      allow_promotion_codes: true, // Checkout でプロモーションコード入力欄を表示
      success_url: `${siteUrl}/ja/lms?checkout=success`,
      cancel_url: `${siteUrl}/ja/lp?checkout=cancel`,
    });

    if (!session.url) {
      console.error("[checkout/stripe] Session created without URL:", session.id);
      return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[checkout/stripe] Unhandled error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
