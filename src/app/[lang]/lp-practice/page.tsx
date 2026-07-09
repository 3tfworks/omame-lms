import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowRight,
  CalendarDays,
  Check,
  CircleHelp,
  Clock3,
  Coffee,
  MessagesSquare,
  MonitorPlay,
  PlayCircle,
  Sparkles,
  Video,
} from "lucide-react";

export const metadata: Metadata = {
  title: "お豆奏法 実践落とし込み講座｜4ヶ月の直接指導",
  description:
    "動画教材で学んだお豆奏法を、一生モノの身体感覚へ。えりな先生の直接指導、動画添削、質問サポートで実践と定着を支える4ヶ月講座です。",
};

const applyHref = "#application";

const worries = [
  "画面の真似をしているつもりだけど、指や身体の感覚がこれで良いのか自信がない",
  "「私のこの手の形、お豆のタッチになってる？」と、直接先生にジャッジしてほしい",
  "ひとりで練習していると、いつの間にか元の弾き方の癖に戻ってしまう",
  "自分の演奏動画を先生に見てもらい、ピンポイントでアドバイスが欲しい",
  "動画の通りにやっているはずなのに、思うような音色にならない",
  "一緒に学んだ仲間のリアルな変化や、生のレッスンを見て刺激を受けたい",
];

const outcomes = [
  "自分のタッチに「これでいい」という確信が持てる",
  "元の弾き方に戻っても、自分で気づいて修正できる",
  "無理なく自然に響く音を、曲の中で再現できる",
  "一人で迷い続けず、今取り組むべき課題が分かる",
  "ピアノの先生なら、生徒の前で迷わずお手本を見せられる",
];

const support = [
  {
    icon: MonitorPlay,
    title: "月1回・全4回\nグループ実践レッスン",
    body: "Zoomを使用し、お一人ずつ直接レッスン（公開添削形式）を行います。あなたの今の課題を見抜き、その場で弾き方を変えていきます。",
    note: "全回アーカイブあり",
  },
  {
    icon: Video,
    title: "月2回\n動画添削フォロー",
    body: "ご自身の演奏動画（5分以内）を送ってください。どこをどう変えればよいか、個別に具体的なアドバイスをお返しします。",
    note: "4ヶ月で最大8回",
  },
  {
    icon: MessagesSquare,
    title: "4ヶ月間\n質問し放題",
    body: "日常の「これで合ってる？」をその都度解消。他の方の質問と回答からも、一人では得られない学びや気づきが手に入ります。",
    note: "LINEグループでサポート",
  },
  {
    icon: Coffee,
    title: "オンラインお茶会\n全3回",
    body: "レッスンとは少し趣向を変え、リラックスした環境で演奏や指導の悩み、その他なんでも気軽に相談し合える場です。",
    note: "相談会として開催",
  },
];

const voices = [
  {
    quote: "「私は初めて、ピアノの弾き方を教えてもらえた」って思ったんです。",
    body: "ずっと自分の弾き方に自信がなく、これでいいの？と迷ってばかりでした。月1回の講座とフォローアップLINEグループ＆お茶会の3本立て、本当に良かったです。先生の的確な言葉と例えで、私の中の「キーワード」が増えました。",
  },
  {
    quote: "動画のアドバイスも凄く分かりやすくて、宝物です。",
    body: "できていることにフォーカスするという先生の言葉が心に残っています。今までのレッスンとは真逆でした。楽に弾けるところが増え、どんどん楽しくなりました。",
  },
  {
    quote: "参加したのと変わらないくらいの、充実した学びをいただきました。",
    body: "これまで言われても実際にはできなかったことが、具体的にどうすればよいか教えていただいたことで、格段に楽に弾けるようになりました。同じ目的を持つ仲間との出会いも大きな財産です。",
  },
];

const faqs = [
  {
    q: "当日の時間に参加できなくても受講できますか？",
    a: "はい。全回アーカイブ受講が可能です。動画添削などを通して一人ひとりをフォローしますので、ご自身のペースで復習していただけます。",
  },
  {
    q: "動画教材を受講途中でも参加できますか？",
    a: "はい。動画教材を受講し終えた方、または現在受講中の方が対象です。基礎知識を学びながら、実践と定着を進めていただけます。",
  },
  {
    q: "初心者や電子ピアノでも参加できますか？",
    a: "ご参加いただけます。初心者からピアノの先生、演奏家まで、ジャンルを問わず対象です。電子ピアノしかお持ちでない方も受講できます。",
  },
  {
    q: "LINEを使っていない場合はどうなりますか？",
    a: "個別に対応しますので、お申込み前にお気軽にご相談ください。",
  },
  {
    q: "支払い方法を教えてください。",
    a: "銀行振込、PayPay、クレジットカードを予定しています。カード払いの分割については、ご利用のカード会社へお申し込みください。",
  },
];

function Cta({
  label = "第1期講座の申込み案内を見る",
  light = false,
}: {
  label?: string;
  light?: boolean;
}) {
  return (
    <a
      href={applyHref}
      className={`group inline-flex min-h-14 items-center justify-center gap-2 rounded-full px-7 py-4 text-center font-bold shadow-lg transition hover:-translate-y-0.5 md:px-10 ${
        light
          ? "bg-white text-omame-deep shadow-black/10"
          : "bg-omame-gold text-white shadow-omame-gold/25 hover:bg-omame-gold/90"
      }`}
    >
      {label}
      <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" />
    </a>
  );
}

function SectionTitle({
  eyebrow,
  children,
}: {
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <div className="text-center">
      <p className="font-sans text-[0.7rem] uppercase tracking-[0.32em] text-omame-gold">
        {eyebrow}
      </p>
      <h2 className="mt-4 whitespace-pre-line text-2xl font-bold leading-relaxed text-omame-deep md:text-4xl md:leading-relaxed">
        {children}
      </h2>
    </div>
  );
}

export default function PracticeLpPage() {
  return (
    <main className="w-full overflow-x-hidden bg-omame-bg text-omame-text">
      <section className="relative flex min-h-[92svh] items-center overflow-hidden">
        <Image
          src="/images/omame-fv-bg.png"
          alt="グランドピアノに向かう演奏者"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(29,24,21,.8),rgba(29,24,21,.52),rgba(29,24,21,.35))]" />
        <div className="relative mx-auto w-full max-w-5xl px-5 py-20 text-white md:px-8">
          <div className="max-w-2xl">
            <p className="inline-flex rounded-full border border-white/35 bg-black/15 px-4 py-2 text-xs tracking-wider backdrop-blur-sm">
              動画教材をご受講いただいたあなたへ
            </p>
            <h1 className="mt-7 text-3xl font-bold leading-[1.65] md:text-5xl md:leading-[1.6]">
              動画を観て、
              <br />
              やってみた。
              <br />
              <span className="text-[#f1d4a2]">
                「でも、私のこの弾き方、
                <br className="hidden md:block" />
                本当に合ってる…？」
              </span>
            </h1>
            <p className="mt-7 text-xl font-bold leading-loose md:text-2xl">
              その不安を、確信に変える4ヶ月。
            </p>
            <div className="mt-7 border-l border-omame-gold pl-5">
              <p className="text-sm leading-loose text-white/85">
                えりな先生の直接指導で、あなたの演奏を別次元へ引き上げる
                <br />
                グループ実践レッスン
              </p>
              <p className="mt-3 text-lg font-bold">
                お豆奏法 実践落とし込み講座
                <span className="ml-2 text-sm font-normal">第1期生募集</span>
              </p>
            </div>
            <div className="mt-8 grid max-w-xl grid-cols-2 gap-3 text-sm md:grid-cols-4">
              {["全4回の直接指導", "動画添削 月2回", "4ヶ月質問し放題", "全回アーカイブ"].map(
                (item) => (
                  <div
                    key={item}
                    className="rounded-lg border border-white/25 bg-black/20 px-3 py-3 text-center backdrop-blur-sm"
                  >
                    {item}
                  </div>
                ),
              )}
            </div>
            <div className="mt-9">
              <Cta />
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-omame-gold/20 bg-white">
        <div className="mx-auto grid max-w-5xl gap-5 px-5 py-8 text-center md:grid-cols-3 md:px-8">
          <div className="flex items-center justify-center gap-3">
            <CalendarDays className="h-6 w-6 text-omame-gold" />
            <p><b>2026年8月〜11月</b><br /><span className="text-sm">毎月第4木曜日</span></p>
          </div>
          <div className="flex items-center justify-center gap-3 border-omame-gold/20 md:border-x">
            <Clock3 className="h-6 w-6 text-omame-gold" />
            <p><b>10:00〜12:00</b><br /><span className="text-sm">月1回・全4回</span></p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <PlayCircle className="h-6 w-6 text-omame-gold" />
            <p><b>オンライン開催</b><br /><span className="text-sm">Zoom・アーカイブあり</span></p>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-20 md:py-28">
        <div className="mx-auto max-w-3xl">
          <SectionTitle eyebrow="Do You Feel This?">{"こんな不安、\nありませんか？"}</SectionTitle>
          <p className="mt-7 text-center leading-loose">
            動画で理論は分かった。
            <br />
            でも、こんな風に立ち止まっていませんか？
          </p>
          <ul className="mt-10 grid gap-4 md:grid-cols-2">
            {worries.map((worry) => (
              <li
                key={worry}
                className="flex gap-3 rounded-2xl border border-omame-gold/20 bg-omame-bg p-5 leading-loose"
              >
                <CircleHelp className="mt-1 h-5 w-5 shrink-0 text-omame-gold" />
                <span>{worry}</span>
              </li>
            ))}
          </ul>
          <p className="mt-12 text-center text-xl font-bold leading-loose text-omame-deep md:text-2xl">
            あなたの「これで合ってる？」を、
            <br />
            「これだ！」という身体の確信に変えます。
          </p>
        </div>
      </section>

      <section className="px-5 py-20 md:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <SectionTitle eyebrow="Why Direct Guidance?">{"動画を学んだからこそ、\n最後に必要なもの。"}</SectionTitle>
          <div className="mx-auto mt-10 max-w-2xl space-y-7 text-base leading-[2.2] md:text-lg">
            <p>
              動画教材は、お豆奏法の膨大なエッセンスを詰め込んだ
              <br className="hidden md:block" />
              素晴らしい教科書です。
            </p>
            <p className="text-2xl font-bold text-omame-deep">しかし、ピアノの演奏は「感覚の芸術」。</p>
            <p>
              一人ひとりの骨格、手の大きさ、これまでの癖によって、
              <br className="hidden md:block" />
              「身体への落とし込み方」は全員異なります。
            </p>
            <p>
              この実践講座では、動画で基礎知識を頭に入れたあなただからこそ
              スムーズに理解できる、「超・実践的な直接指導」を行います。
            </p>
          </div>
        </div>
      </section>

      <section className="bg-omame-deep px-5 py-20 text-white md:py-28">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <p className="font-sans text-xs uppercase tracking-[0.32em] text-[#f1d4a2]">After 4 Months</p>
            <h2 className="mt-4 text-2xl font-bold leading-relaxed md:text-4xl">
              知識から、一生モノの身体感覚へ。
            </h2>
          </div>
          <ul className="mx-auto mt-12 grid max-w-3xl gap-4">
            {outcomes.map((outcome) => (
              <li
                key={outcome}
                className="flex items-center gap-4 rounded-xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur-sm"
              >
                <Check className="h-6 w-6 shrink-0 text-[#f1d4a2]" />
                <span className="text-base leading-loose md:text-lg">{outcome}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-white px-5 py-20 md:py-28">
        <div className="mx-auto max-w-5xl">
          <SectionTitle eyebrow="Four Supports">{"4ヶ月間、\nあなたを一人にしません。"}</SectionTitle>
          <p className="mt-7 text-center leading-loose">
            動画教材のアフターフォローとして、
            <br />
            これ以上ない最高環境を用意しました。
          </p>
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {support.map(({ icon: Icon, title, body, note }) => (
              <article key={title} className="rounded-2xl border border-omame-gold/25 bg-omame-bg p-6 md:p-8">
                <div className="flex items-start gap-4">
                  <span className="rounded-full bg-omame-accent p-3">
                    <Icon className="h-6 w-6 text-omame-deep" />
                  </span>
                  <div>
                    <h3 className="whitespace-pre-line text-xl font-bold leading-relaxed text-omame-deep">
                      {title}
                    </h3>
                    <p className="mt-1 text-xs tracking-wide text-omame-gold">{note}</p>
                  </div>
                </div>
                <p className="mt-5 leading-loose">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:py-28">
        <div className="mx-auto max-w-4xl">
          <SectionTitle eyebrow="Your Journey">{"4ヶ月で、\n「自分で分かる」状態へ。"}</SectionTitle>
          <div className="relative mt-12 grid gap-5 md:grid-cols-4">
            {[
              ["1ヶ月目", "現在の癖と課題を知る"],
              ["2ヶ月目", "正しい感覚をつかむ"],
              ["3ヶ月目", "曲の中で再現する"],
              ["4ヶ月目", "自分で気づき修正する"],
            ].map(([month, goal], index) => (
              <div key={month} className="relative rounded-2xl border border-omame-gold/30 bg-white p-5 text-center">
                <p className="font-sans text-sm text-omame-gold">STEP {index + 1}</p>
                <h3 className="mt-2 font-bold text-omame-deep">{month}</h3>
                <p className="mt-3 text-sm leading-loose">{goal}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-xs text-omame-text/60">
            ※上記は成長イメージです。レッスンはお一人ずつの課題に合わせて進めます。
          </p>
        </div>
      </section>

      <section className="bg-white px-5 py-20 md:py-28">
        <div className="mx-auto max-w-4xl">
          <SectionTitle eyebrow="Student Voices">お豆奏法受講生さんの声</SectionTitle>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {voices.map((voice) => (
              <article key={voice.quote} className="rounded-2xl border border-omame-gold/20 bg-omame-bg p-6">
                <Sparkles className="h-6 w-6 text-omame-gold" />
                <h3 className="mt-4 font-bold leading-loose text-omame-deep">{voice.quote}</h3>
                <p className="mt-4 text-sm leading-[2]">{voice.body}</p>
              </article>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Cta label="私も4ヶ月間で確信を育てる" />
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:py-28">
        <div className="mx-auto max-w-4xl">
          <SectionTitle eyebrow="For You">こんな方が対象です</SectionTitle>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {[
              "お豆奏法の動画教材を受講し終えた方、または受講中の方",
              "理論は分かったので「実践・定着」へ進みたい方",
              "先生から直接、自分の演奏へのフィードバックが欲しい方",
              "独学での練習に限界を感じている方",
              "ピアノの先生、ピアニスト、愛好家、初心者ピアニスト",
              "クラシック・ポップス・ジャズ・ラテンなど、ジャンルを問わず学びたい方",
            ].map((item) => (
              <div key={item} className="flex gap-3 rounded-xl bg-omame-accent/70 p-5">
                <Check className="mt-1 h-5 w-5 shrink-0 text-omame-gold" />
                <p className="leading-loose">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-20 md:py-28">
        <div className="mx-auto max-w-3xl">
          <SectionTitle eyebrow="Your Guide">講師紹介</SectionTitle>
          <div className="mt-12 grid items-start gap-8 md:grid-cols-[240px_1fr]">
            <Image
              src="/images/erina-profile.jpg"
              alt="講師 舘依里奈"
              width={480}
              height={600}
              sizes="(max-width: 768px) 70vw, 240px"
              className="mx-auto aspect-[4/5] w-full max-w-[240px] rounded-2xl object-cover shadow-lg"
            />
            <div>
              <p className="text-sm tracking-widest text-omame-gold">講師</p>
              <h3 className="mt-1 text-2xl font-bold text-omame-deep">舘 依里奈</h3>
              <p className="mt-5 leading-[2]">
                愛知県立明和高等学校音楽科、国立音楽大学音楽学部器楽学科ピアノ専攻卒業。その後渡仏し、パリ・エコールノルマル音楽院にて高等演奏資格（ディプロマ）取得。
              </p>
              <p className="mt-4 leading-[2]">
                長年の演奏・指導と研究を通して、一人ひとりが抱える問題点を見抜き、感覚的なことを具体的な言葉と実践へ落とし込む指導を行っています。
              </p>
              <details className="mt-5 rounded-xl border border-omame-gold/20 bg-omame-bg p-4">
                <summary className="cursor-pointer font-bold text-omame-deep">詳しいプロフィールを見る</summary>
                <p className="mt-4 text-sm leading-[2]">
                  ソロ、伴奏、オペラのコレペティートルとして活動。フランスを拠点にソロ・室内楽・リサイタル等へ出演し、帰国後もクラシックに留まらず幅広いジャンルで演奏活動を行う。国際ピアノコンクールをはじめ入賞・入選多数。全日本演奏家協会正会員。
                </p>
              </details>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:py-28">
        <div className="mx-auto max-w-3xl">
          <SectionTitle eyebrow="FAQ">よくいただくご質問</SectionTitle>
          <div className="mt-10 space-y-3">
            {faqs.map((faq) => (
              <details key={faq.q} className="group rounded-xl border border-omame-gold/20 bg-white p-5">
                <summary className="flex cursor-pointer list-none items-start gap-3 font-bold text-omame-deep">
                  <span className="text-omame-gold">Q.</span>
                  <span className="flex-1">{faq.q}</span>
                  <span className="text-omame-gold transition-transform group-open:rotate-45">＋</span>
                </summary>
                <p className="mt-4 border-t border-omame-gold/10 pt-4 text-sm leading-[2]">
                  <span className="mr-2 font-bold text-omame-gold">A.</span>
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="application" className="scroll-mt-6 bg-omame-deep px-5 py-20 text-white md:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-sans text-xs uppercase tracking-[0.32em] text-[#f1d4a2]">Course Information</p>
          <h2 className="mt-4 text-2xl font-bold leading-relaxed md:text-4xl">開催概要・お申込み</h2>
          <div className="mx-auto mt-10 max-w-xl rounded-2xl bg-white p-6 text-left text-omame-text shadow-xl md:p-9">
            <dl className="divide-y divide-omame-gold/15">
              {[
                ["名称", "お豆奏法【動画受講生限定】実践落とし込み講座（第1期）"],
                ["開催", "Zoom（全回アーカイブあり）"],
                ["期間", "2026年8月〜11月／毎月第4木曜日"],
                ["時間", "午前10時〜12時"],
                ["内容", "実践講座 全4回＋質問サポート＋動画添削 月2回＋お茶会 全3回"],
                ["主催", "お豆奏法ラボ"],
              ].map(([term, description]) => (
                <div key={term} className="grid gap-1 py-4 md:grid-cols-[90px_1fr]">
                  <dt className="font-bold text-omame-deep">{term}</dt>
                  <dd className="leading-loose">{description}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-7 rounded-xl bg-omame-accent p-6 text-center">
              <p className="text-sm text-omame-text/70">
                通常価格 <span className="line-through">198,000円</span>
              </p>
              <p className="mt-2 text-sm font-bold text-omame-gold">第1期限定 50,000円引き</p>
              <p className="mt-1 text-4xl font-bold text-omame-deep">
                148,000<span className="text-base">円</span>
              </p>
            </div>
            <p className="mt-5 text-center text-xs leading-loose text-omame-text/60">
              銀行振込・PayPay・クレジットカード
              <br />
              ※カード払いのみ、カード会社への分割申込みが可能です。
            </p>
          </div>
          <div className="mt-9">
            <a
              href="mailto:erina.t.piano@gmail.com?subject=お豆奏法実践落とし込み講座について"
              className="group inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-white px-8 py-4 font-bold text-omame-deep shadow-lg transition hover:-translate-y-0.5"
            >
              メールで申込み・問い合わせ
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
          <p className="mt-5 text-sm text-white/70">erina.t.piano@gmail.com</p>
          <p className="mt-5 text-xs leading-loose text-white/55">
            ※申込フォーム・定員・申込締切・キャンセル規定は公開前に確定し、本欄へ追記します。
          </p>
        </div>
      </section>

      <section className="relative overflow-hidden px-5 py-20 md:py-28">
        <div className="absolute inset-0 opacity-[0.08]">
          <Image src="/images/hands.png" alt="" fill sizes="100vw" className="object-cover" />
        </div>
        <div className="relative mx-auto max-w-2xl text-center">
          <p className="font-sans text-xs uppercase tracking-[0.32em] text-omame-gold">A Message For You</p>
          <h2 className="mt-5 text-2xl font-bold leading-relaxed text-omame-deep md:text-4xl">
            一緒に、一生モノの感覚へ
            <br />
            育てていきましょう。
          </h2>
          <div className="mt-8 space-y-5 leading-[2.2]">
            <p>
              動画を学んだ今、必要なのは、
              <br />
              さらに知識を増やすことだけではありません。
            </p>
            <p>
              あなた自身の身体と音を見ながら、
              <br />
              「これだ」という感覚を育てることです。
            </p>
            <p className="font-bold text-omame-deep">
              4ヶ月間、あなたを一人にしません。
            </p>
          </div>
          <div className="mt-9">
            <Cta label="申込み案内を確認する" />
          </div>
        </div>
      </section>

      <footer className="bg-[#312b27] px-5 py-8 text-center text-xs text-white/55">
        <p>Copyright © お豆奏法ラボ</p>
      </footer>
    </main>
  );
}
