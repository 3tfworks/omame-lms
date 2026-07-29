export type PurchaseConfirmationEmailInput = {
  customerName: string;
  productName: string;
  amount: number;
  currency: string;
  purchasedAt: Date;
  loginUrl: string;
  purchasesUrl: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: currency.toLowerCase() === "jpy" ? 0 : 2,
  }).format(amount);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function buildPurchaseConfirmationEmail(input: PurchaseConfirmationEmailInput) {
  const name = input.customerName.trim() || "お客様";
  const safeName = escapeHtml(name);
  const safeProduct = escapeHtml(input.productName);
  const safeLoginUrl = escapeHtml(input.loginUrl);
  const safePurchasesUrl = escapeHtml(input.purchasesUrl);
  const amount = formatAmount(input.amount, input.currency);
  const purchasedAt = formatDate(input.purchasedAt);
  const subject = "【おうちで学べるお豆奏法基礎講座】ご購入ありがとうございます";

  const text = `${name} 様

このたびは「${input.productName}」をご購入いただき、誠にありがとうございます。

ご購入内容
・講座名：${input.productName}
・ご購入日：${purchasedAt}
・お支払い金額：${amount}

以下のログイン用リンクから講座をご覧いただけます。
${input.loginUrl}

※ログイン用リンクには有効期限があります。
※LINE内の画面ではなく、SafariまたはChromeで開いてください。

購入履歴・領収書
${input.purchasesUrl}

正式な領収書はStripeから別のメールで届きます。領収書のリンクが期限切れになった場合は、上記の「購入履歴・領収書」画面から現在の登録メールアドレスへ再送できます。

メールが見つからない場合は、受信トレイと迷惑メールフォルダをご確認ください。
ご不明な点がございましたら、そのままこのメールへご返信ください。

お豆奏法事務局`;

  const html = `<!doctype html>
<html lang="ja">
  <body style="margin:0;background:#f7f3eb;color:#3f352a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Hiragino Sans','Yu Gothic',sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;">講座のログイン方法と購入履歴・領収書をご案内します。</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f3eb;padding:24px 12px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border:1px solid #eadfce;border-radius:18px;overflow:hidden;">
          <tr><td style="background:#8b6b3e;padding:24px 28px;color:#ffffff;">
            <div style="font-size:13px;letter-spacing:.12em;">おうちで学べる</div>
            <div style="margin-top:4px;font-size:22px;font-weight:700;">お豆奏法基礎講座</div>
          </td></tr>
          <tr><td style="padding:30px 28px;">
            <p style="margin:0 0 20px;font-size:16px;line-height:1.9;">${safeName} 様</p>
            <p style="margin:0 0 24px;font-size:16px;line-height:1.9;">このたびは「${safeProduct}」をご購入いただき、誠にありがとうございます。</p>

            <div style="margin:0 0 26px;padding:18px;background:#faf7f1;border-radius:12px;font-size:14px;line-height:1.9;">
              <strong>ご購入内容</strong><br>
              講座名：${safeProduct}<br>
              ご購入日：${purchasedAt}<br>
              お支払い金額：${amount}
            </div>

            <p style="margin:0 0 16px;font-size:15px;line-height:1.8;">下のボタンから講座へログインしていただけます。</p>
            <p style="margin:0 0 14px;text-align:center;">
              <a href="${safeLoginUrl}" style="display:inline-block;background:#8b6b3e;color:#ffffff;text-decoration:none;font-weight:700;padding:14px 28px;border-radius:10px;">講座へログインする</a>
            </p>
            <p style="margin:0 0 28px;color:#74695d;font-size:12px;line-height:1.8;text-align:center;">ログイン用リンクには有効期限があります。<br>LINE内の画面ではなく、SafariまたはChromeで開いてください。</p>

            <div style="border-top:1px solid #eadfce;padding-top:24px;">
              <p style="margin:0 0 12px;font-size:15px;font-weight:700;">購入履歴・領収書</p>
              <p style="margin:0 0 14px;font-size:14px;line-height:1.8;">正式な領収書はStripeから別のメールで届きます。期限切れの場合も、購入履歴画面から現在の登録メールアドレスへ再送できます。</p>
              <p style="margin:0 0 24px;"><a href="${safePurchasesUrl}" style="color:#8b6b3e;font-weight:700;">購入履歴・領収書を確認する</a></p>
            </div>

            <p style="margin:0;font-size:13px;line-height:1.9;color:#74695d;">メールが見つからない場合は、受信トレイと迷惑メールフォルダをご確認ください。<br>ご不明な点がございましたら、そのままこのメールへご返信ください。</p>
          </td></tr>
          <tr><td style="background:#faf7f1;padding:20px 28px;color:#74695d;font-size:12px;line-height:1.7;">お豆奏法事務局<br><a href="https://www.omamepiano.com" style="color:#8b6b3e;">www.omamepiano.com</a></td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

  return { subject, text, html };
}
