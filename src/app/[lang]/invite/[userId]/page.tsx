"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Mail, User, Sparkles } from "lucide-react";

export default function InvitePage({ params }: { params: Promise<{ lang: string; userId: string }> }) {
  const { lang, userId } = React.use(params);
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/invite/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, referrerId: userId }),
      });
      if (res.ok) {
        router.push(`/${lang}/invite/${userId}/thanks`);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "エラーが発生しました。もう一度お試しください。");
        setSubmitting(false);
      }
    } catch {
      setError("通信エラーが発生しました。もう一度お試しください。");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      {/* ヘッダー */}
      <header className="py-5 px-6 border-b border-[#e8dfce] bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          <span className="text-lg font-serif font-bold text-stone-800">お豆奏法</span>
          <Heart className="w-4 h-4 fill-rose-400 text-rose-400" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-12">

        {/* ヒーロー */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full text-amber-700 text-sm font-bold mb-6">
            <Sparkles className="w-4 h-4" />
            あなたへの特別なご招待
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-800 leading-relaxed mb-5">
            ピアノを弾くほど、<br />
            心と体が軽くなる。<br />
            <span className="text-[#b8a98f]">「お豆奏法」</span>の世界へ
          </h1>
          <p className="text-stone-500 leading-relaxed max-w-xl mx-auto">
            力を抜くだけで、音が変わる。<br />
            えりな先生の「お豆奏法」は、ピアノを弾くすべての人に届けたい奏法です。
          </p>
        </div>

        {/* えりな先生からのメッセージ */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-[#e8dfce] mb-12 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-50 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-orange-50/50 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <p className="font-serif text-stone-600 leading-loose text-[15px] mb-6">
              はじめまして。えりなです。<br /><br />
              あなたに、この奏法を知っていただきたくてお声がけしました。<br /><br />
              「頑張らなくていい」「力まなくていい」—— ただ重力に任せるだけで、ピアノの音はびっくりするほど美しく変わります。<br /><br />
              いつも一生懸命なのに、どこかしんどいな…と感じているピアノ好きな方に、ぜひ一度体験してほしいのです。<br /><br />
              まずは下の動画をご覧になってみてください。
            </p>
            <div className="flex items-center justify-end gap-2 text-stone-500 font-serif text-sm">
              <Heart className="w-4 h-4 fill-rose-400 text-rose-400" />
              たちえりな
            </div>
          </div>
        </div>

        {/* お試し動画 */}
        <div className="mb-12">
          <h2 className="text-xl font-serif font-bold text-stone-700 mb-4 text-center">
            まずはこちらをご覧ください
          </h2>
          <div className="rounded-2xl overflow-hidden shadow-md border border-[#e8dfce] aspect-video">
            <iframe
              src="https://player.vimeo.com/video/76979871?autoplay=0&title=0&byline=0&portrait=0"
              className="w-full h-full"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>

        {/* お豆奏法で得られること */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          {[
            { icon: "🎹", title: "手が痛くならない", body: "力みゼロで弾けるから、長時間弾いても疲れません" },
            { icon: "✨", title: "音が自然に輝く", body: "重力を使った奏法で、芯のある美しい響きが生まれます" },
            { icon: "🌿", title: "心も軽くなる", body: "ピアノを弾く時間が、心をほどく休息の時間に変わります" },
          ].map((item) => (
            <div key={item.title} className="bg-white rounded-2xl p-6 border border-[#e8dfce] shadow-sm text-center">
              <div className="text-3xl mb-3">{item.icon}</div>
              <p className="font-bold text-stone-800 mb-1">{item.title}</p>
              <p className="text-sm text-stone-500 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>

        {/* LINE & 登録フォーム */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-[#e8dfce]">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-serif font-bold text-stone-800 mb-3">
              気になりましたか？
            </h2>
            <p className="text-stone-500 text-sm leading-relaxed">
              LINEを友達追加して、えりな先生からの最新情報を受け取りましょう。<br />
              さらに、お名前とメールアドレスをご登録いただくと、特典をお届けします。
            </p>
          </div>

          {/* LINE友達追加ボタン */}
          <a
            href="https://lin.ee/XXXXXXXX"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full py-4 rounded-xl text-white font-bold text-lg transition-all shadow-sm mb-8 hover:opacity-90 active:scale-95"
            style={{ backgroundColor: "#06C755" }}
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white flex-shrink-0">
              <path d="M12 2C6.48 2 2 6.19 2 11.33c0 2.92 1.45 5.52 3.73 7.24-.16.6-.53 2.17-.61 2.51-.1.41.15.4.31.29.13-.09 1.68-1.14 2.36-1.6.71.1 1.44.16 2.21.16 5.52 0 10-4.19 10-9.33S17.52 2 12 2z" />
            </svg>
            LINE 公式アカウントを友達追加する
          </a>

          <div className="flex items-center gap-3 mb-8">
            <div className="flex-1 h-px bg-stone-200" />
            <span className="text-sm text-stone-400 font-bold shrink-0">名前とメールも登録する</span>
            <div className="flex-1 h-px bg-stone-200" />
          </div>

          {/* 登録フォーム */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-bold text-stone-700 mb-2">
                <User className="w-4 h-4 text-[#b8a98f]" />
                お名前
              </label>
              <input
                type="text"
                required
                placeholder="例：山田 花子"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full border border-stone-300 rounded-xl px-4 py-3.5 text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#d4c5b0] focus:border-transparent transition-all bg-[#faf9f6]"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-sm font-bold text-stone-700 mb-2">
                <Mail className="w-4 h-4 text-[#b8a98f]" />
                メールアドレス
              </label>
              <input
                type="email"
                required
                placeholder="例：hanako@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-stone-300 rounded-xl px-4 py-3.5 text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#d4c5b0] focus:border-transparent transition-all bg-[#faf9f6]"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-xl">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-stone-800 hover:bg-stone-700 disabled:opacity-50 text-white font-bold rounded-xl text-lg transition-all shadow-sm active:scale-95"
            >
              {submitting ? "送信中..." : "登録して特典を受け取る →"}
            </button>

            <p className="text-xs text-stone-400 text-center leading-relaxed">
              登録情報は第三者に提供することはありません。いつでも配信停止できます。
            </p>
          </form>
        </div>
      </main>

      <footer className="py-8 text-center text-xs text-stone-400 border-t border-[#e8dfce] mt-12">
        © お豆奏法 / たちえりな
      </footer>
    </div>
  );
}
