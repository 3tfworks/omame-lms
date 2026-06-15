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

        {/* [IMAGE_えりな先生] → omame-erina-message.png（横長カード） */}
        <div className="mt-12">
          <Image
            src="/images/omame-erina-message.png"
            alt="グランドピアノのそばで微笑む女性ピアノ講師"
            width={1536}
            height={1024}
            loading="lazy"
            className="mx-auto h-auto w-full max-w-[760px] rounded-2xl shadow-md"
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
