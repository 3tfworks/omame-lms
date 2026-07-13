"use client";

import { FormEvent, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clipboard,
  Clock3,
  CreditCard,
  KeyRound,
  Loader2,
  Mail,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  UserCheck,
  UserX,
} from "lucide-react";

type DiagnosisLevel = "ok" | "customer" | "office" | "system";

type SupportData = {
  requester: {
    role: string;
    isAdmin: boolean;
    canResend: boolean;
    canManageAgents: boolean;
  };
  customer: {
    email: string;
    profile: null | {
      id: string;
      email: string;
      role: string;
      legal_name: string | null;
      display_name: string | null;
      created_at: string;
      updated_at: string | null;
    };
    auth: null | {
      id: string;
      createdAt: string;
      confirmationSentAt: string | null;
      emailConfirmedAt: string | null;
      lastSignInAt: string | null;
      updatedAt: string | null;
      deletedAt: string | null;
      bannedUntil: string | null;
    };
    emailEvents: Array<{
      provider_event_id: string;
      provider_email_id: string | null;
      event_type: string;
      email_kind: string;
      occurred_at: string;
      failure_reason: string | null;
    }>;
    callbackEvents: Array<{
      outcome: string;
      error_code: string | null;
      request_host: string | null;
      created_at: string;
    }>;
    supportActions: Array<{
      action: string;
      result: string;
      detail: string | null;
      created_at: string;
      actor_user_id: string | null;
    }>;
    supportAgent: null | {
      enabled: boolean;
      can_view_auth_status: boolean;
      can_resend_login_email: boolean;
      can_repair_profile: boolean;
    };
  };
  diagnosis: {
    code: string;
    level: DiagnosisLevel;
    title: string;
    detail: string;
    nextAction: string;
  };
  trackingConfigured: boolean;
  stripeLookup: {
    configured: boolean;
    available: boolean;
    payments: Array<{
      checkoutSessionId: string;
      paymentIntentId: string | null;
      status: "succeeded" | "unpaid" | "three_d_secure_failed" | "expired";
      sessionStatus: "open" | "complete" | "expired" | null;
      paymentStatus: "paid" | "unpaid" | "no_payment_required";
      paymentIntentStatus: string | null;
      amountTotal: number | null;
      currency: string | null;
      productType: "general" | "salon" | null;
      createdAt: string;
      expiresAt: string | null;
    }>;
  };
};

const diagnosisStyles: Record<DiagnosisLevel, string> = {
  ok: "border-emerald-200 bg-emerald-50 text-emerald-800",
  customer: "border-amber-200 bg-amber-50 text-amber-900",
  office: "border-sky-200 bg-sky-50 text-sky-900",
  system: "border-rose-200 bg-rose-50 text-rose-900",
};

const diagnosisLabels: Record<DiagnosisLevel, string> = {
  ok: "正常・案内対応",
  customer: "顧客の確認待ち",
  office: "事務担当で対応可能",
  system: "システム調査が必要",
};

const emailEventLabels: Record<string, string> = {
  "email.sent": "送信受付",
  "email.delivered": "配信先サーバーへ到達",
  "email.delivery_delayed": "配信遅延",
  "email.failed": "送信失敗",
  "email.bounced": "受信拒否",
  "email.suppressed": "配信抑止",
  "email.opened": "開封検知",
  "email.clicked": "リンククリック検知",
};

const stripeStatusLabels: Record<SupportData["stripeLookup"]["payments"][number]["status"], string> = {
  succeeded: "決済成功",
  unpaid: "未払い",
  three_d_secure_failed: "3Dセキュア失敗",
  expired: "期限切れ",
};

const stripeStatusStyles: Record<SupportData["stripeLookup"]["payments"][number]["status"], string> = {
  succeeded: "bg-emerald-100 text-emerald-800",
  unpaid: "bg-amber-100 text-amber-900",
  three_d_secure_failed: "bg-rose-100 text-rose-800",
  expired: "bg-stone-200 text-stone-700",
};

const stripeStatusDetails: Record<SupportData["stripeLookup"]["payments"][number]["status"], string> = {
  succeeded: "Stripeで支払いが完了しています。",
  unpaid: "支払いはまだ成立していません。",
  three_d_secure_failed: "本人認証が完了していません。認証失敗・途中中断を含みます。",
  expired: "決済画面の有効期限が切れ、支払いは成立していません。",
};

const stripeNextActions: Record<SupportData["stripeLookup"]["payments"][number]["status"], string> = {
  succeeded: "顧客登録とログインメールの状態を続けて確認",
  unpaid: "決済を最後まで完了するか、購入画面から再度手続きするよう案内",
  three_d_secure_failed: "購入画面から再決済し、カード会社の本人認証まで完了するよう案内",
  expired: "購入画面からもう一度決済するよう案内",
};

function formatDate(value: string | null | undefined) {
  if (!value) return "記録なし";
  return new Date(value).toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatAmount(amount: number | null, currency: string | null) {
  if (amount === null || !currency) return "金額不明";
  try {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: currency.toUpperCase(),
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString("ja-JP")} ${currency.toUpperCase()}`;
  }
}

function StatusItem({ label, value, ok }: { label: string; value: string; ok?: boolean }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3">
      <p className="text-xs font-bold text-stone-400">{label}</p>
      <p className={`mt-1 text-sm font-bold ${ok === true ? "text-emerald-700" : ok === false ? "text-rose-700" : "text-stone-700"}`}>
        {value}
      </p>
    </div>
  );
}

export function LoginSupportConsole() {
  const [email, setEmail] = useState("");
  const [data, setData] = useState<SupportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const search = async (targetEmail = email) => {
    const normalized = targetEmail.trim().toLowerCase();
    if (!normalized) return;
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/support/users?email=${encodeURIComponent(normalized)}`, {
        cache: "no-store",
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.error || "顧客情報を取得できませんでした。");
      setData(result);
      setEmail(normalized);
    } catch (fetchError) {
      setData(null);
      setError(fetchError instanceof Error ? fetchError.message : "通信エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void search();
  };

  const resendLoginEmail = async () => {
    if (!data || !window.confirm(`${data.customer.email} 宛にログインメールを再送します。よろしいですか？`)) return;
    setActionLoading("resend");
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/support/resend-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.customer.email }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.error || "再送に失敗しました。");
      await search(data.customer.email);
      setNotice(result.message);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "再送に失敗しました。");
    } finally {
      setActionLoading("");
    }
  };

  const updateSupportAccess = async (enabled: boolean) => {
    if (!data) return;
    const verb = enabled ? "付与" : "停止";
    if (!window.confirm(`${data.customer.email} の事務担当アクセスを${verb}します。よろしいですか？`)) return;
    setActionLoading("agent");
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/support-agents", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.customer.email, enabled, canResend: true }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.error || `アクセスの${verb}に失敗しました。`);
      await search(data.customer.email);
      setNotice(result.message);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : `アクセスの${verb}に失敗しました。`);
    } finally {
      setActionLoading("");
    }
  };

  const copyReply = async () => {
    if (!data) return;
    const paymentIssue = ["three_d_secure_failed", "checkout_expired", "payment_unpaid"].includes(
      data.diagnosis.code,
    );
    const guidance = paymentIssue
      ? "恐れ入りますが、購入画面からもう一度お手続きいただき、カード会社の本人認証画面まで完了してください。"
      : "ログインに関するメール（件名「【おうちで学べるお豆奏法基礎講座】ログイン用リンクのご案内」）が届いているか、受信トレイと迷惑メールフォルダをご確認ください。メール内の最新のログインリンクを、LINE内ブラウザではなくSafariまたはChromeで開いてください。";
    const reply = `${data.customer.email} 様\n\nお問い合わせありがとうございます。\n${data.diagnosis.detail}\n\n${guidance}`;
    await navigator.clipboard.writeText(reply);
    setNotice("案内文をコピーしました。");
  };

  const profileRole = data?.customer.profile?.role;
  const canToggleAgent = data?.requester.canManageAgents && data.customer.auth && profileRole !== "owner" && profileRole !== "admin";

  return (
    <div className="space-y-6 pb-12">
      <header className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-omame-gold">Login Support</p>
        <h2 className="text-2xl font-bold text-omame-deep">ログインサポート</h2>
        <p className="text-sm leading-relaxed text-stone-500">
          登録状態・最終ログイン・メール配信状況をまとめて確認し、問い合わせの原因を切り分けます。
        </p>
      </header>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-omame-gold/20 bg-white p-4 shadow-sm">
        <label htmlFor="support-email" className="mb-2 block text-sm font-bold text-stone-700">
          顧客のメールアドレス
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
            <input
              id="support-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="customer@example.com"
              className="h-12 w-full rounded-xl border border-stone-200 bg-stone-50 pl-11 pr-4 text-sm outline-none focus:border-omame-gold focus:bg-white focus:ring-2 focus:ring-omame-gold/20"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-stone-900 px-6 font-bold text-white transition-colors hover:bg-stone-700 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
            状況を確認
          </button>
        </div>
      </form>

      {error && (
        <div role="alert" className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          {error}
        </div>
      )}
      {notice && (
        <div role="status" className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          {notice}
        </div>
      )}

      {data && (
        <>
          <section className={`rounded-2xl border p-5 ${diagnosisStyles[data.diagnosis.level]}`}>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <span className="inline-flex rounded-full bg-white/70 px-3 py-1 text-xs font-bold">
                  {diagnosisLabels[data.diagnosis.level]}
                </span>
                <h3 className="mt-3 text-xl font-bold">{data.diagnosis.title}</h3>
                <p className="mt-2 text-sm leading-relaxed opacity-90">{data.diagnosis.detail}</p>
                <p className="mt-3 text-sm font-bold">次の対応：{data.diagnosis.nextAction}</p>
              </div>
              <button
                type="button"
                onClick={() => void search(data.customer.email)}
                disabled={loading}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-current/20 bg-white/70 px-4 py-2 text-sm font-bold"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                更新
              </button>
            </div>
          </section>

          {!data.trackingConfigured && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              メール履歴テーブルがまだ利用できません。DBマイグレーションとResend Webhook設定後に配信状況が表示されます。
            </div>
          )}

          <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-omame-gold" />
                <h3 className="font-bold text-stone-800">Stripe決済状況</h3>
              </div>
              <span className="text-xs text-stone-400">最新10件</span>
            </div>

            {!data.stripeLookup.available ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                {data.stripeLookup.configured
                  ? "Stripeへの照会に失敗しました。時間をおいて更新し、続く場合はシステム担当へ連絡してください。"
                  : "Stripe秘密鍵が設定されていないため、決済状況を確認できません。"}
              </div>
            ) : data.stripeLookup.payments.length > 0 ? (
              <div className="space-y-3">
                {data.stripeLookup.payments.map((payment) => (
                  <article
                    key={payment.checkoutSessionId}
                    className="rounded-xl border border-stone-200 bg-stone-50 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-full px-3 py-1 text-xs font-bold ${stripeStatusStyles[payment.status]}`}>
                            {stripeStatusLabels[payment.status]}
                          </span>
                          <span className="text-sm font-bold text-stone-800">
                            {formatAmount(payment.amountTotal, payment.currency)}
                          </span>
                          {payment.productType && (
                            <span className="text-xs text-stone-500">
                              {payment.productType === "salon" ? "サロン価格" : "通常価格"}
                            </span>
                          )}
                        </div>
                        <p className="mt-3 text-sm text-stone-700">{stripeStatusDetails[payment.status]}</p>
                        <p className="mt-2 text-xs font-bold text-stone-600">
                          次の対応：{stripeNextActions[payment.status]}
                        </p>
                      </div>
                      <time className="shrink-0 text-xs text-stone-400">{formatDate(payment.createdAt)}</time>
                    </div>
                    <details className="mt-3 text-xs text-stone-500">
                      <summary className="cursor-pointer font-medium">システム担当向けID</summary>
                      <div className="mt-2 space-y-1 break-all rounded-lg bg-white p-3 font-mono">
                        <p>Checkout: {payment.checkoutSessionId}</p>
                        <p>PaymentIntent: {payment.paymentIntentId || "なし"}</p>
                      </div>
                    </details>
                  </article>
                ))}
              </div>
            ) : (
              <p className="rounded-xl bg-stone-50 p-4 text-sm text-stone-500">
                このメールアドレスに一致するStripe Checkoutの履歴はありません。
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-omame-gold" />
              <h3 className="font-bold text-stone-800">顧客・認証状態</h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <StatusItem label="メールアドレス" value={data.customer.email} />
              <StatusItem
                label="顧客プロフィール"
                value={data.customer.profile ? "登録あり" : "登録なし"}
                ok={Boolean(data.customer.profile)}
              />
              <StatusItem
                label="Supabase Auth"
                value={data.customer.auth ? "登録あり" : "登録なし"}
                ok={Boolean(data.customer.auth)}
              />
              <StatusItem
                label="氏名"
                value={data.customer.profile?.legal_name || data.customer.profile?.display_name || "未登録"}
              />
              <StatusItem label="会員種別" value={data.customer.profile?.role || "不明"} />
              <StatusItem label="顧客登録日" value={formatDate(data.customer.profile?.created_at)} />
              <StatusItem
                label="Auth上のメール確認状態"
                value={data.customer.auth?.emailConfirmedAt ? formatDate(data.customer.auth.emailConfirmedAt) : "未確認・記録なし"}
                ok={Boolean(data.customer.auth?.emailConfirmedAt)}
              />
              <StatusItem
                label="最終ログイン"
                value={formatDate(data.customer.auth?.lastSignInAt)}
                ok={Boolean(data.customer.auth?.lastSignInAt)}
              />
              <StatusItem
                label="利用停止"
                value={data.customer.auth?.deletedAt ? "削除状態" : data.customer.auth?.bannedUntil ? `BAN: ${formatDate(data.customer.auth.bannedUntil)}` : "なし"}
                ok={!data.customer.auth?.deletedAt && !data.customer.auth?.bannedUntil}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Send className="h-5 w-5 text-omame-gold" />
                <h3 className="font-bold text-stone-800">メール配信履歴</h3>
              </div>
              <span className="text-xs text-stone-400">最新20件</span>
            </div>
            {data.customer.emailEvents.length ? (
              <div className="space-y-2">
                {data.customer.emailEvents.map((event) => (
                  <div key={event.provider_event_id} className="flex flex-col gap-1 rounded-xl bg-stone-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-bold text-stone-700">{emailEventLabels[event.event_type] || event.event_type}</p>
                      {event.failure_reason && <p className="mt-1 text-xs text-rose-600">{event.failure_reason}</p>}
                    </div>
                    <time className="text-xs text-stone-400">{formatDate(event.occurred_at)}</time>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-xl bg-stone-50 p-4 text-sm text-stone-500">配信履歴はまだありません。</p>
            )}
          </section>

          <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-omame-gold" />
              <h3 className="font-bold text-stone-800">対応操作</h3>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={() => void resendLoginEmail()}
                disabled={!data.requester.canResend || !data.customer.auth || Boolean(actionLoading)}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-stone-900 px-5 text-sm font-bold text-white hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {actionLoading === "resend" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                ログインメールを再送
              </button>
              <button
                type="button"
                onClick={() => void copyReply()}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-5 text-sm font-bold text-stone-700 hover:bg-stone-50"
              >
                <Clipboard className="h-4 w-4" />
                顧客向け案内文をコピー
              </button>
              {canToggleAgent && (
                <button
                  type="button"
                  onClick={() => void updateSupportAccess(!data.customer.supportAgent?.enabled)}
                  disabled={Boolean(actionLoading)}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-5 text-sm font-bold text-indigo-700 hover:bg-indigo-100 disabled:opacity-40"
                >
                  {actionLoading === "agent" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : data.customer.supportAgent?.enabled ? (
                    <UserX className="h-4 w-4" />
                  ) : (
                    <ShieldCheck className="h-4 w-4" />
                  )}
                  事務担当アクセスを{data.customer.supportAgent?.enabled ? "停止" : "付与"}
                </button>
              )}
            </div>
            <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-stone-400">
              <Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              再送は60秒に1回までです。操作した担当者・対象・結果は監査ログに保存され、ログインリンク本体は保存しません。
            </p>
          </section>

          {data.customer.supportActions.length > 0 && (
            <details className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <summary className="cursor-pointer font-bold text-stone-700">対応履歴を見る</summary>
              <div className="mt-4 space-y-2">
                {data.customer.supportActions.map((action, index) => (
                  <div key={`${action.created_at}-${index}`} className="flex flex-col gap-1 border-b border-stone-100 py-2 text-sm last:border-0 sm:flex-row sm:justify-between">
                    <span className="font-medium text-stone-600">{action.action} / {action.result}</span>
                    <span className="text-xs text-stone-400">{formatDate(action.created_at)}</span>
                  </div>
                ))}
              </div>
            </details>
          )}
        </>
      )}
    </div>
  );
}
