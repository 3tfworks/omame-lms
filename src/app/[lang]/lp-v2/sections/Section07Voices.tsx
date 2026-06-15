"use client";

import { Eyebrow, Heading, Reveal, SectionShell, VimeoEmbed } from "../ui";

// §7 受講者の声
// 柴田先生は §4b へ前倒し、Y先生は動画なしのため除外。
// 金子先生・才賀崎先生の2本構成。各カードは「結果テキスト → 動画」の順に見せる。
const voices = [
  {
    videoId: "1188098330", // 金子先生インタビュー
    hash: "4b39d0cd81",
    name: "Kaneko-sensei / ピアニスト",
    title: "ジストニアと診断された指が、もう一度動き始めた。",
    body: [
      "ピアニストにとって、ジストニアの診断はキャリアの終わりを意味することもあります。",
      "しかし金子先生は、お豆奏法と出会って、ふたたび弾く喜びを取り戻されました。そのプロセスを、率直に語ってくださっています。",
    ],
  },
  {
    videoId: "1188098243", // 才賀崎先生インタビュー
    hash: "6cc4450180",
    name: "Saigasaki-sensei / ピアノ教室主宰",
    title: "私が変わったら、生徒たちが変わり始めた。",
    body: [
      "ご自身のピアノ教室を主宰される才賀崎先生。お豆奏法を学ばれてから、ご自身の演奏だけでなく、教室の生徒さんたちの変化を強く実感されています。",
      "伴奏オーディションの合格報告など、具体的なエピソードを聞かせてくださいました。",
    ],
  },
];

export function Section07Voices() {
  return (
    <SectionShell width="3xl">
      <Reveal>
        <Eyebrow>More Voices</Eyebrow>
        <Heading>{"柴田先生だけでは、ありません。"}</Heading>

        <p className="mt-8 text-center text-base leading-loose text-omame-text md:text-lg">
          お豆奏法を学ばれた方々が、
          <br />
          それぞれの言葉で、変化を語ってくださいました。
          <br />
          <br />
          技法の話ではなく、
          <br />
          人生がどう変わったか、のお話です。
        </p>
      </Reveal>

      <div className="mt-14 space-y-14">
        {voices.map((v, i) => (
          <Reveal key={v.name}>
            <article className={`${i > 0 ? "border-t border-omame-gold/20 pt-14" : ""}`}>
              {/* 結果テキストを先に見せる */}
              <p className="font-sans text-xs uppercase tracking-[0.15em] text-omame-text/60">
                {v.name}
              </p>
              <p className="mt-3 text-xl font-bold leading-relaxed text-omame-gold md:text-2xl">
                {v.title}
              </p>
              <div className="mt-4 space-y-3 text-sm leading-loose text-omame-text/90 md:text-base">
                {v.body.map((line, j) => (
                  <p key={j}>{line}</p>
                ))}
              </div>
              {/* 動画は結果テキストの後に */}
              <div className="mt-6">
                <VimeoEmbed videoId={v.videoId} hash={v.hash} title={v.name} />
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <p className="mt-14 text-center text-sm leading-loose text-omame-text/70">
          ここに掲載しきれない変化が、
          <br />
          他にもたくさん、寄せられています。
        </p>
      </Reveal>
    </SectionShell>
  );
}
