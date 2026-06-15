"use client";

import { Eyebrow, Heading, Reveal, SectionShell } from "../ui";
import { TalentVsStructure } from "../figures/TalentVsStructure";

// §8 構造の話
// 受講者の声で動かされた感情を、論理で固める。「才能ではなく構造だった」という再定義。
export function Section08Structure() {
  return (
    <SectionShell className="bg-white">
      <Reveal>
        <Eyebrow>Not Talent</Eyebrow>
        <Heading>{"才能ではなく、\n構造だった。"}</Heading>

        <p className="mt-10 text-center text-base leading-loose text-omame-text md:text-lg">
          「できる人」と「できない人」が
          <br />
          いるのではありません。
          <br />
          <br />
          スタート地点で
          <br />
          立っている前提が、
          <br />
          違っていただけなのです。
        </p>

        <div className="mt-12">
          <TalentVsStructure />
        </div>

        <p className="mt-12 text-center text-lg font-bold leading-loose text-omame-deep">
          構造は、学ぶことができます。
          <br />
          だから、変われるのです。
        </p>
      </Reveal>
    </SectionShell>
  );
}
