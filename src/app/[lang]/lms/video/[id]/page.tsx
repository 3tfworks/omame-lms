"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Play, FileText, BookOpen, CheckCircle2 } from "lucide-react";
import { getVideoById, getChapterByVideoId } from "@/lib/lmsData";

export default function VideoPlayerPage({ params }: { params: Promise<{ id: string }> }) {
  // Next.js 15では params がPromiseになるため React.use() でアンラップします
  const resolvedParams = React.use(params);
  const videoId = resolvedParams.id;
  
  const videoData = getVideoById(videoId);
  const chapterData = getChapterByVideoId(videoId);

  const [activeTab, setActiveTab] = useState("memo"); // デフォルトをレバメモに変更
  
  // ダミーのタイムスタンプデータ
  const timestamps = [
    { time: "00:00", desc: "オープニング：今日のテーマ" },
    { time: "02:15", desc: "ピアノの音を決める「打鍵スピード」の解説" },
    { time: "05:30", desc: "【実演】力で弾いた音と、スピードで弾いた音の違い" },
    { time: "08:45", desc: "指先の感覚を掴むための練習法" },
    { time: "12:00", desc: "よくある間違い：手首の固さについて" },
  ];

  if (!videoData) {
    return <div className="p-12 text-center">動画が見つかりませんでした</div>;
  }

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* 戻るボタンとタイトル */}
      <div className="flex items-center gap-4">
        <Link 
          href="/ja/lms" 
          className="p-2 rounded-full hover:bg-[#eae4d3] text-stone-500 transition-colors"
        >
          <ChevronLeft size={24} />
        </Link>
        <div>
          <div className="text-sm font-bold text-[#b8a98f] mb-1">{chapterData?.title || "お豆奏法基礎講座"}</div>
          <h1 className="text-2xl font-bold text-stone-800">{videoData.title}</h1>
        </div>
      </div>

      {/* 動画プレイヤー枠 (Vimeo埋め込みイメージ) */}
      <div className="bg-stone-900 rounded-2xl overflow-hidden shadow-lg border border-stone-200 aspect-video relative">
        <iframe 
          src={`https://player.vimeo.com/video/${videoData.vimeoId}?title=0&byline=0&portrait=0`} 
          className="absolute top-0 left-0 w-full h-full" 
          frameBorder="0" 
          allow="autoplay; fullscreen; picture-in-picture" 
          allowFullScreen
        ></iframe>
      </div>

      {/* アクション領域：完了ボタン */}
      <div className="flex justify-end">
        <button className="bg-stone-800 text-stone-50 font-bold py-3 px-8 rounded-xl flex items-center justify-center gap-2 hover:bg-stone-700 transition-colors shadow-sm">
          <CheckCircle2 size={20} />
          この動画を「完了」にする
        </button>
      </div>

      {/* タブ切り替え領域 */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden mt-8">
        <div className="flex border-b border-stone-200 overflow-x-auto hide-scrollbar">
          <button 
            onClick={() => setActiveTab("timestamp")}
            className={`flex-1 min-w-[150px] py-4 px-6 font-bold text-sm flex items-center justify-center gap-2 transition-colors ${activeTab === "timestamp" ? "bg-[#faf9f6] text-stone-800 border-b-2 border-amber-700" : "text-stone-500 hover:bg-[#faf9f6]"}`}
          >
            <Play size={18} />
            お豆ナビ（目次）
          </button>
          <button 
            onClick={() => setActiveTab("memo")}
            className={`flex-1 min-w-[150px] py-4 px-6 font-bold text-sm flex items-center justify-center gap-2 transition-colors ${activeTab === "memo" ? "bg-[#faf9f6] text-stone-800 border-b-2 border-amber-700" : "text-stone-500 hover:bg-[#faf9f6]"}`}
          >
            <FileText size={18} />
            レバレッジメモ
          </button>
          <button 
            onClick={() => setActiveTab("notes")}
            className={`flex-1 min-w-[150px] py-4 px-6 font-bold text-sm flex items-center justify-center gap-2 transition-colors ${activeTab === "notes" ? "bg-[#faf9f6] text-stone-800 border-b-2 border-amber-700" : "text-stone-500 hover:bg-[#faf9f6]"}`}
          >
            <BookOpen size={18} />
            マイノート
          </button>
        </div>

        <div className="p-6 lg:p-8 bg-[#faf9f6] min-h-[400px]">
          {/* タブの中身：お豆ナビ（タイムスタンプ） */}
          {activeTab === "timestamp" && (
            <div className="space-y-4">
              <h3 className="font-bold text-stone-800 mb-6">動画の目次（クリックでその秒数から再生します）</h3>
              <div className="grid grid-cols-1 gap-3">
                {timestamps.map((ts, idx) => (
                  <button key={idx} className="flex items-center gap-4 p-4 bg-white border border-stone-200 rounded-xl hover:border-[#b8a98f] transition-colors text-left group">
                    <span className="bg-amber-100 text-amber-900 font-mono font-bold px-3 py-1 rounded-md text-sm shrink-0 group-hover:bg-amber-200 transition-colors">
                      {ts.time}
                    </span>
                    <span className="font-medium text-stone-700">{ts.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* タブの中身：レバレッジメモ */}
          {activeTab === "memo" && (
            <div className="prose prose-stone max-w-none">
              <h3 className="font-bold text-stone-800 mb-6 flex items-center gap-2">
                <FileText className="text-amber-700" size={24} />
                えりな先生のレバレッジメモ
              </h3>
              
              <div className="bg-white p-6 lg:p-10 rounded-xl border border-stone-200 shadow-sm">
                {videoData.memoContent ? (
                  <div className="space-y-6 text-stone-700 leading-relaxed mb-12">
                    {videoData.memoContent.split('\n').map((line, idx) => {
                      const text = line.trim();
                      if (!text) return <div key={idx} className="h-4"></div>; // 空行
                      
                      // 見出し（全体要約、タイムライン、など短い強調行）
                      if ((text.length < 30 && !text.includes('。') && !text.includes('・')) || text.startsWith('【') || text.endsWith('】')) {
                        return <h4 key={idx} className="text-lg font-bold text-stone-800 border-b border-stone-200 pb-2 mt-8 mb-4">{text}</h4>;
                      }
                      
                      // タイムライン表記（例: 00:00〜00:40 | イントロ）
                      if (text.match(/^[0-9]{2}:[0-9]{2}/)) {
                        const parts = text.split('|');
                        return (
                          <div key={idx} className="bg-[#faf9f6] p-4 rounded-lg border border-stone-200 my-4">
                            <div className="font-bold text-amber-800 mb-1">{parts[0]}</div>
                            <div className="font-bold text-stone-800">{parts.slice(1).join('|')}</div>
                          </div>
                        );
                      }
                      
                      // 箇条書き
                      if (text.startsWith('・') || text.startsWith('-') || text.startsWith('●')) {
                        return <li key={idx} className="ml-4 list-disc marker:text-amber-600">{text.replace(/^[・\-●]\s*/, '')}</li>;
                      }
                      
                      // 通常テキスト
                      return <p key={idx} className="mb-2">{text}</p>;
                    })}
                  </div>
                ) : (
                  <div className="text-center p-8 text-stone-400 mb-8">
                    この動画にはレバレッジメモのテキストはありません。
                  </div>
                )}

                {/* 元のドキュメントへのリンク（ボタン） */}
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

          {/* タブの中身：マイノート */}
          {activeTab === "notes" && (
            <div className="space-y-6">
              <h3 className="font-bold text-stone-800">あなたの学習ノート</h3>
              <p className="text-sm text-stone-500">この動画から得た気づきや、次回の練習で意識することを書き留めておきましょう。（先生には見えません）</p>
              
              <textarea 
                className="w-full h-48 p-4 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d4c5b0] resize-none text-stone-700"
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
    </div>
  );
}
