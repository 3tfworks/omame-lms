"use client";

import Image from "next/image";
import { Eyebrow, Heading, Reveal, SectionShell, VimeoEmbed } from "../ui";

// §4b 変化の予告（柴田先生独立）
// えりな先生のストーリー直後に「実際に変化を経験された方」を投入し、
// 「では学ぶとどうなるのか」に即座に答える橋渡し。最強の証言を前倒し配置する。
const VIMEO_ID_SHIBATA = "1188098171"; // 柴田先生インタビュー
const VIMEO_HASH_SHIBATA = "d83555146c";

export function Section04bBridge() {
  return (
    <SectionShell width="3xl" className="bg-omame-accent/30">
      <Reveal>
        <Eyebrow>A Witness</Eyebrow>
        <Heading>{"50年間解決しなかった悩みが、\n変わり始めた。"}</Heading>

        <p className="mt-8 text-center text-base leading-loose text-omame-text md:text-lg">
          お豆奏法を学ばれた、
          <br />
          ある一人のピアノ講師の物語。
        </p>

        {/* 50年間の悩みが変化するストーリー図解（動画への橋渡し） */}
        <div className="py-10 md:py-16">
          <Image
            src="/images/omame-50years-story.png"
            alt="50年間解決しなかったピアノの悩みが変化するストーリー図解"
            width={1402}
            height={1122}
            loading="lazy"
            decoding="async"
            className="mx-auto h-auto w-full max-w-[1000px] rounded-2xl shadow-md"
          />
          <p className="mt-4 text-center text-sm leading-loose text-omame-text/60">
            動画では、50年近く探し続けてきた悩みが、お豆奏法によってどのように変化したのかをお話しいただいています。
          </p>
        </div>

        {/* 柴田先生インタビュー（大きめ表示） */}
        <div className="mt-12">
          <VimeoEmbed
            videoId={VIMEO_ID_SHIBATA}
            hash={VIMEO_HASH_SHIBATA}
            title="柴田先生インタビュー"
          />
        </div>

        <p className="mt-6 text-center text-sm leading-loose text-omame-text/70">
          柴田先生（ピアノ講師）。
          <br />
          <br />
          半世紀ものあいだ続いた
          <br />
          手の痛みと、音色への悩み。
          <br />
          それが、お豆奏法と出会って、変わり始めた——
          <br />
          <br />
          ご自身の言葉で、語ってくださっています。
        </p>
      </Reveal>

      {/* 次セクションへの橋渡し */}
      <Reveal>
        <div className="mx-auto mt-16 max-w-md border-y border-omame-gold/30 py-10 text-center">
          <p className="text-xl font-bold leading-loose text-omame-deep md:text-2xl">
            「もし、変われるとしたら——
            <br />
            何が変わるのでしょうか。」
          </p>
          <p className="mt-6 text-sm leading-loose text-omame-text/70">
            ——
            <br />
            その答えを、これから、お伝えします。
          </p>
        </div>
      </Reveal>
    </SectionShell>
  );
}
