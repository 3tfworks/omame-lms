"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronLeft, ChevronRight, NotebookPen } from "lucide-react";
import { curriculumData } from "@/lib/lmsData";
import { createClient } from "@/utils/supabase/client";

type NoteRow = {
  video_id: string;
  content: string;
  updated_at: string;
};

// 章ごとにまとめたノート（カリキュラム順）。
type ChapterNotes = {
  chapterId: string;
  chapterTitle: string;
  items: {
    videoId: string;
    videoTitle: string;
    excerpt: string;
    updatedAt: string;
  }[];
};

// 本文の冒頭を一覧用の抜粋に整形する（空行を詰めて先頭120文字程度）。
function toExcerpt(content: string): string {
  const flat = content
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .join(" / ");
  return flat.length > 120 ? `${flat.slice(0, 120)}…` : flat;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}

export default function NotesListPage() {
  const [loading, setLoading] = useState(true);
  const [grouped, setGrouped] = useState<ChapterNotes[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    let active = true;
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (active) setLoading(false);
        return;
      }
      // RLS により自分の行のみ取得される
      const { data, error } = await supabase
        .from("user_notes")
        .select("video_id, content, updated_at");

      if (error || !data) {
        if (active) setLoading(false);
        return;
      }

      // 中身のあるノートだけを対象にする
      const noteMap = new Map<string, NoteRow>();
      for (const row of data as NoteRow[]) {
        if (row.content && row.content.trim() !== "") {
          noteMap.set(row.video_id, row);
        }
      }

      // カリキュラム順に章グルーピング
      const result: ChapterNotes[] = [];
      let count = 0;
      for (const chapter of curriculumData) {
        const items = chapter.videos
          .filter((v) => noteMap.has(v.id))
          .map((v) => {
            const row = noteMap.get(v.id)!;
            return {
              videoId: v.id,
              videoTitle: v.title,
              excerpt: toExcerpt(row.content),
              updatedAt: row.updated_at,
            };
          });
        if (items.length > 0) {
          result.push({
            chapterId: chapter.id,
            chapterTitle: chapter.title,
            items,
          });
          count += items.length;
        }
      }

      if (active) {
        setGrouped(result);
        setTotalCount(count);
        setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* 戻る導線 */}
      <Link
        href="/ja/lms"
        className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 transition-colors mb-6"
      >
        <ChevronLeft size={18} />
        ホーム画面へ戻る
      </Link>

      {/* ページタイトル */}
      <div className="mb-8 flex items-center gap-3">
        <div className="p-2 bg-amber-100 text-amber-700 rounded-xl shadow-sm">
          <BookOpen className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-omame-deep font-serif">マイノート</h1>
          <p className="text-sm text-stone-500 mt-0.5">動画ごとに書き留めた、あなただけの学習メモ一覧です。</p>
        </div>
      </div>

      {totalCount === 0 ? (
        /* 空状態 */
        <div className="text-center py-16 px-6 bg-[#faf9f6] rounded-3xl border border-[#e8dfce] relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-100/40 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-orange-100/30 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <NotebookPen size={48} className="mx-auto mb-4 text-[#b8a98f] opacity-50" />
            <h2 className="font-bold text-stone-800 text-lg mb-2">まだノートがありません</h2>
            <p className="text-stone-500 text-sm leading-relaxed max-w-md mx-auto mb-8">
              各動画ページの「マイノート」タブに気づきを書き留めると、ここに一覧で表示されます。<br />
              焦らず、あなたのペースで感じたことを残していきましょう。
            </p>
            <Link
              href="/ja/lms"
              className="inline-flex items-center justify-center gap-2 bg-stone-800 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-stone-700 transition-colors shadow-sm"
            >
              動画一覧へ
              <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          {grouped.map((chapter) => (
            <section key={chapter.chapterId}>
              <h2 className="text-base font-bold text-amber-800 mb-4 pb-2 border-b border-amber-200/60">
                {chapter.chapterTitle}
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {chapter.items.map((item) => (
                  <Link
                    key={item.videoId}
                    href={`/ja/lms/video/${item.videoId}`}
                    className="group block bg-white rounded-2xl p-5 border border-stone-200 hover:border-[#b8a98f] hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="font-bold text-stone-800 group-hover:text-amber-900 transition-colors">
                        {item.videoTitle}
                      </h3>
                      <ChevronRight size={18} className="text-stone-300 group-hover:text-amber-600 shrink-0 mt-1 transition-colors" />
                    </div>
                    <p className="text-sm text-stone-500 leading-relaxed whitespace-pre-line line-clamp-2">
                      {item.excerpt}
                    </p>
                    {item.updatedAt && (
                      <p className="text-xs text-stone-400 mt-3">更新日：{formatDate(item.updatedAt)}</p>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
