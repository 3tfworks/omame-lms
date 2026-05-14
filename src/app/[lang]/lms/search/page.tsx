"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Tag, Filter, PlayCircle, Star } from "lucide-react";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>("手が痛い");

  // クイック絞り込み用のタグデータ
  const quickTags = [
    { category: "お悩み", tags: ["手が痛い", "音が硬い", "暗譜が飛ぶ", "速く弾けない"] },
    { category: "身体の部位", tags: ["指先", "手首", "腕・肩", "姿勢・重心"] },
    { category: "その他", tags: ["練習法", "マインドセット", "ペダル"] },
  ];

  // 検索結果のモックデータ（みんなの付箋・タイムスタンプ）
  const searchResults = [
    {
      id: "res-1",
      videoId: "v1",
      videoTitle: "第1章：努力しても弾けなかった理由",
      timestamp: "08:45",
      desc: "手首が痛くなる一番の原因「押し込み」のメカニズム",
      contributor: "公式",
      likes: 124,
    },
    {
      id: "res-2",
      videoId: "v3-2",
      videoTitle: "第2章：ピアノの音を決めるのは「打鍵スピード」だけ",
      timestamp: "12:30",
      desc: "フォルテを弾く時に手が痛くならない重力の乗せ方",
      contributor: "A子さん",
      likes: 89,
    },
    {
      id: "res-3",
      videoId: "v4-1",
      videoTitle: "第3章：脱力の本当の意味",
      timestamp: "05:15",
      desc: "【必見】オクターブ連続で腕がパンパンになる時の対処法",
      contributor: "Y先生",
      likes: 56,
    },
  ];

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* ページヘッダー */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-stone-800 flex items-center gap-3 mb-2">
          <Search className="text-[#b8a98f]" size={28} />
          お豆ナビ（魔法の辞書）
        </h1>
        <p className="text-stone-500">
          気になるキーワードや悩みで検索すると、えりな先生の解説シーン（秒数）が直接見つかります。
        </p>
      </div>

      {/* 検索ボックス領域 */}
      <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-stone-200">
        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="text-stone-400" size={20} />
          </div>
          <input
            type="text"
            className="w-full pl-12 pr-4 py-4 bg-[#faf9f6] border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#d4c5b0] focus:border-transparent text-lg transition-shadow"
            placeholder="例：手が痛い、脱力、ショパン..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="absolute inset-y-2 right-2 bg-stone-800 text-stone-50 font-bold px-6 rounded-lg hover:bg-stone-700 transition-colors">
            検索
          </button>
        </div>

        {/* クイック絞り込みタグ */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-stone-700 font-bold mb-4 border-b border-stone-100 pb-2">
            <Filter size={18} className="text-[#b8a98f]" />
            ワンクリック絞り込み
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickTags.map((group, idx) => (
              <div key={idx}>
                <div className="text-xs font-bold text-stone-400 mb-3">{group.category}</div>
                <div className="flex flex-wrap gap-2">
                  {group.tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setActiveTag(tag)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        activeTag === tag
                          ? "bg-[#b8a98f] text-white shadow-sm"
                          : "bg-[#faf9f6] text-stone-600 border border-stone-200 hover:border-[#b8a98f] hover:text-stone-800"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 検索結果表示領域 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-stone-800">
            {activeTag ? `「${activeTag}」の検索結果` : "検索結果"}
            <span className="ml-2 text-sm text-stone-400 font-normal">{searchResults.length}件の解説が見つかりました</span>
          </h2>
          
          {/* ソート等のオプション */}
          <select className="bg-transparent border-none text-stone-500 text-sm focus:ring-0 cursor-pointer">
            <option>「助かった！」が多い順</option>
            <option>新着順</option>
          </select>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {searchResults.map((result) => (
            <Link 
              key={result.id}
              href={`/ja/lms/video/${result.videoId}?t=${result.timestamp.replace(":", "m")}s`}
              className="block bg-white border border-stone-200 rounded-2xl p-5 hover:border-[#b8a98f] hover:shadow-md transition-all group relative overflow-hidden"
            >
              {/* 装飾用ライン */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#e8deca] to-[#b8a98f] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
                
                {/* タイムスタンプと内容 */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="inline-flex items-center gap-1 bg-stone-100 text-stone-700 font-mono font-bold px-2.5 py-1 rounded-md text-sm border border-stone-200">
                      <PlayCircle size={14} className="text-[#b8a98f]" />
                      {result.timestamp} から再生
                    </span>
                    <span className="text-xs font-bold text-stone-400 line-clamp-1">{result.videoTitle}</span>
                  </div>
                  <h3 className="text-lg font-bold text-stone-800 group-hover:text-[#b8a98f] transition-colors leading-tight">
                    {result.desc}
                  </h3>
                </div>

                {/* 右側のメタ情報（バッジといいね） */}
                <div className="flex items-center gap-4 shrink-0 mt-3 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 border-stone-100">
                  <div className="flex items-center gap-1.5 bg-[#fcfbf9] px-3 py-1.5 rounded-full border border-[#eae4d3]">
                    {result.contributor === "公式" ? (
                      <span className="text-xs font-bold text-amber-700 flex items-center gap-1">
                        <Star size={12} fill="currentColor" /> 公式目次
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-stone-600 flex items-center gap-1">
                        ✨ {result.contributor} 発見
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-stone-400">
                    <button className="hover:text-rose-500 transition-colors" title="助かった！">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                    </button>
                    <span className="text-sm font-bold">{result.likes}</span>
                  </div>
                </div>

              </div>
            </Link>
          ))}
        </div>
        
        {/* もっと見るボタン（情報過多対策） */}
        <div className="pt-4 flex justify-center">
          <button className="text-sm font-bold text-stone-500 hover:text-stone-800 transition-colors py-2 px-4 rounded-full hover:bg-stone-100">
            他の付箋も見る（全24件）
          </button>
        </div>
      </div>
    </div>
  );
}
