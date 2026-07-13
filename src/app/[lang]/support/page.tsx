import Link from "next/link";
import { LoginSupportConsole } from "@/components/admin/LoginSupportConsole";

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-omame-bg font-serif">
      <header className="border-b border-stone-200 bg-stone-900 text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 md:px-8">
          <div>
            <p className="text-xs font-bold tracking-widest text-stone-400">OMAME SOHO LAB.</p>
            <h1 className="mt-1 font-bold">事務担当サポート画面</h1>
          </div>
          <Link href="/ja/lms" className="rounded-lg border border-stone-700 px-4 py-2 text-sm font-bold text-stone-200 hover:bg-stone-800">
            LMSへ戻る
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-5xl p-4 md:p-8">
        <LoginSupportConsole />
      </div>
    </main>
  );
}
