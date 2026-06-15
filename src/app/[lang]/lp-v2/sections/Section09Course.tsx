"use client";

import Image from "next/image";
import { Eyebrow, Heading, Reveal, SectionShell } from "../ui";

// §9 講座内容
// ここで初めて商品の中身を見せる。具体性と「ボリューム感」を両立。
const chapters = [
  {
    no: "第 1 章",
    title: "お豆奏法の原理",
    body: "「足し算ではなく引き算」その思想の根本を、具体的な事例とともに学びます。",
  },
  {
    no: "第 2 章",
    title: "身体との向き合い方",
    body: "力みの正体、痛みの原因、無意識のクセに気づき、身体本来の感覚を取り戻します。",
  },
  {
    no: "第 3 章",
    title: "演奏への応用",
    body: "タッチ、音色、ペダリング、表現の幅をどう広げるか。具体的な楽曲を題材に解説します。",
  },
  {
    no: "第 4 章",
    title: "読譜",
    body: "楽譜の読み方が変わると、演奏も変わります。お豆奏法の視点での読譜法。",
  },
  {
    no: "第 5 章",
    title: "練習法",
    body: "「うまくなるための練習」と「自分を苦しめる練習」の違い。日々の練習を再設計します。",
  },
];

export function Section09Course() {
  return (
    <SectionShell id="course" width="3xl">
      <Reveal>
        <Eyebrow>The Course</Eyebrow>
        <Heading>{"お豆奏法 基礎講座で、\n学べること。"}</Heading>

        <p className="mt-8 text-center text-base leading-loose text-omame-text md:text-lg">
          全 5 章・動画 47 本。
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
            <div className="rounded-xl border border-omame-gold/20 bg-white p-6 shadow-sm">
              <div className="mb-3 flex items-center gap-3">
                <span className="font-sans text-sm font-bold tracking-wide text-omame-gold">
                  {c.no}
                </span>
                <span className="h-px flex-1 bg-omame-gold/20" />
              </div>
              <h3 className="text-lg font-bold text-omame-deep">{c.title}</h3>
              <p className="mt-2 text-sm leading-loose text-omame-text/80 md:text-base">
                {c.body}
              </p>
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
