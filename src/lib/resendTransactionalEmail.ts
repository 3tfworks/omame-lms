import "server-only";

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
  idempotencyKey: string;
  category: string;
};

type ResendResponse = {
  id?: string;
  message?: string;
  name?: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function requiredEnv(name: "RESEND_API_KEY" | "EMAIL_FROM" | "EMAIL_REPLY_TO") {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

export async function sendTransactionalEmail(input: SendEmailInput) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${requiredEnv("RESEND_API_KEY")}`,
      "Content-Type": "application/json",
      "Idempotency-Key": input.idempotencyKey,
    },
    body: JSON.stringify({
      from: requiredEnv("EMAIL_FROM"),
      reply_to: requiredEnv("EMAIL_REPLY_TO"),
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
      tags: [{ name: "category", value: input.category }],
    }),
  });

  const result = (await response.json().catch(() => ({}))) as ResendResponse;
  if (!response.ok || !result.id) {
    throw new Error(
      `Resend ${response.status}: ${result.message || result.name || "email_send_failed"}`,
    );
  }
  return result.id;
}

export async function sendPurchaseEmailFailureAlert(input: {
  checkoutSessionId: string;
  customerEmail: string;
  errorMessage: string;
}) {
  const alertEmail = process.env.ADMIN_ALERT_EMAIL?.trim();
  if (!alertEmail) return;

  const subject = "【要確認】購入案内メールを送信できませんでした";
  const text = `購入処理は完了しましたが、購入・ログイン案内メールを送信できませんでした。

購入者メール：${input.customerEmail}
Stripe Checkout Session：${input.checkoutSessionId}
エラー：${input.errorMessage}

再決済は案内せず、ログインサポート画面で顧客登録とメール配信状況を確認してください。`;

  try {
    await sendTransactionalEmail({
      to: alertEmail,
      subject,
      text,
      html: `<p>購入処理は完了しましたが、購入・ログイン案内メールを送信できませんでした。</p><ul><li>購入者メール：${escapeHtml(input.customerEmail)}</li><li>Stripe Checkout Session：${escapeHtml(input.checkoutSessionId)}</li><li>エラー：${escapeHtml(input.errorMessage)}</li></ul><p><strong>再決済は案内せず</strong>、ログインサポート画面で顧客登録とメール配信状況を確認してください。</p>`,
      idempotencyKey: `purchase-email-failure/${input.checkoutSessionId}`,
      category: "purchase_email_failure",
    });
  } catch (alertError) {
    console.error("[Purchase Email] Could not send admin alert:", alertError);
  }
}

export async function sendAffiliateEmailFallbackAlert(input: {
  checkoutSessionId: string;
  customerEmail: string;
  referrerId: string;
  leadId: string;
  paymentAmount: number;
}) {
  const alertEmail = process.env.ADMIN_ALERT_EMAIL?.trim();
  if (!alertEmail) {
    console.warn("[Affiliate Attribution] ADMIN_ALERT_EMAIL is not configured");
    return;
  }

  const subject = "【要確認】紹介購入をメール照合で復元しました";
  const amount = `￥${input.paymentAmount.toLocaleString("ja-JP")}`;
  const text = `紹介情報がStripe Checkoutに無かったため、購入者メールと招待記録の照合で紹介関係を復元しました。

購入者メール：${input.customerEmail}
紹介者ID：${input.referrerId}
招待記録ID：${input.leadId}
決済額：${amount}
Stripe Checkout Session：${input.checkoutSessionId}

紹介割引が適用されていない可能性があります。Stripeの決済額と管理画面の報酬を確認してください。`;

  try {
    await sendTransactionalEmail({
      to: alertEmail,
      subject,
      text,
      html: `<p>紹介情報がStripe Checkoutに無かったため、購入者メールと招待記録の照合で紹介関係を復元しました。</p><ul><li>購入者メール：${escapeHtml(input.customerEmail)}</li><li>紹介者ID：${escapeHtml(input.referrerId)}</li><li>招待記録ID：${escapeHtml(input.leadId)}</li><li>決済額：${escapeHtml(amount)}</li><li>Stripe Checkout Session：${escapeHtml(input.checkoutSessionId)}</li></ul><p><strong>紹介割引が適用されていない可能性があります。</strong> Stripeの決済額と管理画面の報酬を確認してください。</p>`,
      idempotencyKey: `affiliate-email-fallback/${input.checkoutSessionId}`,
      category: "affiliate_email_fallback",
    });
  } catch (alertError) {
    console.error("[Affiliate Attribution] Could not send admin alert:", alertError);
  }
}
