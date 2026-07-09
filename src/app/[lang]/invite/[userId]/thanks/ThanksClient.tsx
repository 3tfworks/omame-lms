"use client";

import React, { useState } from "react";
import { Heart, CheckCircle2, Sparkles } from "lucide-react";

export default function ThanksClient({
  userId,
  referrerName,
  regularPrice,
  referralPrice,
}: {
  userId: string;
  referrerName: string | null;
  regularPrice: number;
  referralPrice: number;
}) {
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    setCheckoutError("");
    try {
      const res = await fetch("/api/checkout/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referrerId: userId }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.url) {
        window.location.href = data.url;
      } else {
        setCheckoutError(data.error || "購入画面を開けませんでした。時間をおいてお試しください。");
        setCheckoutLoading(false);
      }
    } catch {
      setCheckoutError("通信エラーが発生しました。時間をおいてお試しください。");
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col">
      {/* ヘッダー */}
      <header className="py-5 px-6 border-b border-[#e8dfce] bg-white/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          <span className="text-lg font-serif font-bold text-stone-800">お豆奏法</span>
          <Heart className="w-4 h-4 fill-rose-400 text-rose-400" />
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-5 py-16 flex flex-col items-center justify-center text-center">
        {/* 完了アイコン */}
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-8 shadow-sm border border-emerald-100">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>

        {/* メインメッセージ */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full text-amber-700 text-sm font-bold mb-6">
          <Sparkles className="w-4 h-4" />
          登録が完了しました
        </div>

        <h1 className="text-3xl font-serif font-bold text-stone-800 mb-5 leading-relaxed">
          ようこそ、<br />
          <span className="text-[#b8a98f]">お豆奏法の世界</span>へ。
        </h1>

        <p className="text-stone-500 leading-loose max-w-md mb-12">
          ご登録ありがとうございます。<br />
          えりな先生から、まもなくメールをお届けします。<br />
          届かない場合は、迷惑メールフォルダもご確認ください。
        </p>

        {/* お豆奏法 動画コンテンツへの申し込み（Stripe Checkout） */}
        <div className="w-full bg-gradient-to-br from-amber-50 to-[#faf6ee] rounded-3xl p-8 border border-amber-200 shadow-sm text-center mb-10">
          <p className="mb-3 text-sm font-bold text-emerald-700">
            {referrerName ? `${referrerName}さんからのご紹介` : "ご紹介特典"}
          </p>
          <p className="text-lg font-bold text-stone-800 mb-3">
            紹介特典10%OFFでお申し込み
          </p>
          <p className="text-sm text-stone-500 leading-relaxed mb-6">
            <span className="line-through">{regularPrice.toLocaleString("ja-JP")}円</span>
            <span className="mx-2">→</span>
            <strong className="text-xl text-stone-800">
              {referralPrice.toLocaleString("ja-JP")}円
            </strong>
            <br />
            クーポンコードは不要です。購入画面で自動的に割引されます。
          </p>
          {checkoutError && (
            <p role="alert" className="mb-5 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {checkoutError}
            </p>
          )}
          <button
            onClick={handleCheckout}
            disabled={checkoutLoading}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-base md:text-lg py-4 px-10 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 tracking-wide disabled:cursor-wait disabled:opacity-60 disabled:hover:scale-100"
          >
            {checkoutLoading ? "購入画面を準備しています..." : "10%OFFで申し込む"}
          </button>
        </div>

        {/* 次のステップ */}
        <div className="w-full bg-white rounded-3xl p-8 border border-[#e8dfce] shadow-sm text-left mb-10">
          <h2 className="text-lg font-bold text-stone-800 mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            次にやること
          </h2>
          <ol className="space-y-5">
            {[
              {
                num: "01",
                title: "LINEを友達追加する",
                body: "まだの方は、えりな先生の公式LINEを友達追加してください。最新情報をいち早くお届けします。",
                action: {
                  label: "LINE 公式を友達追加する",
                  href: "https://lin.ee/RmeCAtQ",
                  color: "#06C755",
                },
              },
              {
                num: "02",
                title: "届いたメールを確認する",
                body: "ご登録のメールアドレスに、特典情報と次のご案内をお送りします。",
              },
              {
                num: "03",
                title: "えりな先生の動画を楽しみに待つ",
                body: "もうすぐ、あなたの演奏が変わる瞬間が訪れます。楽しみにしていてください。",
              },
            ].map((step) => (
              <li key={step.num} className="flex gap-4 items-start">
                <span className="shrink-0 w-9 h-9 rounded-full bg-[#faf9f6] border border-[#e8dfce] flex items-center justify-center text-xs font-bold text-[#b8a98f]">
                  {step.num}
                </span>
                <div className="flex-1">
                  <p className="font-bold text-stone-800 mb-1">{step.title}</p>
                  <p className="text-sm text-stone-500 leading-relaxed">{step.body}</p>
                  {step.action && (
                    <a
                      href={step.action.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-3 px-5 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:opacity-90"
                      style={{ backgroundColor: step.action.color }}
                    >
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white flex-shrink-0">
                        <path d="M12 2C6.48 2 2 6.19 2 11.33c0 2.92 1.45 5.52 3.73 7.24-.16.6-.53 2.17-.61 2.51-.1.41.15.4.31.29.13-.09 1.68-1.14 2.36-1.6.71.1 1.44.16 2.21.16 5.52 0 10-4.19 10-9.33S17.52 2 12 2z" />
                      </svg>
                      {step.action.label}
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>

        <p className="text-stone-400 font-serif text-sm leading-relaxed">
          一緒に、優しい音のあふれる世界を創っていきましょう。<br />
          <Heart className="inline w-4 h-4 fill-rose-300 text-rose-300 mb-0.5" /> えりな
        </p>
      </main>

      <footer className="py-8 text-center text-xs text-stone-400 border-t border-[#e8dfce]">
        © お豆奏法 / たちえりな
      </footer>
    </div>
  );
}
