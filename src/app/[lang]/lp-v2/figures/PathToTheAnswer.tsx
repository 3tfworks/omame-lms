import { CornerDownRight, CornerDownLeft, ArrowDown } from "lucide-react";

// FIGURE_答えへの地図
// 左：従来の学び方（曲がりくねった経路・くすんだトーン）
// 右：お豆奏法（まっすぐ一本の経路・gold アクセント）
// 文字情報よりも「経路の形」の違いで語る。

// 左：ジグザグの経路。align で左右に振って迷走を表現する。
const winding = [
  { text: "ピアノレッスンに通う", align: "start" as const },
  { text: "奏法セミナーへ", align: "end" as const },
  { text: "専門書を読み漁る", align: "start" as const },
  { text: "別の奏法を試す", align: "end" as const },
  { text: "迷子", align: "start" as const },
];

export function PathToTheAnswer() {
  return (
    <div className="mx-auto grid max-w-xl gap-4 sm:grid-cols-2">
      {/* 従来の学び方（くすんだトーン） */}
      <div className="rounded-2xl border border-omame-text/10 bg-omame-text/[0.04] p-6">
        <p className="mb-6 text-center text-sm font-bold tracking-wide text-omame-text/50">
          従来の学び方
        </p>
        <div className="space-y-1">
          {winding.map((step, i) => (
            <div key={step.text}>
              <div
                className={`flex ${step.align === "end" ? "justify-end" : "justify-start"}`}
              >
                <span
                  className={`rounded-full px-3 py-1.5 text-xs ${
                    i === winding.length - 1
                      ? "bg-omame-text/10 font-bold text-omame-text/60"
                      : "bg-white text-omame-text/50 ring-1 ring-omame-text/10"
                  }`}
                >
                  {step.text}
                </span>
              </div>
              {i < winding.length - 1 && (
                <div
                  className={`flex py-0.5 ${
                    step.align === "start" ? "justify-end pr-6" : "justify-start pl-6"
                  }`}
                >
                  {step.align === "start" ? (
                    <CornerDownRight className="h-3.5 w-3.5 text-omame-text/30" />
                  ) : (
                    <CornerDownLeft className="h-3.5 w-3.5 text-omame-text/30" />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        <p className="mt-6 border-t border-omame-text/10 pt-4 text-center text-sm font-bold text-omame-text/50">
          答えは、どこに?
        </p>
      </div>

      {/* お豆奏法（gold アクセント・まっすぐ） */}
      <div className="rounded-2xl border border-omame-gold/40 bg-omame-bg p-6 shadow-sm shadow-omame-gold/10">
        <p className="mb-6 text-center text-sm font-bold tracking-wide text-omame-gold">
          お豆奏法
        </p>
        <div className="flex flex-col items-center">
          <span className="rounded-full bg-white px-4 py-1.5 text-sm font-medium text-omame-deep ring-1 ring-omame-gold/30">
            原理から学ぶ
          </span>
          <span className="my-1 h-6 w-px bg-omame-gold/50" />
          <ArrowDown className="h-4 w-4 text-omame-gold" />
          <span className="my-1 h-6 w-px bg-omame-gold/50" />
          <span className="rounded-full bg-omame-gold/10 px-4 py-1.5 text-sm font-bold text-omame-deep ring-1 ring-omame-gold/40">
            答えに辿り着く
          </span>
        </div>
        <p className="mt-6 border-t border-omame-gold/30 pt-4 text-center text-sm font-bold text-omame-deep">
          最短距離で、本質へ。
        </p>
      </div>
    </div>
  );
}
