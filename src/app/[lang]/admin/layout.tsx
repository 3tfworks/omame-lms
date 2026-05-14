"use client";

import React from "react";
import Link from "next/link";
import { MessageSquare, CheckSquare, Users, LogOut } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-omame-bg flex flex-col md:flex-row font-serif">
      {/* 管理者用サイドバー */}
      <aside className="w-full md:w-64 bg-stone-900 text-stone-50 flex flex-col shadow-xl z-10">
        <div className="p-6 border-b border-stone-800">
          <div className="text-xs font-bold text-stone-400 tracking-wider mb-1">えりな先生 専用画面</div>
          <h1 className="font-bold text-xl tracking-tight text-white">お豆奏法基礎講座<br/>管理室</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link href="/ja/admin" className="flex items-center gap-3 px-4 py-3 bg-stone-800 text-white rounded-xl font-bold transition-colors">
            <CheckSquare size={20} className="text-amber-400" />
            付箋の確認・承認
          </Link>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-stone-400 hover:bg-stone-800 hover:text-white rounded-xl font-bold transition-colors text-left">
            <MessageSquare size={20} />
            生徒へのメッセージ
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-stone-400 hover:bg-stone-800 hover:text-white rounded-xl font-bold transition-colors text-left">
            <Users size={20} />
            生徒の進捗を見る
          </button>
        </nav>
        
        <div className="p-4 border-t border-stone-800">
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
