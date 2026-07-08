"use client";

import { useState, Suspense } from "react";
import { use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, ArrowRight } from "lucide-react";
import { DISPLAY_NAME_MAX } from "@/lib/displayName";

// ?next= はオープンリダイレクト防止のため、必ず「/」始まりのローカルパスのみ許可する。
// 「//」始まり（プロトコル相対）やフルURLは弾く。
function safeNext(next: string | null, fallback: string): string {
  if (!next) return fallback;
  if (!next.startsWith("/")) return fallback;
  if (next.startsWith("//")) return fallback;
  return next;
}

function SetupNameForm({ lang }: { lang: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setError("");

    const trimmed = name.trim();
    if (trimmed === "") {
      setError("お名前を入力してください。");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: trimmed }),
      });
      if (res.ok) {
        const dest = safeNext(searchParams.get("next"), `/${lang}/lms`);
        router.push(dest);
      } else {
        const data = await res.json().catch(() => null);
        setError(data?.error || "お名前の保存に失敗しました。もう一度お試しください。");
        setSaving(false);
      }
    } catch {
      setError("通信エラーが発生しました。もう一度お試しください。");
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#faf9f6] text-omame-text font-serif flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg">
        {/* 挨拶ヘッダー */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-omame-primary/70 text-sm tracking-[0.3em] uppercase mb-6 font-sans">
            <Sparkles className="w-4 h-4" />
            Welcome
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-omame-deep leading-relaxed mb-4">
            ようこそ、お豆奏法へ
          </h1>
          <p className="text-omame-text/70 leading-loose">
            はじめに、画面に表示されるお名前を教えてください。
          </p>
        </div>

        {/* 入力カード */}
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-md border border-omame-gold/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="display-name" className="block text-sm font-bold text-omame-deep mb-2">
                ニックネーム
              </label>
              <input
                id="display-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={DISPLAY_NAME_MAX}
                required
                autoFocus
                placeholder="例：えりな"
                className="w-full border border-stone-300 rounded-xl px-4 py-3.5 text-omame-text focus:outline-none focus:ring-2 focus:ring-omame-gold/40 focus:border-omame-gold/60 transition-all"
              />
              <p className="mt-2 text-xs text-omame-text/50 leading-relaxed">
                受講ページの画面上で使われるお名前です。本名でなくても大丈夫です（{DISPLAY_NAME_MAX}文字以内）。
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm font-bold">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-omame-deep text-white font-bold hover:bg-omame-primary transition-colors disabled:opacity-50"
            >
              {saving ? "保存中..." : (
                <>
                  お豆奏法をはじめる
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default function SetupNamePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#faf9f6]" />}>
      <SetupNameForm lang={lang} />
    </Suspense>
  );
}
