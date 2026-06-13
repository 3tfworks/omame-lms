"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Play, FileText, BookOpen, CheckCircle2, Sparkles, ArrowRight, Trophy, Star, Trash2, HelpCircle } from "lucide-react";
import { getVideoById, getChapterByVideoId, getAdjacentVideos, curriculumData } from "@/lib/lmsData";
import { motion, AnimatePresence } from "framer-motion";

import Player from '@vimeo/player';

function ActionCheckbox({ text, onCheck }: { text: string, onCheck: () => void }) {
  const [checked, setChecked] = useState(false);
  const [showBeans, setShowBeans] = useState(false);

  const handleClick = () => {
    if (checked) return;
    setChecked(true);
    setShowBeans(true);
    onCheck();
    setTimeout(() => setShowBeans(false), 2000);
  };

  return (
    <div 
      className="relative flex items-start gap-4 p-4 my-3 bg-white rounded-xl border border-stone-200 shadow-sm hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group" 
      onClick={handleClick}
    >
      <div className={`mt-0.5 w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${checked ? 'bg-amber-600 border-amber-600 text-white' : 'border-stone-300 bg-white group-hover:border-amber-400'}`}>
        {checked && <CheckCircle2 size={16} />}
      </div>
      <span className={`leading-relaxed transition-colors duration-300 ${checked ? 'text-stone-400' : 'text-stone-700 font-medium'}`}>
        {text}
      </span>
      
      {/* お豆弾けるエフェクト */}
      <AnimatePresence>
        {showBeans && (
          <>
            <motion.div 
              initial={{ scale: 0, opacity: 1, y: 0, x: -10 }}
              animate={{ scale: [0.5, 1.5, 1], opacity: [1, 1, 0], y: -40, x: -20, rotate: -20 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute left-2 top-0 pointer-events-none text-3xl z-10"
            >
              🌱
            </motion.div>
            <motion.div 
              initial={{ scale: 0, opacity: 1, y: 0, x: 10 }}
              animate={{ scale: [0.5, 1.2, 1], opacity: [1, 1, 0], y: -30, x: 30, rotate: 20 }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
              className="absolute left-4 top-2 pointer-events-none text-2xl z-10"
            >
              ✨
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Vimeo Player API を使ったカスタムプレイヤー
function CustomVideoPlayer({ vimeoId, onReady }: { vimeoId: string, onReady: (player: Player) => void }) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!containerRef.current) return;

    // URLパラメータの t（秒数）を取得して開始位置を設定
    const params = new URLSearchParams(window.location.search);
    const tStr = params.get('t');

    // vimeoIdだけを数値として抽出（https://vimeo.com/...等のURLの可能性も考慮）
    const cleanId = vimeoId.split('?')[0].split('/').pop() || vimeoId;

    const options: any = {
      id: parseInt(cleanId),
      responsive: true,
      title: false,
      byline: false,
      portrait: false,
    };

    if (tStr) {
      const seconds = parseInt(tStr, 10);
      if (!isNaN(seconds) && seconds > 0) {
        options.t = seconds;
      }
    }

    const player = new Player(containerRef.current, options);
    onReady(player);

    return () => {
      player.destroy();
    };
  }, [vimeoId]);

  return <div ref={containerRef} className="w-full h-full"></div>;
}

export default function VideoPlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const videoId = resolvedParams.id;
  
  const videoData = getVideoById(videoId);
  const chapterData = getChapterByVideoId(videoId);
  const { prev, next, currentIndexInChapter, totalInChapter } = getAdjacentVideos(videoId);

  const [activeTab, setActiveTab] = useState("memo");
  const [noteText, setNoteText] = useState("");
  
  // Vimeo Player と付箋用ステート
  const [vimeoPlayer, setVimeoPlayer] = useState<Player | null>(null);
  const [isAddingBookmark, setIsAddingBookmark] = useState(false);
  const [bookmarkTime, setBookmarkTime] = useState<number>(0);
  const [bookmarkContent, setBookmarkContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [isVideoCompleted, setIsVideoCompleted] = useState(false); // 完了状態のステート追加

  // 付箋一覧の取得
  React.useEffect(() => {
    async function fetchBookmarks() {
      try {
        const res = await fetch(`/api/bookmarks?videoId=${videoId}`);
        if (res.ok) {
          const data = await res.json();
          setBookmarks(data.bookmarks);
        }
      } catch (error) {
        console.error("Failed to fetch bookmarks:", error);
      }
    }
    fetchBookmarks();
  }, [videoId]);
  
  if (!videoData) {
    return <div className="p-12 text-center">動画が見つかりませんでした</div>;
  }

  const handleTaskCheck = (taskText: string) => {
    const today = new Date();
    const dateStr = `${today.getMonth() + 1}/${today.getDate()}`;
    const newRecord = `✅ 【完了】${taskText}（${dateStr}）\n`;
    setNoteText(prev => prev ? `${prev}\n${newRecord}` : newRecord);
  };

  // memoContentのパースロジック
  const renderMemoContent = () => {
    if (!videoData.memoContent) return null;

    const parsedElements = [];
    let currentSection = ''; // 'action' | 'summary' | ''
    const lines = videoData.memoContent.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) {
        parsedElements.push(<div key={i} className="h-4"></div>);
        continue;
      }
      
      if (line.includes('行動リスト')) {
        currentSection = 'action';
        parsedElements.push(
          <div key={i} className="flex items-center gap-2 mt-8 mb-4 border-b border-stone-200 pb-2">
            <span className="text-xl">🎯</span>
            <h4 className="text-lg font-bold text-amber-800">{line}</h4>
          </div>
        );
        continue;
      }

      if (line.includes('まとめポイント')) {
        currentSection = 'summary';
      }

      // 「動画のながれ」（旧タイムライン）セクションの見出し。【】や箇条書き接頭辞付きでも検出する。
      if (line.includes('動画のながれ') || line.includes('タイムライン別の重要ポイント')) {
        currentSection = 'flow';
        parsedElements.push(
          <div key={i} className="flex items-center gap-2 mt-8 mb-4 border-b border-stone-200 pb-2">
            <span className="text-xl">🎬</span>
            <h4 className="text-lg font-bold text-amber-800">動画のながれ</h4>
          </div>
        );
        continue;
      }

      // 区切り線（---など）は無視
      if (line.match(/^[-_]{3,}$/)) {
        parsedElements.push(<hr key={i} className="my-6 border-stone-200 border-dashed" />);
        continue;
      }

      // 箇条書きの判定（行頭の空白や不可視文字を許容）
      const listMatch = line.match(/^[\s\u200B\u00A0]*[*\-・●＊]\s*(.+)/);
      if (listMatch) {
        const text = listMatch[1].trim();
        
        // 「行動リスト」セクションの箇条書きのみをチェックボックスにする
        if (currentSection === 'action') {
          parsedElements.push(<ActionCheckbox key={i} text={text} onCheck={() => handleTaskCheck(text)} />);
        } else {
          // それ以外のセクション（タイムライン、まとめ等）のものは普通のリスト
          parsedElements.push(<li key={i} className="ml-4 list-disc marker:text-amber-600 my-2 leading-relaxed">{text}</li>);
        }
        continue;
      }

      // 「動画のながれ」セクション内のポイント行（"NN 見出し"）→ 連番の丸バッジ＋見出し。
      // 連番はデータ生成時に並び順から自動採番済み（scripts/clean-memo.mjs）。
      if (currentSection === 'flow') {
        const pointMatch = line.match(/^(\d{2})[ 　]+(.+)$/);
        if (pointMatch) {
          parsedElements.push(
            <div key={i} className="flex items-start gap-3 my-4">
              <span
                className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold"
                style={{ backgroundColor: "rgba(203,163,101,0.15)", color: "#cba365" }}
              >
                {pointMatch[1]}
              </span>
              <div className="font-bold text-stone-800 leading-snug pt-1.5">{pointMatch[2]}</div>
            </div>
          );
          continue;
        }
      }

      // 見出し（全体要約、まとめポイントなど短い強調行）
      if ((line.length < 30 && !line.includes('。')) || line.startsWith('【') || line.endsWith('】')) {
        parsedElements.push(<h4 key={i} className="text-lg font-bold text-stone-800 border-b border-stone-200 pb-2 mt-8 mb-4">{line.replace(/^[【]/, '').replace(/[】]$/, '')}</h4>);
        continue;
      }
      
      // 通常テキスト
      parsedElements.push(<p key={i} className="mb-2">{line}</p>);
    }

    return parsedElements;
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* 戻るボタンとタイトル */}
      <div className="flex items-center gap-4">
        <Link href="/ja/lms" className="p-2 rounded-full hover:bg-[#eae4d3] text-stone-500 transition-colors">
          <ChevronLeft size={24} />
        </Link>
        <div>
          <div className="text-sm font-bold text-[#b8a98f] mb-1">{chapterData?.title || "お豆奏法基礎講座"}</div>
          <h1 className="text-2xl font-bold text-stone-800">{videoData.title}</h1>
        </div>
      </div>

      {/* 動画プレイヤー枠 */}
      <div className="bg-stone-900 rounded-2xl overflow-hidden shadow-lg border border-stone-200 aspect-video relative">
        <CustomVideoPlayer vimeoId={videoData.vimeoId} onReady={(player) => setVimeoPlayer(player)} />
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
        {/* みんなの付箋追加ボタン */}
        <button 
          onClick={async () => {
            if (vimeoPlayer) {
              const seconds = await vimeoPlayer.getCurrentTime();
              setBookmarkTime(Math.floor(seconds));
              setIsAddingBookmark(true);
            }
          }}
          className="bg-white border-2 border-[#b8a98f] text-[#b8a98f] font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-[#faf9f6] transition-colors shadow-sm w-full sm:w-auto"
        >
          <Star size={20} />
          今のシーンに付箋を貼る
        </button>

        <button 
          onClick={() => setIsVideoCompleted(!isVideoCompleted)}
          className={`font-bold py-3 px-8 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm w-full sm:w-auto group ${isVideoCompleted ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-stone-800 text-stone-50 hover:bg-stone-700'}`}
          title={isVideoCompleted ? "未完了の状態に戻す" : "完了にする"}
        >
          <CheckCircle2 size={20} />
          {isVideoCompleted ? (
            <span className="flex items-center gap-2">
              完了しました <span className="text-emerald-200 text-xs font-normal opacity-0 group-hover:opacity-100 transition-opacity">（クリックで取消）</span>
            </span>
          ) : 'この動画を「完了」にする'}
        </button>
      </div>

      {/* ① コンパクト版：前後ナビゲーション（プレイヤー直下） */}
      <div className="flex justify-between items-center mt-2">
        {prev ? (
          <Link
            href={`/ja/lms/video/${prev.video.id}`}
            className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 transition-colors group py-2 pr-4"
          >
            <ChevronLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="truncate max-w-[200px]">前の動画</span>
          </Link>
        ) : (
          <div />
        )}
        <span className="text-xs text-stone-400 font-medium">
          {currentIndexInChapter + 1} / {totalInChapter} 本目
        </span>
        {next ? (
          <Link
            href={`/ja/lms/video/${next.video.id}`}
            className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 transition-colors group py-2 pl-4"
          >
            <span className="truncate max-w-[200px]">次の動画</span>
            <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        ) : (
          <div />
        )}
      </div>

      {/* 付箋追加フォーム（インライン展開） */}
      <AnimatePresence>
        {isAddingBookmark && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-[#faf9f6] border border-[#b8a98f] rounded-2xl p-6 overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-4 text-[#b8a98f] font-bold">
              <Star size={20} />
              <span>{Math.floor(bookmarkTime / 60).toString().padStart(2, '0')}:{(bookmarkTime % 60).toString().padStart(2, '0')} に付箋を貼る</span>
            </div>
            <textarea 
              className="w-full border border-stone-300 rounded-xl p-4 focus:ring-2 focus:ring-[#b8a98f] focus:border-transparent transition-shadow resize-none mb-4"
              rows={3}
              placeholder="このシーンの気づきやメモを入力してください（他の受講生にも共有されます）"
              value={bookmarkContent}
              onChange={(e) => setBookmarkContent(e.target.value)}
            ></textarea>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setIsAddingBookmark(false)}
                className="px-6 py-2 rounded-lg font-bold text-stone-500 hover:bg-stone-200 transition-colors"
              >
                キャンセル
              </button>
              <button 
                onClick={async () => {
                  if (!bookmarkContent.trim() || isSubmitting) return;
                  setIsSubmitting(true);
                  try {
                    const res = await fetch("/api/bookmarks", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        videoId: videoId,
                        timestampSeconds: bookmarkTime,
                        content: bookmarkContent
                      })
                    });
                    
                    if (res.ok) {
                      const data = await res.json();
                      setBookmarks(prev => [...prev, data.bookmark].sort((a, b) => a.timeSeconds - b.timeSeconds));
                      setBookmarkContent("");
                      setIsAddingBookmark(false);
                      setActiveTab("bookmarks");
                    } else {
                      const errorData = await res.json();
                      alert(`投稿に失敗しました: ${errorData.error}`);
                    }
                  } catch (error) {
                    console.error("Failed to post bookmark:", error);
                    alert("通信エラーが発生しました。");
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                disabled={isSubmitting}
                className={`px-6 py-2 rounded-lg font-bold transition-colors ${isSubmitting ? 'bg-stone-300 text-stone-500 cursor-not-allowed' : 'bg-[#b8a98f] text-white hover:bg-amber-700'}`}
              >
                {isSubmitting ? '送信中...' : '付箋を投稿する'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* タブ切り替え領域 */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden mt-8">
        <div className="flex border-b border-stone-200 overflow-x-auto hide-scrollbar">
          <button 
            onClick={() => setActiveTab("memo")}
            className={`flex-1 min-w-[120px] py-4 px-4 font-bold text-sm flex items-center justify-center gap-2 transition-colors ${activeTab === "memo" ? "bg-[#faf9f6] text-stone-800 border-b-2 border-amber-700" : "text-stone-500 hover:bg-[#faf9f6]"}`}
          >
            <FileText size={18} />
            レバレッジメモ
          </button>
          <button 
            onClick={() => setActiveTab("bookmarks")}
            className={`flex-1 min-w-[120px] py-4 px-4 font-bold text-sm flex items-center justify-center gap-2 transition-colors ${activeTab === "bookmarks" ? "bg-[#faf9f6] text-stone-800 border-b-2 border-amber-700" : "text-stone-500 hover:bg-[#faf9f6]"}`}
          >
            <Star size={18} />
            みんなの付箋
          </button>
          <button 
            onClick={() => setActiveTab("notes")}
            className={`flex-1 min-w-[120px] py-4 px-4 font-bold text-sm flex items-center justify-center gap-2 transition-colors ${activeTab === "notes" ? "bg-[#faf9f6] text-stone-800 border-b-2 border-amber-700" : "text-stone-500 hover:bg-[#faf9f6]"}`}
          >
            <BookOpen size={18} />
            マイノート
          </button>
        </div>

        <div className="p-6 lg:p-8 bg-[#faf9f6] min-h-[400px]">

          {activeTab === "memo" && (
            <div className="prose prose-stone max-w-none">
              <h3 className="font-bold text-stone-800 mb-6 flex items-center gap-2">
                <FileText className="text-amber-700" size={24} />
                えりな先生のレバレッジメモ
              </h3>
              
              <div className="bg-white p-6 lg:p-10 rounded-xl border border-stone-200 shadow-sm">
                {videoData.memoContent ? (
                  <div className="space-y-6 text-stone-700 leading-relaxed mb-12">
                    {renderMemoContent()}
                  </div>
                ) : (
                  <div className="text-center p-8 text-stone-400 mb-8">
                    この動画にはレバレッジメモのテキストはありません。
                  </div>
                )}

                {videoData.memoUrl && (
                  <div className="mt-8 pt-8 border-t border-stone-200 flex flex-col items-center justify-center space-y-4">
                    <p className="text-sm text-stone-500">
                      印刷用や、より詳細なフォーマットで確認したい場合は以下の原本をご覧ください。
                    </p>
                    <a 
                      href={videoData.memoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold py-3 px-8 rounded-full transition-all border border-stone-300"
                    >
                      <FileText size={20} />
                      元のGoogleドキュメントを開く
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "bookmarks" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-stone-800 flex items-center gap-2">
                  <Star className="text-amber-500" size={24} />
                  みんなの付箋
                </h3>
                <span className="text-sm text-stone-500">{bookmarks.length}件の付箋</span>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {bookmarks.length > 0 ? bookmarks.map((bm) => (
                  <div key={bm.id} className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm hover:border-[#b8a98f] transition-colors relative group">
                    <div className="flex justify-between items-start mb-3">
                      <button 
                        onClick={() => {
                          if (vimeoPlayer) vimeoPlayer.setCurrentTime(bm.timeSeconds);
                        }}
                        className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 font-mono font-bold px-3 py-1 rounded-md text-sm hover:bg-amber-200 transition-colors"
                      >
                        <Play size={14} />
                        {bm.timeStr}
                      </button>
                      <div className="flex items-center gap-2">
                        {bm.isOwn && (
                          <button
                            onClick={async () => {
                              if (!confirm("この付箋を削除しますか？")) return;
                              try {
                                const res = await fetch("/api/bookmarks", {
                                  method: "DELETE",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ bookmarkId: bm.id })
                                });
                                if (res.ok) {
                                  setBookmarks(prev => prev.filter(b => b.id !== bm.id));
                                } else {
                                  const errData = await res.json();
                                  alert(`削除に失敗しました: ${errData.error}`);
                                }
                              } catch (error) {
                                console.error("Failed to delete bookmark:", error);
                              }
                            }}
                            className="p-1 rounded-md text-stone-500 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="この付箋を削除"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                        <span className="text-xs font-bold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full">
                          {bm.author}
                        </span>
                      </div>
                    </div>
                    <p className="text-stone-800 leading-relaxed font-medium mb-4">{bm.content}</p>
                    <div className="flex justify-end border-t border-stone-100 pt-3">
                      <button 
                        onClick={async () => {
                          try {
                            const res = await fetch("/api/bookmarks", {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ bookmarkId: bm.id })
                            });
                            if (res.ok) {
                              const data = await res.json();
                              setBookmarks(prev => prev.map(b => b.id === bm.id ? { ...b, likes: data.likes } : b));
                            }
                          } catch (error) {
                            console.error("Failed to like bookmark:", error);
                          }
                        }}
                        className="flex items-center gap-1.5 text-stone-400 hover:text-rose-500 transition-colors group/btn"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover/btn:fill-rose-100"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                        <span className="text-sm font-bold">助かった！ {bm.likes}</span>
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-10 px-4 bg-white rounded-xl border border-stone-200 shadow-sm relative overflow-hidden">
                    {/* 背景の装飾 */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-100/50 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-stone-100 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="relative z-10">
                      <Star size={48} className="mx-auto mb-4 text-[#b8a98f] opacity-40" />
                      <h4 className="font-bold text-stone-800 mb-2 text-lg">まだ付箋がありません</h4>
                      <p className="text-stone-500 text-sm mb-6 leading-relaxed max-w-sm mx-auto">
                        動画の気づきや疑問を書き留めて、他の受講生とシェアしましょう！えりな先生の目に留まるかもしれません✨
                      </p>
                      
                      <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
                        <Link
                          href="/ja/lms/bookmarks-guide"
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#faf9f6] border border-[#b8a98f] text-amber-900 font-bold py-2.5 px-6 rounded-xl hover:bg-amber-50 transition-colors shadow-sm"
                        >
                          <HelpCircle size={18} />
                          みんなの付箋とは？
                        </Link>
                        
                        <button
                          onClick={async () => {
                            if (vimeoPlayer) {
                              const seconds = await vimeoPlayer.getCurrentTime();
                              setBookmarkTime(Math.floor(seconds));
                              setIsAddingBookmark(true);
                              // 画面上部（付箋追加フォーム）へスクロールさせる
                              window.scrollTo({ top: 300, behavior: 'smooth' });
                            }
                          }}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-stone-800 text-stone-50 font-bold py-2.5 px-6 rounded-xl hover:bg-stone-700 transition-colors shadow-sm"
                        >
                          <Star size={18} fill="currentColor" />
                          最初の付箋を貼る
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "notes" && (
            <div className="space-y-6">
              <h3 className="font-bold text-stone-800">あなたの学習ノート</h3>
              <p className="text-sm text-stone-500">この動画から得た気づきや、次回の練習で意識することを書き留めておきましょう。（先生には見えません）</p>
              
              <textarea 
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="w-full h-48 p-4 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d4c5b0] resize-none text-stone-700 font-medium leading-relaxed"
                placeholder="例：打鍵スピードを意識したら、今までより少ない力で芯のある音が出た！明日は右手だけでこの感覚を反復する。"
              ></textarea>
              
              <div className="flex justify-end">
                <button className="bg-stone-200 text-stone-700 font-bold py-2 px-6 rounded-lg hover:bg-stone-300 transition-colors">
                  ノートを保存する
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ② リッチ版：前後ナビゲーション（ページ最下部） */}
      <div className="mt-10">
        {/* 章クリア表示（次の動画が別の章の場合 ＆＆ 動画が完了した場合のみ表示） */}
        {next?.isNewChapter && isVideoCompleted && (
          <div className="mb-6 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 rounded-2xl p-6 lg:p-8 border border-amber-200 text-center relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-200/30 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-orange-200/20 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10">
              <div className="text-4xl mb-3">🎉</div>
              <h3 className="text-xl font-bold text-stone-800 mb-2">
                {chapterData?.title?.split('：')[0] || '章'} クリア！
              </h3>
              <p className="text-stone-500 text-sm mb-4">
                おつかれさまでした！次は新しい章に進みます。
              </p>
              <div className="bg-white/80 rounded-xl p-4 border border-amber-200/50 inline-block">
                <div className="text-xs font-bold text-amber-700 mb-1">📖 次の章</div>
                <div className="font-bold text-stone-800">{next.chapter.title}</div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 前の動画カード */}
          {prev ? (
            <Link
              href={`/ja/lms/video/${prev.video.id}`}
              className="group bg-white rounded-xl p-5 border border-stone-200 hover:border-[#b8a98f] hover:shadow-md transition-all flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-stone-100 group-hover:bg-amber-100 flex items-center justify-center shrink-0 transition-colors">
                <ChevronLeft size={20} className="text-stone-400 group-hover:text-amber-700 transition-colors" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-stone-400 mb-1">前の動画</div>
                {prev.isNewChapter && (
                  <div className="text-xs text-amber-700 font-bold mb-1">{prev.chapter.title.split('：')[0]}</div>
                )}
                <div className="font-bold text-stone-700 group-hover:text-stone-900 truncate transition-colors">
                  {prev.video.title}
                </div>
              </div>
            </Link>
          ) : (
            <div />
          )}

          {/* 次の動画カード */}
          {next ? (
            <Link
              href={`/ja/lms/video/${next.video.id}`}
              className="group bg-white rounded-xl p-5 border border-stone-200 hover:border-[#b8a98f] hover:shadow-md transition-all flex items-start gap-4 sm:flex-row-reverse sm:text-right"
            >
              <div className="w-10 h-10 rounded-full bg-stone-100 group-hover:bg-amber-100 flex items-center justify-center shrink-0 transition-colors">
                <ChevronRight size={20} className="text-stone-400 group-hover:text-amber-700 transition-colors" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-stone-400 mb-1">次の動画</div>
                {next.isNewChapter && (
                  <div className="text-xs text-amber-700 font-bold mb-1">{next.chapter.title.split('：')[0]}</div>
                )}
                <div className="font-bold text-stone-700 group-hover:text-stone-900 truncate transition-colors">
                  {next.video.title}
                </div>
              </div>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>

      {/* 最終動画の場合：修了CTA */}
      {(() => {
        const lastChapter = curriculumData[curriculumData.length - 1];
        const lastVideoId = lastChapter?.videos[lastChapter.videos.length - 1]?.id;
        if (videoId !== lastVideoId) return null;
        if (!isVideoCompleted) return null; // 完了ボタンを押すまでは表示しない
        
        return (
          <div className="mt-10 bg-gradient-to-br from-amber-50 via-white to-orange-50 rounded-2xl p-8 lg:p-10 border border-amber-200 shadow-lg relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-200/30 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-orange-200/20 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 text-center">
              <Trophy className="w-14 h-14 mx-auto text-amber-500 mb-4" />
              <h2 className="text-2xl lg:text-3xl font-bold text-stone-800 mb-3">
                🎉 おめでとうございます！
              </h2>
              <p className="text-stone-600 mb-2 text-lg">
                お豆奏法基礎講座、すべての動画を修了しました。
              </p>
              <p className="text-stone-500 mb-8 max-w-lg mx-auto leading-relaxed">
                ここまで学んだ「身体の使い方」と「音の鳴る原理」を、
                あなた自身の演奏曲で実践してみませんか？
              </p>
              
              <div className="bg-white rounded-xl p-6 mb-8 border border-stone-200 shadow-sm max-w-md mx-auto text-left">
                <h3 className="font-bold text-stone-800 mb-4 text-center">基礎実践講座で学べること</h3>
                <div className="space-y-3">
                  {[
                    "実際の楽曲でのお豆奏法の応用方法",
                    "えりな先生による実践的なフィードバック",
                    "受講生同士で学び合えるコミュニティ",
                    "より深い身体感覚のワーク"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle2 size={18} className="text-amber-600 shrink-0" />
                      <span className="text-stone-700 text-sm font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <Link
                href="/ja/lms/practice-course"
                className="inline-flex items-center gap-3 bg-stone-800 text-white font-bold py-4 px-8 rounded-full text-lg hover:bg-stone-700 transition-all shadow-lg group"
              >
                <Sparkles size={20} className="text-amber-400" />
                基礎実践講座の詳細を見る
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <p className="mt-4 text-xs text-stone-400">
                ※ まずは詳細をご覧ください。無理な勧誘はいたしません。
              </p>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
