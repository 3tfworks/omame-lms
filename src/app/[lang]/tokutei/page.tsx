import Link from "next/link";
import { isValidLocale } from "@/lib/i18n";
import { BUSINESS_INFO } from "@/lib/businessInfo";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "特定商取引法に基づく表記 | OMAME SOHO LAB.",
};

// 特定商取引法に基づく表記の項目（和文中心・3ロケール共通）
const ITEMS: { label: string; value: string }[] = [
  { label: "事業者の名称", value: BUSINESS_INFO.name },
  { label: "運営統括責任者", value: BUSINESS_INFO.manager },
  { label: "所在地", value: BUSINESS_INFO.address },
  { label: "電話番号", value: BUSINESS_INFO.phone },
  { label: "メールアドレス", value: BUSINESS_INFO.email },
  { label: "販売価格", value: "各商品の販売ページに表示の金額（税込）" },
  { label: "商品代金以外の必要料金", value: "なし（決済手数料等は当方負担）" },
  {
    label: "支払方法",
    value:
      "・クレジットカード決済（Visa / Mastercard / JCB / American Express / Diners Club / Discover）\n・会費ペイ（口座振替・コンビニ決済等、サロン会費のみ）",
  },
  {
    label: "代金支払時期",
    value:
      "・クレジットカード決済：商品申込時に即時決済\n・会費ペイ：各決済方法の規定に準じます",
  },
  {
    label: "商品引渡時期",
    value:
      "決済完了後、ログイン用URL（Magic Link）をメールにて送付し、即時に動画コンテンツをご視聴いただけます。",
  },
  {
    label: "返品・キャンセル",
    value:
      "デジタルコンテンツの性質上、商品の返品・返金はお受けできかねます。\nただし、コンテンツに重大な欠陥がある場合はこの限りではありません。",
  },
  {
    label: "動作環境",
    value:
      "推奨ブラウザ：最新版の Google Chrome、Safari、Firefox、Microsoft Edge",
  },
];

export default async function TokuteiPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!isValidLocale(lang)) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-omame-bg text-omame-text font-serif">
      <div className="max-w-3xl mx-auto px-6 py-16 md:py-20">
        {/* 見出し */}
        <header className="mb-10 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-omame-deep tracking-wide">
            特定商取引法に基づく表記
          </h1>
          <div className="mt-6 flex items-center justify-center">
            <div className="h-px w-12 bg-omame-gold/40" />
            <span className="mx-3 text-omame-gold/60 text-sm">⸻</span>
            <div className="h-px w-12 bg-omame-gold/40" />
          </div>
        </header>

        {/* 英文注記（英語圏ユーザーへの配慮） */}
        <p className="mb-10 text-center text-xs md:text-sm text-omame-text/50 leading-relaxed">
          ※ This page is provided only in Japanese in accordance with Japan&apos;s
          Act on Specified Commercial Transactions.
        </p>

        {/* 表記項目（定義リスト） */}
        <dl className="border-t border-omame-gold/20">
          {ITEMS.map((item) => (
            <div
              key={item.label}
              className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-1 md:gap-6 py-5 border-b border-omame-gold/20"
            >
              <dt className="text-sm md:text-base font-bold text-omame-deep">
                {item.label}
              </dt>
              <dd className="text-sm md:text-base text-omame-text/80 leading-relaxed whitespace-pre-line">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>

        {/* トップへ戻る */}
        <div className="mt-12 text-center">
          <Link
            href={`/${lang}`}
            className="text-sm text-omame-deep hover:text-omame-primary underline underline-offset-4 transition-colors"
          >
            トップページへ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
