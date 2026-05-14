"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BookOpen, PlayCircle, Search, Home, Menu, X, CheckCircle2, Lock } from "lucide-react";
import { curriculumData } from "@/lib/lmsData";

export default function LMSLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-omame-bg flex font-serif">
      {/* スマホ用ヘッダー */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b z-50 flex items-center justify-between px-4">
        <div className="font-bold text-lg text-amber-900">おうちで学べるお豆奏法基礎講座</div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* サイドバー（目次・カリキュラム） */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-[#faf9f6] border-r border-stone-200 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0 pt-16" : "-translate-x-full lg:translate-x-0"
        } flex flex-col h-full`}
      >
        <div className="p-6 hidden lg:block border-b border-stone-200 bg-[#fdfaf5]">
          <h1 className="font-bold text-xl text-amber-900 tracking-tight">おうちで学べる<br/>お豆奏法基礎講座</h1>
          <p className="text-xs text-stone-500 mt-2">あなた専用の学習システム</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* メインメニュー */}
          <div className="space-y-1">
            <Link href="/ja/lms" className="flex items-center gap-3 px-3 py-2.5 bg-amber-100/50 text-amber-900 rounded-lg font-medium transition-colors">
              <Home size={20} />
              ホーム画面
            </Link>
            <Link href="/ja/lms/search" className="flex items-center gap-3 px-3 py-2.5 text-neutral-600 hover:bg-neutral-50 rounded-lg font-medium transition-colors">
              <Search size={20} />
              お悩みから探す（ナビ検索）
            </Link>
            <Link href="/ja/lms/notes" className="flex items-center gap-3 px-3 py-2.5 text-neutral-600 hover:bg-neutral-50 rounded-lg font-medium transition-colors">
              <BookOpen size={20} />
              マイノートを見る
            </Link>
          </div>

          <div className="border-t border-neutral-200 pt-6">
            <h2 className="px-3 text-sm font-bold text-neutral-400 uppercase tracking-wider mb-3">カリキュラム一覧</h2>
            
            <div className="space-y-4">
              {curriculumData.map((chapter) => (
                <div key={chapter.id} className="space-y-1">
                  <div className={`px-3 py-2 font-bold text-sm flex items-center justify-between ${/* chapter.locked */ false ? 'text-neutral-400' : 'text-neutral-800'}`}>
                    {chapter.title}
                    {/* chapter.locked && <Lock size={14} /> */}
                  </div>
                  {/* !chapter.locked */ true && chapter.videos.map((video) => (
                    <Link
                      key={video.id}
                      href={`/ja/lms/video/${video.id}`}
                      className="group flex items-start gap-3 pl-4 pr-3 py-2 text-sm text-stone-600 hover:bg-amber-50 hover:text-amber-900 rounded-lg transition-colors"
                    >
                      <div className="mt-0.5 shrink-0">
                        {video.completed ? (
                          <CheckCircle2 size={16} className="text-amber-600" />
                        ) : (
                          <PlayCircle size={16} className="text-stone-300 group-hover:text-amber-500" />
                        )}
                      </div>
                      <span className="leading-snug">{video.title}</span>
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </nav>
        
        {/* ユーザープロファイル・ログアウト */}
        <div className="p-4 border-t border-stone-200 bg-[#faf9f6]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-900 font-bold">
              甲
            </div>
            <div>
              <div className="font-bold text-sm text-stone-800">甲斐 様</div>
              <div className="text-xs text-stone-500">お豆サロン会員</div>
            </div>
          </div>
        </div>
      </aside>

      {/* メインコンテンツエリア */}
      <main className="flex-1 overflow-y-auto lg:pt-0 pt-16">
        <div className="max-w-5xl mx-auto p-4 lg:p-8">
          {children}
        </div>
      </main>

      {/* スマホ用オーバーレイ */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
