"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ChevronRight, Circle, Clock3, PlayCircle } from "lucide-react";

export type ProgressVideo = {
  id: string;
  title: string;
  completed: boolean;
  completedAt: string | null;
  lastWatchedAt: string | null;
  actionItems: Array<{
    key: string;
    text: string;
    completedAt: string | null;
  }>;
};

export type ProgressChapter = {
  id: string;
  title: string;
  videos: ProgressVideo[];
};

type Filter = "all" | "completed" | "incomplete";

const filters: Array<{ value: Filter; label: string }> = [
  { value: "all", label: "すべて" },
  { value: "completed", label: "完了済み" },
  { value: "incomplete", label: "未完了" },
];

function formatDateTime(value: string | null) {
  if (!value) return null;
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Tokyo",
  }).format(new Date(value));
}

export function ProgressList({ chapters, lang }: { chapters: ProgressChapter[]; lang: string }) {
  const [filter, setFilter] = useState<Filter>("all");

  const matchesFilter = (video: ProgressVideo) => {
    if (filter === "completed") return video.completed;
    if (filter === "incomplete") return !video.completed;
    return true;
  };

  const visibleCount = chapters.reduce(
    (count, chapter) => count + chapter.videos.filter(matchesFilter).length,
    0,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2" role="group" aria-label="動画の完了状態で絞り込む">
        {filters.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setFilter(item.value)}
            aria-pressed={filter === item.value}
            className={`rounded-full border px-4 py-2 text-sm font-bold transition-colors ${
              filter === item.value
                ? "border-stone-800 bg-stone-800 text-white"
                : "border-stone-200 bg-white text-stone-600 hover:border-stone-400"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {visibleCount === 0 ? (
        <div className="rounded-2xl border border-stone-200 bg-white p-10 text-center text-stone-500">
          該当する動画はありません。
        </div>
      ) : (
        chapters.map((chapter) => {
          const visibleVideos = chapter.videos.filter(matchesFilter);
          if (visibleVideos.length === 0) return null;

          const completedCount = chapter.videos.filter((video) => video.completed).length;
          const chapterPercent = Math.round((completedCount / chapter.videos.length) * 100);

          return (
            <section key={chapter.id} className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
              <div className="border-b border-stone-100 bg-[#faf9f6] p-5 md:p-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <h2 className="font-bold leading-relaxed text-stone-800">{chapter.title}</h2>
                  <span className="shrink-0 text-sm font-bold text-stone-500">
                    {completedCount} / {chapter.videos.length} 本完了
                  </span>
                </div>
                <div
                  className="mt-3 h-2 overflow-hidden rounded-full bg-stone-200"
                  role="progressbar"
                  aria-label="章の進捗"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={chapterPercent}
                >
                  <div className="h-full rounded-full bg-omame-gold" style={{ width: `${chapterPercent}%` }} />
                </div>
              </div>

              <ul className="divide-y divide-stone-100">
                {visibleVideos.map((video) => {
                  const completedAt = formatDateTime(video.completedAt);
                  const lastWatchedAt = formatDateTime(video.lastWatchedAt);

                  return (
                    <li key={video.id} className="p-5 transition-colors hover:bg-amber-50/50 md:p-6">
                      <Link
                        href={`/${lang}/lms/video/${video.id}`}
                        className="group flex items-start gap-4"
                      >
                        <span className="mt-0.5 shrink-0" aria-hidden="true">
                          {video.completed ? (
                            <CheckCircle2 className="text-emerald-600" size={22} />
                          ) : lastWatchedAt ? (
                            <PlayCircle className="text-amber-600" size={22} />
                          ) : (
                            <Circle className="text-stone-300" size={22} />
                          )}
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                            <h3 className="font-bold leading-relaxed text-stone-800 group-hover:text-amber-900">
                              {video.title}
                            </h3>
                            <span className={`w-fit shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                              video.completed
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-stone-100 text-stone-500"
                            }`}>
                              {video.completed ? "完了" : "未完了"}
                            </span>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-xs text-stone-500">
                            {video.completed ? (
                              <span className="flex items-center gap-1.5">
                                <CheckCircle2 size={14} />
                                完了日時：{completedAt ?? "記録なし"}
                              </span>
                            ) : null}
                            {lastWatchedAt ? (
                              <span className="flex items-center gap-1.5">
                                <Clock3 size={14} />
                                最終視聴：{lastWatchedAt}
                              </span>
                            ) : (
                              <span>まだ視聴していません</span>
                            )}
                          </div>

                        </div>

                        <ChevronRight className="mt-1 shrink-0 text-stone-300 group-hover:text-amber-600" size={20} />
                      </Link>
                      {video.actionItems.length > 0 ? (
                        <details className="ml-9 mt-4 rounded-xl border border-stone-200 bg-[#faf9f6] p-3">
                          <summary className="cursor-pointer list-none text-sm font-bold text-stone-600">
                            行動項目の進捗（{video.actionItems.filter((item) => item.completedAt).length} / {video.actionItems.length}）
                          </summary>
                          <ul className="mt-3 space-y-2 border-t border-stone-200 pt-3">
                            {video.actionItems.map((item) => (
                              <li key={item.key} className="flex items-start gap-2 text-xs leading-relaxed text-stone-600">
                                {item.completedAt ? (
                                  <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={15} />
                                ) : (
                                  <Circle className="mt-0.5 shrink-0 text-stone-300" size={15} />
                                )}
                                <span>
                                  {item.text}
                                  {item.completedAt ? (
                                    <span className="ml-2 whitespace-nowrap text-stone-400">
                                      {formatDateTime(item.completedAt)}
                                    </span>
                                  ) : null}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </details>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })
      )}
    </div>
  );
}
