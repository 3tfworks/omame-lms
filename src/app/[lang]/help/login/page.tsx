// ログイン方法のご案内ページ（/ja/help/login）
// 6/29 ログイン障害の二次被害対策 + マジックリンク方式への不安解消が目的。
// 読者像: 50-70代女性のピアノ講師（SP 約8割・デジタル不安強め）。
//   → 本文は serif で気持ち大きめ（text-base md:text-lg）、角丸は rounded-2xl で統一。
// 多言語: コンテンツは日本語のみ。[lang] 構造のため /en・/fr でも到達可（その場合は冒頭に注記）。
// 注意: 連携実装（login のアコーディオン / ?error= バナー / メール追記 / LINE 自動応答）は
//   本ページ本番反映後の別ラウンド。ここでは扱わない。

import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { isValidLocale } from "@/lib/i18n";
import { LineLogo } from "@/components/ui/LineLogo";

export const metadata: Metadata = {
  title: "ログイン方法のご案内 | お豆奏法基礎講座",
  description:
    "お豆奏法基礎講座のログイン方法を、画面の画像つきでご案内します。パスワード不要のシンプルな方式で、一度ログインすればしばらく使えます。",
};

// 初回ログインの 6 ステップ。画像（プレースホルダ・実寸 390x844）と本文を交互に配置する。
const STEPS = [
  {
    n: 1,
    img: "/images/help/omame-login-step1-sp.png",
    alt: "お豆奏法のログインページ。メールアドレスを入力する欄が表示されている",
    title: "① ログインページを開きます",
  },
  {
    n: 2,
    img: "/images/help/omame-login-step2-sp.png",
    alt: "メールアドレスを入力した状態のログインページ",
    title: "② メールアドレスを入力します",
  },
  {
    n: 3,
    img: "/images/help/omame-login-step3-sp.png",
    alt: "「ログインリンクを送る」と書かれた緑色のボタン",
    title: "③「ログインリンクを送る」ボタンを押します",
  },
  {
    n: 4,
    img: "/images/help/omame-login-step4-sp.png",
    alt: "メールアプリの受信トレイにお豆奏法からのログイン用メールが届いている画面",
    title: "④ メールを確認します",
  },
  {
    n: 5,
    img: "/images/help/omame-login-step5-sp.png",
    alt: "メール本文の中にある青色のログインボタン",
    title: "⑤ メールの中の青いボタンを押します",
  },
  {
    n: 6,
    img: "/images/help/omame-login-step6-sp.png",
    alt: "ログイン後の受講ページ（LMS）のトップ画面",
    title: "⑥ 受講ページが開きます",
  },
];

// 既存資産のブックマーク登録ガイド（/public/images 直下・PC 横長スクショ）。
// ※ 仕様書 v2 の /images/lms/ は誤りで、実体は images 直下。サイズは画像ごとに異なる。
const BOOKMARK_IMAGES = [
  { img: "/images/bookmarks-guide-01.png", w: 1719, h: 915, alt: "ブックマーク登録手順 ①" },
  { img: "/images/bookmarks-guide-02.png", w: 1693, h: 929, alt: "ブックマーク登録手順 ②" },
  { img: "/images/bookmarks-guide-03.png", w: 1746, h: 901, alt: "ブックマーク登録手順 ③" },
  { img: "/images/bookmarks-guide-04.png", w: 1691, h: 930, alt: "ブックマーク登録手順 ④" },
];

// 「ログインできないとき」の Q&A。アコーディオンは <details> で静的に実装（JS 状態管理は不要）。
const FAQS = [
  {
    q: "Q1. メールが届きません",
    body: [
      "まずはご登録のメールアドレスの「迷惑メールフォルダ」をご確認ください。お豆奏法からのメールが、迷惑メール扱いになっていることがあります。",
      "迷惑メールフォルダにメールがあった場合は、メールを開いて「迷惑メールではない」ボタンを押していただくと、次回からは正しく受信トレイに届くようになります。",
      "それでも届かない場合は、ご購入時に使ったメールアドレスと、いま入力されているメールアドレスが完全に一致しているかご確認ください。1文字でも違うと、メールはお手元に届きません。",
    ],
  },
  {
    q: "Q2. リンクを押しても、ログイン画面に戻ってしまいます",
    body: [
      "メールに書かれているリンクには有効期限（発行から数分）があります。古いメールのリンクを使っていらっしゃる可能性があります。",
      "一度ログイン画面に戻って、もう一度メールアドレスを入力 → 新しく届いたメールのリンクを押す、という流れでお試しください。",
      "古いメールが何通も届いている場合は、いちばん新しいメールをご利用ください。",
    ],
  },
  {
    q: "Q3. ご購入時とは違うメールアドレスを入れてしまったかも",
    body: [
      "お豆奏法は、ご購入時にお使いいただいたメールアドレスでログインしていただく仕組みです。別のメールアドレスではログインできません。",
      "お心当たりのメールアドレスをいくつかお試しいただくか、ご購入時に届いた Stripe からの領収書メールをご確認ください。そのメールが届いているアドレスが、ログインに使えるアドレスです。",
    ],
  },
  {
    q: "Q4. LINE のメッセージからリンクを開いたら、うまくいきません",
    body: [
      "LINE のトーク画面からリンクを開くと、LINE 内の小さなブラウザでページが表示されます。これが原因でログインがうまくいかないことがあります。",
      "その場合は、LINE 内ブラウザの右上にある「・・・」または「↗」ボタンを押して、「Safari で開く」または「Chrome で開く」を選んでください。普段使っているブラウザで開きなおしていただくと、ログインがスムーズに進みます。",
    ],
  },
  {
    q: "Q5. 「無効なリンクです」と表示されます",
    body: [
      "こちらも有効期限切れの可能性が高いです。Q2 と同じく、もう一度ログイン画面でメールアドレスを入力していただき、新しく届いたメールのリンクをお使いください。",
    ],
  },
];

// 公式 LINE 問い合わせ CTA。login ページの LoginSupportCta と同一スタイル（緑ピル + LineLogo）。
// ※ 共有コンポーネント化は login/page.tsx に手を入れる別ラウンド（§7.4）で検討する。
function LineHelpCta() {
  return (
    <a
      href="https://lin.ee/RmeCAtQ"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-full bg-[#06C755] px-6 py-3 text-base font-bold text-white transition-colors hover:bg-[#05b34d]"
    >
      <LineLogo size={18} />
      LINE で問い合わせる
    </a>
  );
}

export default async function HelpLoginPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!isValidLocale(lang)) {
    notFound();
  }

  // 日本語以外のロケールで開かれた場合の注記（privacy ページと同じ「日本語のみ」方針）。
  const isJa = lang === "ja";

  return (
    <main className="min-h-screen bg-omame-bg text-omame-text font-serif">
      <div className="mx-auto max-w-2xl px-6 py-12 md:py-16">
        {!isJa && (
          <p className="mb-8 rounded-2xl bg-omame-accent px-4 py-3 text-center text-sm text-omame-text/70">
            This page is available in Japanese only. / Cette page n&apos;est
            disponible qu&apos;en japonais.
          </p>
        )}

        {/* H1 + 導入 */}
        <header className="mb-12 text-center">
          <h1 className="text-3xl font-bold tracking-wide text-omame-deep md:text-4xl">
            ログイン方法のご案内
          </h1>
          <div className="mt-6 flex items-center justify-center">
            <div className="h-px w-12 bg-omame-gold/40" />
            <span className="mx-3 text-sm text-omame-gold/60">⸻</span>
            <div className="h-px w-12 bg-omame-gold/40" />
          </div>
        </header>

        <p className="mb-12 text-base leading-relaxed text-omame-text/90 md:text-lg">
          このページでは、お豆奏法基礎講座へのログイン方法をご案内します。
          「むずかしそう…」と感じる必要はまったくありません。スマートフォンでもパソコンでも、お手元のメールが使えれば数分で入っていただけます。
        </p>

        {/* (1) 仕組み */}
        <section id="flow" className="mb-16 scroll-mt-6">
          <h2 className="mb-6 text-2xl font-bold text-omame-deep md:text-3xl">
            お豆奏法のログインについて
          </h2>

          <h3 className="mb-3 text-xl font-semibold text-omame-deep md:text-2xl">
            パスワードは、ありません。
          </h3>
          <div className="space-y-4 text-base leading-relaxed md:text-lg">
            <p>
              お豆奏法のサイトには、パスワードを覚えていただく必要がありません。
              必要なのは「ご購入時にお使いいただいたメールアドレス」だけ。アドレスを入力すると、そのメールアドレス宛にお豆奏法から「ログイン用のメール」が届きます。
              あとは、そのメールに書かれているボタンを押すだけ。それでログインが完了します。
            </p>
            <p>
              パスワードを思い出す、紙にメモする、忘れて再設定する――そういった手間は一切ありません。
            </p>
          </div>

          <h3 className="mb-3 mt-10 text-xl font-semibold text-omame-deep md:text-2xl">
            なぜパスワードを使わないの?
          </h3>
          <div className="space-y-4 text-base leading-relaxed md:text-lg">
            <p>
              パスワードには、「忘れてしまう」「人に見られてしまう」「あちこちのサービスで使い回してしまう」というリスクがあります。お豆奏法では、大切なお客様にこうした心配をしていただかないよう、よりシンプルで安全な方式を選びました。
            </p>
            <p>
              ご自分のメールアドレスに届いたメールを開けるのは、そのメールアドレスをお持ちのご本人だけです。「メールが届いたあなた = ご本人」というシンプルな考え方で、安心してログインしていただける仕組みになっています。最近では銀行のアプリやお買い物サイトでも、同じ方式が増えてきています。
            </p>
          </div>
        </section>

        {/* (2) 初回ログイン */}
        <section id="first-login" className="mb-16 scroll-mt-6">
          <h2 className="mb-6 text-2xl font-bold text-omame-deep md:text-3xl">
            はじめてのログイン
          </h2>
          <p className="mb-8 text-base leading-relaxed md:text-lg">
            ご購入後、はじめてログインされる場合の手順です。スマートフォンの画面でご案内します。
          </p>

          <div className="space-y-12">
            {STEPS.map((step) => (
              <div key={step.n}>
                <Image
                  src={step.img}
                  alt={step.alt}
                  width={390}
                  height={844}
                  className="mx-auto h-auto w-full max-w-xs rounded-2xl border border-omame-gold/20 shadow-sm"
                />
                <h3 className="mb-2 mt-5 text-xl font-semibold text-omame-deep">
                  {step.title}
                </h3>
                {step.n === 1 && (
                  <div className="space-y-3 text-base leading-relaxed md:text-lg">
                    <p>パソコンまたはスマートフォンで、以下のページを開いてください。</p>
                    <p className="rounded-2xl bg-omame-accent px-4 py-3 text-center font-semibold break-all">
                      https://www.omamepiano.com/ja/login
                    </p>
                    <p className="text-sm text-omame-text/70 md:text-base">
                      ※ご購入完了メールに記載されているリンクからも開けます。
                    </p>
                  </div>
                )}
                {step.n === 2 && (
                  <p className="text-base leading-relaxed md:text-lg">
                    入力欄に、<strong>ご購入時にお使いいただいたメールアドレス</strong>
                    を入力してください。大文字・小文字、ハイフンや数字も、ご購入時とまったく同じものをお願いします。
                  </p>
                )}
                {step.n === 3 && (
                  <p className="text-base leading-relaxed md:text-lg">
                    緑色の「ログインリンクを送る」ボタンを押してください。「メールをお送りしました」という画面が表示されたら成功です。
                  </p>
                )}
                {step.n === 4 && (
                  <div className="space-y-3 text-base leading-relaxed md:text-lg">
                    <p>
                      ご登録のメールアプリを開いてください。お豆奏法から
                      <strong>「ログイン用のリンクです」</strong>
                      という件名のメールが届いています。
                    </p>
                    <p>
                      数十秒〜2分ほどで届きます。届かない場合は、後ほどご案内する「ログインできないとき」をご覧ください。
                    </p>
                  </div>
                )}
                {step.n === 5 && (
                  <div className="space-y-3 text-base leading-relaxed md:text-lg">
                    <p>メールを開くと、青い「ログインする」ボタンがあります。これを押してください。</p>
                    <p className="text-sm text-omame-text/70 md:text-base">
                      ※ボタンが表示されない場合は、その下にあるリンク（https://… で始まるアドレス）を押してください。
                    </p>
                  </div>
                )}
                {step.n === 6 && (
                  <div className="space-y-3 text-base leading-relaxed md:text-lg">
                    <p>自動的にブラウザが開き、お豆奏法の受講ページに入れます。これでログイン完了です。</p>
                    <p className="text-sm text-omame-text/70 md:text-base">
                      ※スマートフォンの方は、画面の左上にあるメニュー（三本線）から、レッスン動画や教材にアクセスできます。
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* PC 利用者向け */}
          <div className="mt-12">
            <Image
              src="/images/help/omame-login-pc.png"
              alt="パソコンで表示したお豆奏法のログインページ"
              width={1440}
              height={900}
              className="h-auto w-full rounded-2xl border border-omame-gold/20 shadow-sm"
            />
            <h3 className="mb-2 mt-5 text-xl font-semibold text-omame-deep">
              パソコンで利用される方へ
            </h3>
            <p className="text-base leading-relaxed md:text-lg">
              パソコンでも手順は同じです。画面が大きい分、入力欄やボタンの位置が分かりやすくなっています。
            </p>
          </div>
        </section>

        {/* (3-1) 2回目以降 */}
        <section id="stay-logged-in" className="mb-16 scroll-mt-6">
          <h2 className="mb-6 text-2xl font-bold text-omame-deep md:text-3xl">
            2回目からはもっと簡単です
          </h2>

          <h3 className="mb-3 text-xl font-semibold text-omame-deep md:text-2xl">
            一度ログインすれば、しばらくそのまま使えます
          </h3>
          <div className="space-y-4 text-base leading-relaxed md:text-lg">
            <p>
              一度ログインしていただくと、
              <strong>同じスマートフォン（またはパソコン）で、同じブラウザを使う限り</strong>
              、しばらくのあいだログイン状態が保たれます。
            </p>
            <p>ですので、次回からは:</p>
            <ol className="list-decimal space-y-2 pl-6">
              <li>
                ブラウザのブックマークから https://www.omamepiano.com/ja/lms を開く
              </li>
              <li>そのまま受講ページに入れる</li>
            </ol>
            <p>
              ――この2ステップだけ。
              <strong>メールアドレスの入力やリンクのクリックは必要ありません。</strong>
            </p>
            <p>
              はじめてログインされたあとは、受講ページ（LMS）を
              <strong>ブックマークに登録しておかれること</strong>をおすすめします。
            </p>
          </div>

          {/* ブックマーク登録手順（既存資産の流用） */}
          <h3 className="mb-3 mt-10 text-xl font-semibold text-omame-deep md:text-2xl">
            ブックマーク登録の手順
          </h3>
          <p className="mb-6 text-base leading-relaxed md:text-lg">
            次の画面の流れで登録できます。
            <span className="text-sm text-omame-text/70 md:text-base">
              （※お使いの端末・ブラウザにより画面は多少異なります。Android
              端末の方は、ブラウザのメニュー（︙）から「ブックマーク」または「ホーム画面に追加」を選んでいただくと同様に登録できます。）
            </span>
          </p>
          <div className="space-y-8">
            {BOOKMARK_IMAGES.map((b, i) => (
              <div key={b.img}>
                <Image
                  src={b.img}
                  alt={b.alt}
                  width={b.w}
                  height={b.h}
                  className="h-auto w-full rounded-2xl border border-omame-gold/20 shadow-sm"
                />
                <p className="mt-3 text-center text-sm text-omame-text/70 md:text-base">
                  手順 {i + 1}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* (3-2) 再ログインが必要なケース */}
        <section id="need-relogin" className="mb-16 scroll-mt-6">
          <h2 className="mb-6 text-2xl font-bold text-omame-deep md:text-3xl">
            もう一度ログインが必要になるのは、こんなときです
          </h2>
          <p className="mb-6 text-base leading-relaxed md:text-lg">
            以下のような場合は、最初のログインと同じ手順で、もう一度メールアドレスを入力していただく必要があります。「なぜ?」と不安に感じる必要はなく、
            <strong>安全のための仕組み</strong>とご理解ください。
          </p>
          <ul className="list-disc space-y-2 pl-6 text-base leading-relaxed md:text-lg">
            <li>スマートフォンを機種変更されたとき</li>
            <li>いつもと違う端末で開いたとき（例: いつもスマホで見ていた方が、パソコンで開いた）</li>
            <li>いつもと違うブラウザで開いたとき（例: いつも Safari → Chrome で開いた）</li>
            <li>ブラウザの履歴やキャッシュをクリアされたあと</li>
            <li>シークレットモード（プライベートブラウザ）で開いたとき</li>
            <li>ご自分でログアウトボタンを押されたとき</li>
            <li>長くアクセスされていなかったとき（数週間以上の間隔があいた場合）</li>
            <li>LINE のトーク内に貼られたリンクから開き、そのあとにブラウザを切り替えたとき</li>
          </ul>
          <p className="mt-6 rounded-2xl bg-omame-accent px-4 py-4 text-base leading-relaxed md:text-lg">
            これらは「セキュリティのために、一度本人確認を行う」というだけのことです。お客様の受講記録や学習データは何も失われません。ログインしなおせば、これまでと同じレッスン動画・教材にアクセスしていただけます。
          </p>
        </section>

        {/* (4) ログインできないとき */}
        <section id="trouble" className="mb-16 scroll-mt-6">
          <h2 className="mb-6 text-2xl font-bold text-omame-deep md:text-3xl">
            ログインできないときの対処法
          </h2>
          <div className="space-y-4">
            {FAQS.map((faq) => (
              <details
                key={faq.q}
                className="rounded-2xl border border-omame-gold/20 bg-white/60 p-5"
              >
                <summary className="cursor-pointer text-lg font-semibold text-omame-deep">
                  {faq.q}
                </summary>
                <div className="mt-4 space-y-3 text-base leading-relaxed md:text-lg">
                  {faq.body.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* (5) それでも困ったら */}
        <section className="mb-8 rounded-2xl bg-omame-accent px-6 py-10 text-center">
          <h2 className="mb-4 text-2xl font-bold text-omame-deep md:text-3xl">
            それでも解決しない場合は、お気軽にご相談ください
          </h2>
          <p className="mb-6 text-base leading-relaxed md:text-lg">
            ここまでお試しいただいてもログインできない場合は、運営事務局までお気軽にご連絡ください。
            LINE で個別にサポートさせていただきます。
          </p>
          <div className="flex justify-center">
            <LineHelpCta />
          </div>
          <p className="mt-4 text-sm text-omame-text/70 md:text-base">
            メールでのお問い合わせも受け付けております:
            piano.beans.method03@gmail.com
          </p>
        </section>
      </div>
    </main>
  );
}
