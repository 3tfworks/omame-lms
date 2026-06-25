"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, PlayCircle, Search, Home, Menu, X, CheckCircle2, Lock, ChevronDown, ChevronRight, Sparkles, Handshake, Star } from "lucide-react";
import { curriculumData } from "@/lib/lmsData";
import ReferralPopup from "@/components/ReferralPopup";
import { LineLogo } from "@/components/ui/LineLogo";

// アコーディオン用のコンポーネント
function ChapterAccordion({ chapter, defaultOpen = false }: { chapter: any, defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="space-y-1">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2.5 font-bold text-sm flex items-start gap-2 text-neutral-800 hover:bg-neutral-100/80 rounded-lg transition-colors text-left"
      >
        <div className="mt-0.5 shrink-0 text-neutral-400">
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>
        <span className="leading-snug">{chapter.title}</span>
      </button>
      
      {isOpen && (
        <div className="pt-1 pb-3 space-y-1">
          {chapter.videos.map((video: any) => (
            <Link
              key={video.id}
              href={`/ja/lms/video/${video.id}`}
              className="group flex items-start gap-3 pl-8 pr-3 py-2.5 text-sm text-stone-600 hover:bg-amber-50 hover:text-amber-900 rounded-lg transition-colors"
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
      )}
    </div>
  );
}

export default function LMSLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profile, setProfile] = useState<{ role: string; display_name: string | null; referral_prompt_shown: boolean } | null>(null);
  const [showReferralPopup, setShowReferralPopup] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const data = await res.json();
          setProfile(data.profile);
          if (data.profile && data.profile.referral_prompt_shown === false) {
            setShowReferralPopup(true);
          }
        }
      } catch (e) {
        console.error("プロフィール取得エラー:", e);
      }
    };
    fetchProfile();
  }, []);

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
            <Link href="/ja/lms/guide" className="flex items-center gap-3 px-3 py-2.5 text-neutral-600 hover:bg-neutral-50 rounded-lg font-medium transition-colors">
              <Sparkles size={20} />
              はじめての方へ
            </Link>
            <Link href="/ja/lms/search" className="flex items-center gap-3 px-3 py-2.5 text-neutral-600 hover:bg-neutral-50 rounded-lg font-medium transition-colors">
              <Search size={20} />
              お悩みから探す（ナビ検索）
            </Link>
            <Link href="/ja/lms/bookmarks-guide" className="flex items-center gap-3 px-3 py-2.5 text-neutral-600 hover:bg-neutral-50 rounded-lg font-medium transition-colors">
              <Star size={20} className="text-amber-500" />
              みんなの付箋とは？
            </Link>
            <Link href="/ja/lms/notes" className="flex items-center gap-3 px-3 py-2.5 text-neutral-600 hover:bg-neutral-50 rounded-lg font-medium transition-colors">
              <BookOpen size={20} />
              マイノートを見る
            </Link>
          </div>

          <div className="border-t border-neutral-200 pt-6">
            <h2 className="px-3 text-sm font-bold text-neutral-400 uppercase tracking-wider mb-3">カリキュラム一覧</h2>
            
            <div className="space-y-2">
              {curriculumData.map((chapter, index) => (
                <ChapterAccordion key={chapter.id} chapter={chapter} defaultOpen={index === 0} />
              ))}
            </div>
          </div>

          {/* サロンメンバー限定メニュー */}
          {(profile?.role === "salon_member" || profile?.role === "owner") && (
            <div className="mt-8">
              <h3 className="px-3 mb-2 text-xs font-bold text-stone-400 uppercase tracking-wider">
                サロンメンバー特典
              </h3>
              <Link
                href="/ja/lms/affiliate"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg font-bold transition-colors"
              >
                <Handshake className="w-5 h-5" />
                紹介プログラム
              </Link>
            </div>
          )}

          {/* アップセル：基礎実践講座バナー（常設） */}
          <div className="border-t border-amber-200/50 pt-5">
            <Link
              href="/ja/lms/practice-course"
              className="block p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200/60 hover:border-amber-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-base">🚀</span>
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Next Step</span>
              </div>
              <p className="text-sm font-bold text-stone-800 leading-snug mb-1">
                基礎実践講座のご案内
              </p>
              <p className="text-xs text-stone-500 leading-relaxed">
                学んだ原理を、実際のレッスンで確かめてみませんか？
              </p>
              <div className="mt-2 text-xs font-bold text-amber-600 group-hover:text-amber-700 flex items-center gap-1">
                詳しく見る →
              </div>
            </Link>
          </div>
        </nav>
        
        {/* 管理者メニュー（admin/ownerのみ有効） */}
        {(profile?.role === "admin" || profile?.role === "owner") && (
          <div className="p-4 border-t border-stone-200 bg-[#faf9f6]">
            <Link
              href="/ja/admin"
              prefetch={false}
              className="flex items-center gap-3 px-3 py-2.5 text-stone-500 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg font-medium transition-colors text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
              管理者ページ
            </Link>
          </div>
        )}

        {/* ユーザープロファイル・ログアウト */}
        <div className="p-4 border-t border-stone-200 bg-[#faf9f6] space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-900 font-bold">
              👤
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm text-stone-800 truncate">
                {profile ? (profile.display_name || "受講生") : "..."}
              </div>
              <div className="text-xs text-stone-500">ログイン中</div>
            </div>
          </div>
          <a
            href="https://lin.ee/RmeCAtQ"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-stone-500 hover:text-stone-800 hover:bg-neutral-100/80 rounded-lg transition-colors"
          >
            <LineLogo size={16} />
            <span>お問い合わせ（公式LINE）</span>
          </a>
          <button
            onClick={async () => {
              const { createBrowserClient } = await import("@supabase/ssr");
              const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
              );
              await supabase.auth.signOut();
              window.location.href = "/ja";
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            ログアウト
          </button>
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

      {/* 救済ポップアップ（初回ログイン時のみ） */}
      {showReferralPopup && (
        <ReferralPopup onClose={() => setShowReferralPopup(false)} />
      )}
    </div>
  );
}
