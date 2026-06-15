import { X, Check } from "lucide-react";

// FIGURE_才能vs構造
// 左：「才能」に×、右：「構造」に○
export function TalentVsStructure() {
  return (
    <div className="mx-auto grid max-w-md grid-cols-2 gap-4">
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-omame-text/10 bg-omame-text/[0.04] p-7">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-omame-text/10 text-omame-text/40">
          <X className="h-6 w-6" strokeWidth={2} />
        </div>
        <p className="text-base font-bold text-omame-text/50">才能の有無</p>
      </div>
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-omame-gold/40 bg-omame-bg p-7 shadow-sm shadow-omame-gold/10">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-omame-gold/15 text-omame-gold">
          <Check className="h-6 w-6" strokeWidth={2} />
        </div>
        <p className="text-base font-bold text-omame-deep">構造の理解</p>
      </div>
    </div>
  );
}
