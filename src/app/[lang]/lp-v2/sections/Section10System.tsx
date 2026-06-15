"use client";

import { Eyebrow, Heading, Reveal, SectionShell } from "../ui";
import { LearningSystem } from "../figures/LearningSystem";

// §10 学習システム
// 「動画を見るだけ」ではない、立体的なサポート設計を見せる。
export function Section10System() {
  return (
    <SectionShell>
      <Reveal>
        <Eyebrow>Not Just Videos</Eyebrow>
        <Heading>{"動画を見るだけでは、\n終わりません。"}</Heading>

        <p className="mt-8 text-center text-base leading-loose text-omame-text md:text-lg">
          理解を、定着へ。
          <br />
          定着を、変化へ。
          <br />
          <br />
          お豆奏法 基礎講座は、
          <br />
          4 つの要素で構成されています。
        </p>

        <div className="mt-12">
          <LearningSystem />
        </div>
      </Reveal>
    </SectionShell>
  );
}
