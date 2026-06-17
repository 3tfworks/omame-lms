"use client";

import { Eyebrow, Heading, Reveal, SectionShell } from "../ui";
import { AddVsSubtract } from "../figures/AddVsSubtract";

// §5 お豆奏法とは
// LP の核。だが絶対に技法を説明しない。「足し算ではなく引き算」という思想を提示するだけ。
export function Section05WhatItIs() {
  return (
    <SectionShell>
      <Reveal>
        <Eyebrow>What It Is</Eyebrow>
        <Heading>{"お豆奏法は、\n新しい技術ではありません。"}</Heading>

        <p className="mt-10 text-center text-lg font-bold leading-loose text-omame-deep">
          足す奏法ではなく、
          <br />
          戻る奏法。
        </p>
        <p className="mt-6 text-center text-base leading-loose text-omame-text md:text-lg">
          何かを身につけるのではなく、
          <br />
          本来備わっている感覚を
          <br />
          取り戻すための「考え方」です。
        </p>

        <div className="mt-12">
          <AddVsSubtract />
        </div>

        <p className="mt-12 text-center text-sm leading-loose text-omame-text/70">
          だから
          <br />
          お豆奏法は
          <br />
          『奏法』というより
          <br />
          『気付き』そのものです。
        </p>
      </Reveal>
    </SectionShell>
  );
}
