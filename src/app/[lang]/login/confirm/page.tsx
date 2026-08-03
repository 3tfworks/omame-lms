import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { sanitizeInternalNextPath } from "@/lib/loginMagicLinkEmail";

export const metadata: Metadata = {
  title: "ログインの確認 | お豆奏法基礎講座",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function LoginConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token_hash?: string; next?: string }>;
}) {
  const params = await searchParams;
  const tokenHash = typeof params.token_hash === "string" ? params.token_hash : "";
  const next = sanitizeInternalNextPath(params.next);

  return (
    <main className="min-h-screen bg-omame-bg flex items-center justify-center px-4 py-12 font-sans">
      <section className="w-full max-w-md rounded-2xl border border-omame-gold/20 bg-white p-7 shadow-xl shadow-omame-primary/5 sm:p-10">
        <ShieldCheck className="mx-auto mb-4 h-12 w-12 text-omame-gold" aria-hidden="true" />
        <h1 className="text-center font-serif text-2xl font-bold text-omame-primary">
          ログインの確認
        </h1>

        {tokenHash ? (
          <>
            <p className="mt-5 text-center leading-relaxed text-omame-text/80">
              下のボタンを押すと、お豆奏法基礎講座へログインします。
            </p>
            <p className="mt-3 rounded-xl bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
              LINE内の画面で開いている場合は、右上の「↗」などからSafariまたはChromeで開き直してからボタンを押してください。
            </p>
            <form action="/api/auth/verify" method="post" className="mt-6">
              <input type="hidden" name="token_hash" value={tokenHash} />
              <input type="hidden" name="next" value={next} />
              <button
                type="submit"
                className="w-full rounded-xl bg-omame-primary px-4 py-3 font-bold text-white transition-colors hover:bg-omame-primary/90"
              >
                ログインを続ける
              </button>
            </form>
          </>
        ) : (
          <div className="mt-5 text-center">
            <p className="leading-relaxed text-rose-600">
              ログインリンクを確認できませんでした。もう一度ログインメールを送信してください。
            </p>
            <Link href="/ja/login" className="mt-6 inline-block font-bold text-omame-gold underline">
              ログイン画面へ戻る
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
