import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const RESEND_INTERVAL_MS = 60_000;
const RECEIPT_PRODUCT_KEYS = ["omame_basic", "omame_basic_salon"];

function requestIsSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return Boolean(origin && origin === new URL(request.url).origin);
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!requestIsSameOrigin(request)) {
    return NextResponse.json({ error: "不正なリクエストです。" }, { status: 403 });
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user?.email || !user.email_confirmed_at) {
    return NextResponse.json({ error: "ログインを確認できませんでした。" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: "購入情報を確認できませんでした。" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: purchase, error: purchaseError } = await admin
    .from("purchase_records")
    .select("id, user_id, stripe_charge_id, status, last_receipt_sent_at")
    .eq("id", id)
    .eq("user_id", user.id)
    .in("product_key", RECEIPT_PRODUCT_KEYS)
    .maybeSingle();

  if (purchaseError || !purchase) {
    return NextResponse.json({ error: "対象の購入情報が見つかりません。" }, { status: 404 });
  }
  if (!purchase.stripe_charge_id || purchase.status === "disputed") {
    return NextResponse.json(
      { error: "この決済は自動再送できません。事務局へお問い合わせください。" },
      { status: 409 },
    );
  }

  const now = new Date();
  const resendCutoff = new Date(now.getTime() - RESEND_INTERVAL_MS).toISOString();
  const sentAt = now.toISOString();
  const { data: claimedPurchase, error: claimError } = await admin
    .from("purchase_records")
    .update({ last_receipt_sent_at: sentAt, updated_at: sentAt })
    .eq("id", purchase.id)
    .eq("user_id", user.id)
    .or(`last_receipt_sent_at.is.null,last_receipt_sent_at.lte.${resendCutoff}`)
    .select("id")
    .maybeSingle();

  if (claimError) {
    console.error("[Receipt Resend API] Rate-limit claim failed:", claimError);
    return NextResponse.json(
      { error: "領収書を再送できませんでした。時間を置いてもう一度お試しください。" },
      { status: 500 },
    );
  }
  if (!claimedPurchase) {
    return NextResponse.json(
      { error: "領収書は送信済みです。1分ほど待ってからメールをご確認ください。" },
      { status: 429 },
    );
  }

  try {
    await stripe.charges.update(purchase.stripe_charge_id, {
      receipt_email: user.email,
    });

    const { error: logError } = await admin.from("purchase_receipt_logs").insert({
      purchase_record_id: purchase.id,
      user_id: user.id,
      destination_email: user.email,
      result: "success",
    });
    if (logError) console.error("[Receipt Resend API] Success log failed:", logError);

    return NextResponse.json({
      message: "現在の登録メールアドレスへ領収書を再送しました。",
      sentAt,
    });
  } catch (error) {
    console.error("[Receipt Resend API] Stripe update failed:", error);
    await admin.from("purchase_receipt_logs").insert({
      purchase_record_id: purchase.id,
      user_id: user.id,
      destination_email: user.email,
      result: "failure",
      detail: error instanceof Error ? error.message.slice(0, 500) : "unknown_error",
    });
    return NextResponse.json(
      { error: "領収書を再送できませんでした。時間を置いてもう一度お試しください。" },
      { status: 502 },
    );
  }
}
