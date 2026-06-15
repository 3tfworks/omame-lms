"use client";

import Image from "next/image";
import { Eyebrow, Heading, Reveal, SectionShell } from "../ui";

// §13 メッセージ
// 申込ボタンの直前に、えりな先生の人格を最後にもう一度。感情パート。
export function Section13Message() {
  return (
    <SectionShell className="bg-white">
      <Reveal>
        <Eyebrow>A Letter from Erina</Eyebrow>
        <Heading>最後に、ひとつだけ。</Heading>

        {/* [IMAGE_えりな先生_笑顔] */}
        <div className="mx-auto mt-12 h-40 w-40 overflow-hidden rounded-full shadow-md shadow-omame-deep/10">
          <Image
            src="/images/lp-v2/erina-smiling.jpg"
            alt="舘 依里奈"
            width={400}
            height={400}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="mx-auto mt-12 max-w-md space-y-6 text-base leading-loose text-omame-text md:text-lg">
          <p>
            私は、奏法を教えたいのでは
            <br />
            ありません。
          </p>
          <p>ピアノを、好きでいてほしいのです。</p>
          <p>
            努力しても変わらない。
            <br />
            苦しい。辛い。
            <br />
            それでもピアノが、好き。
          </p>
          <p>
            ——
            <br />
            そんな方にこそ、
            <br />
            このお豆奏法 基礎講座を
            <br />
            届けたいと思っています。
          </p>
        </div>

        <p className="mt-10 text-center text-lg italic text-omame-deep">舘 依里奈</p>
      </Reveal>
    </SectionShell>
  );
}
