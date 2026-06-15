"use client";

import Image from "next/image";
import { Eyebrow, Heading, Reveal, SectionShell, VimeoEmbed } from "../ui";

// §4 ストーリー（えりな先生）
// えりな先生の人格信頼を LP 内で再構築する。
const VIMEO_ID_ERINA_INTRO = "PLACEHOLDER"; // [VIMEO_ID_えりな先生自己紹介]

export function Section04Story() {
  return (
    <SectionShell className="bg-white">
      <Reveal>
        <Eyebrow>Her Story</Eyebrow>
        <Heading>{"私自身も、ずっと\n奏法迷子でした。"}</Heading>

        <div className="mt-12 space-y-8 text-base leading-loose text-omame-text md:text-lg">
          <p>
            舘 依里奈（たち えりな）と申します。
            <br />
            <br />
            幼少期からピアノを始め、
            <br />
            音大に進学し、フランスへ留学。
            <br />
            国際コンクールに出場し、
            <br />
            たくさんの先生に師事してきました。
          </p>

          <p>
            それでも、私には
            <br />
            「自分の音が好きになれない」
            <br />
            という悩みがありました。
            <br />
            <br />
            うまく弾けない理由を探し続け、
            <br />
            研究ノートは、20冊を超えました。
          </p>
        </div>

        {/* [IMAGE_研究ノート] 手書きメモが大量に写った写真 */}
        <div className="my-12 overflow-hidden rounded-2xl shadow-md shadow-omame-deep/10">
          <Image
            src="/images/lp-v2/research-notes.jpg"
            alt="えりな先生の研究ノート"
            width={768}
            height={512}
            className="h-auto w-full object-cover"
          />
        </div>

        <div className="space-y-8 text-base leading-loose text-omame-text md:text-lg">
          <p>
            ある日、ふと気づいたのです。
          </p>
          <p className="border-l-2 border-omame-gold/50 pl-5 text-omame-deep">
            「私は、足し続けてきた。
            <br />
            でも本当は、
            <br />
            引き算が必要だったのかもしれない」
          </p>
          <p>
            そこから生まれたのが、
            <br />
            お豆奏法でした。
          </p>
        </div>

        {/* [VIMEO_ID_えりな先生自己紹介] */}
        <div className="mt-14">
          <VimeoEmbed videoId={VIMEO_ID_ERINA_INTRO} title="お豆奏法が生まれるまで" />
          <p className="mt-4 text-center text-xs leading-relaxed text-omame-text/60">
            3〜5分のえりな先生自己紹介。
            <br />
            留学・コンクール・研究ノート・気付きの瞬間まで、
            <br />
            LINEで語った物語を、声と表情でもう一度。
          </p>
        </div>
      </Reveal>
    </SectionShell>
  );
}
