import { ArrowRight, Smile, Layers, Frown } from "lucide-react";

// FIGURE_情報過多
// 左：初心者 → 中央：知識を背負う → 右：苦しむ
const steps = [
  { icon: Smile, label: "はじまり", sub: "身軽" },
  { icon: Layers, label: "学び続ける", sub: "知識を背負う" },
  { icon: Frown, label: "いま", sub: "苦しい" },
];

export function InfoOverflow() {
  return (
    <div className="mx-auto flex max-w-lg items-center justify-center gap-2 sm:gap-4">
      {steps.map((s, i) => (
        <div key={s.label} className="flex items-center gap-2 sm:gap-4">
          <div className="flex w-20 flex-col items-center gap-2 text-center sm:w-24">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-full ${
                i === 2
                  ? "bg-omame-deep/10 text-omame-deep"
                  : "bg-omame-accent/50 text-omame-deep/60"
              }`}
            >
              <s.icon className="h-6 w-6" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs font-bold text-omame-deep">{s.label}</p>
              <p className="text-[0.65rem] text-omame-text/60">{s.sub}</p>
            </div>
          </div>
          {i < steps.length - 1 && (
            <ArrowRight className="h-4 w-4 shrink-0 text-omame-gold/60" />
          )}
        </div>
      ))}
    </div>
  );
}
