"use client";

import { useState } from "react";
import { Heart, X } from "lucide-react";

interface Props {
  onClose: () => void;
}

export default function ReferralPopup({ onClose }: Props) {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const markAndClose = async (dismiss: boolean) => {
    if (!dismiss) return;
    await fetch("/api/invite/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dismiss: true }),
    });
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/invite/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referralCode: code.trim() }),
      });

      if (res.ok) {
        setStatus("success");
        setTimeout(onClose, 2500);
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error || "エラーが発生しました。もう一度お試しください");
        setStatus("idle");
      }
    } catch {
      setErrorMsg("通信エラーが発生しました。もう一度お試しください");
      setStatus("idle");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">

        {/* ヘッダー */}
        <div className="bg-[#faf9f6] px-8 py-6 border-b border-[#e8dfce] relative">
          <button
            onClick={() => markAndClose(true)}
            className="absolute right-4 top-4 p-2 text-stone-400 hover:text-stone-600 transition-colors rounded-full hover:bg-stone-100"
            aria-label="閉じる"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 pr-8">
            <Heart className="w-5 h-5 fill-rose-300 text-rose-300 shrink-0" />
            <h2 className="text-base font-serif font-bold text-stone-800 leading-snug">
              お豆メッセンジャー（紹介）からのご入会ですか？
            </h2>
          </div>
        </div>

        {/* コンテンツ */}
        <div className="p-8">
          {status === "success" ? (
            <div className="text-center py-4">
              <div className="text-5xl mb-5">🎉</div>
              <h3 className="text-xl font-serif font-bold text-stone-800 mb-3">
                紐付けが完了しました！
              </h3>
              <p className="text-stone-500 text-sm leading-relaxed">
                紹介してくださった方への感謝が、<br />ちゃんと届きます。
              </p>
            </div>
          ) : (
            <>
              <p className="text-stone-600 leading-loose text-sm mb-6 font-serif">
                ようこそ！お豆奏法の世界へ。<br /><br />
                サロンメンバーの方からの<strong className="text-stone-800">ご紹介でご入会</strong>された場合は、招待URLに含まれる<strong className="text-stone-800">紹介コード</strong>をこちらに入力してください。<br /><br />
                紹介してくださった方への感謝の気持ちが、しっかり伝わります。
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">
                    紹介コード
                  </label>
                  <input
                    type="text"
                    placeholder="例：xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    value={code}
                    onChange={e => {
                      setCode(e.target.value);
                      setErrorMsg("");
                    }}
                    className="w-full border border-stone-300 rounded-xl px-4 py-3 text-stone-800 text-sm placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-[#d4c5b0] focus:border-transparent bg-[#faf9f6] font-mono"
                  />
                  <p className="text-xs text-stone-400 mt-1.5 leading-relaxed">
                    招待URL <span className="font-mono">/invite/<strong>この部分</strong></span> のテキストです
                  </p>
                </div>

                {errorMsg && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-xl">
                    {errorMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={!code.trim() || status === "loading"}
                  className="w-full py-3.5 bg-stone-800 hover:bg-stone-700 disabled:opacity-40 text-white font-bold rounded-xl transition-all text-sm"
                >
                  {status === "loading" ? "確認中..." : "コードを確認して紐付ける"}
                </button>
              </form>

              <div className="mt-5 text-center">
                <button
                  onClick={() => markAndClose(true)}
                  className="text-sm text-stone-400 hover:text-stone-600 transition-colors underline"
                >
                  紹介ではありません（このまま進む）
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
