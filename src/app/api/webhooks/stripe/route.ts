import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/utils/supabase/admin";
import { getAffiliateRewardRate } from "@/lib/affiliateRate";
import { findAuthUserByEmail } from "@/lib/authUsers";
import { getPurchaseRole } from "@/lib/purchaseRole";
import { getValidReferrer } from "@/lib/invite";
import { getAffiliateAttributionCutoff } from "@/lib/affiliateAttribution";
import crypto from "crypto";

// Stripe Webhook 受信エンドポイント。
//
// - Stripe-Signature ヘッダーで署名検証（STRIPE_WEBHOOK_SECRET は後で登録するので参照のみ）
// - event.type で分岐できる構造（将来サブスク: invoice.paid / customer.subscription.* 等を追加する）
// - checkout.session.completed:
//     a. Supabase Auth でユーザー作成（既存ならスキップ）
//     b. public.users に INSERT（サロン価格購入は "salon_member"、通常購入は "user"）
//     c. metadata.referrer_id があればアフィリエイト報酬を記録
//     d. referrer_id が無い場合は email で invite_leads を検索してフォールバック
//     e. Magic Link を送信
//
// ※既存の会費ペイ Webhook (/api/webhooks/kaihipay) はそのまま残し、本エンドポイントと並行運用する。

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    // シークレット未登録の段階では検証できないため拒否する（後で Vercel に登録予定）
    console.error("[Stripe Webhook] Missing STRIPE_WEBHOOK_SECRET");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    console.warn("[Stripe Webhook] Missing Stripe-Signature header");
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  // 署名検証には生のリクエストボディが必要（JSON パース前）
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("[Stripe Webhook] Signature verification failed:", (err as Error).message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    // イベント種別で分岐（将来サブスク対応時はここに case を追加）
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        // 単発購入(payment)のみ処理。サブスク初回も completed が来るが、ここでは payment に限定。
        if (session.mode === "payment") {
          await handleCheckoutCompleted(session, event.id);
        } else {
          console.log(`[Stripe Webhook] Skipping checkout.session.completed (mode: ${session.mode})`);
        }
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId = getStripeId(charge.payment_intent);
        if (paymentIntentId) {
          await cancelAffiliateReward(paymentIntentId, "購入者への返金のため");
        }
        break;
      }
      case "charge.dispute.created": {
        const dispute = event.data.object as Stripe.Dispute;
        const chargeId = getStripeId(dispute.charge);
        if (chargeId) {
          const charge = await stripe.charges.retrieve(chargeId);
          const paymentIntentId = getStripeId(charge.payment_intent);
          if (paymentIntentId) {
            await cancelAffiliateReward(paymentIntentId, "カード会社による支払いの取消のため");
          }
        }
        break;
      }
      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("[Stripe Webhook] Unhandled error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

function getStripeId(value: string | { id: string } | null): string | null {
  if (typeof value === "string") return value;
  return value?.id ?? null;
}

async function cancelAffiliateReward(paymentIntentId: string, reason: string) {
  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin
    .from("affiliate_rewards")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      cancellation_reason: reason,
    })
    .eq("stripe_payment_intent_id", paymentIntentId)
    .neq("status", "cancelled");
  if (error) throw error;
  console.log(
    `[Stripe Webhook] Affiliate reward cancelled: payment_intent=${paymentIntentId}, reason=${reason}`,
  );
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session, eventId: string) {
  const email = session.customer_details?.email || session.customer_email;
  const name = session.customer_details?.name || "受講生";
  const referrerIdFromMeta =
    typeof session.metadata?.referrer_id === "string" && session.metadata.referrer_id.trim()
      ? session.metadata.referrer_id.trim()
      : undefined;
  // JPY はゼロ十進通貨なので amount_total はそのまま「円」
  const paymentAmount = session.amount_total ?? 0;
  const referralDiscountPercent = session.metadata?.referral_discount_percent;
  const discountAmount = session.total_details?.amount_discount ?? 0;

  if (referralDiscountPercent) {
    if (referralDiscountPercent !== "10" || discountAmount <= 0) {
      console.error(
        `[Stripe Webhook] Referral discount mismatch: session=${session.id}, percent=${referralDiscountPercent}, amount=${discountAmount}`,
      );
    } else {
      console.log(
        `[Stripe Webhook] Referral discount applied: session=${session.id}, amount=${discountAmount}, paid=${paymentAmount}`,
      );
    }
  }

  if (!email) {
    console.error("[Stripe Webhook] checkout.session.completed without email:", session.id);
    return;
  }

  const supabaseAdmin = createAdminClient();
  const purchaseRole = getPurchaseRole(session.metadata?.price_type);

  // 1. 既存ユーザーかチェック（listUsers を全ページ走査。50名超でも取りこぼさない）
  const existing = await findAuthUserByEmail(supabaseAdmin, email);
  let userId: string;

  if (existing) {
    console.log(`[Stripe Webhook] User already exists: ${email}`);
    userId = existing.id;
  } else {
    // 2. 新規ユーザー作成（Auth）
    const randomPassword = crypto.randomBytes(16).toString("hex") + "aA1!";
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: randomPassword,
      email_confirm: true,
      user_metadata: { full_name: name },
    });

    if (authError || !authData.user) {
      console.error("[Stripe Webhook] Error creating auth user:", authError);
      throw authError ?? new Error("Failed to create user");
    }
    userId = authData.user.id;
  }

  // 3. public.users を upsert（onConflict: id）。
  //    新規・既存にかかわらず毎回実行し、「auth はあるが public.users が欠落」状態を
  //    再処理で自己修復できるようにする。新規のサロン価格購入者は salon_member で登録する。
  //    既存行はまず DO NOTHING とし、サロン価格購入時だけ user → salon_member に昇格する。
  //    owner / admin / instructor / 既存 salon_member などの権限は上書きしない。
  const { error: dbError } = await supabaseAdmin
    .from("users")
    .upsert({ id: userId, email, role: purchaseRole }, { onConflict: "id", ignoreDuplicates: true });

  if (dbError) {
    console.error("[Stripe Webhook] Error upserting public.users:", dbError);
    throw dbError;
  }

  if (purchaseRole === "salon_member") {
    const { error: upgradeError } = await supabaseAdmin
      .from("users")
      .update({ role: "salon_member" })
      .eq("id", userId)
      .eq("role", "user");

    if (upgradeError) {
      console.error("[Stripe Webhook] Error upgrading salon member role:", upgradeError);
      throw upgradeError;
    }
  }

  // 4. アフィリエイト報酬の記録（失敗してもユーザー作成は成功扱い）
  // サロン経由は紹介者報酬対象外（甲斐さん 2026-06-20 確定）。price_type==="salon" の場合は
  // ① referrer_id 経由の報酬計算 ② email→invite_leads 逆引きフォールバック
  // ③ affiliate_rewards への INSERT を一切スキップする（受講登録 / Magic Link 等は通常実行）。
  if (session.metadata?.price_type === "salon") {
    console.log(
      `[Stripe Webhook] Salon purchase: affiliate reward skipped (salon は報酬対象外). session=${session.id}`,
    );
  } else try {
    let referrerId = referrerIdFromMeta;
    let leadId: string | null = null;

    // metadata に referrer_id が無ければ、決済開始前30日以内に登録された
    // invite_leads だけを email でフォールバック検索する。
    if (!referrerId) {
      const attributionCutoff = getAffiliateAttributionCutoff(
        new Date(session.created * 1000),
      ).toISOString();
      const { data: lead } = await supabaseAdmin
        .from("invite_leads")
        .select("id, referrer_id")
        .eq("email", email.trim().toLowerCase())
        .eq("converted", false)
        .gte("created_at", attributionCutoff)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (lead) {
        referrerId = lead.referrer_id;
        leadId = lead.id;
      }
    } else {
      // metadata 経由でも、対応する未コンバートのリードがあれば converted 更新対象にする
      const { data: lead } = await supabaseAdmin
        .from("invite_leads")
        .select("id")
        .eq("email", email.trim().toLowerCase())
        .eq("referrer_id", referrerId)
        .eq("converted", false)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (lead) leadId = lead.id;
    }

    if (referrerId === userId) {
      console.warn(
        `[Stripe Webhook] Self-referral reward skipped: user=${userId}, session=${session.id}`,
      );
      if (leadId) {
        await supabaseAdmin.from("invite_leads").update({ converted: true }).eq("id", leadId);
      }
    } else if (referrerId && !(await getValidReferrer(referrerId))) {
      console.warn(
        `[Stripe Webhook] Affiliate reward skipped because referrer is not currently eligible: referrer=${referrerId}, session=${session.id}`,
      );
      if (leadId) {
        await supabaseAdmin.from("invite_leads").update({ converted: true }).eq("id", leadId);
      }
    } else if (referrerId && paymentAmount > 0) {
      // 報酬率は決済成立日時（Checkout Session の作成時刻＝unix秒）を基準に判定する。
      const { rate: rewardRate } = await getAffiliateRewardRate(
        new Date(session.created * 1000),
        supabaseAdmin,
      );
      const rewardAmount = Math.floor((paymentAmount * rewardRate) / 100);

      // stripe_event_id を一意キーにして二重付与を防止（同一イベント再処理は DO NOTHING）。
      const { error: rewardError } = await supabaseAdmin.from("affiliate_rewards").upsert(
        {
          stripe_event_id: eventId,
          stripe_checkout_session_id: session.id,
          stripe_payment_intent_id: getStripeId(session.payment_intent),
          referrer_id: referrerId,
          buyer_id: userId,
          amount: rewardAmount,
          reward_rate: rewardRate,
          status: "pending",
        },
        { onConflict: "stripe_event_id", ignoreDuplicates: true },
      );

      if (rewardError) {
        console.error("[Stripe Webhook] Failed to insert affiliate reward:", rewardError);
      } else {
        if (leadId) {
          await supabaseAdmin.from("invite_leads").update({ converted: true }).eq("id", leadId);
        }
        console.log(
          `[Stripe Webhook] Affiliate reward recorded: referrer=${referrerId}, amount=${rewardAmount}, rate=${rewardRate}%`,
        );
      }
    }
  } catch (affiliateErr) {
    console.error("[Stripe Webhook] Affiliate reward step failed:", affiliateErr);
  }

  // 既存ユーザーには Magic Link を再送しない（新規のみ案内）
  if (existing) {
    console.log(`[Stripe Webhook] Processed purchase for existing user: ${email} (ID: ${userId})`);
    return;
  }

  // 5. Magic Link（ログイン案内メール）を送信
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://omamepiano.com";
  const redirectUrl = `${siteUrl}/api/auth/callback?next=/ja/lms`;

  const { error: otpError } = await supabaseAdmin.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectUrl },
  });

  if (otpError) {
    console.error("[Stripe Webhook] Error sending magic link:", otpError);
    // メール送信失敗でもユーザー作成自体は成功しているので処理は継続
  }

  if (!otpError) {
    console.log(`[Stripe Webhook] Successfully created user and requested Magic Link: ${email} (ID: ${userId})`);
  }
}
