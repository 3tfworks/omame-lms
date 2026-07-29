"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  FileText,
  Loader2,
  Mail,
  ReceiptText,
} from "lucide-react";

type Purchase = {
  id: string;
  productName: string;
  amountTotal: number;
  currency: string;
  status: "paid" | "partially_refunded" | "refunded" | "disputed";
  purchasedAt: string;
  receiptUrl: string | null;
  canResend: boolean;
};

const statusLabels: Record<Purchase["status"], string> = {
  paid: "お支払い済み",
  partially_refunded: "一部返金済み",
  refunded: "返金済み",
  disputed: "確認が必要",
};

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: currency.toLowerCase() === "jpy" ? 0 : 2,
  }).format(amount);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [destinationEmail, setDestinationEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [messages, setMessages] = useState<
    Record<string, { type: "success" | "error"; text: string }>
  >({});

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch("/api/user/purchases");
        const data = await response.json().catch(() => null);
        if (!response.ok) {
          setLoadError(data?.error || "購入履歴を読み込めませんでした。");
          return;
        }
        setPurchases(data.purchases || []);
        setDestinationEmail(data.destinationEmail || "");
      } catch {
        setLoadError("通信エラーが発生しました。時間を置いてもう一度お試しください。");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const resendReceipt = async (purchaseId: string) => {
    setSendingId(purchaseId);
    setMessages((current) => {
      const next = { ...current };
      delete next[purchaseId];
      return next;
    });
    try {
      const response = await fetch(`/api/user/purchases/${purchaseId}/resend-receipt`, {
        method: "POST",
      });
      const data = await response.json().catch(() => null);
      setMessages((current) => ({
        ...current,
        [purchaseId]: {
          type: response.ok ? "success" : "error",
          text:
            data?.message ||
            data?.error ||
            "領収書を再送できませんでした。時間を置いてもう一度お試しください。",
        },
      }));
    } catch {
      setMessages((current) => ({
        ...current,
        [purchaseId]: {
          type: "error",
          text: "通信エラーが発生しました。時間を置いてもう一度お試しください。",
        },
      }));
    } finally {
      setSendingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      <header className="rounded-2xl border border-amber-100 bg-gradient-to-br from-white to-amber-50 p-6 shadow-sm md:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
            <ReceiptText className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold tracking-wider text-amber-700">PURCHASES & RECEIPTS</p>
            <h1 className="mt-1 text-2xl font-bold text-stone-900 md:text-3xl">購入履歴・領収書</h1>
            <p className="mt-3 text-sm leading-relaxed text-stone-600">
              ご購入内容の確認と、Stripeが発行する領収書の表示・再送ができます。
            </p>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex min-h-48 items-center justify-center rounded-2xl border border-stone-200 bg-white">
          <Loader2 className="h-6 w-6 animate-spin text-amber-700" />
          <span className="ml-3 text-stone-600">購入履歴を確認しています</span>
        </div>
      ) : loadError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
          <p className="flex items-center gap-2 font-bold">
            <AlertCircle className="h-5 w-5" />
            {loadError}
          </p>
        </div>
      ) : purchases.length === 0 ? (
        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-stone-800">購入履歴がまだ表示されていません</h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            過去の購入情報が現在のアカウントに結び付いていない場合があります。再決済はせず、事務局へご連絡ください。
          </p>
          <a
            href="https://lin.ee/RmeCAtQ"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-stone-800 px-5 text-sm font-bold text-white transition-colors hover:bg-stone-700"
          >
            事務局へ問い合わせる
          </a>
        </section>
      ) : (
        <div className="space-y-4">
          {purchases.map((purchase) => {
            const message = messages[purchase.id];
            return (
              <article
                key={purchase.id}
                className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm md:p-6"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-stone-500">
                      <FileText className="h-4 w-4" />
                      {formatDate(purchase.purchasedAt)}
                    </div>
                    <h2 className="mt-2 text-lg font-bold leading-relaxed text-stone-900">
                      {purchase.productName}
                    </h2>
                    <p className="mt-1 text-xl font-bold text-stone-800">
                      {formatAmount(purchase.amountTotal, purchase.currency)}
                    </p>
                  </div>
                  <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                    {statusLabels[purchase.status]}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {purchase.receiptUrl ? (
                    <a
                      href={purchase.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-stone-800 px-4 text-sm font-bold text-white transition-colors hover:bg-stone-700"
                    >
                      <ExternalLink className="h-4 w-4" />
                      領収書を開く
                    </a>
                  ) : (
                    <div className="inline-flex min-h-11 items-center justify-center rounded-xl bg-stone-100 px-4 text-sm font-bold text-stone-400">
                      領収書を表示できません
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => resendReceipt(purchase.id)}
                    disabled={!purchase.canResend || sendingId === purchase.id}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 text-sm font-bold text-amber-900 transition-colors hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {sendingId === purchase.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Mail className="h-4 w-4" />
                    )}
                    登録メールへ再送
                  </button>
                </div>

                {message ? (
                  <p
                    className={`mt-4 flex items-start gap-2 rounded-xl p-3 text-sm font-bold ${
                      message.type === "success"
                        ? "bg-emerald-50 text-emerald-800"
                        : "bg-red-50 text-red-800"
                    }`}
                  >
                    {message.type === "success" ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                    ) : (
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    )}
                    {message.text}
                  </p>
                ) : null}
              </article>
            );
          })}
        </div>
      )}

      <aside className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5 md:p-6">
        <h2 className="font-bold text-stone-800">領収書のリンクが開けない場合</h2>
        <p className="mt-2 text-sm leading-relaxed text-stone-600">
          Stripeの領収書リンクは、安全上の理由により30日で期限切れになります。その場合は「登録メールへ再送」を押してください。
          現在の登録メールアドレス（{destinationEmail || "確認中"}）へ、新しい領収書メールをお送りします。
        </p>
        <p className="mt-3 text-xs leading-relaxed text-stone-500">
          登録メールアドレスを変更したい場合や、購入履歴が表示されない場合は、事務局へお問い合わせください。
        </p>
        <Link
          href="/ja/lms/mypage"
          className="mt-4 inline-flex text-sm font-bold text-amber-800 underline underline-offset-4"
        >
          登録情報を確認する
        </Link>
      </aside>
    </div>
  );
}
