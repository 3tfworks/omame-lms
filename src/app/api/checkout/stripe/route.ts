import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

// Stripe Checkout Session を作成する API。
// POST { referrerId?: string } を受け取り、単発購入(mode: "payment")の Session を作成して URL を返す。
//
// 将来サブスク対応する場合は、price をサブスク用 price に切り替えて mode: "subscription" を渡せるよう拡張する。

export async function POST(request: Request) {
  try {
    const priceId = process.env.STRIPE_PRICE_ID_OMAME_BASIC;
    if (!priceId) {
      console.error("[checkout/stripe] Missing STRIPE_PRICE_ID_OMAME_BASIC");
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    const body = await request.json().catch(() => ({}));
    const referrerId: string | undefined =
      typeof body.referrerId === "string" && body.referrerId.trim()
        ? body.referrerId.trim()
        : undefined;

    // リダイレクト先のベースURL（Vercel/本番では NEXT_PUBLIC_SITE_URL を設定）
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      new URL(request.url).origin ||
      "https://omamepiano.com";

    const session = await stripe.checkout.sessions.create({
      mode: "payment", // 単発購入
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      // アフィリエイト紐付け用。referrer_id があれば metadata に入れる。
      metadata: referrerId ? { referrer_id: referrerId } : {},
      success_url: `${siteUrl}/ja/lms?checkout=success`,
      cancel_url: `${siteUrl}/ja/offer?checkout=cancel`,
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
