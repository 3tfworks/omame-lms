"use client";

import Image from "next/image";
import { Eyebrow, Heading, Reveal, SectionShell } from "../ui";

// §9 講座内容
// ここで初めて商品の中身を見せる。具体性と「ボリューム感」を両立。
// 章タイトル自体が情報量を持つため、サブテキストは付けず番号＋タイトルで端的に。
// 「総まとめ」は章番号ではなく別カテゴリ（summary フラグで見せ方を変える）。
const chapters = [
  { no: "第 1 章", title: "「ピアノの常識を、根底から覆します」―お豆奏法の原点と核心" },
  { no: "第 2 章", title: "音の鳴る仕組みと、鍵盤の「本当の扱い方」" },
  { no: "第 3 章", title: "身体の本当の使い方 〜\"自然体\"とは" },
  { no: "第 4 章", title: "「たて読み」で譜読みが超楽になる💕" },
  { no: "第 5 章", title: "「ズレ」の最終調整" },
  { no: "第 6 章", title: "お豆奏法・実践テクニック集" },
  {
    no: "総まとめ",
    title: "「\"頑張るピアノ\"に戻らないために」―お豆奏法の総仕上げ―",
    summary: true,
  },
];

export function Section09Course() {
  return (
    <SectionShell id="course" width="3xl">
      <Reveal>
        <Eyebrow>The Course</Eyebrow>
        <Heading>{"お豆奏法 基礎講座で、\n学べること。"}</Heading>

        <p className="mt-8 text-center text-base leading-loose text-omame-text md:text-lg">
          全 6 章＋総まとめ・動画 47 本。
          <br />
          お豆奏法の根本から、
          <br />
          日々の練習・演奏への応用までを、
          <br />
          一つずつ丁寧にお伝えします。
        </p>
      </Reveal>

      <div className="mt-12 space-y-5">
        {chapters.map((c) => (
          <Reveal key={c.no}>
            <div
              className={
                c.summary
                  ? "rounded-xl border-2 border-omame-gold/50 bg-omame-bg p-6 shadow-sm shadow-omame-gold/10"
                  : "rounded-xl border border-omame-gold/20 bg-white p-6 shadow-sm"
              }
            >
              <div className="mb-3 flex items-center gap-3">
                <span
                  className={`font-sans text-sm font-bold tracking-wide ${
                    c.summary ? "text-omame-deep" : "text-omame-gold"
                  }`}
                >
                  {c.no}
                </span>
                <span
                  className={`h-px flex-1 ${c.summary ? "bg-omame-gold/50" : "bg-omame-gold/20"}`}
                />
              </div>
              <h3 className="text-lg font-bold leading-relaxed text-omame-deep">{c.title}</h3>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal>
        {/* [IMAGE_会員サイト_スクショ] LMS の動画一覧スクリーンショット */}
        <div className="mt-12 overflow-hidden rounded-2xl border border-omame-gold/20 shadow-md shadow-omame-deep/10">
          <Image
            src="/images/lp-v2/lms-screenshot.jpg"
            alt="会員サイトの画面"
            width={768}
            height={480}
            className="h-auto w-full object-cover"
          />
        </div>
        <p className="mt-4 text-center text-xs leading-relaxed text-omame-text/60">
          会員サイトでは、いつでも・どこでも
          <br />
          スマートフォン・PC・タブレットから受講いただけます。
        </p>
      </Reveal>
    </SectionShell>
  );
}
