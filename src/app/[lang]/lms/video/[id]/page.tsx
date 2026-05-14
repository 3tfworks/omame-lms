"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Play, FileText, BookOpen, CheckCircle2 } from "lucide-react";

export default function VideoPlayerPage() {
  const [activeTab, setActiveTab] = useState("timestamp");
  
  // ダミーのタイムスタンプデータ
  const timestamps = [
    { time: "00:00", desc: "オープニング：今日のテーマ" },
    { time: "02:15", desc: "ピアノの音を決める「打鍵スピード」の解説" },
    { time: "05:30", desc: "【実演】力で弾いた音と、スピードで弾いた音の違い" },
    { time: "08:45", desc: "指先の感覚を掴むための練習法" },
    { time: "12:00", desc: "よくある間違い：手首の固さについて" },
  ];

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
          <div className="text-sm font-bold text-[#b8a98f] mb-1">第2章：音の鳴る仕組みと鍵盤の扱い</div>
          <h1 className="text-2xl font-bold text-stone-800">ピアノの音を決めるのは「打鍵スピード」だけ</h1>
        </div>
      </div>

      {/* 動画プレイヤー枠 (Vimeo埋め込みイメージ) */}
      <div className="bg-stone-900 rounded-2xl overflow-hidden shadow-lg border border-stone-200 aspect-video relative">
        {/* ダミーのVimeo iframe */}
        <iframe 
          src="https://player.vimeo.com/video/76979871?h=8272103f6e&title=0&byline=0&portrait=0" 
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
              <h3 className="font-bold text-stone-800 mb-6">えりな先生のレバレッジメモ</h3>
              <div className="bg-white p-6 rounded-xl border border-stone-200 space-y-4 text-stone-700">
                <p>多くの人が「力」でピアノを鳴らそうとしますが、ハンマーを飛ばすために必要なのは「スピード」です。</p>
                <p><strong>💡 今日の最重要ポイント：</strong></p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>鍵盤の底に向かって押し込まない</li>
                  <li>打鍵した瞬間に力は抜けていること（重力に任せる）</li>
                  <li>音の硬さは「手首の力み」がそのまま伝わっている証拠</li>
                </ul>
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
