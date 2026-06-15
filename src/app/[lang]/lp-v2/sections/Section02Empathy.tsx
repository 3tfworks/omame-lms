"use client";

import { Square } from "lucide-react";
import { Eyebrow, Heading, Reveal, SectionShell } from "../ui";
import { OverwhelmedBubbles } from "../figures/OverwhelmedBubbles";

// §2 共感
// 「私のことだ」と思わせる。チェックリスト形式で読者の悩みを具体的に列挙。
const painPoints = [
  "練習しても、上達した実感がない",
  "本番になると、いつも崩れてしまう",
  "どれだけ気をつけても、音が固い",
  "弾いていると、指や手首が痛くなる",
  "力を抜きたいのに、抜けない",
  "生徒が、なかなか練習してこない",
  "いろいろ学んだけれど、何が正解か分からない",
  "自分の演奏の「方向性」を見失っている",
  // 最後の一文は感情に届くパンチライン。少し違う見せ方にする。
  "ピアノが好きなのに、苦しい",
];

export function Section02Empathy() {
  return (
    <SectionShell className="bg-white">
      <Reveal>
        <Eyebrow>Do You Feel This?</Eyebrow>
        <Heading>{"こんなお悩みは、\nありませんか？"}</Heading>

        <div className="mt-12">
          <OverwhelmedBubbles />
        </div>

        <ul className="mx-auto mt-12 max-w-lg space-y-4">
          {painPoints.map((p, i) => {
            const isClimax = i === painPoints.length - 1;
            return (
              <li
                key={p}
                className={`flex items-start gap-3 ${isClimax ? "mt-6" : ""}`}
              >
                <Square
                  className={`mt-1 h-5 w-5 shrink-0 ${
                    isClimax ? "text-omame-gold" : "text-omame-gold/70"
                  }`}
                  strokeWidth={1.5}
                />
                <span
                  className={`leading-relaxed md:text-lg ${
                    isClimax
                      ? "text-base italic text-omame-deep"
                      : "text-base text-omame-text"
                  }`}
                >
                  {p}
                </span>
              </li>
            );
          })}
        </ul>

        <p className="mt-12 text-center text-lg font-bold leading-loose text-omame-deep">
          もし、一つでも当てはまるなら ——
          <br />
          それは、あなたの努力不足ではありません。
        </p>
      </Reveal>
    </SectionShell>
  );
}
