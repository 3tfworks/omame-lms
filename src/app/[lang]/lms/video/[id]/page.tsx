"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Play, FileText, BookOpen, CheckCircle2, Sparkles, ArrowRight, Trophy, Star, Trash2, HelpCircle, Lock, Users } from "lucide-react";
import { getVideoById, getChapterByVideoId, getAdjacentVideos, curriculumData } from "@/lib/lmsData";
import { BOOKMARK_CONTENT_MAX, type BookmarkStatus, type BookmarkVisibility } from "@/lib/bookmarks";
import { motion, AnimatePresence } from "framer-motion";

import Player from '@vimeo/player';
import { createClient } from "@/utils/supabase/client";

function ActionCheckbox({ text, checked, onToggle }: { text: string, checked: boolean, onToggle: () => void }) {
  const [showBeans, setShowBeans] = useState(false);

  const handleClick = () => {
    // チェックON にするときだけお豆エフェクトを出す（OFF はそのまま解除）
    if (!checked) {
      setShowBeans(true);
      setTimeout(() => setShowBeans(false), 2000);
    }
    onToggle();
  };

  return (
    <div 
      className="relative flex items-start gap-4 p-4 my-2 bg-white rounded-xl border border-stone-200 shadow-sm hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group"
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

    const options: NonNullable<ConstructorParameters<typeof Player>[1]> & { t?: number } = {
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
  }, [onReady, vimeoId]);

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
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteStatus, setNoteStatus] = useState<{ text: string; type: string }>({ text: "", type: "" });
  const noteTextRef = React.useRef("");
  
  // Vimeo Player と付箋用ステート
  const [vimeoPlayer, setVimeoPlayer] = useState<Player | null>(null);
  const handleVimeoReady = React.useCallback((player: Player) => {
    setVimeoPlayer(player);
  }, []);
  const [isAddingBookmark, setIsAddingBookmark] = useState(false);
  const [bookmarkTime, setBookmarkTime] = useState<number>(0);
  const [bookmarkContent, setBookmarkContent] = useState("");
  const [bookmarkVisibility, setBookmarkVisibility] = useState<BookmarkVisibility>("private");
  const [isSubmitting, setIsSubmitting] = useState(false);
  type Bookmark = {
    id: string;
    timeSeconds: number;
    timeStr: string;
    content: string;
    author: string;
    likes: number;
    isLiked: boolean;
    createdAt: string;
    isOwn: boolean;
    status: BookmarkStatus;
    visibility: BookmarkVisibility;
  };
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [bookmarksLoading, setBookmarksLoading] = useState(true);
  const [bookmarkError, setBookmarkError] = useState("");
  const [bookmarkNotice, setBookmarkNotice] = useState("");
  const [reactionProcessingId, setReactionProcessingId] = useState<string | null>(null);
  const [bookmarkView, setBookmarkView] = useState<"private" | "shared">("private");
  const [visibilityProcessingId, setVisibilityProcessingId] = useState<string | null>(null);
  const [isVideoCompleted, setIsVideoCompleted] = useState(false); // 完了状態のステート追加
  const [isProgressLoading, setIsProgressLoading] = useState(true);
  const [isProgressSaving, setIsProgressSaving] = useState(false);
  const [progressError, setProgressError] = useState("");

  // Load the persisted completion state and record this video as the most
  // recently watched one. Upsert also creates the first progress row.
  React.useEffect(() => {
    let active = true;

    async function loadVideoProgress() {
      setIsProgressLoading(true);
      setProgressError("");

      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        if (active) {
          setProgressError("ログイン状態を確認できませんでした。ページを再読み込みしてください。");
          setIsProgressLoading(false);
        }
        console.error("Failed to get user for video progress:", authError);
        return;
      }
      if (!user) {
        if (active) {
          setProgressError("ログイン状態を確認できませんでした。再度ログインしてください。");
          setIsProgressLoading(false);
        }
        return;
      }

      const { data, error: loadError } = await supabase
        .from("user_progress")
        .select("is_completed")
        .eq("user_id", user.id)
        .eq("video_id", videoId)
        .maybeSingle();

      if (loadError) {
        if (active) {
          setProgressError("学習進捗を読み込めませんでした。ページを再読み込みしてください。");
          setIsProgressLoading(false);
        }
        console.error("Failed to load video progress:", loadError);
        return;
      }

      const completed = data?.is_completed ?? false;
      const { error: saveWatchError } = await supabase
        .from("user_progress")
        .upsert(
          {
            user_id: user.id,
            video_id: videoId,
            is_completed: completed,
            last_watched_at: new Date().toISOString(),
          },
          { onConflict: "user_id,video_id" }
        );

      if (!active) return;
      setIsVideoCompleted(completed);
      setIsProgressLoading(false);
      if (saveWatchError) {
        setProgressError("視聴履歴を保存できませんでした。");
        console.error("Failed to save watch history:", saveWatchError);
      }
    }

    loadVideoProgress();
    return () => { active = false; };
  }, [videoId]);

  const toggleVideoCompleted = async () => {
    if (isProgressLoading || isProgressSaving) return;

    const nextCompleted = !isVideoCompleted;
    setIsProgressSaving(true);
    setProgressError("");

    try {
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        setProgressError("ログイン状態を確認できませんでした。再度ログインしてください。");
        if (authError) console.error("Failed to get user for video completion:", authError);
        return;
      }

      const { error } = await supabase
        .from("user_progress")
        .upsert(
          {
            user_id: user.id,
            video_id: videoId,
            is_completed: nextCompleted,
            last_watched_at: new Date().toISOString(),
          },
          { onConflict: "user_id,video_id" }
        );

      if (error) {
        setProgressError("完了状態を保存できませんでした。もう一度お試しください。");
        console.error("Failed to save video completion:", error);
        return;
      }

      setIsVideoCompleted(nextCompleted);
    } catch (error) {
      setProgressError("完了状態を保存できませんでした。通信状態を確認してもう一度お試しください。");
      console.error("Unexpected error while saving video completion:", error);
    } finally {
      setIsProgressSaving(false);
    }
  };

  // 付箋一覧の取得
  React.useEffect(() => {
    let active = true;
    async function fetchBookmarks() {
      setBookmarksLoading(true);
      setBookmarkError("");
      try {
        const res = await fetch(`/api/bookmarks?videoId=${videoId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "付箋を読み込めませんでした。");
        if (active) setBookmarks(data.bookmarks);
      } catch (error) {
        console.error("Failed to fetch bookmarks:", error);
        if (active) {
          setBookmarkError(error instanceof Error ? error.message : "付箋を読み込めませんでした。");
        }
      } finally {
        if (active) setBookmarksLoading(false);
      }
    }
    fetchBookmarks();
    return () => {
      active = false;
    };
  }, [videoId]);

  const submitBookmark = async () => {
    const content = bookmarkContent.trim();
    if (!content || content.length > BOOKMARK_CONTENT_MAX || isSubmitting) return;

    setIsSubmitting(true);
    setBookmarkError("");
    setBookmarkNotice("");
    try {
      const response = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId,
          timestampSeconds: bookmarkTime,
          content,
          visibility: bookmarkVisibility,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "付箋を投稿できませんでした。");

      setBookmarks((current) =>
        [...current, data.bookmark].sort((a, b) => a.timeSeconds - b.timeSeconds),
      );
      setBookmarkContent("");
      setBookmarkView(bookmarkVisibility);
      setIsAddingBookmark(false);
      setActiveTab("bookmarks");
      setBookmarkNotice(
        bookmarkVisibility === "private"
          ? "自分だけの付箋を保存しました。"
          : "共有付箋を投稿しました。承認されると、ほかの受講生にも公開されます。",
      );
    } catch (error) {
      console.error("Failed to post bookmark:", error);
      setBookmarkError(error instanceof Error ? error.message : "付箋を投稿できませんでした。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateBookmarkVisibility = async (bookmark: Bookmark) => {
    if (visibilityProcessingId) return;
    const nextVisibility: BookmarkVisibility = bookmark.visibility === "private" ? "shared" : "private";
    if (
      nextVisibility === "shared" &&
      !window.confirm("この付箋をみんなに共有しますか？承認後にほかの受講生へ公開されます。")
    ) {
      return;
    }

    setVisibilityProcessingId(bookmark.id);
    setBookmarkError("");
    setBookmarkNotice("");
    try {
      const response = await fetch("/api/bookmarks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookmarkId: bookmark.id, visibility: nextVisibility }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "付箋の公開範囲を変更できませんでした。");

      setBookmarks((current) =>
        current.map((item) =>
          item.id === bookmark.id
            ? { ...item, visibility: data.visibility, status: data.status ?? item.status, isLiked: false }
            : item,
        ),
      );
      setBookmarkView(nextVisibility);
      setBookmarkNotice(
        nextVisibility === "private"
          ? "自分だけの付箋に戻しました。"
          : "共有申請を受け付けました。承認後に公開されます。",
      );
    } catch (error) {
      console.error("Failed to update bookmark visibility:", error);
      setBookmarkError(error instanceof Error ? error.message : "付箋の公開範囲を変更できませんでした。");
    } finally {
      setVisibilityProcessingId(null);
    }
  };

  const deleteBookmark = async (bookmarkId: string) => {
    if (!window.confirm("この付箋を削除しますか？")) return;
    setBookmarkError("");
    setBookmarkNotice("");
    try {
      const response = await fetch("/api/bookmarks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookmarkId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "付箋を削除できませんでした。");
      setBookmarks((current) => current.filter((bookmark) => bookmark.id !== bookmarkId));
      setBookmarkNotice("付箋を削除しました。");
    } catch (error) {
      console.error("Failed to delete bookmark:", error);
      setBookmarkError(error instanceof Error ? error.message : "付箋を削除できませんでした。");
    }
  };

  const toggleBookmarkLike = async (bookmark: Bookmark) => {
    if (
      reactionProcessingId ||
      bookmark.isOwn ||
      bookmark.visibility !== "shared" ||
      bookmark.status !== "approved"
    ) return;

    const wasLiked = bookmark.isLiked;
    setReactionProcessingId(bookmark.id);
    setBookmarkError("");
    setBookmarks((current) =>
      current.map((item) =>
        item.id === bookmark.id
          ? { ...item, isLiked: !wasLiked, likes: Math.max(0, item.likes + (wasLiked ? -1 : 1)) }
          : item,
      ),
    );

    try {
      const response = await fetch(`/api/bookmarks/${bookmark.id}/like`, {
        method: wasLiked ? "DELETE" : "POST",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "リアクションを保存できませんでした。");
      setBookmarks((current) =>
        current.map((item) =>
          item.id === bookmark.id ? { ...item, isLiked: data.isLiked, likes: data.likes } : item,
        ),
      );
    } catch (error) {
      console.error("Failed to update bookmark reaction:", error);
      setBookmarks((current) =>
        current.map((item) =>
          item.id === bookmark.id
            ? { ...item, isLiked: wasLiked, likes: Math.max(0, item.likes + (wasLiked ? 1 : -1)) }
            : item,
        ),
      );
      setBookmarkError(error instanceof Error ? error.message : "リアクションを保存できませんでした。");
    } finally {
      setReactionProcessingId(null);
    }
  };

  // マイノート（user_notes）へ upsert 保存する。
  // silent=true は行動リスト連携の自動保存用（成功トーストを出さない）。
  const saveNote = async (content: string, silent = false) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      if (!silent) setNoteStatus({ text: "ログインが必要です", type: "error" });
      return;
    }
    if (!silent) {
      setNoteSaving(true);
      setNoteStatus({ text: "", type: "" });
    }
    const { error } = await supabase
      .from("user_notes")
      .upsert(
        { user_id: user.id, video_id: videoId, content, updated_at: new Date().toISOString() },
        { onConflict: "user_id,video_id" }
      );
    if (!silent) {
      setNoteSaving(false);
      setNoteStatus(
        error
          ? { text: "保存に失敗しました", type: "error" }
          : { text: "ノートを保存しました", type: "success" }
      );
    } else if (error) {
      console.error("マイノートの自動保存に失敗:", error);
    }
  };

  // 行動リストのチェックON時に、完了ログをマイノート本文へ追記して自動保存する。
  // ・重複ガード: 同じ完了ログ文言が既に本文に含まれていれば追記しない（文字列一致）。
  // ・チェックOFF（action_item_progress の削除）には連動させない＝完了ログは残したまま。
  const handleTaskCheck = (taskText: string) => {
    const prev = noteTextRef.current;
    const marker = `✅ 【完了】${taskText}`;
    if (prev.includes(marker)) return; // 既に同じ完了ログがある → 何もしない
    const today = new Date();
    const dateStr = `${today.getMonth() + 1}/${today.getDate()}`;
    const newRecord = `${marker}（${dateStr}）`;
    const updated = prev ? `${prev}\n${newRecord}\n` : `${newRecord}\n`;
    setNoteText(updated);
    noteTextRef.current = updated;
    saveNote(updated, true);
  };

  // 行動リストのチェック状態（item_key の集合）。Supabase に presence 方式で永続化する。
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  // ページ表示時に、ログインユーザー×この動画のチェック済み項目を読み込む
  React.useEffect(() => {
    let active = true;
    async function loadProgress() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return; // 未ログイン時は何も読み込まない（このページはログイン必須）
      const { data, error } = await supabase
        .from("action_item_progress")
        .select("item_key")
        .eq("video_id", videoId);
      if (!error && data && active) {
        setCheckedItems(new Set(data.map((row: { item_key: string }) => row.item_key)));
      }
    }
    loadProgress();
    return () => { active = false; };
  }, [videoId]);

  // ノート本文の最新値を ref に同期（行動リスト自動保存時に最新本文を参照するため）
  React.useEffect(() => {
    noteTextRef.current = noteText;
  }, [noteText]);

  // ページ表示時に、この動画の既存マイノートを取得して textarea に復元する
  React.useEffect(() => {
    let active = true;
    async function loadNote() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return; // 未ログイン時は何も読み込まない（このページはログイン必須）
      const { data, error } = await supabase
        .from("user_notes")
        .select("content")
        .eq("video_id", videoId)
        .maybeSingle();
      if (!error && data && active) {
        setNoteText(data.content || "");
        noteTextRef.current = data.content || "";
      }
    }
    loadNote();
    return () => { active = false; };
  }, [videoId]);

  // 楽観的更新つきトグル: UI を即反映 → Supabase へ保存（presence 方式の insert / delete）。失敗時は元に戻す。
  const toggleActionItem = async (itemKey: string, text: string) => {
    const wasChecked = checkedItems.has(itemKey);

    // 1) 楽観的更新
    setCheckedItems(prev => {
      const next = new Set(prev);
      if (wasChecked) next.delete(itemKey);
      else next.add(itemKey);
      return next;
    });
    // チェックON にしたときだけ、マイノートへ完了記録を追記（既存挙動を維持）
    if (!wasChecked) handleTaskCheck(text);

    // 2) 保存
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const revert = () => {
      setCheckedItems(prev => {
        const reverted = new Set(prev);
        if (wasChecked) reverted.add(itemKey);
        else reverted.delete(itemKey);
        return reverted;
      });
    };
    if (!user) { revert(); return; }

    try {
      if (wasChecked) {
        const { error } = await supabase
          .from("action_item_progress")
          .delete()
          .eq("user_id", user.id)
          .eq("video_id", videoId)
          .eq("item_key", itemKey);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("action_item_progress")
          .insert({ user_id: user.id, video_id: videoId, item_key: itemKey });
        // 23505 = unique 制約違反（既にチェック済み）。冪等なので成功扱いにする
        if (error && error.code !== "23505") throw error;
      }
    } catch (e) {
      console.error("行動リストの進捗保存に失敗:", e);
      revert();
    }
  };

  // memoContentのパースロジック
  //
  // 縦リズムの設計（video #8 を基準に全47本を統一）:
  // ・レイアウトの責任はレンダラが完全に持つ。ソースの空行には依存しない（空行はスキップ）。
  // ・親に space-y-* は付けず、各要素の種別と「直前要素の種別(lastType)」から mt を構造的に決める。
  //   → 番号見出しの前は大きく空け、見出し直下の bullet と bullet 同士は詰める＝グループ感を出す。
  const renderMemoContent = () => {
    if (!videoData?.memoContent) return null;

    const parsedElements: React.ReactNode[] = [];
    let currentSection = ''; // 'action' | 'summary' | 'flow' | ''
    let actionIndex = 0; // 行動リスト内の項目連番（item_key の採番に使用）
    // 直前に積んだ要素の種別。間隔（mt）を文脈に応じて決めるために使う。
    let lastType = ''; // '' | 'section' | 'point' | 'bullet' | 'action' | 'para' | 'hr'
    const lines = videoData.memoContent.split('\n');

    const isFirst = () => parsedElements.length === 0;
    // セクション見出し（全体要約 / 動画のながれ / 行動リスト / まとめポイント）の前余白。
    // 先頭は 0、区切り線(hr)直後は控えめ、それ以外は大きく空ける。
    const headerMt = () => (isFirst() ? '' : lastType === 'hr' ? 'mt-4' : 'mt-10');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // 空行はレイアウトに使わない（間隔は要素種別ごとに付与する）
      if (!line) continue;

      // 中身のない箇条書きマーカー単独行（"*" など）はスキップ
      if (/^[*＊•・●·]+$/.test(line)) continue;

      // セクション区切り線（____ / --- / ⸻ など）。⸻(U+2E3B)は単独1文字でも区切り。
      if (/^(?:[-_–—]{3,}|⸻+)$/.test(line)) {
        parsedElements.push(<hr key={i} className="my-6 border-stone-200 border-dashed" />);
        lastType = 'hr';
        continue;
      }
      
      // === セクション見出し（既知の名称のみを構造的に検出。長さヒューリスティックは廃止） ===
      // 行動リスト
      if (line.includes('行動リスト')) {
        currentSection = 'action';
        actionIndex = 0;
        parsedElements.push(
          <div key={i} className={`flex items-center gap-2 ${headerMt()} mb-4 border-b border-stone-200 pb-2`}>
            <span className="text-xl">🎯</span>
            <h4 className="text-lg font-bold text-amber-800">行動リスト</h4>
          </div>
        );
        lastType = 'section';
        continue;
      }

      // 動画のながれ（旧タイムライン）。【】や箇条書き接頭辞付きでも検出する。
      if (line.includes('動画のながれ') || line.includes('タイムライン別の重要ポイント')) {
        currentSection = 'flow';
        parsedElements.push(
          <div key={i} className={`flex items-center gap-2 ${headerMt()} mb-4 border-b border-stone-200 pb-2`}>
            <span className="text-xl">🎬</span>
            <h4 className="text-lg font-bold text-amber-800">動画のながれ</h4>
          </div>
        );
        lastType = 'section';
        continue;
      }

      // まとめポイント
      if (line.includes('まとめポイント')) {
        currentSection = 'summary';
        parsedElements.push(
          <h4 key={i} className={`text-lg font-bold text-stone-800 border-b border-stone-200 pb-2 ${headerMt()} mb-4`}>
            {line.replace(/^[【]/, '').replace(/[】]$/, '')}
          </h4>
        );
        lastType = 'section';
        continue;
      }

      // 全体要約
      if (line.includes('全体要約')) {
        currentSection = '';
        parsedElements.push(
          <h4 key={i} className={`text-lg font-bold text-stone-800 border-b border-stone-200 pb-2 ${headerMt()} mb-4`}>
            {line.replace(/^[【]/, '').replace(/[】]$/, '')}
          </h4>
        );
        lastType = 'section';
        continue;
      }

      // 箇条書きの判定（行頭の空白や不可視文字を許容）
      const listMatch = line.match(/^[\s\u200B\u00A0]*[*\-・●＊•]\s*(.+)/);
      if (listMatch) {
        const text = listMatch[1].trim();
        
        // 「行動リスト」セクションの箇条書きのみをチェックボックスにする
        if (currentSection === 'action') {
          // item_key は行動リスト内の並び順インデックス（案A）。並び順から自動採番する。
          const itemKey = `action-${actionIndex}`;
          actionIndex++;
          parsedElements.push(
            <ActionCheckbox
              key={i}
              text={text}
              checked={checkedItems.has(itemKey)}
              onToggle={() => toggleActionItem(itemKey, text)}
            />
          );
          lastType = 'action';
        } else {
          // それ以外（動画のながれ・まとめ）は通常リスト。
          // 見出し直下は詰め、bullet 同士も詰める。marker はお豆ゴールドで統一。
          const bulletMt = lastType === 'point' ? 'mt-2' : lastType === 'bullet' ? 'mt-1.5' : 'mt-3';
          parsedElements.push(
            <li key={i} className={`ml-4 list-disc marker:text-omame-gold ${isFirst() ? '' : bulletMt} leading-relaxed`}>{text}</li>
          );
          lastType = 'bullet';
        }
        continue;
      }

      // 「動画のながれ」セクション内のポイント行（"NN 見出し"）→ 連番の丸バッジ＋見出し。
      // 連番はデータ生成時に並び順から自動採番済み（scripts/clean-memo.mjs）。
      if (currentSection === 'flow') {
        const pointMatch = line.match(/^(\d{2})[ 　]+(.+)$/);
        if (pointMatch) {
          // 見出し直後の最初のポイントは詰め、2つ目以降はグループ区切りとして大きく空ける。
          const pointMt = lastType === 'section' ? 'mt-3' : 'mt-8';
          // 「NN タイトル：説明」のように全角コロンを含む見出しは、タイトル（太字）と
          // 説明（通常ウェイト）に分割して、長文がまるごと太字になる重さを避ける。
          // 分割は最初の全角「：」のみ。半角「:」やコロン無しの短い見出しは従来どおり。
          const full = pointMatch[2];
          const ci = full.indexOf('：');
          const hasSplit = ci > 0 && ci < full.length - 1;
          const title = hasSplit ? full.slice(0, ci).trim() : full;
          const desc = hasSplit ? full.slice(ci + 1).trim() : '';
          parsedElements.push(
            <div key={i} className={`flex items-start gap-3 ${isFirst() ? '' : pointMt}`}>
              <span
                className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold"
                style={{ backgroundColor: "rgba(203,163,101,0.15)", color: "#cba365" }}
              >
                {pointMatch[1]}
              </span>
              <div className="pt-1.5">
                <div className="font-bold text-stone-800 leading-snug">{title}</div>
                {desc && <div className="mt-1 font-normal text-stone-600 leading-relaxed">{desc}</div>}
              </div>
            </div>
          );
          lastType = 'point';
          continue;
        }
      }

      // 行動リスト内の「※…」注記は、直前の行動カードに視覚的に併合する小さなインセットとして描画。
      // （他セクションの ※ — 例: 全体要約の補足 — は対象外。通常段落のまま。）
      if (currentSection === 'action' && /^※/.test(line)) {
        parsedElements.push(
          <div key={i} className="ml-4 -mt-1 mb-1 pl-3 border-l-2 border-omame-gold/50 text-sm text-omame-deep leading-relaxed">
            {line}
          </div>
        );
        lastType = 'note';
        continue;
      }

      // 通常テキスト（全体要約の本文や、bullet/ポイントの折り返し継続行など）
      // bullet/ポイント直後は継続行として字下げして寄せる。見出し直後は本文段落として扱う。
      let paraCls;
      if (lastType === 'point' || lastType === 'bullet') paraCls = 'mt-1 ml-4';
      else if (lastType === 'para') paraCls = 'mt-1';
      else paraCls = 'mt-3';
      parsedElements.push(
        <p key={i} className={isFirst() ? '' : paraCls}>{line}</p>
      );
      lastType = 'para';
    }

    return parsedElements;
  };

  if (!videoData) {
    return <div className="p-12 text-center">動画が見つかりませんでした</div>;
  }

  const displayedBookmarks = bookmarks.filter((bookmark) =>
    bookmarkView === "private"
      ? bookmark.isOwn && bookmark.visibility === "private"
      : bookmark.visibility === "shared",
  );

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
        <CustomVideoPlayer vimeoId={videoData.vimeoId} onReady={handleVimeoReady} />
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
        {/* みんなの付箋追加ボタン */}
        <button 
          onClick={async () => {
            if (vimeoPlayer) {
              const seconds = await vimeoPlayer.getCurrentTime();
              setBookmarkTime(Math.floor(seconds));
              setBookmarkVisibility("private");
              setIsAddingBookmark(true);
            }
          }}
          className="bg-white border-2 border-[#b8a98f] text-[#b8a98f] font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-[#faf9f6] transition-colors shadow-sm w-full sm:w-auto"
        >
          <Star size={20} />
          今のシーンに付箋を貼る
        </button>

        <button 
          type="button"
          onClick={toggleVideoCompleted}
          disabled={isProgressLoading || isProgressSaving}
          className={`font-bold py-3 px-8 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm w-full sm:w-auto group disabled:cursor-wait disabled:opacity-70 ${isVideoCompleted ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-stone-800 text-stone-50 hover:bg-stone-700'}`}
          title={isVideoCompleted ? "未完了の状態に戻す" : "完了にする"}
        >
          <CheckCircle2 size={20} />
          {isProgressLoading ? '進捗を確認中…' : isProgressSaving ? '保存中…' : isVideoCompleted ? (
            <span className="flex items-center gap-2">
              完了しました <span className="text-emerald-200 text-xs font-normal opacity-0 group-hover:opacity-100 transition-opacity">（クリックで取消）</span>
            </span>
          ) : 'この動画を「完了」にする'}
        </button>
      </div>
      {progressError && (
        <p role="alert" aria-live="polite" className="text-right text-sm font-medium text-red-600">
          {progressError}
        </p>
      )}

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
            <fieldset className="mb-4">
              <legend className="mb-2 text-sm font-bold text-stone-700">公開範囲</legend>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setBookmarkVisibility("private")}
                  aria-pressed={bookmarkVisibility === "private"}
                  className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-colors ${
                    bookmarkVisibility === "private"
                      ? "border-amber-500 bg-amber-50 text-amber-950"
                      : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
                  }`}
                >
                  <Lock size={18} className="mt-0.5 shrink-0" />
                  <span>
                    <span className="block text-sm font-bold">自分だけ</span>
                    <span className="block text-xs font-medium opacity-70">承認不要ですぐ保存</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setBookmarkVisibility("shared")}
                  aria-pressed={bookmarkVisibility === "shared"}
                  className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-colors ${
                    bookmarkVisibility === "shared"
                      ? "border-amber-500 bg-amber-50 text-amber-950"
                      : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
                  }`}
                >
                  <Users size={18} className="mt-0.5 shrink-0" />
                  <span>
                    <span className="block text-sm font-bold">みんなに共有</span>
                    <span className="block text-xs font-medium opacity-70">承認後にほかの受講生へ公開</span>
                  </span>
                </button>
              </div>
            </fieldset>
            <textarea 
              className="w-full border border-stone-300 rounded-xl p-4 focus:ring-2 focus:ring-[#b8a98f] focus:border-transparent transition-shadow resize-none mb-4"
              rows={3}
              placeholder={
                bookmarkVisibility === "private"
                  ? "このシーンで自分が覚えておきたいことを入力してください"
                  : "このシーンの気づきやメモを入力してください（承認後に共有されます）"
              }
              value={bookmarkContent}
              onChange={(e) => setBookmarkContent(e.target.value)}
              maxLength={BOOKMARK_CONTENT_MAX}
            ></textarea>
            <p className="-mt-2 mb-4 text-right text-xs text-stone-400">
              {bookmarkContent.length} / {BOOKMARK_CONTENT_MAX}文字
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setIsAddingBookmark(false)}
                className="px-6 py-2 rounded-lg font-bold text-stone-500 hover:bg-stone-200 transition-colors"
              >
                キャンセル
              </button>
              <button 
                onClick={submitBookmark}
                disabled={isSubmitting || !bookmarkContent.trim() || bookmarkContent.trim().length > BOOKMARK_CONTENT_MAX}
                className={`px-6 py-2 rounded-lg font-bold transition-colors ${isSubmitting || !bookmarkContent.trim() ? 'bg-stone-300 text-stone-500 cursor-not-allowed' : 'bg-[#b8a98f] text-white hover:bg-amber-700'}`}
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
            付箋
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
                  <div className="text-stone-700 leading-relaxed mb-12">
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
                  {bookmarkView === "private" ? (
                    <Lock className="text-amber-600" size={24} />
                  ) : (
                    <Users className="text-amber-600" size={24} />
                  )}
                  {bookmarkView === "private" ? "自分の付箋" : "みんなの付箋"}
                </h3>
                <span className="text-sm text-stone-500">{displayedBookmarks.length}件の付箋</span>
              </div>

              <div className="grid grid-cols-2 rounded-xl border border-stone-200 bg-white p-1" aria-label="付箋の公開範囲">
                <button
                  type="button"
                  onClick={() => setBookmarkView("private")}
                  className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold transition-colors ${
                    bookmarkView === "private" ? "bg-stone-800 text-white" : "text-stone-500 hover:bg-stone-100"
                  }`}
                >
                  <Lock size={16} />
                  自分の付箋
                </button>
                <button
                  type="button"
                  onClick={() => setBookmarkView("shared")}
                  className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold transition-colors ${
                    bookmarkView === "shared" ? "bg-stone-800 text-white" : "text-stone-500 hover:bg-stone-100"
                  }`}
                >
                  <Users size={16} />
                  みんなの付箋
                </button>
              </div>

              {bookmarkNotice && (
                <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                  {bookmarkNotice}
                </p>
              )}
              {bookmarkError && (
                <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                  {bookmarkError}
                </p>
              )}
              
              <div className="grid grid-cols-1 gap-4">
                {bookmarksLoading ? (
                  <div className="rounded-xl border border-stone-200 bg-white p-10 text-center text-sm font-bold text-stone-500">
                    付箋を読み込んでいます…
                  </div>
                ) : displayedBookmarks.length > 0 ? displayedBookmarks.map((bm) => (
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
                            onClick={() => deleteBookmark(bm.id)}
                            className="p-1 rounded-md text-stone-500 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="この付箋を削除"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                        <span className="text-xs font-bold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full">
                          {bm.author}
                        </span>
                        {bm.visibility === "private" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-1 text-xs font-bold text-stone-600">
                            <Lock size={12} />
                            自分だけ
                          </span>
                        )}
                        {bm.isOwn && bm.status !== "approved" && (
                          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                            bm.status === "pending"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-stone-200 text-stone-600"
                          }`}>
                            {bm.status === "pending" ? "承認待ち" : "非承認"}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-stone-800 leading-relaxed font-medium mb-4">{bm.content}</p>
                    <div className="flex flex-wrap items-center justify-end gap-3 border-t border-stone-100 pt-3">
                      {bm.isOwn && (
                        <button
                          type="button"
                          onClick={() => updateBookmarkVisibility(bm)}
                          disabled={visibilityProcessingId !== null}
                          className="inline-flex items-center gap-1.5 text-sm font-bold text-stone-500 transition-colors hover:text-amber-700 disabled:opacity-50"
                        >
                          {bm.visibility === "private" ? <Users size={15} /> : <Lock size={15} />}
                          {visibilityProcessingId === bm.id
                            ? "変更中…"
                            : bm.visibility === "private"
                              ? "みんなに共有する"
                              : "自分だけに戻す"}
                        </button>
                      )}
                      {bm.visibility === "shared" && (
                        bm.status === "approved" && !bm.isOwn ? (
                          <button
                            type="button"
                            onClick={() => toggleBookmarkLike(bm)}
                            disabled={reactionProcessingId !== null}
                            aria-pressed={bm.isLiked}
                            className={`flex items-center gap-1.5 transition-colors group/btn disabled:opacity-50 ${
                              bm.isLiked ? "text-rose-600" : "text-stone-400 hover:text-rose-500"
                            }`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={bm.isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover/btn:fill-rose-100"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                            <span className="text-sm font-bold">助かった！ {bm.likes}</span>
                          </button>
                        ) : (
                          <span className="text-sm font-bold text-stone-400">助かった！ {bm.likes}</span>
                        )
                      )}
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-10 px-4 bg-white rounded-xl border border-stone-200 shadow-sm relative overflow-hidden">
                    {/* 背景の装飾 */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-100/50 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-stone-100 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="relative z-10">
                      <Star size={48} className="mx-auto mb-4 text-[#b8a98f] opacity-40" />
                      <h4 className="font-bold text-stone-800 mb-2 text-lg">
                        {bookmarkView === "private" ? "自分だけの付箋はまだありません" : "共有付箋はまだありません"}
                      </h4>
                      <p className="text-stone-500 text-sm mb-6 leading-relaxed max-w-sm mx-auto">
                        {bookmarkView === "private"
                          ? "動画の気づきや、あとで見返したいポイントを自分だけの付箋として残せます。"
                          : "動画の気づきや疑問を共有して、みんなの学びに役立てましょう。"}
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
                              setBookmarkVisibility(bookmarkView);
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
              
              {noteStatus.text && (
                <div className={`p-3 rounded-lg text-sm font-bold ${noteStatus.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                  {noteStatus.text}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={() => saveNote(noteText)}
                  disabled={noteSaving}
                  className="bg-stone-200 text-stone-700 font-bold py-2 px-6 rounded-lg hover:bg-stone-300 transition-colors disabled:opacity-50"
                >
                  {noteSaving ? "保存中..." : "ノートを保存する"}
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
