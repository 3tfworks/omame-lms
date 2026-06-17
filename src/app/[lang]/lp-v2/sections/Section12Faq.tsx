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
    a: "はい。\n\n多くの講師の方に受講いただいておりますが、\n\n「生徒が勝手に上達するようになった」\n「音が変わった」\n「レッスンが驚くほど楽になった」\n「練習への取り組み方が変わった」\n\nというお声を数多くいただいています。\n\nお豆奏法は、\n先生と生徒が頑張り続けるためのメソッドではなく、\n\n生徒自身が理解し、成長できる状態を自然と導き出すメソッドです。",
  },
  {
    q: "動画だけで、本当に理解できますか？",
    a: "はい。\n\n各動画には「レバメモ」と呼ばれる独自のサポート資料が付属しており、\n\n何を理解するべきか\n何を意識するべきか\n次に何を試すべきか\n\nが一目で分かるようになっています。\n\nまた、お豆奏法は知識を覚える講座ではなく、\n\n「体感しながら理解する」\n\nことを重視しているため、\n\n動画を見るだけで終わらず、\n実際に弾きながら自然と理解が深まる設計になっています。",
  },
  {
    q: "どれくらいで変化を感じられますか？",
    a: "個人差はありますが、多くの方が第 1 章を見終えた時点で\n\n「今までとは感覚が違う」\n「音が変わった気がする」\n\nという変化を感じ始めます。\n\n早い方では 1 週間ほどで演奏時の身体の使い方や音色の変化を実感されることもあります。\n\nお豆奏法は技術を積み上げるというよりも、\n演奏の捉え方そのものを変えていくため、\n比較的早い段階で変化を感じやすい傾向があります。",
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
                      <span className="whitespace-pre-line">{item.a}</span>
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
