import { User } from "lucide-react";

// FIGURE_悩みの吹き出し
// 中央に悩むピアニスト、四隅に「脱力？」「指の形？」「姿勢？」「練習不足？」の吹き出し。
const bubbles = ["脱力？", "指の形？", "姿勢？", "練習不足？"];

export function OverwhelmedBubbles() {
  return (
    <div className="mx-auto grid max-w-md grid-cols-2 items-center gap-3 sm:gap-4">
      <Bubble text={bubbles[0]} align="end" />
      <Bubble text={bubbles[1]} align="start" />

      <div className="col-span-2 my-1 flex justify-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full border border-omame-gold/30 bg-omame-accent/50">
          <User className="h-10 w-10 text-omame-deep/70" strokeWidth={1.4} />
        </div>
      </div>

      <Bubble text={bubbles[2]} align="end" />
      <Bubble text={bubbles[3]} align="start" />
    </div>
  );
}

function Bubble({ text, align }: { text: string; align: "start" | "end" }) {
  return (
    <div className={`flex ${align === "end" ? "justify-end" : "justify-start"}`}>
      <span className="rounded-full bg-white px-4 py-2 text-sm text-omame-deep/80 shadow-sm ring-1 ring-omame-gold/20">
        {text}
      </span>
    </div>
  );
}
