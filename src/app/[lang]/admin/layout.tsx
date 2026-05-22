"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, CheckSquare, Users, LogOut, Calendar, Handshake, PlayCircle } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-omame-bg flex flex-col md:flex-row font-serif">
      {/* 管理者用サイドバー */}
      <aside className="w-full md:w-64 bg-stone-900 text-stone-50 flex flex-col shadow-xl z-10">
        <div className="p-6 border-b border-stone-800">
          <div className="text-xs font-bold text-stone-400 tracking-wider mb-1">管理者専用画面</div>
          <h1 className="font-bold text-xl tracking-tight text-white">おうちで学べる<br/>お豆奏法管理室</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {/* 未実装のため一時非表示
          <Link href="/ja/admin/bookmarks" className="flex items-center gap-3 px-4 py-3 text-stone-400 hover:bg-stone-800 hover:text-white rounded-xl font-bold transition-colors">
            <CheckSquare size={20} />
            付箋の確認・承認
          </Link>
          */}
          <Link
            href="/ja/admin"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-bold ${
              pathname.endsWith('/admin') 
                ? 'bg-stone-800 text-white' 
                : 'text-stone-400 hover:bg-stone-800 hover:text-white'
            }`}
          >
            <MessageSquare size={20} className={pathname.endsWith('/admin') ? "text-amber-400" : ""} />
            生徒へのメッセージ
          </Link>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-stone-400 hover:bg-stone-800 hover:text-white rounded-xl font-bold transition-colors text-left">
            <Users size={20} />
            生徒の進捗を見る
          </button>
          <Link
            href="/ja/admin/users"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-bold ${
              pathname.includes('/admin/users') 
                ? 'bg-stone-800 text-white' 
                : 'text-stone-400 hover:bg-stone-800 hover:text-white'
            }`}
          >
            <Users size={20} />
            ユーザー管理
          </Link>
          <Link
            href="/ja/admin/campaign"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-bold ${
              pathname.includes('/admin/campaign') 
                ? 'bg-stone-800 text-white' 
                : 'text-stone-400 hover:bg-stone-800 hover:text-white'
            }`}
          >
            <Calendar size={20} />
            キャンペーン設定
          </Link>
          <Link
            href="/ja/admin/affiliate"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-bold ${
              pathname.includes('/admin/affiliate') 
                ? 'bg-stone-800 text-white' 
                : 'text-stone-400 hover:bg-stone-800 hover:text-white'
            }`}
          >
            <Handshake size={20} />
            アフィリエイト管理
          </Link>
        </nav>
        
        <div className="p-4 border-t border-stone-800 space-y-2">
          <Link href="/ja/lms" className="w-full flex items-center gap-3 px-4 py-3 text-stone-400 hover:bg-stone-800 hover:text-white rounded-xl transition-colors font-medium">
            <PlayCircle size={20} />
            動画（LMS）に戻る
          </Link>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-stone-400 hover:text-white transition-colors font-medium">
            <LogOut size={20} />
            ログアウト
          </button>
        </div>
      </aside>

      {/* メインコンテンツ */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 md:p-8 lg:p-12">
          {children}
        </div>
      </main>
    </div>
  );
}
