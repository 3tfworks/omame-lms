"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Filter, PlayCircle, Star } from "lucide-react";
import { curriculumData } from "@/lib/lmsData";

// 検索結果の型定義
interface SearchResult {
  id: string;
  videoId: string;
  videoTitle: string;
  chapterTitle: string;
  desc: string;
  contributor: string;
  likes: number;
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // クイック絞り込み用のタグデータ（実際に動画メモで言及されている言葉）
  const quickTags = [
    { category: "お悩み", tags: ["痛い", "力み", "疲れる", "テンポ"] },
    { category: "身体・感覚", tags: ["指", "手首", "腕", "重力"] },
    { category: "その他", tags: ["脱力", "スピード", "自然体", "レガート"] },
  ];

  // lmsData から検索可能なブロック（インデックス）を生成する。
  // 旧仕様は時刻でブロック分割していたが、時刻は撤廃したため、
  // 「動画のながれ」の各ポイント見出し（"NN 見出し"）を分割境界に切り替える。
  const searchableBlocks = useMemo(() => {
    const blocks: { videoId: string; videoTitle: string; chapterTitle: string; desc: string; text: string }[] = [];

    // 箇条書き接頭辞や【】を除いた見出しテキストを得る
    const cleanDesc = (s: string) =>
      s.replace(/^[\s　*・●＊•-]+/, "").replace(/^【/, "").replace(/】$/, "").trim();

    curriculumData.forEach(chapter => {
      chapter.videos.forEach(video => {
        if (!video.memoContent) return;

        const lines = video.memoContent.split('\n');
        let currentSection = "";
        let currentDesc = "動画全体（要約など）";
        let currentText = "";

        const flush = () => {
          if (currentText.trim()) {
            blocks.push({
              videoId: video.id,
              videoTitle: video.title,
              chapterTitle: chapter.title,
              desc: currentDesc,
              text: currentText.toLowerCase(),
            });
          }
        };

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          // 「動画のながれ」見出し（境界にはせず、セクション状態だけ切り替える）
          if (line.includes('動画のながれ') || line.includes('タイムライン別の重要ポイント')) {
            currentSection = "flow";
            continue;
          }

          // 行動リスト / まとめポイント … 別セクション見出しを新ブロック境界にする
          if (line.includes('行動リスト') || line.includes('まとめポイント')) {
            flush();
            currentSection = "other";
            currentDesc = cleanDesc(line);
            currentText = line + "\n";
            continue;
          }

          // 「動画のながれ」内のポイント行（"NN 見出し"）を新ブロック境界にする
          const pointMatch = currentSection === "flow" ? line.match(/^(\d{2})[ 　]+(.+)$/) : null;
          if (pointMatch) {
            flush();
            currentDesc = pointMatch[2];
            currentText = pointMatch[2] + "\n";
            continue;
          }

          // それ以外は現在のブロックに本文として追加
          currentText += line + "\n";
        }

        flush();
      });
    });
    return blocks;
  }, []);

  // 検索クエリとタグに基づいて結果をフィルタリング
  const searchResults = useMemo(() => {
    // 検索語がない場合は空（またはランダムなおすすめ）を返してもよいが、一旦何も出さないか全件出すか
    // 今回は「検索語またはタグが指定されている場合のみ」表示する仕様とする
    const activeQuery = (searchQuery || activeTag || "").toLowerCase().trim();
    
    if (!activeQuery) return [];

    // 検索キーワードをスペース区切りで複数キーワードに対応
    const keywords = activeQuery.split(/\s+/);

    const filtered = searchableBlocks.filter(block => {
      // すべてのキーワードが含まれているか (AND検索)
      return keywords.every(kw => block.text.includes(kw) || block.desc.toLowerCase().includes(kw) || block.videoTitle.toLowerCase().includes(kw));
    });

    // 検索結果を SearchResult 型にマッピング
    return filtered.map((block, idx) => ({
      id: `res-${block.videoId}-${idx}`,
      videoId: block.videoId,
      videoTitle: block.videoTitle,
      chapterTitle: block.chapterTitle,
      desc: block.desc,
      contributor: "公式",
      likes: Math.floor(Math.abs(Math.sin(idx + block.videoId.length)) * 100) + 10,
    }));
  }, [searchQuery, activeTag, searchableBlocks]);

  // タグをクリックしたときの処理
  const handleTagClick = (tag: string) => {
    if (activeTag === tag) {
      setActiveTag(null);
    } else {
      setActiveTag(tag);
      setSearchQuery(""); // タグを選んだらテキスト検索はクリア
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* ページヘッダー */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-stone-800 flex items-center gap-3 mb-2">
          <Search className="text-[#b8a98f]" size={28} />
          お豆ナビ（魔法の辞書）
        </h1>
        <p className="text-stone-500">
          気になるキーワードや悩みで検索すると、えりな先生の解説ポイントが直接見つかります。
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
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value) setActiveTag(null); // テキスト入力時はタグ選択を解除
            }}
          />
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
                      onClick={() => handleTagClick(tag)}
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
      {(searchQuery || activeTag) && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-stone-800">
              {activeTag ? `「${activeTag}」の検索結果` : "検索結果"}
              <span className="ml-2 text-sm text-stone-400 font-normal">{searchResults.length}件の解説が見つかりました</span>
            </h2>
          </div>

          {searchResults.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {searchResults.map((result) => (
                <Link
                  key={result.id}
                  href={`/ja/lms/video/${result.videoId}`}
                  className="block bg-white border border-stone-200 rounded-2xl p-5 hover:border-[#b8a98f] hover:shadow-md transition-all group relative overflow-hidden"
                >
                  {/* 装飾用ライン */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#e8deca] to-[#b8a98f] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
                    
                    {/* 内容 */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="inline-flex items-center gap-1 bg-stone-100 text-stone-700 font-bold px-2.5 py-1 rounded-md text-sm border border-stone-200">
                          <PlayCircle size={14} className="text-[#b8a98f]" />
                          解説を見る
                        </span>
                        <span className="text-xs font-bold text-stone-400 line-clamp-1">{result.chapterTitle} ＞ {result.videoTitle}</span>
                      </div>
                      <h3 className="text-lg font-bold text-stone-800 group-hover:text-[#b8a98f] transition-colors leading-tight">
                        {result.desc}
                      </h3>
                    </div>

                    {/* 右側のメタ情報（バッジといいね） */}
                    <div className="flex items-center gap-4 shrink-0 mt-3 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 border-stone-100">
                      <div className="flex items-center gap-1.5 bg-[#fcfbf9] px-3 py-1.5 rounded-full border border-[#eae4d3]">
                        <span className="text-xs font-bold text-amber-700 flex items-center gap-1">
                          <Star size={12} fill="currentColor" /> 公式目次
                        </span>
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
          ) : (
            <div className="text-center py-20 bg-stone-50 rounded-2xl border border-stone-200 border-dashed">
              <p className="text-stone-500 mb-2">該当する解説が見つかりませんでした。</p>
              <p className="text-sm text-stone-400">キーワードを変えてもう一度検索してみてください。</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
