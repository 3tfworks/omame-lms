"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Eyebrow, Heading, Reveal, SectionShell } from "../ui";

// §12 FAQ
// 申込前の不安を一気に解消する。アコーディオン形式（CSR）。
const faqs = [
  {
    q: "初心者でも受講できますか？",
    a: "はい、もちろんです。お豆奏法は技術以前の「考え方」を学ぶ講座のため、レベルに関わらず受講いただけます。むしろ、変なクセがついていない方のほうが吸収が早いこともあります。",
  },
  {
    q: "子どもでも理解できますか？",
    a: "動画の内容は大人向けに作られていますが、保護者の方が一緒に学んでいただければ、お子様にも応用いただけます。小学校高学年以上であれば、ご本人だけでもご理解いただけるかと思います。",
  },
  {
    q: "ピアノ講師として、自分の指導に活かせますか？",
    a: "多くの講師の方に受講いただいており、実際に「生徒が変わった」というお声を数多くいただいています。ご自身の演奏改善はもちろん、指導の引き出しを広げる材料としてもご活用いただけます。",
  },
  {
    q: "動画だけで、本当に理解できますか？",
    a: "各動画には「レバメモ」と呼ばれる独自のサポート資料がついており、要点・行動リスト・まとめポイントをテキストでも確認できます。さらに、ご質問もお受けしますので、一人で取り残されることはありません。",
  },
  {
    q: "どれくらいで変化を感じられますか？",
    a: "個人差はありますが、多くの方が第 1 章を見終えた時点で「これまでとは違う何か」を感じ始められています。音色や身体の感覚の変化は、早い方で 2 週間〜1 ヶ月で実感される傾向にあります。",
  },
  {
    q: "スマートフォンだけでも受講できますか？",
    a: "はい、すべての動画・資料がスマートフォン・タブレット・PC でご視聴いただけます。いつでも、どこでも、ご自身のペースで学習を進めていただけます。",
  },
];

export function Section12Faq() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <SectionShell>
      <Reveal>
        <Eyebrow>FAQ</Eyebrow>
        <Heading>{"よくいただく、\nご質問。"}</Heading>

        <div className="mt-12 space-y-3">
          {faqs.map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className="overflow-hidden rounded-xl border border-omame-gold/20 bg-white"
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full cursor-pointer items-center justify-between gap-4 p-4 text-left md:p-5"
                  aria-expanded={isOpen}
                >
                  <span className="flex items-start gap-3 text-sm font-bold text-omame-deep md:text-base">
                    <span className="text-omame-gold">Q.</span>
                    <span>{item.q}</span>
                  </span>
                  {isOpen ? (
                    <ChevronUp className="h-5 w-5 shrink-0 text-omame-gold" />
                  ) : (
                    <ChevronDown className="h-5 w-5 shrink-0 text-omame-gold" />
                  )}
                </button>
                {isOpen && (
                  <div className="border-t border-omame-gold/10 px-4 pb-4 pt-4 md:px-5 md:pb-5">
                    <p className="flex gap-2 text-sm leading-7 text-omame-text/80 md:text-base md:leading-loose">
                      <span className="font-bold text-omame-gold">A.</span>
                      <span>{item.a}</span>
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Reveal>
    </SectionShell>
  );
}
