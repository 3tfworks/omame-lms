"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Check,
  ExternalLink,
  Loader2,
  RefreshCw,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";

type Status = "pending" | "approved" | "rejected";
type Bookmark = {
  id: string;
  videoId: string;
  videoTitle: string;
  timeSeconds: number;
  timeStr: string;
  content: string;
  author: string;
  status: Status;
  rejectionReason: string | null;
  likes: number;
  createdAt: string;
  reviewedAt: string | null;
};

const statusLabels: Record<Status, string> = {
  pending: "承認待ち",
  approved: "承認済み",
  rejected: "非承認",
};

async function fetchBookmarks(selectedStatus: Status | "all"): Promise<Bookmark[]> {
  const response = await fetch(`/api/admin/bookmarks?status=${selectedStatus}`, { cache: "no-store" });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "付箋を読み込めませんでした。");
  return data.bookmarks;
}

export default function AdminBookmarksPage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [status, setStatus] = useState<Status | "all">("pending");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadBookmarks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setBookmarks(await fetchBookmarks(status));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "付箋を読み込めませんでした。");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    let active = true;
    fetchBookmarks(status)
      .then((rows) => {
        if (active) setBookmarks(rows);
      })
      .catch((loadError) => {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "付箋を読み込めませんでした。");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [status]);

  const filteredBookmarks = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase("ja");
    if (!keyword) return bookmarks;
    return bookmarks.filter((bookmark) =>
      [bookmark.content, bookmark.author, bookmark.videoTitle].some((value) =>
        value.toLocaleLowerCase("ja").includes(keyword),
      ),
    );
  }, [bookmarks, search]);

  const moderate = async (bookmarkId: string, nextStatus: "approved" | "rejected") => {
    if (processingId) return;
    setProcessingId(bookmarkId);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/bookmarks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookmarkId, status: nextStatus }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "付箋の状態を更新できませんでした。");
      setBookmarks((current) =>
        status === "all"
          ? current.map((bookmark) =>
              bookmark.id === bookmarkId ? { ...bookmark, status: nextStatus } : bookmark,
            )
          : current.filter((bookmark) => bookmark.id !== bookmarkId),
      );
      setNotice(nextStatus === "approved" ? "付箋を承認しました。" : "付箋を非承認にしました。");
    } catch (moderationError) {
      setError(
        moderationError instanceof Error
          ? moderationError.message
          : "付箋の状態を更新できませんでした。",
      );
    } finally {
      setProcessingId(null);
    }
  };

  const removeBookmark = async (bookmarkId: string) => {
    if (processingId || !window.confirm("この付箋を完全に削除しますか？")) return;
    setProcessingId(bookmarkId);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/bookmarks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookmarkId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "付箋を削除できませんでした。");
      setBookmarks((current) => current.filter((bookmark) => bookmark.id !== bookmarkId));
      setNotice("付箋を削除しました。");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "付箋を削除できませんでした。");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <p className="text-sm font-bold tracking-wider text-amber-700">みんなの付箋</p>
        <h2 className="mt-1 text-2xl font-bold text-stone-800">付箋の確認・承認</h2>
        <p className="mt-2 text-sm leading-relaxed text-stone-500">
          受講生が投稿した付箋を確認し、ほかの受講生へ公開するものを承認します。
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2" aria-label="付箋の状態で絞り込み">
          {(["pending", "approved", "rejected", "all"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setLoading(true);
                setError("");
                setStatus(value);
              }}
              className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                status === value
                  ? "bg-stone-800 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {value === "all" ? "すべて" : statusLabels[value]}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={loadBookmarks}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 px-4 py-2 text-sm font-bold text-stone-600 hover:bg-stone-50 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          再読み込み
        </button>
      </div>

      <label className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-amber-300">
        <Search size={18} className="text-stone-400" />
        <span className="sr-only">付箋を検索</span>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="本文・投稿者・動画名で検索"
          className="w-full bg-transparent text-sm text-stone-800 outline-none"
        />
      </label>

      {notice && (
        <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
          {notice}
        </p>
      )}
      {error && (
        <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex min-h-56 items-center justify-center rounded-2xl border border-stone-200 bg-white">
          <Loader2 className="animate-spin text-amber-700" size={28} />
        </div>
      ) : filteredBookmarks.length === 0 ? (
        <div className="rounded-2xl border border-stone-200 bg-white px-6 py-16 text-center shadow-sm">
          <Star size={40} className="mx-auto mb-3 text-stone-300" />
          <p className="font-bold text-stone-700">該当する付箋はありません</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookmarks.map((bookmark) => (
            <article key={bookmark.id} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-amber-900">
                      {statusLabels[bookmark.status]}
                    </span>
                    <span className="text-stone-500">{bookmark.author}</span>
                    <span className="text-stone-400">
                      {new Date(bookmark.createdAt).toLocaleString("ja-JP")}
                    </span>
                  </div>
                  <h3 className="mt-3 font-bold text-stone-800">{bookmark.videoTitle}</h3>
                </div>
                <Link
                  href={`/ja/lms/video/${bookmark.videoId}?t=${bookmark.timeSeconds}`}
                  target="_blank"
                  className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-stone-100 px-3 py-2 text-sm font-bold text-stone-600 hover:bg-stone-200"
                >
                  {bookmark.timeStr}を確認
                  <ExternalLink size={14} />
                </Link>
              </div>

              <p className="my-5 whitespace-pre-wrap rounded-xl bg-[#faf9f6] p-4 leading-relaxed text-stone-800">
                {bookmark.content}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-4">
                <span className="text-xs font-bold text-stone-400">助かった！ {bookmark.likes}</span>
                <div className="flex flex-wrap justify-end gap-2">
                  {bookmark.status !== "approved" && (
                    <button
                      type="button"
                      onClick={() => moderate(bookmark.id, "approved")}
                      disabled={processingId !== null}
                      className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {processingId === bookmark.id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                      承認
                    </button>
                  )}
                  {bookmark.status !== "rejected" && (
                    <button
                      type="button"
                      onClick={() => moderate(bookmark.id, "rejected")}
                      disabled={processingId !== null}
                      className="inline-flex items-center gap-2 rounded-lg bg-stone-200 px-4 py-2 text-sm font-bold text-stone-700 hover:bg-stone-300 disabled:opacity-50"
                    >
                      <X size={16} />
                      非承認
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeBookmark(bookmark.id)}
                    disabled={processingId !== null}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                    削除
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
