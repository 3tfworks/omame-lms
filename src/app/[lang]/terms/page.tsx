import Link from "next/link";
import { isValidLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BUSINESS_INFO } from "@/lib/businessInfo";

export const metadata: Metadata = {
  title: `利用規約 | ${BUSINESS_INFO.name}`,
};

// 制定日・最終更新日
const ESTABLISHED_DATE = "2026年6月13日";
const UPDATED_DATE = "2026年6月13日";

// 利用規約の各条文（和文中心・3ロケール共通）
const ARTICLES: { title: string; items: string[] }[] = [
  {
    title: "第1条（適用）",
    items: [
      `本規約は、${BUSINESS_INFO.name}（以下「運営者」といいます）が提供するオンライン講座サービス（以下「本サービス」といいます）の利用に関する一切の関係に適用されます。`,
      "利用者は、本サービスを利用することにより、本規約に同意したものとみなされます。",
    ],
  },
  {
    title: "第2条（利用登録）",
    items: [
      "本サービスの利用登録は、所定の決済が完了した時点をもって成立するものとします。",
      "利用者は、1人につき1アカウントのみ登録できるものとし、複数アカウントの作成・保有を禁止します。",
    ],
  },
  {
    title: "第3条（アカウントの管理）",
    items: [
      "利用者は、自己の責任において、本サービスのログイン情報を適切に管理するものとします。",
      "利用者は、ログイン情報を第三者に共有・貸与・譲渡してはならないものとします。",
      "ログイン情報の管理不十分による損害の責任は、利用者が負うものとします。",
    ],
  },
  {
    title: "第4条（料金及び支払方法）",
    items: [
      "利用者は、本サービスの利用に対し、各商品の販売ページに記載された料金を支払うものとします。",
      "支払方法は、クレジットカード決済または会費ペイによるものとします。",
    ],
  },
  {
    title: "第5条（禁止事項）",
    items: [
      "利用者は、本サービスの利用にあたり、以下の行為をしてはなりません。",
      "・法令または公序良俗に違反する行為",
      "・動画コンテンツのダウンロード、録画、複製、配布する行為",
      "・本サービスまたはコンテンツを第三者へ譲渡、転売する行為",
      "・本サービスのリバースエンジニアリング、スクレイピング等の行為",
      "・本サービスへの不正アクセス、システムの妨害行為",
      "・他の利用者に対する迷惑行為",
      "・運営者になりすます行為",
    ],
  },
  {
    title: "第6条（コンテンツの著作権）",
    items: [
      "本サービスで提供される全ての動画・テキスト等のコンテンツの著作権は、運営者またはコンテンツ提供者に帰属します。",
      "利用者は、私的視聴の範囲を超えてコンテンツを利用してはならないものとします。",
    ],
  },
  {
    title: "第7条（サービスの変更・中断・終了）",
    items: [
      "運営者は、利用者に事前の予告なく、本サービスの内容を変更し、または提供を中断・終了することがあります。",
      "運営者は、これに起因して利用者に生じた損害について、一切の責任を負わないものとします。",
    ],
  },
  {
    title: "第8条（利用制限及び退会）",
    items: [
      "運営者は、利用者が本規約に違反した場合、事前の通知なくアカウントの停止または削除を行うことがあります。",
      "利用者は、運営者所定の手続きにより、本サービスを退会することができます。",
    ],
  },
  {
    title: "第9条（保証の否認及び免責事項）",
    items: [
      "運営者は、本サービスのコンテンツの正確性・完全性・有用性等について、いかなる保証も行いません。",
      "運営者は、本サービスの利用に伴い利用者に生じた損害について、運営者に故意または重大な過失がある場合を除き、責任を負わないものとします。",
    ],
  },
  {
    title: "第10条（アフィリエイトプログラム）",
    items: [
      "アフィリエイトプログラムへの参加条件は、サロン会員に限るものとします。",
      "報酬の支払条件については、別途定めるところによります。",
      "不正な紹介行為が判明した場合、運営者は当該報酬を取り消すことができるものとします。",
    ],
  },
  {
    title: "第11条（規約の変更）",
    items: [
      "運営者は、必要と判断した場合、利用者に通知することなく本規約を変更することができるものとします。",
      "変更後、利用者が本サービスの利用を継続した場合、変更後の規約に同意したものとみなされます。",
    ],
  },
  {
    title: "第12条（準拠法・裁判管轄）",
    items: [
      "本規約の解釈にあたっては、日本法を準拠法とします。",
      "本サービスに関して紛争が生じた場合には、運営者の所在地を管轄する裁判所を専属的合意管轄裁判所とします。",
    ],
  },
];

export default async function TermsPage({
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
            利用規約
          </h1>
          <div className="mt-6 flex items-center justify-center">
            <div className="h-px w-12 bg-omame-gold/40" />
            <span className="mx-3 text-omame-gold/60 text-sm">⸻</span>
            <div className="h-px w-12 bg-omame-gold/40" />
          </div>
        </header>

        {/* 英文注記（英語圏ユーザーへの配慮） */}
        <p className="mb-12 text-center text-xs md:text-sm text-omame-text/50 leading-relaxed">
          ※ These Terms of Service are provided only in Japanese, as this service
          is offered for customers in Japan.
        </p>

        {/* 前文 */}
        <p className="mb-10 text-sm md:text-base text-omame-text/80 leading-loose">
          本利用規約（以下「本規約」といいます）は、{BUSINESS_INFO.name}（以下「運営者」といいます）が提供するオンライン講座サービスの利用条件を定めるものです。利用者の皆さまには、本規約に同意の上で本サービスをご利用いただきます。
        </p>

        <div className="space-y-10">
          {ARTICLES.map((article) => (
            <section key={article.title}>
              <h2 className="text-lg md:text-xl font-bold text-omame-deep mb-3 pb-2 border-b border-omame-gold/20">
                {article.title}
              </h2>
              <div className="space-y-2 text-sm md:text-base text-omame-text/80 leading-loose">
                {article.items.map((item, i) => (
                  <p key={i} className={item.startsWith("・") ? "pl-4" : ""}>
                    {item}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* 制定日・最終更新日 */}
        <div className="mt-12 pt-6 border-t border-omame-gold/20 text-sm text-omame-text/60 leading-relaxed">
          <p>制定日：{ESTABLISHED_DATE}</p>
          <p>最終更新日：{UPDATED_DATE}</p>
        </div>

        {/* トップへ戻る */}
        <div className="mt-10 text-center">
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
