import Link from "next/link";
import {
  AFFILIATE_TERMS_SECTIONS,
  AFFILIATE_TERMS_TITLE,
  AFFILIATE_TERMS_VERSION,
} from "@/lib/affiliateProgram";

export default async function AffiliateTermsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  return (
    <main className="min-h-screen bg-[#faf9f6] px-4 py-10 text-stone-700 sm:px-6 sm:py-16">
      <article className="mx-auto max-w-3xl rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-10">
        <header className="border-b border-stone-200 pb-8 text-center">
          <p className="text-xs font-bold tracking-[0.25em] text-amber-700">OMAME MESSENGER</p>
          <h1 className="mt-3 text-2xl font-bold text-omame-deep sm:text-3xl">
            {AFFILIATE_TERMS_TITLE}
          </h1>
          <p className="mt-4 text-sm text-stone-500">
            制定日：2026年7月16日<br />規約バージョン：{AFFILIATE_TERMS_VERSION}
          </p>
        </header>

        <div className="mt-8 space-y-9">
          {AFFILIATE_TERMS_SECTIONS.map((section) => (
            <section key={section.title}>
              <h2 className="border-b border-amber-100 pb-2 text-lg font-bold text-omame-deep">
                {section.title}
              </h2>
              <div className="mt-3 space-y-3 text-sm leading-8 sm:text-base">
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 border-t border-stone-200 pt-8 text-center">
          <Link
            href={`/${lang}/lms/affiliate`}
            className="inline-flex rounded-xl bg-stone-800 px-6 py-3 text-sm font-bold text-white hover:bg-stone-700"
          >
            お豆メッセンジャーへ戻る
          </Link>
        </div>
      </article>
    </main>
  );
}
