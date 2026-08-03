import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  Check,
  Clock3,
  ExternalLink,
  GraduationCap,
  Laptop,
  Music2,
  Quote,
  Smartphone,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "お豆奏法とは｜おうちで学べるお豆奏法基礎講座",
  description:
    "頑張るピアノから、自然に響くピアノへ。身体・ピアノ・重力の原理に立ち戻る「お豆奏法」と、オンライン基礎講座をご紹介します。",
};

const LINE_URL = "https://lin.ee/RmeCAtQ";

const concerns = [
  "脱力しようとするほど、かえって身体が固まる",
  "練習しているのに、思うような音が出ない",
  "手や腕が疲れる、痛みを感じる",
  "本番になると緊張して、普段のように弾けない",
  "学べば学ぶほど、何が正しいのか分からなくなる",
  "生徒に身体の使い方をうまく伝えられない",
];

const changes = [
  {
    icon: Music2,
    title: "頑張る演奏から、自然な演奏へ",
    body: "力を抜こうと頑張るのではなく、自然に音楽へ集中できる状態を目指します。",
  },
  {
    icon: Sparkles,
    title: "本番で戦う状態から、音楽へ",
    body: "緊張を消そうとするのではなく、音楽そのものへ意識を向けられる状態を目指します。",
  },
  {
    icon: GraduationCap,
    title: "伝わらない指導から、伝わる指導へ",
    body: "ご自身の演奏だけでなく、生徒さんへの伝え方を見直すきっかけにもなります。",
  },
];

const courseTopics = [
  "音の鳴る仕組みと、鍵盤の本当の扱い方",
  "身体の自然な使い方",
  "譜読みを楽にする「たて読み」",
  "日々の練習に取り入れる実践テクニック",
];

const recommendations = [
  "もっと自然な身体でピアノを弾きたい方",
  "脱力や身体の使い方に悩んでいる方",
  "音色や表現を根本から見直したい方",
  "本番で力を発揮できずに悩んでいる方",
  "生徒への伝え方を深めたいピアノ講師の方",
  "お豆奏法を初めて学ぶ方",
];

const voices = [
  {
    quote: "ジストニアと診断された指が、もう一度動き始めた。",
    name: "金子先生／ピアニスト",
  },
  {
    quote: "私が変わったら、生徒たちが変わり始めた。",
    name: "才賀崎先生／ピアノ教室主宰",
  },
];

function SectionTitle({
  eyebrow,
  children,
}: {
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <div className="text-center">
      <p className="font-sans text-[0.68rem] uppercase tracking-[0.28em] text-omame-gold">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-2xl font-bold leading-[1.7] text-omame-deep md:text-3xl">
        {children}
      </h2>
    </div>
  );
}

function Section({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`scroll-mt-8 px-5 py-16 md:py-24 ${className}`}>
      <div className="mx-auto max-w-3xl">{children}</div>
    </section>
  );
}

function buildCourseUrl(lang: string, source?: string, campaign?: string) {
  const params = new URLSearchParams({
    utm_source: source || "offline_introduction",
    utm_medium: "offline",
    utm_campaign: campaign || "course_introduction",
    utm_content: "detail_cta",
  });
  return `/${lang}/lp-v2?${params.toString()}`;
}

export default async function IntroductionPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ utm_source?: string; utm_campaign?: string }>;
}) {
  const [{ lang }, query] = await Promise.all([params, searchParams]);
  const courseUrl = buildCourseUrl(lang, query.utm_source, query.utm_campaign);

  return (
    <main className="w-full overflow-x-hidden bg-omame-bg text-omame-text">
      <section className="relative min-h-[92svh] overflow-hidden bg-stone-950">
        <Image
          src="/images/omame-fv-bg.png"
          alt="光の差し込む部屋でグランドピアノに向かう演奏者の後ろ姿"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[62%_center] md:object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/42 to-black/70" />

        <div className="relative z-10 mx-auto flex min-h-[92svh] max-w-3xl flex-col items-center justify-center px-6 py-20 text-center text-white">
          <p className="font-sans text-[0.65rem] uppercase tracking-[0.36em] text-white/75">
            A New Way of Playing
          </p>
          <h1 className="mt-7 text-[2rem] font-bold leading-[1.75] md:text-5xl md:leading-[1.65]">
            頑張るほど
            <br />
            弾けなくなる。
            <span className="mt-4 block text-xl leading-[1.8] md:text-3xl">
              それは、才能不足でも、
              <br />
              努力不足でもありません。
            </span>
          </h1>

          <div className="mt-9 w-full max-w-sm rounded-2xl border border-omame-gold/55 bg-black/30 px-5 py-6 backdrop-blur-sm">
            <p className="text-xs tracking-[0.18em] text-omame-gold">おうちで学べる</p>
            <p className="mt-2 text-xl font-bold">お豆奏法基礎講座</p>
            <p className="mt-4 text-sm leading-7 text-white/85">
              ピアノ演奏のすべての土台となる、
              <br />
              「原理・原則」を学ぶオンライン動画講座
            </p>
          </div>

          <a
            href="#about"
            className="mt-9 inline-flex min-h-12 items-center gap-2 rounded-full border border-white/50 px-6 text-sm text-white transition-colors hover:bg-white/10"
          >
            お豆奏法について知る
            <ArrowDown className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </section>

      <Section className="bg-white">
        <SectionTitle eyebrow="For You">ピアノの前で、こんなふうに感じていませんか？</SectionTitle>
        <ul className="mx-auto mt-10 grid max-w-2xl gap-3 md:grid-cols-2">
          {concerns.map((concern) => (
            <li
              key={concern}
              className="flex items-start gap-3 rounded-xl border border-omame-gold/20 bg-omame-bg px-4 py-4 text-sm leading-7 md:text-base"
            >
              <span className="mt-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-omame-gold/15 text-omame-deep">
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              {concern}
            </li>
          ))}
        </ul>
        <p className="mx-auto mt-10 max-w-xl text-center text-base leading-9 md:text-lg">
          もっと努力しなければ、と感じるかもしれません。
          <br />
          けれど必要なのは、新しい何かを足すことではないのかもしれません。
        </p>
      </Section>

      <Section id="about">
        <SectionTitle eyebrow="What Is Omame?">
          答えは、「足すこと」ではなく、
          <br />
          本当に必要な原理に戻ることでした。
        </SectionTitle>
        <div className="mx-auto mt-9 max-w-2xl space-y-6 text-[15px] leading-9 md:text-lg">
          <p>
            お豆奏法は、「こう弾きなさい」という新しいテクニックを増やすものではありません。
          </p>
          <p>
            身体の自然な状態、ピアノが音を出す仕組み、そして重力。もともとそこにある原理に立ち戻り、ピアノとの向き合い方そのものを見直していく学びです。
          </p>
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl border border-omame-gold/25 bg-white shadow-sm">
          <Image
            src="/images/omame-add-vs-subtract.png"
            alt="知識やテクニックを足し続ける学びと、必要な原理に戻るお豆奏法の違い"
            width={1536}
            height={1024}
            sizes="(max-width: 768px) 100vw, 768px"
            className="h-auto w-full"
          />
        </div>
      </Section>

      <Section className="bg-white">
        <SectionTitle eyebrow="What Will Change">ピアノとの向き合い方が、変わり始めます。</SectionTitle>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {changes.map(({ icon: Icon, title, body }) => (
            <article
              key={title}
              className="rounded-2xl border border-omame-gold/20 bg-omame-bg p-6 text-center shadow-sm"
            >
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-omame-gold/15 text-omame-deep">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-lg font-bold leading-8 text-omame-deep">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-omame-text/85">{body}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section>
        <SectionTitle eyebrow="The Course">
          お豆奏法の原理を、
          <br />
          おうちで、ご自身のペースで。
        </SectionTitle>

        <div className="mt-9 text-center">
          <p className="text-xl font-bold text-omame-deep">全6章・総まとめを含む47本の動画レッスン</p>
          <p className="mt-3 text-sm leading-7 text-omame-text/75">
            1本約3〜5分。スキマ時間にも少しずつ学べます。
          </p>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {courseTopics.map((topic) => (
            <div key={topic} className="flex items-start gap-3 rounded-xl bg-white px-4 py-4 shadow-sm">
              <BookOpen className="mt-1 h-5 w-5 shrink-0 text-omame-gold" aria-hidden="true" />
              <p className="text-sm leading-7 md:text-base">{topic}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl border border-omame-gold/25 bg-white p-2 shadow-md">
          <Image
            src="/images/omame-lms-screenshot.png"
            alt="お豆奏法基礎講座の動画レッスン画面"
            width={1536}
            height={1024}
            sizes="(max-width: 768px) 100vw, 768px"
            className="h-auto w-full rounded-xl"
          />
        </div>

        <div className="mt-7 flex flex-wrap justify-center gap-3 text-xs text-omame-text/80 md:text-sm">
          {[
            { icon: Smartphone, label: "スマートフォン対応" },
            { icon: Laptop, label: "パソコン対応" },
            { icon: Clock3, label: "繰り返し学べる" },
          ].map(({ icon: Icon, label }) => (
            <span key={label} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm">
              <Icon className="h-4 w-4 text-omame-gold" aria-hidden="true" />
              {label}
            </span>
          ))}
        </div>
      </Section>

      <Section className="bg-white">
        <SectionTitle eyebrow="For Players & Teachers">演奏する方にも、教える方にも。</SectionTitle>
        <ul className="mx-auto mt-9 max-w-2xl space-y-3">
          {recommendations.map((item) => (
            <li key={item} className="flex items-start gap-3 text-sm leading-7 md:text-base">
              <Check className="mt-1 h-5 w-5 shrink-0 text-omame-gold" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-8 text-center text-sm leading-7 text-omame-text/70">
          初心者の方から指導者の方まで、経験レベルを問わず学んでいただけます。
        </p>
      </Section>

      <Section>
        <SectionTitle eyebrow="Voices">お豆奏法を学ばれた方の声</SectionTitle>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {voices.map((voice) => (
            <figure key={voice.name} className="rounded-2xl border border-omame-gold/25 bg-white p-6 shadow-sm">
              <Quote className="h-7 w-7 text-omame-gold/60" aria-hidden="true" />
              <blockquote className="mt-4 text-lg font-bold leading-8 text-omame-deep">
                「{voice.quote}」
              </blockquote>
              <figcaption className="mt-5 text-xs tracking-wide text-omame-text/65">{voice.name}</figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-6 text-center text-xs leading-6 text-omame-text/60">
          ※受講者個人の体験であり、感じ方や変化には個人差があります。
        </p>
      </Section>

      <Section className="bg-white">
        <SectionTitle eyebrow="About Erina">お豆奏法をお伝えしている人</SectionTitle>
        <div className="mx-auto mt-10 grid max-w-2xl items-center gap-8 md:grid-cols-[220px_1fr]">
          <Image
            src="/images/omame-erina-message.jpg"
            alt="お豆奏法考案者の舘依里奈"
            width={600}
            height={600}
            sizes="(max-width: 768px) 240px, 220px"
            className="mx-auto aspect-square w-full max-w-[240px] rounded-2xl object-cover shadow-md"
          />
          <div>
            <p className="text-sm tracking-wide text-omame-gold">ピアニスト・お豆奏法考案者</p>
            <h3 className="mt-2 text-2xl font-bold text-omame-deep">舘 依里奈</h3>
            <p className="mt-5 text-sm leading-8 md:text-base">
              音大での学びや留学、国際コンクールへの挑戦、長年にわたる研究と試行錯誤を経て「お豆奏法」にたどり着く。15年以上にわたり、演奏者やピアノ講師をはじめ、多くの方へお豆奏法の考え方を伝えています。
            </p>
          </div>
        </div>
      </Section>

      <Section className="bg-omame-deep text-white">
        <div className="text-center">
          <p className="font-sans text-[0.68rem] uppercase tracking-[0.28em] text-omame-gold">
            Your Next Step
          </p>
          <h2 className="mt-4 text-2xl font-bold leading-[1.7] md:text-3xl">
            あなたに合った方法で、
            <br />
            お豆奏法に触れてみてください。
          </h2>
        </div>

        <div className="mx-auto mt-10 grid max-w-2xl gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 text-center text-omame-text shadow-lg">
            <p className="text-lg font-bold text-omame-deep">講座について詳しく知りたい方</p>
            <p className="mt-3 text-xs leading-6 text-omame-text/70">
              講座内容、体験談、受講料、お申込み方法をご覧いただけます。
            </p>
            <Link
              href={courseUrl}
              className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-omame-gold px-5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
            >
              お豆奏法基礎講座を詳しく見る
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="rounded-2xl border border-white/25 bg-white/10 p-6 text-center backdrop-blur-sm">
            <p className="text-lg font-bold">まずは、お豆奏法を知りたい方</p>
            <p className="mt-3 text-xs leading-6 text-white/75">
              お豆奏法の考え方や、実際に変化された方の体験談をLINEでお届けします。
            </p>
            <a
              href={LINE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#06C755] px-5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
            >
              公式LINEで受け取る
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </Section>

      <footer className="bg-[#4a4036] px-5 py-10 text-center text-xs leading-7 text-white/65">
        <p className="font-bold tracking-wider text-white/85">お豆奏法ラボ</p>
        <div className="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-1">
          <Link href={`/${lang}`} className="underline-offset-4 hover:underline">
            公式サイト
          </Link>
          <Link href={`/${lang}/tokutei`} className="underline-offset-4 hover:underline">
            特定商取引法に基づく表記
          </Link>
          <Link href={`/${lang}/privacy`} className="underline-offset-4 hover:underline">
            プライバシーポリシー
          </Link>
        </div>
        <p className="mt-4">© OMAME SOHO LAB.</p>
      </footer>
    </main>
  );
}
