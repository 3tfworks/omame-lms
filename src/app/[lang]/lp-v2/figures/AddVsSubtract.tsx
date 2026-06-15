// FIGURE_足し算vs引き算
// 左：足し算（脱力+姿勢+指+筋トレ+フォーム→混乱）／右：引き算（不要なものを外す→自然→音が変わる）

const addItems = ["＋ 脱力", "＋ 姿勢", "＋ 指の形", "＋ 筋トレ", "＋ フォーム", "＋ …"];
const subItems = ["ー 不要なものを外す", "ー 力みを手放す", "ー 思い込みを解く"];

export function AddVsSubtract() {
  return (
    <div className="mx-auto grid max-w-xl gap-4 sm:grid-cols-2">
      {/* 足し算（暗いトーン） */}
      <div className="rounded-2xl border border-omame-text/10 bg-omame-text/[0.04] p-6">
        <p className="mb-4 text-center text-sm font-bold tracking-wide text-omame-text/50">
          一般的な奏法
        </p>
        <ul className="space-y-2 text-center text-omame-text/60">
          {addItems.map((t) => (
            <li key={t} className="text-base">
              {t}
            </li>
          ))}
        </ul>
        <div className="mt-5 space-y-1 border-t border-omame-text/10 pt-4 text-center text-sm font-bold text-omame-text/50">
          <p>→ 混乱</p>
          <p>→ 固まる</p>
        </div>
      </div>

      {/* 引き算（明るいトーン・gold アクセント） */}
      <div className="rounded-2xl border border-omame-gold/40 bg-omame-bg p-6 shadow-sm shadow-omame-gold/10">
        <p className="mb-4 text-center text-sm font-bold tracking-wide text-omame-gold">
          お豆奏法
        </p>
        <ul className="space-y-2 text-center text-omame-deep">
          {subItems.map((t) => (
            <li key={t} className="text-base font-medium">
              {t}
            </li>
          ))}
        </ul>
        <div className="mt-5 space-y-1 border-t border-omame-gold/30 pt-4 text-center text-sm font-bold text-omame-deep">
          <p>→ 自然</p>
          <p>→ 音が変わる</p>
        </div>
      </div>
    </div>
  );
}
