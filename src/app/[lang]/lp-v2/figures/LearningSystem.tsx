import { PlayCircle, FileText, NotebookPen, MessagesSquare } from "lucide-react";

// FIGURE_学習システム
// 中央に受講生、周囲を「動画／レバメモ／マイノート／質問・相談」が囲む。
const elements = [
  {
    icon: PlayCircle,
    no: "①",
    title: "動画講座",
    sub: "全 5 章 47 本。スマホ・PC で何度でも視聴可能。",
  },
  {
    icon: FileText,
    no: "②",
    title: "レバメモ",
    sub: "各動画の要点・行動リスト・まとめポイントをテキスト化した独自の学習サポート資料。",
  },
  {
    icon: NotebookPen,
    no: "③",
    title: "マイノート",
    sub: "各動画ごとに、自分の気づきを記録できるパーソナル学習ノート機能。",
  },
  {
    icon: MessagesSquare,
    no: "④",
    title: "質問・相談",
    sub: "分からないこと、迷っていることをいつでも投げかけられる仕組みがあります。",
  },
];

export function LearningSystem() {
  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6 flex justify-center">
        <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full border border-omame-gold/40 bg-omame-accent/50 text-center">
          <span className="text-xs leading-tight text-omame-deep">あなた</span>
          <span className="text-[0.6rem] leading-tight text-omame-text/60">受講生</span>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {elements.map((e) => (
          <div
            key={e.title}
            className="flex gap-4 rounded-xl border border-omame-gold/20 bg-white p-5 shadow-sm"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-omame-accent/50 text-omame-gold">
              <e.icon className="h-5 w-5" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-base font-bold text-omame-deep">
                <span className="mr-1 text-omame-gold">{e.no}</span>
                {e.title}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-omame-text/70">{e.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
