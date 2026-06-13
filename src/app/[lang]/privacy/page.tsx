import Link from "next/link";
import { isValidLocale } from "@/lib/i18n";
import { BUSINESS_INFO } from "@/lib/businessInfo";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "プライバシーポリシー | OMAME SOHO LAB.",
};

// 制定日・最終更新日
const ESTABLISHED_DATE = "2026年6月13日";
const UPDATED_DATE = "2026年6月13日";

export default async function PrivacyPage({
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
            プライバシーポリシー
          </h1>
          <div className="mt-6 flex items-center justify-center">
            <div className="h-px w-12 bg-omame-gold/40" />
            <span className="mx-3 text-omame-gold/60 text-sm">⸻</span>
            <div className="h-px w-12 bg-omame-gold/40" />
          </div>
        </header>

        {/* 英文注記（英語圏ユーザーへの配慮） */}
        <p className="mb-12 text-center text-xs md:text-sm text-omame-text/50 leading-relaxed">
          ※ This Privacy Policy is provided only in Japanese, as this service is
          offered for customers in Japan.
        </p>

        {/* 前文 */}
        <p className="mb-10 text-sm md:text-base text-omame-text/80 leading-loose">
          OMAME SOHO LAB.（以下「当方」といいます）は、当方が提供するオンライン講座サービス（以下「本サービス」といいます）における、利用者の個人情報の取り扱いについて、以下のとおりプライバシーポリシー（以下「本ポリシー」といいます）を定めます。
        </p>

        <div className="space-y-10">
          {/* a) 取得する個人情報 */}
          <section>
            <h2 className="text-lg md:text-xl font-bold text-omame-deep mb-3 pb-2 border-b border-omame-gold/20">
              1. 取得する個人情報の項目
            </h2>
            <p className="text-sm md:text-base text-omame-text/80 leading-loose mb-3">
              当方は、本サービスの提供にあたり、以下の情報を取得します。
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm md:text-base text-omame-text/80 leading-relaxed">
              <li>氏名、メールアドレス</li>
              <li>振込先口座情報（アフィリエイトプログラム参加者のみ）</li>
              <li>動画の視聴履歴、学習進捗</li>
              <li>アクセスログ、IPアドレス、Cookie情報</li>
              <li>
                決済関連情報（クレジットカード情報等は決済代行会社（Stripe）にて処理され、当方では保持しません）
              </li>
            </ul>
          </section>

          {/* b) 利用目的 */}
          <section>
            <h2 className="text-lg md:text-xl font-bold text-omame-deep mb-3 pb-2 border-b border-omame-gold/20">
              2. 個人情報の利用目的
            </h2>
            <p className="text-sm md:text-base text-omame-text/80 leading-loose mb-3">
              当方は、取得した個人情報を以下の目的で利用します。
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm md:text-base text-omame-text/80 leading-relaxed">
              <li>本サービスの提供（動画コンテンツの配信、学習進捗の管理）</li>
              <li>本人確認・認証（ログイン用URL（Magic Link）の送信）</li>
              <li>アフィリエイト報酬の計算および支払い</li>
              <li>お問い合わせへの対応</li>
              <li>本サービスの改善および利用状況の分析</li>
              <li>重要なお知らせの送付</li>
            </ul>
          </section>

          {/* c) 第三者提供 */}
          <section>
            <h2 className="text-lg md:text-xl font-bold text-omame-deep mb-3 pb-2 border-b border-omame-gold/20">
              3. 個人情報の第三者提供
            </h2>
            <p className="text-sm md:text-base text-omame-text/80 leading-loose mb-3">
              当方は、原則として、利用者の個人情報を第三者に提供しません。ただし、以下の場合はこの限りではありません。
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm md:text-base text-omame-text/80 leading-relaxed mb-3">
              <li>法令に基づき開示が求められる場合</li>
              <li>本人の同意がある場合</li>
            </ul>
            <p className="text-sm md:text-base text-omame-text/80 leading-loose">
              なお、本サービスの運営にあたり、業務委託先（Supabase、Vercel、Stripe 等のクラウドサービス提供事業者）に個人情報の取り扱いを委託する場合がありますが、これらの委託先とは適切な契約を締結し、安全に管理します。
            </p>
          </section>

          {/* d) Cookie・アクセス解析 */}
          <section>
            <h2 className="text-lg md:text-xl font-bold text-omame-deep mb-3 pb-2 border-b border-omame-gold/20">
              4. Cookie・アクセス解析について
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-sm md:text-base text-omame-text/80 leading-relaxed">
              <li>当方は、ログイン状態の維持等のためにCookieを使用します。</li>
              <li>
                本サービスの利用状況を把握するため、アクセス解析ツールを使用する場合があります（必要に応じて将来的に導入することがあります）。
              </li>
            </ul>
          </section>

          {/* e) 個人情報の管理 */}
          <section>
            <h2 className="text-lg md:text-xl font-bold text-omame-deep mb-3 pb-2 border-b border-omame-gold/20">
              5. 個人情報の管理
            </h2>
            <p className="text-sm md:text-base text-omame-text/80 leading-loose mb-3">
              当方は、個人情報の漏えい、滅失またはき損の防止その他の個人情報の安全管理のために、以下を含む必要かつ適切な措置を講じます。
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm md:text-base text-omame-text/80 leading-relaxed">
              <li>SSL/TLS による暗号化通信の使用</li>
              <li>データベースにおけるアクセス制限（Supabase の行レベルセキュリティ（RLS）による保護）</li>
            </ul>
          </section>

          {/* f) 開示・訂正・削除 */}
          <section>
            <h2 className="text-lg md:text-xl font-bold text-omame-deep mb-3 pb-2 border-b border-omame-gold/20">
              6. 個人情報の開示・訂正・削除
            </h2>
            <p className="text-sm md:text-base text-omame-text/80 leading-loose">
              当方は、本人からの個人情報の開示・訂正・削除の請求があった場合、本人であることを確認の上、法令に従い遅滞なく対応します。請求は、下記のお問い合わせ先までご連絡ください。
            </p>
          </section>

          {/* g) お問い合わせ先 */}
          <section>
            <h2 className="text-lg md:text-xl font-bold text-omame-deep mb-3 pb-2 border-b border-omame-gold/20">
              7. お問い合わせ先
            </h2>
            <p className="text-sm md:text-base text-omame-text/80 leading-loose">
              本ポリシーに関するお問い合わせ、および個人情報に関するご請求は、以下までご連絡ください。
            </p>
            <div className="mt-3 text-sm md:text-base text-omame-text/80 leading-relaxed">
              <p>事業者の名称：{BUSINESS_INFO.name}</p>
              <p>メールアドレス：{BUSINESS_INFO.email}</p>
            </div>
          </section>

          {/* h) 変更 */}
          <section>
            <h2 className="text-lg md:text-xl font-bold text-omame-deep mb-3 pb-2 border-b border-omame-gold/20">
              8. プライバシーポリシーの変更
            </h2>
            <p className="text-sm md:text-base text-omame-text/80 leading-loose">
              当方は、必要に応じて本ポリシーを変更することがあります。変更後の本ポリシーは、本ページに掲載した時点から効力を生じるものとします。
            </p>
          </section>
        </div>

        {/* i) 制定日・最終更新日 */}
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
