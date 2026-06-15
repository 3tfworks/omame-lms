"use client";

import Image from "next/image";
import { Eyebrow, Heading, Reveal, SectionShell } from "../ui";

// §6 起きる変化
// 「学ぶとどうなるのか」をベネフィット連鎖で見せる。
export function Section06Changes() {
  return (
    <SectionShell className="bg-white">
      <Reveal>
        <Eyebrow>What Will Change</Eyebrow>
        <Heading>{"実際に、\n何が変わるのか。"}</Heading>

        <p className="mt-8 text-center text-base leading-loose text-omame-text md:text-lg">
          お豆奏法で変わるのは、弾き方だけではありません。
          <br />
          音、身体、本番、指導、そしてピアノとの向き合い方そのものに
          <br />
          変化が広がっていきます。
        </p>

        <div className="py-10 md:py-16">
          <Image
            src="/images/omame-change-circle.png"
            alt="お豆奏法で起こる音色・身体・本番力・指導力の変化"
            width={1254}
            height={1254}
            loading="lazy"
            className="mx-auto h-auto w-full max-w-[960px] rounded-2xl shadow-md"
          />
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
