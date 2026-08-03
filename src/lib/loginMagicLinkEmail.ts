export type LoginMagicLinkEmailInput = {
  loginUrl: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function sanitizeInternalNextPath(value: string | null | undefined) {
  if (!value?.startsWith("/") || value.startsWith("//")) return "/ja/lms";
  return value;
}

export function buildBrowserIndependentLoginUrl(input: {
  siteUrl: string;
  tokenHash: string;
  next?: string;
}) {
  const siteUrl = input.siteUrl.replace(/\/+$/, "");
  const loginUrl = new URL("/ja/login/confirm", siteUrl);
  loginUrl.searchParams.set("token_hash", input.tokenHash);
  loginUrl.searchParams.set("next", sanitizeInternalNextPath(input.next));
  return loginUrl.toString();
}

export function buildLoginMagicLinkEmail(input: LoginMagicLinkEmailInput) {
  const safeLoginUrl = escapeHtml(input.loginUrl);
  const subject = "【おうちで学べるお豆奏法基礎講座】ログイン用リンクのご案内";
  const text = `お豆奏法基礎講座へのログインを受け付けました。

以下のリンクを開き、画面の「ログインを続ける」ボタンを押してください。
${input.loginUrl}

※このリンクには有効期限があり、一度だけ使用できます。
※LINE内の画面で開いた場合は、右上の「↗」などからSafariまたはChromeで開き直してください。
※このメールに心当たりがない場合は、そのまま破棄してください。

お豆奏法事務局`;

  const html = `<!doctype html>
<html lang="ja">
  <body style="margin:0;background:#f7f3eb;color:#3f352a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Hiragino Sans','Yu Gothic',sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;">お豆奏法基礎講座へのログインをご案内します。</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f3eb;padding:24px 12px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border:1px solid #eadfce;border-radius:18px;overflow:hidden;">
          <tr><td style="background:#8b6b3e;padding:24px 28px;color:#ffffff;">
            <div style="font-size:13px;letter-spacing:.12em;">おうちで学べる</div>
            <div style="margin-top:4px;font-size:22px;font-weight:700;">お豆奏法基礎講座</div>
          </td></tr>
          <tr><td style="padding:30px 28px;">
            <p style="margin:0 0 18px;font-size:16px;line-height:1.9;">ログインを受け付けました。</p>
            <p style="margin:0 0 20px;font-size:15px;line-height:1.9;">下のボタンを押して開いた画面で、もう一度「ログインを続ける」を押してください。</p>
            <p style="margin:0 0 18px;text-align:center;">
              <a href="${safeLoginUrl}" style="display:inline-block;background:#8b6b3e;color:#ffffff;text-decoration:none;font-weight:700;padding:14px 28px;border-radius:10px;">ログイン画面を開く</a>
            </p>
            <p style="margin:0 0 20px;color:#74695d;font-size:12px;line-height:1.8;text-align:center;">このリンクには有効期限があり、一度だけ使用できます。</p>
            <div style="margin:0 0 22px;padding:16px;background:#faf7f1;border-radius:12px;color:#65594d;font-size:13px;line-height:1.8;">
              LINE内の画面で開いた場合は、右上の「↗」などからSafariまたはChromeで開き直してください。ブラウザを切り替えても、このリンクはお使いいただけます。
            </div>
            <p style="margin:0;font-size:12px;line-height:1.8;color:#74695d;">このメールに心当たりがない場合は、そのまま破棄してください。</p>
          </td></tr>
          <tr><td style="background:#faf7f1;padding:20px 28px;color:#74695d;font-size:12px;line-height:1.7;">お豆奏法事務局<br><a href="https://www.omamepiano.com" style="color:#8b6b3e;">www.omamepiano.com</a></td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

  return { subject, text, html };
}
