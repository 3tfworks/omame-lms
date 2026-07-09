import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function InvalidReferralPage({ lang }: { lang: string }) {
  return (
    <main className="min-h-screen bg-[#faf9f6] px-5 py-16">
      <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center text-center">
        <AlertCircle className="mb-5 size-10 text-amber-600" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-stone-800">紹介リンクを確認できませんでした</h1>
        <p className="mt-4 leading-7 text-stone-600">
          リンクが古いか、途中までしか開けていない可能性があります。
          <br />
          紹介者の方に新しいリンクをご確認ください。
        </p>
        <Link
          href={`/${lang}/lp`}
          className="mt-8 inline-flex min-h-11 items-center border border-stone-300 bg-white px-5 py-2.5 font-bold text-stone-700 hover:bg-stone-50"
        >
          お豆奏法のページへ
        </Link>
      </div>
    </main>
  );
}
