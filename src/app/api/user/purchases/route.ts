import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/utils/supabase/server";

type PurchaseRow = {
  id: string;
  product_name: string;
  amount_total: number;
  currency: string;
  status: "paid" | "partially_refunded" | "refunded" | "disputed";
  purchased_at: string;
  stripe_charge_id: string | null;
  last_receipt_sent_at: string | null;
};

const RECEIPT_PRODUCT_KEYS = ["omame_basic", "omame_basic_salon"];

function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  return `${local.slice(0, 1)}${"*".repeat(Math.min(Math.max(local.length - 1, 2), 6))}@${domain}`;
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("purchase_records")
      .select(
        "id, product_name, amount_total, currency, status, purchased_at, stripe_charge_id, last_receipt_sent_at",
      )
      .eq("user_id", user.id)
      .in("product_key", RECEIPT_PRODUCT_KEYS)
      .order("purchased_at", { ascending: false });

    if (error) {
      console.error("[User Purchases API] DB error:", error);
      return NextResponse.json({ error: "購入履歴を取得できませんでした。" }, { status: 500 });
    }

    const purchases = await Promise.all(
      ((data ?? []) as PurchaseRow[]).map(async (purchase) => {
        let receiptUrl: string | null = null;
        if (purchase.stripe_charge_id && purchase.status !== "disputed") {
          try {
            const charge = await stripe.charges.retrieve(purchase.stripe_charge_id);
            receiptUrl = charge.receipt_url;
          } catch (error) {
            console.error(
              `[User Purchases API] Stripe charge lookup failed: ${purchase.stripe_charge_id}`,
              error,
            );
          }
        }

        return {
          id: purchase.id,
          productName: purchase.product_name,
          amountTotal: purchase.amount_total,
          currency: purchase.currency,
          status: purchase.status,
          purchasedAt: purchase.purchased_at,
          receiptUrl,
          canResend: Boolean(purchase.stripe_charge_id && purchase.status !== "disputed"),
          lastReceiptSentAt: purchase.last_receipt_sent_at,
        };
      }),
    );

    return NextResponse.json({
      purchases,
      destinationEmail: maskEmail(user.email),
    });
  } catch (error) {
    console.error("[User Purchases API] Unhandled error:", error);
    return NextResponse.json({ error: "購入履歴を取得できませんでした。" }, { status: 500 });
  }
}
