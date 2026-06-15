import { Music, Feather, Shield, Heart, Sun } from "lucide-react";

// FIGURE_変化の連鎖
// 縦に並ぶ 5 つのカードを矢印で繋ぐ。
const chain = [
  { icon: Music, title: "音が、変わる", sub: "これまでとは違う響きが、自分の指から生まれる" },
  { icon: Feather, title: "弾くことが、軽くなる", sub: "力みが抜け、長時間弾いても疲れにくくなる" },
  { icon: Shield, title: "本番が、安定する", sub: "不安で崩れていた演奏が、揺るがなくなる" },
  { icon: Heart, title: "痛みが、和らぐ", sub: "手や肘の負担が減り、身体が楽になる" },
  { icon: Sun, title: "演奏が、楽しくなる", sub: "「弾きたい」という気持ちが、戻ってくる" },
];

export function ChangeChain() {
  return (
    <div className="mx-auto max-w-md">
      {chain.map((c, i) => (
        <div key={c.title}>
          <div className="flex items-center gap-4 rounded-xl border border-omame-gold/20 bg-white p-5 shadow-sm">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-omame-accent/50 text-omame-gold">
              <c.icon className="h-6 w-6" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-lg font-bold text-omame-deep">{c.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-omame-text/70">{c.sub}</p>
            </div>
          </div>
          {i < chain.length - 1 && (
            <div className="flex justify-center py-2">
              <div className="h-5 w-px bg-omame-gold/40" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
