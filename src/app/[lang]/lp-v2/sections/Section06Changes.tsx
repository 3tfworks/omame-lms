"use client";

import { Eyebrow, Heading, Reveal, SectionShell } from "../ui";
import { ChangeChain } from "../figures/ChangeChain";

// §6 起きる変化
// 「学ぶとどうなるのか」をベネフィット連鎖で見せる。
export function Section06Changes() {
  return (
    <SectionShell className="bg-white">
      <Reveal>
        <Eyebrow>What Will Change</Eyebrow>
        <Heading>{"実際に、\n何が変わるのか。"}</Heading>

        <div className="mt-12">
          <ChangeChain />
        </div>

        <p className="mt-12 text-center text-sm leading-loose text-omame-text/70">
          これらは、すべて
          <br />
          受講された方々から実際にいただいた
          <br />
          お声から生まれたリストです。
        </p>
      </Reveal>
    </SectionShell>
  );
}
