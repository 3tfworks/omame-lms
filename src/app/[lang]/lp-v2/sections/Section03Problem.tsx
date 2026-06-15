"use client";

import { Eyebrow, Heading, Reveal, SectionShell } from "../ui";
import { InfoOverflow } from "../figures/InfoOverflow";

// §3 問題提起
// 原因は「努力不足」ではなく「情報過多」だと位置づける。
export function Section03Problem() {
  return (
    <SectionShell>
      <Reveal>
        <Eyebrow>The True Problem</Eyebrow>
        <Heading>{"なぜ、頑張るほど\n苦しくなるのでしょうか。"}</Heading>

        <div className="mt-12 space-y-8 text-base leading-loose text-omame-text md:text-lg">
          <p>
            世の中には、たくさんの奏法があります。
            <br />
            <br />
            脱力、姿勢、手首、肘、
            <br />
            重力奏法、ロシア奏法、
            <br />
            体幹、呼吸、ペダリング ——
            <br />
            <br />
            学べば学ぶほど、
            <br />
            「やるべきこと」が増えていきます。
          </p>

          <div className="py-4">
            <InfoOverflow />
          </div>

          <p>
            真面目で、努力家な人ほど、
            <br />
            それを全部、抱え込もうとします。
            <br />
            <br />
            そして気づくと、
            <br />
            身体は固まり、頭は混乱し、
            <br />
            ピアノの前で、何をしたらいいのか
            <br />
            分からなくなっている。
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-md border-y border-omame-gold/30 py-8 text-center">
          <p className="text-xl font-bold leading-loose text-omame-deep">
            足りないのではなく、
            <br />
            増えすぎている。
          </p>
          <p className="mt-4 text-base text-omame-text/80">
            ——
            <br />
            それが、本当の問題かもしれません。
          </p>
        </div>
      </Reveal>
    </SectionShell>
  );
}
