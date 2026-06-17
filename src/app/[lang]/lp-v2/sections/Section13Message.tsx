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

        {/* [IMAGE_えりな先生] → omame-erina-message.jpg（縦長ポートレート） */}
        <div className="mt-12">
          <Image
            src="/images/omame-erina-message.jpg"
            alt="グランドピアノの前でマイクを手に微笑む女性ピアノ講師"
            width={910}
            height={1291}
            loading="lazy"
            decoding="async"
            className="mx-auto h-auto w-full max-w-[320px] rounded-2xl shadow-md md:max-w-[460px]"
          />
        </div>

        <div className="mx-auto mt-8 max-w-[340px] space-y-6 text-[15px] leading-loose text-omame-text md:mt-12 md:max-w-md md:text-lg">
          <p>
            私は、奏法を教えたいのでは
            <br />
            ありません。
          </p>
          <p>ピアノを、もっと楽しんでいただきたいのです。</p>
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
