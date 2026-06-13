import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { stripe } from "@/lib/stripe";
import {
  getProductPricing,
  PRODUCT_PRICING_SETTINGS_ID,
  type ProductPricing,
} from "@/lib/pricing";

// owner / admin かどうかを判定する共通処理。
// 認可OKなら admin クライアントを返し、NGなら NextResponse(エラー) を返す。
async function authorizeAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const supabaseAdmin = createAdminClient();
  const { data: requester } = await supabaseAdmin
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!requester || (requester.role !== "owner" && requester.role !== "admin")) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { supabaseAdmin };
}

// GET: 現在の価格設定を取得（管理画面の初期表示用）。
export async function GET() {
  try {
    const auth = await authorizeAdmin();
    if (auth.error) return auth.error;

    const pricing = await getProductPricing();
    return NextResponse.json({ pricing });
  } catch (error) {
    console.error("[Admin Pricing API] Unhandled Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT: 価格設定を更新する。
// salePrice が現在値から変更された場合のみ、Stripe API で新しい Price を作成し、
// 旧 Price をアーカイブして stripePriceId を切り替える。
// （Stripe は既存 Price の金額変更ができないため、新規作成→切り替え方式）
export async function PUT(request: Request) {
  try {
    const auth = await authorizeAdmin();
    if (auth.error) return auth.error;
    const { supabaseAdmin } = auth;

    const body = await request.json().catch(() => ({}));
    const { regularPrice, salePrice, campaignLabel, showCampaign } = body;

    // バリデーション
    if (
      typeof regularPrice !== "number" ||
      typeof salePrice !== "number" ||
      !Number.isFinite(regularPrice) ||
      !Number.isFinite(salePrice) ||
      regularPrice <= 0 ||
      salePrice <= 0
    ) {
      return NextResponse.json(
        { error: "regularPrice と salePrice は正の数値で指定してください" },
        { status: 400 }
      );
    }
    if (typeof campaignLabel !== "string") {
      return NextResponse.json({ error: "campaignLabel は文字列で指定してください" }, { status: 400 });
    }
    if (typeof showCampaign !== "boolean") {
      return NextResponse.json({ error: "showCampaign は真偽値で指定してください" }, { status: 400 });
    }

    // 円（JPY: ゼロデシマル通貨）なので整数に丸める
    const regular = Math.round(regularPrice);
    const sale = Math.round(salePrice);

    const current = await getProductPricing();
    let stripePriceId = current.stripePriceId;

    // salePrice が変わった場合のみ Stripe で新しい Price を作成する（差分検知）
    if (sale !== current.salePrice) {
      if (!current.stripePriceId) {
        return NextResponse.json(
          { error: "現在の Stripe Price ID が未設定のため、価格を切り替えられません" },
          { status: 500 }
        );
      }

      // 現在の Price から商品(Product)を特定（商品IDは固定で使い回す）
      const oldPrice = await stripe.prices.retrieve(current.stripePriceId);
      const productId =
        typeof oldPrice.product === "string" ? oldPrice.product : oldPrice.product.id;

      // 新しい Price を作成（JPY はゼロデシマルなので unit_amount は円の額面そのまま）
      const newPrice = await stripe.prices.create({
        product: productId,
        unit_amount: sale,
        currency: oldPrice.currency || "jpy",
      });

      // 旧 Price は履歴として残しつつアーカイブ（無効化）する
      await stripe.prices.update(current.stripePriceId, { active: false });

      stripePriceId = newPrice.id;
    }

    const updated: ProductPricing = {
      regularPrice: regular,
      salePrice: sale,
      stripePriceId,
      campaignLabel,
      showCampaign,
    };

    const { error } = await supabaseAdmin.from("system_settings").upsert(
      {
        id: PRODUCT_PRICING_SETTINGS_ID,
        value: JSON.stringify(updated),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (error) {
      console.error("[Admin Pricing API] Upsert Error:", error);
      return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
    }

    return NextResponse.json({ pricing: updated });
  } catch (error) {
    console.error("[Admin Pricing API] Unhandled Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
