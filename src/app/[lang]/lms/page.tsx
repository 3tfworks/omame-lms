import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Bell, Play, Sparkles, BarChart3, ChevronRight, Trophy, Search } from "lucide-react";
import { formatAnnouncementDate, type Announcement } from "@/lib/announcements";
import { currentTenantConfig } from "@/lib/tenantConfig";
import { Watermark } from "@/components/decorations/Watermark";
import { PixieDust } from "@/components/decorations/PixieDust";
import { createClient } from "@/utils/supabase/server";
import { curriculumData, type ChapterData, type VideoData } from "@/lib/lmsData";
import { BookmarkGuide } from "@/components/help/BookmarkGuide";

export default async function LMSDashboard() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;

  // 全動画数を lmsData から計算
  const curriculumVideoIds = curriculumData.flatMap((chapter) =>
    chapter.videos.map((video) => video.id)
  );
  const totalVideos = curriculumVideoIds.length;

  // ユーザーの完了動画数を取得 (user_progress から取得)
  let completedVideos = 0;
  if (userId) {
    const { count, error: progressCountError } = await supabase
      .from("user_progress")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_completed", true)
      .in("video_id", curriculumVideoIds);
    if (progressCountError) {
      console.error("Failed to count completed videos:", progressCountError);
    }
    completedVideos = count || 0;
  }

  // 進捗率を計算
  const progressPercent = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;

  let latestAnnouncements: Announcement[] = [];
  let readAnnouncementIds = new Set<string>();
  if (userId) {
    const [announcementsResult, readsResult] = await Promise.all([
      supabase
        .from("announcements")
        .select("id, title, body, audience, is_important, is_published, published_at, created_at, updated_at")
        .order("is_important", { ascending: false })
        .order("published_at", { ascending: false })
        .limit(3),
      supabase.from("announcement_reads").select("announcement_id").eq("user_id", userId),
    ]);
    latestAnnouncements = (announcementsResult.data ?? []) as Announcement[];
    readAnnouncementIds = new Set((readsResult.data ?? []).map((row) => row.announcement_id));
  }

  // 「前回の続きから学ぶ」または「最初の動画」のデータを lmsData から取得
  let nextVideoInfo: { chapter: ChapterData; video: VideoData } | null = null;
  let isFirstTime = false;

  if (userId) {
    // 最後に視聴した動画を取得 (video_id は文字列 "video-xxx" などになっている前提)
    const { data: watchedVideos, error: watchedVideosError } = await supabase
      .from("user_progress")
      .select("video_id")
      .eq("user_id", userId)
      .in("video_id", curriculumVideoIds)
      .order("last_watched_at", { ascending: false, nullsFirst: false })
      .limit(1);

    if (watchedVideosError) {
      console.error("Failed to load last watched video:", watchedVideosError);
    }

    const lastWatched = watchedVideos?.[0];
    if (lastWatched?.video_id) {
      // lmsData から該当動画を探す
      for (const chapter of curriculumData) {
        const video = chapter.videos.find(v => v.id === lastWatched.video_id);
        if (video) {
          nextVideoInfo = { chapter, video };
          break;
        }
      }
    }
  }

  // 視聴履歴がない場合、または該当動画が見つからなかった場合は「第一章の最初の動画」を取得
  if (!nextVideoInfo && curriculumData.length > 0 && curriculumData[0].videos.length > 0) {
    isFirstTime = true;
    nextVideoInfo = {
      chapter: curriculumData[0],
      video: curriculumData[0].videos[0]
    };
  }

  // 「今日の一言」メッセージを取得
  let todaysMessage = "ここでは、ピアノを弾くための「本当の身体の使い方」と「音の鳴る仕組み」を基礎から順を追って学んでいきます。焦らず、ご自身のペースで一つ一つの感覚を大切にしながら進めていきましょう！";
  try {
    const { data: messageData } = await supabase
      .from("system_settings")
      .select("value")
      .eq("id", "todays_message")
      .single();
    if (messageData && messageData.value) {
      todaysMessage = messageData.value;
    }
  } catch (error) {
    console.error("Failed to fetch todays message", error);
  }
  
  return (
    <div className="space-y-8 pb-12">
      {/* ブックマーク登録のご案内バナー（控えめ・アコーディオン展開。主役は下の学習コンテンツ） */}
      <details className="group rounded-2xl border-l-4 border-omame-gold bg-omame-accent/50 p-4 md:p-5">
        <summary className="flex cursor-pointer list-none items-center gap-3">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-omame-gold text-base text-white">
            📌
          </span>
          <div className="flex-1">
            <p className="text-base font-medium text-omame-text md:text-lg">
              このページをブックマーク登録しておかれることをおすすめします
            </p>
            <p className="mt-1 text-sm text-omame-text/70">
              次回からは、ブックマークから一発でログインできます（メールでのログイン手続きが不要になります）
            </p>
          </div>
          <span className="flex-shrink-0 text-sm font-medium text-omame-gold">
            <span className="group-open:hidden">見る ▼</span>
            <span className="hidden group-open:inline">閉じる ▲</span>
          </span>
        </summary>
        <div className="mt-6 border-t border-omame-gold/30 pt-6">
          <BookmarkGuide />
        </div>
      </details>

      {/* 歓迎メッセージ＆えりな先生の一言 */}
      <section className="bg-gradient-to-br from-omame-bg to-omame-accent/30 rounded-2xl p-6 lg:p-8 text-omame-text shadow-sm border border-omame-primary/20 relative overflow-hidden">
        
        {/* 動的デコレーション（テナント設定に基づく） */}
        {currentTenantConfig.decorations.todaysMessage.animationStyle === "pixie-dust" && (
          <PixieDust particleCount={30} color="bg-[#d4c5b0]" className="opacity-100 z-0" />
        )}
        
        {currentTenantConfig.decorations.todaysMessage.watermarkImage && (
          <Watermark 
            imageUrl={currentTenantConfig.decorations.todaysMessage.watermarkImage} 
            position="right" 
            opacity={0.06} 
            className="mix-blend-multiply filter sepia-[0.3]"
          />
        )}

        <div className="relative z-10 w-full md:w-3/4">
          <div className="flex items-center gap-2 mb-2 text-omame-primary">
            <Sparkles size={18} />
            <span className="font-bold tracking-widest text-sm">TODAY&apos;S MESSAGE</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold mb-4 leading-tight text-omame-text">
            ようこそ！<br className="lg:hidden" />お豆奏法基礎講座へ
          </h2>
          <p className="text-omame-text/80 max-w-2xl leading-relaxed whitespace-pre-wrap">
            {todaysMessage}
          </p>
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-omame-primary/20 shadow-sm">
                <span className="text-xl">🎹</span>
              </div>
              <span className="font-medium text-omame-text/80">たちえりな</span>
            </div>
            
            {/* スタンプ画像（設定がある場合） */}
            {currentTenantConfig.decorations.todaysMessage.stampImage && (
              <div className="relative w-16 h-16 md:w-20 md:h-20 mr-4 opacity-90 transform rotate-12 hover:rotate-0 hover:scale-110 transition-transform duration-300">
                <Image 
                  src={currentTenantConfig.decorations.todaysMessage.stampImage}
                  alt="Wax Stamp"
                  fill
                  className="object-contain drop-shadow-md"
                />
              </div>
            )}
          </div>
        </div>
        
        {/* ベースの装飾用背景グラデーション */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white opacity-40 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-12 w-64 h-64 bg-omame-gold opacity-20 rounded-full blur-3xl pointer-events-none"></div>
      </section>

      {/* アクション領域：続きから見る ＆ 進捗 */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* メインアクション：前回の続きから / 最初の動画 */}
        <div className="col-span-1 lg:col-span-2">
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm h-full flex flex-col justify-between hover:border-[#d4c5b0] transition-colors group">
            <div>
              <h3 className="font-bold text-stone-800 flex items-center gap-2 mb-4">
                <Play size={20} className="text-[#b8a98f]" />
                {isFirstTime ? "さっそく学習を始めましょう" : "前回の続きから学ぶ"}
              </h3>
              
              {nextVideoInfo ? (
                <div className="bg-[#faf9f6] rounded-xl p-4 mb-6 border border-stone-100">
                  <div className="text-xs font-bold text-[#b8a98f] mb-1">{nextVideoInfo.chapter.title}</div>
                  <h4 className="font-bold text-stone-800 text-lg">{nextVideoInfo.video.title}</h4>
                  {nextVideoInfo.video.memoContent && (
                    <p className="text-sm text-stone-500 mt-2 line-clamp-2">
                      {nextVideoInfo.video.memoContent.split('\n')[0] || nextVideoInfo.video.title}
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-[#faf9f6] rounded-xl p-4 mb-6 border border-stone-100 flex items-center justify-center h-24">
                  <p className="text-sm text-stone-500">現在、動画データが準備中です。</p>
                </div>
              )}
            </div>
            
            {nextVideoInfo && (
              <Link 
                href={`/ja/lms/video/${nextVideoInfo.video.id}`}
                className="bg-stone-800 text-stone-50 font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-stone-700 transition-colors shadow-sm w-full text-lg"
              >
                <Play size={24} fill="currentColor" />
                今すぐこの動画を見る
              </Link>
            )}
          </div>
        </div>

        {/* 進捗プログレス */}
        <div className="col-span-1">
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm h-full">
            <h3 className="font-bold text-stone-800 flex items-center gap-2 mb-6">
              <Trophy size={20} className="text-[#b8a98f]" />
              あなたの学習進捗
            </h3>
            
            <div className="flex justify-between items-end mb-2">
              <span className="text-3xl font-black text-stone-800">{progressPercent}<span className="text-lg text-stone-400 font-medium ml-1">%</span></span>
              <span className="text-sm font-bold text-stone-500">{completedVideos} / {totalVideos} 本完了</span>
            </div>
            
            {/* プログレスバー */}
            <div className="w-full bg-[#faf9f6] rounded-full h-4 mb-8 overflow-hidden border border-stone-200/50">
              <div 
                className="bg-gradient-to-r from-[#d4c5b0] to-[#b8a98f] h-4 rounded-full shadow-inner transition-all duration-1000 ease-out" 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>

            <Link 
              href="/ja/lms/progress"
              className="flex items-center justify-between p-4 bg-[#faf9f6] hover:bg-[#f4f0e6] rounded-xl transition-colors border border-stone-200"
            >
              <div className="flex items-center gap-3">
                <BarChart3 size={20} className="text-stone-600" />
                <span className="font-bold text-stone-700">学習状況を詳しく見る</span>
              </div>
              <ChevronRight size={18} className="text-stone-400" />
            </Link>
          </div>
        </div>
      </section>

      {latestAnnouncements.length > 0 ? (
        <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-stone-100 bg-[#faf9f6] px-6 py-4">
            <h2 className="flex items-center gap-2 font-bold text-stone-800"><Bell size={19} className="text-amber-600" />最新のお知らせ</h2>
            <Link href="/ja/lms/announcements" className="flex items-center gap-1 text-sm font-bold text-stone-500 hover:text-amber-800">一覧を見る<ChevronRight size={16} /></Link>
          </div>
          <ul className="divide-y divide-stone-100">
            {latestAnnouncements.map((item) => (
              <li key={item.id}>
                <Link href={`/ja/lms/announcements/${item.id}`} className="flex items-center gap-4 px-6 py-4 hover:bg-amber-50/50">
                  {!readAnnouncementIds.has(item.id) ? <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" aria-label="未読" /> : <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-stone-200" aria-hidden="true" />}
                  <div className="min-w-0 flex-1"><p className="truncate font-bold text-stone-700">{item.title}</p><time dateTime={item.published_at} className="mt-1 block text-xs text-stone-400">{formatAnnouncementDate(item.published_at)}</time></div>
                  {item.is_important ? <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-800">重要</span> : null}
                  <ChevronRight size={18} className="shrink-0 text-stone-300" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* お豆ナビ検索（大きな入口） */}
      <section>
        <Link 
          href="/ja/lms/search"
          className="block bg-[#fcfbf9] border border-[#eae4d3] text-stone-800 rounded-2xl p-8 relative overflow-hidden group hover:shadow-md transition-all"
        >
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <Search size={24} className="text-[#b8a98f]" />
                お豆ナビ検索（魔法の辞書）
              </h3>
              <p className="text-stone-500 max-w-xl leading-relaxed">
                「手が痛い」「音が硬い」「本番で飛ぶ」などの悩みや曲名で検索すると、えりな先生がその話題を解説している動画の<strong>"該当する秒数"</strong>から自動で再生が始まります。
              </p>
            </div>
            <div className="shrink-0">
              <div className="bg-stone-800 text-white font-bold py-3 px-6 rounded-full inline-flex items-center gap-2 group-hover:bg-stone-700 group-hover:scale-105 transition-all shadow-sm">
                検索してみる
                <ChevronRight size={18} />
              </div>
            </div>
          </div>
          
          {/* 装飾 */}
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-white/40 to-transparent skew-x-12 transform translate-x-8 group-hover:-translate-x-4 transition-transform duration-700"></div>
        </Link>
      </section>

      {/* アップセル：進捗50%以上で表示 */}
      {progressPercent >= 50 && (
        <section>
          <Link
            href="/ja/lms/practice-course"
            className="block bg-gradient-to-r from-stone-800 to-stone-900 text-white rounded-2xl p-6 lg:p-8 relative overflow-hidden group hover:shadow-xl transition-all"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🎉</span>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    {progressPercent}% 達成おめでとうございます！
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2">
                  学んだ原理を、あなたの曲で実践しませんか？
                </h3>
                <p className="text-stone-400 max-w-lg leading-relaxed text-sm">
                  基礎講座で身につけた「お豆奏法の原理」を、実際の楽曲で応用する実践講座をご用意しています。
                </p>
              </div>
              <div className="shrink-0">
                <div className="bg-amber-500 text-stone-900 font-bold py-3 px-6 rounded-full inline-flex items-center gap-2 group-hover:bg-amber-400 group-hover:scale-105 transition-all shadow-lg">
                  🚀 実践講座を見る
                  <ChevronRight size={18} />
                </div>
              </div>
            </div>
          </Link>
        </section>
      )}

    </div>
  );
}
