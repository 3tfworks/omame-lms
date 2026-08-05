import Link from "next/link";
import { LoginSupportConsole } from "@/components/admin/LoginSupportConsole";
import { Bell, LifeBuoy } from "lucide-react";
import { getSupportAccess } from "@/lib/supportAuth";

export default async function SupportPage({ params }: { params: Promise<{ lang: string }> }) {
  const [{ lang }, access] = await Promise.all([params, getSupportAccess()]);
  return (
    <main className="min-h-screen bg-omame-bg font-serif">
      <header className="border-b border-stone-200 bg-stone-900 text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 md:px-8">
          <div>
            <p className="text-xs font-bold tracking-widest text-stone-400">OMAME SOHO LAB.</p>
            <h1 className="mt-1 font-bold">事務担当サポート画面</h1>
          </div>
          <Link href={`/${lang}/lms`} className="rounded-lg border border-stone-700 px-4 py-2 text-sm font-bold text-stone-200 hover:bg-stone-800">
            LMSへ戻る
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-5xl p-4 md:p-8">
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          {access?.canView ? (
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <LifeBuoy className="h-6 w-6 text-amber-700" />
              <h2 className="mt-3 font-bold text-stone-900">ログインサポート</h2>
              <p className="mt-1 text-sm text-stone-500">この画面の下で、顧客のログイン状況を確認できます。</p>
            </div>
          ) : null}
          {access?.canManageAnnouncements ? (
            <Link href={`/${lang}/support/announcements`} className="rounded-2xl border border-sky-200 bg-sky-50 p-5 shadow-sm transition hover:border-sky-400 hover:shadow-md">
              <Bell className="h-6 w-6 text-sky-700" />
              <h2 className="mt-3 font-bold text-sky-950">お知らせ・インフォバー管理</h2>
              <p className="mt-1 text-sm text-sky-900/70">障害・復旧案内などを受講画面に表示します。</p>
            </Link>
          ) : null}
        </div>
        {access?.canView ? <LoginSupportConsole /> : <p className="rounded-2xl border border-stone-200 bg-white p-6 text-stone-600">お知らせ管理を選択してください。</p>}
      </div>
    </main>
  );
}
