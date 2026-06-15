"use client";

import { Eyebrow, Heading, Reveal, SectionShell, VimeoEmbed } from "../ui";

// §7 受講者の声（最重要セクション）
// インタビュー動画 4 本を一気に投入。LP 全体で最も CV を押し上げる。
const voices = [
  {
    // [VIMEO_ID_柴田先生インタビュー]
    videoId: "PLACEHOLDER",
    name: "Shibata-sensei / ピアノ講師",
    title: "50年悩み続けた痛みが、消えた。",
    body: [
      "長年ピアノ講師として活動されてきた柴田先生。",
      "手の痛みと音色への悩みが、半世紀ものあいだ解消されないまま続いていました。",
      "お豆奏法と出会い、ご自身が変わり、そして指導する生徒さんたちも変わっていく —— その全過程をお話しいただきました。",
    ],
  },
  {
    // [VIMEO_ID_Y先生インタビュー]
    videoId: "PLACEHOLDER",
    name: "Y-sensei / ピアニスト",
    title: "本番が怖かった私が、ソロ活動を始められた。",
    body: [
      "プロとして活動しながらも、本番のたびに不安に襲われていたY先生。",
      "お豆奏法を通じて、「本番で崩れる原因」が技術ではなく構造にあったと気づき、今では年に何度もの本番をこなされています。",
    ],
  },
  {
    // [VIMEO_ID_金子先生インタビュー]
    videoId: "PLACEHOLDER",
    name: "Kaneko-sensei / ピアニスト",
    title: "ジストニアと診断された指が、もう一度動き始めた。",
    body: [
      "ピアニストにとって、ジストニアの診断はキャリアの終わりを意味することもあります。",
      "しかし金子先生は、お豆奏法と出会って、ふたたび弾く喜びを取り戻されました。そのプロセスを、率直に語ってくださっています。",
    ],
  },
  {
    // [VIMEO_ID_才賀崎先生インタビュー]
    videoId: "PLACEHOLDER",
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
        <Eyebrow>Voices</Eyebrow>
        <Heading>受講者の、変化。</Heading>

        <p className="mt-8 text-center text-base leading-loose text-omame-text md:text-lg">
          お豆奏法を学ばれた方々が、
          <br />
          ご自身の言葉で語ってくださいました。
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
            <article
              className={`${i > 0 ? "border-t border-omame-gold/20 pt-14" : ""}`}
            >
              <VimeoEmbed videoId={v.videoId} title={v.name} />
              <p className="mt-6 font-sans text-xs uppercase tracking-[0.15em] text-omame-text/60">
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
