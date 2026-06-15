"use client";

import Image from "next/image";
import { Eyebrow, Heading, Reveal, SectionShell } from "../ui";

// §4c お豆奏法で起こる変化
// 説明ではなく未来を見せる。文字は最小限、Before/After 画像が主役。
// width/height は各画像の実寸（比率が異なるとカードごとに変わる）。
const changes = [
  {
    src: "/images/omame-before-after-performance.png",
    w: 1672,
    h: 941,
    alt: "頑張る演奏から自然な演奏への変化",
    title: "頑張る演奏から、自然な演奏へ。",
    body: ["力を抜こうと頑張るのではなく、自然に音楽へ集中できる状態へ。"],
  },
  {
    src: "/images/omame-before-after-stage.png",
    w: 1672,
    h: 941,
    alt: "本番で戦う状態から音楽に集中できる状態への変化",
    title: "本番で戦うから、音楽へ。",
    body: [
      "緊張を消そうとするのではなく、",
      "良く弾こうと戦うのでもなく、",
      "音楽そのものに意識を向けられるようになる。",
    ],
  },
  {
    src: "/images/omame-before-after-teaching.png",
    w: 1672,
    h: 941,
    alt: "生徒への伝わり方の変化",
    title: "伝わらないから、伝わるへ。",
    body: ["自分が変わるだけではなく、生徒への伝え方も変わっていく。"],
  },
];

export function Section04cChanges() {
  return (
    <SectionShell width="3xl">
      <Reveal>
        <Eyebrow>What Will Change</Eyebrow>
        <Heading>お豆奏法で起こる変化</Heading>

        <p className="mt-8 text-center text-base leading-loose text-omame-text md:text-lg">
          お豆奏法で変わるのは、弾き方だけではありません。
          <br />
          音との向き合い方。
          <br />
          本番との向き合い方。
          <br />
          そして、生徒との向き合い方まで。
          <br />
          <br />
          少しずつ、しかし確かに変化が広がっていきます。
        </p>
      </Reveal>

      <div className="mt-12">
        {changes.map((c, i) => (
          <Reveal key={c.src}>
            <div className={i > 0 ? "mt-12 md:mt-20" : ""}>
              <Image
                src={c.src}
                alt={c.alt}
                width={c.w}
                height={c.h}
                loading="lazy"
                className="mx-auto h-auto w-full max-w-[900px] rounded-3xl shadow-md"
              />
              <p className="mt-6 text-center text-xl font-bold leading-relaxed text-omame-deep md:text-2xl">
                {c.title}
              </p>
              <p className="mt-3 text-center text-sm leading-loose text-omame-text/70 md:text-base">
                {c.body.map((line, j) => (
                  <span key={j}>
                    {line}
                    {j < c.body.length - 1 && <br />}
                  </span>
                ))}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}
