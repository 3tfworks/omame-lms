"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronRight,
  ClipboardList,
  Download,
  ExternalLink,
  FileText,
  Lightbulb,
  Loader2,
  MessageCircleQuestion,
  Music2,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  Video,
} from "lucide-react";
import {
  RESEARCH_STATUSES,
  analyzeResearchComments,
  generateResearchKeywords,
  totalIdeaScore,
  youtubeSearchUrl,
  type IdeaScores,
  type ResearchIdea,
  type ResearchKeyword,
  type ResearchPillar,
  type ResearchStatus,
  type ResearchVideo,
} from "@/lib/youtubeResearch";

type Tab = "keywords" | "videos" | "ideas";
type ApiResource = "keyword" | "video" | "idea";
type ResearchMode = "standard" | "classical_shorts";
type ResearchRun = {
  id: string;
  status: "queued" | "running" | "completed" | "failed";
  trigger_source: "manual" | "schedule";
  current_step: string;
  seed_keywords: string[];
  stats: Record<string, number>;
  insights: { audience?: string[]; content_gaps?: string[] };
  error_message: string;
  created_at: string;
  completed_at: string | null;
  research_mode?: ResearchMode;
};

const PILLAR_LABELS: Record<ResearchPillar, string> = {
  pain: "悩み解決",
  principle: "原理・実演",
  practice: "譜読み・練習",
  story: "変化・物語",
  teacher: "講師向け",
};

const STATUS_LABELS: Record<ResearchStatus, string> = {
  candidate: "候補",
  researching: "リサーチ中",
  script: "台本作成",
  scheduled: "撮影予定",
  editing: "編集中",
  published: "公開済み",
  measuring: "効果測定",
};

const EMPTY_VIDEO_FORM = {
  url: "",
  title: "",
  channel_name: "",
  published_at: "",
  view_count: 0,
  channel_subscribers: 0,
  duration_minutes: 0,
  notes: "",
  comments_text: "",
};

const EMPTY_SCORES: IdeaScores = {
  demand_score: 20,
  fit_score: 20,
  proof_score: 12,
  conversion_score: 10,
  ease_score: 3,
};

const EMPTY_IDEA_FORM = {
  title: "",
  pillar: "pain" as ResearchPillar,
  status: "candidate" as ResearchStatus,
  target_audience: "",
  problem: "",
  hook: "",
  demonstration: "",
  cta: "5分で分かる・頑張りすぎピアノ診断",
  source_keyword: "",
  source_url: "",
  thumbnail_a: "",
  thumbnail_b: "",
  thumbnail_c: "",
  scheduled_at: "",
  ...EMPTY_SCORES,
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("ja-JP").format(Number(value) || 0);
}

function viewsPerDay(video: ResearchVideo): number | null {
  if (!video.published_at) return null;
  const days = Math.max(1, (Date.now() - new Date(video.published_at).getTime()) / 86_400_000);
  return Math.round(Number(video.view_count) / days);
}

function csvCell(value: unknown): string {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function downloadIdeasCsv(ideas: ResearchIdea[]) {
  const headers = [
    "タイトル",
    "柱",
    "状態",
    "合計点",
    "対象視聴者",
    "悩み",
    "冒頭",
    "実演",
    "CTA",
    "キーワード",
    "参考URL",
    "形式",
    "作曲家",
    "曲名",
    "難所",
    "冒頭テロップ",
    "演奏区間",
    "目標秒数",
    "カット割り",
    "権利確認",
  ];
  const rows = ideas.map((idea) => [
    idea.title,
    PILLAR_LABELS[idea.pillar],
    STATUS_LABELS[idea.status],
    idea.score_total,
    idea.target_audience,
    idea.problem,
    idea.hook,
    idea.demonstration,
    idea.cta,
    idea.source_keyword,
    idea.source_url,
    idea.content_format,
    idea.composer,
    idea.piece_title,
    idea.difficult_passage,
    idea.opening_overlay,
    idea.performance_segment,
    idea.target_duration_seconds,
    idea.shot_plan?.join(" → ") ?? "",
    idea.rights_note,
  ]);
  const csv = `\uFEFF${[headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n")}`;
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `youtube-research-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function YouTubeResearchConsole() {
  const [tab, setTab] = useState<Tab>("keywords");
  const [keywords, setKeywords] = useState<ResearchKeyword[]>([]);
  const [videos, setVideos] = useState<ResearchVideo[]>([]);
  const [ideas, setIdeas] = useState<ResearchIdea[]>([]);
  const [runs, setRuns] = useState<ResearchRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [automationLoading, setAutomationLoading] = useState(false);
  const [researchMode, setResearchMode] = useState<ResearchMode>("standard");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [seed, setSeed] = useState("ピアノ 脱力");
  const [videoForm, setVideoForm] = useState(EMPTY_VIDEO_FORM);
  const [ideaForm, setIdeaForm] = useState(EMPTY_IDEA_FORM);
  const loadRequestId = useRef(0);
  const deferredCommentsText = useDeferredValue(videoForm.comments_text);

  const generatedKeywords = useMemo(() => generateResearchKeywords(seed), [seed]);
  const savedKeywordSet = useMemo(() => new Set(keywords.map((item) => item.keyword)), [keywords]);
  const commentPreview = useMemo(
    () => analyzeResearchComments(deferredCommentsText),
    [deferredCommentsText],
  );
  const currentIdeaScore = useMemo(
    () => totalIdeaScore({
      demand_score: ideaForm.demand_score,
      fit_score: ideaForm.fit_score,
      proof_score: ideaForm.proof_score,
      conversion_score: ideaForm.conversion_score,
      ease_score: ideaForm.ease_score,
    }),
    [ideaForm],
  );

  const loadData = useCallback(async () => {
    const requestId = ++loadRequestId.current;
    setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams({ mode: researchMode });
      const [response, runsResponse] = await Promise.all([
        fetch(`/api/admin/youtube-research?${query}`, { cache: "no-store" }),
        fetch(`/api/admin/youtube-research/runs?${query}`, { cache: "no-store" }),
      ]);
      const [data, runsData] = await Promise.all([
        response.json().catch(() => ({})),
        runsResponse.json().catch(() => ({})),
      ]);
      if (!response.ok) throw new Error(data.error || "データを取得できませんでした");
      if (!runsResponse.ok) throw new Error(runsData.error || "実行履歴を取得できませんでした");
      if (requestId !== loadRequestId.current) return;
      setKeywords(data.keywords ?? []);
      setVideos(data.videos ?? []);
      setIdeas(data.ideas ?? []);
      setRuns(runsData.runs ?? []);
    } catch (loadError) {
      if (requestId === loadRequestId.current) {
        setError(loadError instanceof Error ? loadError.message : "データを取得できませんでした");
      }
    } finally {
      if (requestId === loadRequestId.current) setLoading(false);
    }
  }, [researchMode]);

  useEffect(() => {
    // Initial client-side synchronization with the admin API.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadData();
  }, [loadData]);

  useEffect(() => {
    if (!runs.some((run) => run.status === "queued" || run.status === "running")) return;
    const timer = window.setInterval(() => void loadData(), 4_000);
    return () => window.clearInterval(timer);
  }, [loadData, runs]);

  async function startAutomation() {
    setAutomationLoading(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/youtube-research/runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          researchMode,
          keywords: researchMode === "standard"
            ? keywords.slice(0, 5).map((item) => item.keyword)
            : undefined,
          videosPerKeyword: 8,
          commentsPerVideo: 20,
          ideaCount: 8,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "自動リサーチを開始できませんでした");
      setNotice(`${researchMode === "classical_shorts" ? "クラシック演奏Shorts" : "通常動画"}の全自動リサーチを開始しました。画面を閉じても処理は継続します。`);
      await loadData();
    } catch (automationError) {
      setError(automationError instanceof Error ? automationError.message : "開始に失敗しました");
    } finally {
      setAutomationLoading(false);
    }
  }

  async function mutate(method: "POST" | "PATCH" | "DELETE", payload: Record<string, unknown>) {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/youtube-research", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "操作に失敗しました");
      await loadData();
      return true;
    } catch (mutationError) {
      setError(mutationError instanceof Error ? mutationError.message : "操作に失敗しました");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function saveKeyword(keyword: string) {
    const ok = await mutate("POST", {
      resource: "keyword",
      data: { keyword, source_seed: seed, status: "candidate", notes: "" },
    });
    if (ok) setNotice(`「${keyword}」を保存しました`);
  }

  async function saveVideo(event: React.FormEvent) {
    event.preventDefault();
    const ok = await mutate("POST", {
      resource: "video",
      data: { ...videoForm, content_format: researchMode },
    });
    if (ok) {
      setVideoForm(EMPTY_VIDEO_FORM);
      setNotice("競合動画とコメント分析を保存しました");
    }
  }

  async function saveIdea(event: React.FormEvent) {
    event.preventDefault();
    const ok = await mutate("POST", {
      resource: "idea",
      data: { ...ideaForm, content_format: researchMode },
    });
    if (ok) {
      setIdeaForm(EMPTY_IDEA_FORM);
      setNotice("動画企画を保存しました");
    }
  }

  async function updateIdeaStatus(id: string, status: ResearchStatus) {
    const ok = await mutate("PATCH", { resource: "idea", id, data: { status } });
    if (ok) setNotice("企画の状態を更新しました");
  }

  async function remove(resource: ApiResource, id: string, label: string) {
    if (!window.confirm(`「${label}」を削除しますか？`)) return;
    const ok = await mutate("DELETE", { resource, id });
    if (ok) setNotice("削除しました");
  }

  function prefillIdeaFromVideo(video: ResearchVideo) {
    const topCategory = Object.entries(video.comment_analysis?.categoryCounts ?? {})
      .sort((a, b) => b[1] - a[1])[0]?.[0];
    setIdeaForm({
      ...EMPTY_IDEA_FORM,
      title: video.title,
      problem: topCategory ? `コメントで「${topCategory}」の悩みが多い` : "",
      source_url: video.url,
      source_keyword: "",
    });
    setTab("ideas");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function selectResearchMode(mode: ResearchMode) {
    setResearchMode(mode);
    setNotice("");
    setError("");
    if (mode === "classical_shorts" && tab === "keywords") setTab("videos");
  }

  const tabs: Array<{ id: Tab; label: string; count: number; icon: typeof Search }> = [
    ...(researchMode === "standard"
      ? [{ id: "keywords" as const, label: "キーワード", count: keywords.length, icon: Search }]
      : []),
    { id: "videos", label: "競合・コメント", count: videos.length, icon: Video },
    { id: "ideas", label: "企画ボード", count: ideas.length, icon: Lightbulb },
  ];

  return (
    <div className="space-y-7">
      <header className="rounded-3xl bg-gradient-to-br from-red-950 via-stone-900 to-stone-950 p-6 text-white shadow-xl md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-bold tracking-[0.22em] text-red-200">
              <Video className="h-5 w-5" /> OMAME YOUTUBE RESEARCH
            </div>
            <h2 className="text-2xl font-bold md:text-3xl">YouTube企画リサーチ</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone-300">
              検索需要、競合コメント、お豆奏法との相性を一つの流れで整理し、撮影する企画を決めます。
            </p>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 rounded-xl border border-white/10 bg-black/20 p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => selectResearchMode("standard")}
                className={`rounded-lg px-3 py-2 transition-colors ${researchMode === "standard" ? "bg-white text-stone-900" : "text-stone-300 hover:bg-white/10"}`}
              >
                通常動画
              </button>
              <button
                type="button"
                onClick={() => selectResearchMode("classical_shorts")}
                className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 transition-colors ${researchMode === "classical_shorts" ? "bg-white text-stone-900" : "text-stone-300 hover:bg-white/10"}`}
              >
                <Music2 className="h-3.5 w-3.5" /> 演奏Shorts
              </button>
            </div>
            <button
              type="button"
              onClick={() => void startAutomation()}
              disabled={automationLoading || runs.some((run) => run.status === "queued" || run.status === "running")}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-red-950/30 hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {automationLoading || runs.some((run) => run.status === "queued" || run.status === "running") ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {researchMode === "classical_shorts" ? "演奏Shortsを自動企画" : "全自動リサーチを実行"}
            </button>
            <div className="grid grid-cols-3 gap-2 text-center">
            {[
              [keywords.length, "キーワード"],
              [videos.length, "競合動画"],
              [ideas.length, "企画"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="text-xl font-bold">{value}</div>
                <div className="mt-1 text-[11px] text-stone-400">{label}</div>
              </div>
            ))}
            </div>
          </div>
        </div>
      </header>

      {runs[0] && <ResearchRunCard run={runs[0]} />}
      {runs.length > 1 && <ResearchRunHistory runs={runs.slice(1, 6)} />}

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-stone-200 bg-white p-2 shadow-sm">
        {tabs.map(({ id, label, count, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors ${
              tab === id ? "bg-stone-900 text-white" : "text-stone-500 hover:bg-stone-100"
            }`}
          >
            <Icon className="h-4 w-4" /> {label}
            <span className={`rounded-full px-2 py-0.5 text-xs ${tab === id ? "bg-white/15" : "bg-stone-100"}`}>
              {count}
            </span>
          </button>
        ))}
        <button
          type="button"
          onClick={() => void loadData()}
          disabled={loading}
          className="ml-auto rounded-xl p-2.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 disabled:opacity-50"
          aria-label="データを再読み込み"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div>}
      {notice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">{notice}</div>}

      {loading && keywords.length === 0 && videos.length === 0 && ideas.length === 0 ? (
        <div className="flex items-center justify-center gap-3 py-20 text-stone-400">
          <Loader2 className="h-6 w-6 animate-spin" /> 読み込み中...
        </div>
      ) : null}

      {tab === "keywords" && (
        <section className="space-y-6">
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-start gap-3">
              <div className="rounded-xl bg-red-50 p-2.5 text-red-700"><Search className="h-5 w-5" /></div>
              <div>
                <h3 className="font-bold text-stone-800">種キーワードから検索候補を作る</h3>
                <p className="mt-1 text-sm text-stone-500">YouTube検索を開き、候補表示と上位動画を確認してください。</p>
              </div>
            </div>
            <label className="mb-2 block text-sm font-bold text-stone-700" htmlFor="research-seed">種キーワード</label>
            <input
              id="research-seed"
              value={seed}
              onChange={(event) => setSeed(event.target.value)}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-red-500"
              placeholder="例：ピアノ 脱力"
            />
            <div className="mt-5 grid gap-2 md:grid-cols-2">
              {generatedKeywords.map((keyword) => {
                const saved = savedKeywordSet.has(keyword);
                return (
                  <div key={keyword} className="flex items-center gap-2 rounded-xl border border-stone-200 p-3">
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-stone-700">{keyword}</span>
                    <a
                      href={youtubeSearchUrl(keyword)}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg p-2 text-stone-400 hover:bg-stone-100 hover:text-red-600"
                      aria-label={`${keyword}をYouTubeで検索`}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <button
                      type="button"
                      disabled={saved || saving}
                      onClick={() => void saveKeyword(keyword)}
                      className={`rounded-lg p-2 ${saved ? "bg-emerald-50 text-emerald-600" : "text-stone-400 hover:bg-red-50 hover:text-red-600"}`}
                      aria-label={`${keyword}を保存`}
                    >
                      {saved ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white shadow-sm">
            <div className="border-b border-stone-100 px-6 py-4"><h3 className="font-bold text-stone-800">保存済みキーワード</h3></div>
            {keywords.length === 0 ? (
              <p className="p-8 text-center text-sm text-stone-400">まだ保存されていません</p>
            ) : (
              <ul className="divide-y divide-stone-100">
                {keywords.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 px-5 py-3">
                    <span className="flex-1 text-sm font-medium text-stone-700">{item.keyword}</span>
                    <a href={youtubeSearchUrl(item.keyword)} target="_blank" rel="noreferrer" className="text-stone-400 hover:text-red-600"><ExternalLink className="h-4 w-4" /></a>
                    <button type="button" onClick={() => void remove("keyword", item.id, item.keyword)} className="text-stone-300 hover:text-red-600" aria-label="キーワードを削除"><Trash2 className="h-4 w-4" /></button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {tab === "videos" && (
        <section className="space-y-6">
          <form onSubmit={saveVideo} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm [&_.input]:w-full [&_.input]:rounded-xl [&_.input]:border [&_.input]:border-stone-300 [&_.input]:px-3 [&_.input]:py-2.5 [&_.input]:text-sm [&_.input]:outline-none focus-within:[&_.input]:border-red-500">
            <div className="mb-6 flex items-start gap-3">
              <div className="rounded-xl bg-red-50 p-2.5 text-red-700"><Video className="h-5 w-5" /></div>
              <div><h3 className="font-bold text-stone-800">競合動画を登録する</h3><p className="mt-1 text-sm text-stone-500">コメントは1行に1件ずつ貼り付けると自動分類されます。</p></div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="YouTube URL"><input required type="url" value={videoForm.url} onChange={(e) => setVideoForm({ ...videoForm, url: e.target.value })} className="input" placeholder="https://www.youtube.com/watch?v=..." /></Field>
              <Field label="動画タイトル"><input required value={videoForm.title} onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })} className="input" /></Field>
              <Field label="チャンネル名"><input value={videoForm.channel_name} onChange={(e) => setVideoForm({ ...videoForm, channel_name: e.target.value })} className="input" /></Field>
              <Field label="公開日"><input type="date" value={videoForm.published_at} onChange={(e) => setVideoForm({ ...videoForm, published_at: e.target.value })} className="input" /></Field>
              <Field label="再生数"><input type="number" min={0} value={videoForm.view_count} onChange={(e) => setVideoForm({ ...videoForm, view_count: Number(e.target.value) })} className="input" /></Field>
              <Field label="チャンネル登録者数"><input type="number" min={0} value={videoForm.channel_subscribers} onChange={(e) => setVideoForm({ ...videoForm, channel_subscribers: Number(e.target.value) })} className="input" /></Field>
              <Field label="動画時間（分）"><input type="number" min={0} step="0.1" value={videoForm.duration_minutes} onChange={(e) => setVideoForm({ ...videoForm, duration_minutes: Number(e.target.value) })} className="input" /></Field>
              <Field label="メモ"><input value={videoForm.notes} onChange={(e) => setVideoForm({ ...videoForm, notes: e.target.value })} className="input" placeholder="冒頭、タイトル、サムネイルの特徴" /></Field>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <Field label="コメント貼り付け">
                <textarea value={videoForm.comments_text} onChange={(e) => setVideoForm({ ...videoForm, comments_text: e.target.value })} className="input min-h-48 resize-y" placeholder={"力を抜こうとしても余計に固くなります\n本番になると同じ場所でミスします\nどうすれば自然に弾けますか？"} />
              </Field>
              <CommentAnalysisCard analysis={commentPreview} />
            </div>
            <button type="submit" disabled={saving} className="mt-5 flex items-center gap-2 rounded-xl bg-red-700 px-5 py-3 text-sm font-bold text-white hover:bg-red-800 disabled:opacity-50"><Plus className="h-4 w-4" />競合動画を保存</button>
          </form>

          <div className="grid gap-4">
            {videos.map((video) => {
              const daily = viewsPerDay(video);
              const subscriberRatio = Number(video.channel_subscribers) > 0 ? Number(video.view_count) / Number(video.channel_subscribers) : null;
              return (
                <article key={video.id} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-stone-400"><span>{video.channel_name || "チャンネル未入力"}</span>{video.published_at && <span>・{new Date(video.published_at).toLocaleDateString("ja-JP")}</span>}</div>
                      <a href={video.url} target="_blank" rel="noreferrer" className="font-bold leading-relaxed text-stone-800 hover:text-red-700">{video.title} <ExternalLink className="inline h-3.5 w-3.5" /></a>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        <Metric label="再生" value={formatNumber(video.view_count)} />
                        {daily !== null && <Metric label="1日" value={formatNumber(daily)} />}
                        {subscriberRatio !== null && <Metric label="登録者比" value={`${subscriberRatio.toFixed(1)}倍`} />}
                        <Metric label="コメント分析" value={`${video.comment_analysis?.totalComments ?? 0}件`} />
                      </div>
                      {video.notes && <p className="mt-3 text-sm leading-relaxed text-stone-500">{video.notes}</p>}
                      {(video.comment_analysis?.questions?.length ?? 0) > 0 && (
                        <div className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900"><span className="font-bold">質問：</span> {video.comment_analysis.questions[0]}</div>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button type="button" onClick={() => prefillIdeaFromVideo(video)} className="flex items-center gap-1 rounded-lg bg-stone-900 px-3 py-2 text-xs font-bold text-white"><Lightbulb className="h-3.5 w-3.5" />企画化</button>
                      <button type="button" onClick={() => void remove("video", video.id, video.title)} className="rounded-lg bg-red-50 p-2 text-red-500" aria-label="競合動画を削除"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                </article>
              );
            })}
            {videos.length === 0 && <EmptyState icon={Video} text="競合動画を登録すると、ここで比較できます" />}
          </div>
        </section>
      )}

      {tab === "ideas" && (
        <section className="space-y-6">
          <form onSubmit={saveIdea} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm [&_.input]:w-full [&_.input]:rounded-xl [&_.input]:border [&_.input]:border-stone-300 [&_.input]:px-3 [&_.input]:py-2.5 [&_.input]:text-sm [&_.input]:outline-none focus-within:[&_.input]:border-red-500">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex items-start gap-3"><div className="rounded-xl bg-amber-50 p-2.5 text-amber-700"><Sparkles className="h-5 w-5" /></div><div><h3 className="font-bold text-stone-800">動画企画を作る</h3><p className="mt-1 text-sm text-stone-500">需要と販売へのつながりを100点で評価します。</p></div></div>
              <div className={`rounded-2xl px-5 py-3 text-center ${currentIdeaScore >= 70 ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-600"}`}><div className="text-2xl font-bold">{currentIdeaScore}</div><div className="text-[11px] font-bold">/ 100点</div></div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="企画タイトル"><input required value={ideaForm.title} onChange={(e) => setIdeaForm({ ...ideaForm, title: e.target.value })} className="input" /></Field>
              <Field label="コンテンツの柱"><select value={ideaForm.pillar} onChange={(e) => setIdeaForm({ ...ideaForm, pillar: e.target.value as ResearchPillar })} className="input">{Object.entries(PILLAR_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
              <Field label="対象視聴者"><input value={ideaForm.target_audience} onChange={(e) => setIdeaForm({ ...ideaForm, target_audience: e.target.value })} className="input" placeholder="例：奏法迷子のピアノ講師" /></Field>
              <Field label="元キーワード"><input value={ideaForm.source_keyword} onChange={(e) => setIdeaForm({ ...ideaForm, source_keyword: e.target.value })} className="input" /></Field>
              <Field label="解決する悩み"><textarea value={ideaForm.problem} onChange={(e) => setIdeaForm({ ...ideaForm, problem: e.target.value })} className="input min-h-24" /></Field>
              <Field label="冒頭10秒"><textarea value={ideaForm.hook} onChange={(e) => setIdeaForm({ ...ideaForm, hook: e.target.value })} className="input min-h-24" placeholder="音のビフォーアフターなど" /></Field>
              <Field label="実演内容"><textarea value={ideaForm.demonstration} onChange={(e) => setIdeaForm({ ...ideaForm, demonstration: e.target.value })} className="input min-h-24" /></Field>
              <Field label="CTA"><textarea value={ideaForm.cta} onChange={(e) => setIdeaForm({ ...ideaForm, cta: e.target.value })} className="input min-h-24" /></Field>
              <Field label="サムネイル案A"><input value={ideaForm.thumbnail_a} onChange={(e) => setIdeaForm({ ...ideaForm, thumbnail_a: e.target.value })} className="input" maxLength={100} /></Field>
              <Field label="サムネイル案B"><input value={ideaForm.thumbnail_b} onChange={(e) => setIdeaForm({ ...ideaForm, thumbnail_b: e.target.value })} className="input" maxLength={100} /></Field>
            </div>
            <div className="mt-5 grid gap-3 rounded-2xl bg-stone-50 p-4 sm:grid-cols-2 lg:grid-cols-5">
              <ScoreInput label="需要" max={30} value={ideaForm.demand_score} onChange={(value) => setIdeaForm({ ...ideaForm, demand_score: value })} />
              <ScoreInput label="お豆適合" max={30} value={ideaForm.fit_score} onChange={(value) => setIdeaForm({ ...ideaForm, fit_score: value })} />
              <ScoreInput label="実演性" max={20} value={ideaForm.proof_score} onChange={(value) => setIdeaForm({ ...ideaForm, proof_score: value })} />
              <ScoreInput label="購入意向" max={15} value={ideaForm.conversion_score} onChange={(value) => setIdeaForm({ ...ideaForm, conversion_score: value })} />
              <ScoreInput label="撮影容易" max={5} value={ideaForm.ease_score} onChange={(value) => setIdeaForm({ ...ideaForm, ease_score: value })} />
            </div>
            <button type="submit" disabled={saving} className="mt-5 flex items-center gap-2 rounded-xl bg-stone-900 px-5 py-3 text-sm font-bold text-white hover:bg-black disabled:opacity-50"><Plus className="h-4 w-4" />企画を保存</button>
          </form>

          <div className="flex items-center justify-between"><h3 className="font-bold text-stone-800">企画一覧</h3><button type="button" disabled={ideas.length === 0} onClick={() => downloadIdeasCsv(ideas)} className="flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-50 disabled:opacity-40"><Download className="h-4 w-4" />CSV</button></div>
          <div className="grid gap-4">
            {ideas.map((idea) => (
              <article key={idea.id} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-start">
                  <div className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl ${idea.score_total >= 70 ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-600"}`}><span className="text-xl font-bold">{idea.score_total}</span><span className="text-[9px]">SCORE</span></div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap gap-2">
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">{PILLAR_LABELS[idea.pillar]}</span>
                      {idea.content_format === "classical_shorts" && <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-bold text-violet-700">クラシック演奏Shorts</span>}
                      {idea.source_keyword && <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] text-stone-500">{idea.source_keyword}</span>}
                    </div>
                    <h4 className="font-bold leading-relaxed text-stone-800">{idea.title}</h4>
                    {idea.hook && <p className="mt-2 text-sm leading-relaxed text-stone-500"><span className="font-bold text-stone-700">冒頭：</span>{idea.hook}</p>}
                    {idea.content_format === "classical_shorts" && (
                      <div className="mt-3 grid gap-2 rounded-xl bg-violet-50/70 p-3 text-xs leading-relaxed text-stone-600 sm:grid-cols-2">
                        <p><span className="font-bold text-violet-800">曲：</span>{[idea.composer, idea.piece_title].filter(Boolean).join(" / ")}</p>
                        <p><span className="font-bold text-violet-800">目標：</span>{idea.target_duration_seconds || 30}秒</p>
                        <p><span className="font-bold text-violet-800">難所：</span>{idea.difficult_passage}</p>
                        <p><span className="font-bold text-violet-800">冒頭テロップ：</span>{idea.opening_overlay}</p>
                        <p className="sm:col-span-2"><span className="font-bold text-violet-800">演奏区間：</span>{idea.performance_segment}</p>
                        {idea.shot_plan?.length > 0 && <p className="sm:col-span-2"><span className="font-bold text-violet-800">カット割り：</span>{idea.shot_plan.join(" → ")}</p>}
                        {idea.rights_note && <p className="sm:col-span-2 text-amber-800"><span className="font-bold">権利確認：</span>{idea.rights_note}</p>}
                      </div>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <select value={idea.status} onChange={(e) => void updateIdeaStatus(idea.id, e.target.value as ResearchStatus)} className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-bold text-stone-600">{RESEARCH_STATUSES.map((status) => <option key={status} value={status}>{STATUS_LABELS[status]}</option>)}</select>
                    {idea.source_url && <a href={idea.source_url} target="_blank" rel="noreferrer" className="rounded-lg bg-stone-100 p-2 text-stone-500" aria-label="参考動画を開く"><ExternalLink className="h-4 w-4" /></a>}
                    <button type="button" onClick={() => void remove("idea", idea.id, idea.title)} className="rounded-lg bg-red-50 p-2 text-red-500" aria-label="企画を削除"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </article>
            ))}
            {ideas.length === 0 && <EmptyState icon={Lightbulb} text="70点以上を目安に、最初の企画を作成してください" />}
          </div>
        </section>
      )}

      <footer className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-5 text-sm leading-relaxed text-stone-500">
        <div className="flex items-start gap-3"><ClipboardList className="mt-0.5 h-5 w-5 shrink-0 text-stone-400" /><p><span className="font-bold text-stone-700">推奨の順番：</span>キーワードを検索 → 上位動画とコメントを登録 → 70点以上の企画を作成 → 公開後に状態を「効果測定」へ変更。</p></div>
      </footer>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block text-sm font-bold text-stone-700">{label}</span>{children}</label>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <span className="rounded-lg bg-stone-100 px-2.5 py-1 text-stone-600"><span className="text-stone-400">{label}</span> {value}</span>;
}

function ResearchRunCard({ run }: { run: ResearchRun }) {
  const statusLabels = {
    queued: "待機中",
    running: "実行中",
    completed: "完了",
    failed: "失敗",
  } as const;
  const stepLabels: Record<string, string> = {
    queued: "開始待ち",
    collecting_youtube: "YouTube検索・コメント取得",
    saving_evidence: "調査データ保存",
    generating_ideas: "AI企画生成・採点",
    saving_ideas: "企画ボード登録",
    completed: "すべて完了",
    failed: "処理失敗",
    failed_to_start: "開始失敗",
  };
  const active = run.status === "queued" || run.status === "running";
  return (
    <section className={`rounded-2xl border p-5 shadow-sm ${run.status === "failed" ? "border-red-200 bg-red-50" : "border-emerald-200 bg-emerald-50/60"}`}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-white p-2 text-emerald-700 shadow-sm">
            {active ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-stone-800">最新の全自動リサーチ</h3>
              {run.research_mode === "classical_shorts" && <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-bold text-violet-700">演奏Shorts</span>}
              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-stone-600">{statusLabels[run.status]}</span>
            </div>
            <p className="mt-1 text-sm text-stone-600">{stepLabels[run.current_step] ?? run.current_step}</p>
            <p className="mt-1 text-xs text-stone-400">{run.seed_keywords.join(" / ")}</p>
          </div>
        </div>
        {run.status === "completed" && (
          <div className="flex flex-wrap gap-2 text-xs">
            <Metric label="動画" value={`${run.stats.video_count ?? 0}件`} />
            <Metric label="コメント" value={`${run.stats.comment_count ?? 0}件`} />
            <Metric label="企画" value={`${run.stats.idea_count ?? 0}件`} />
          </div>
        )}
      </div>
      {run.error_message && <p className="mt-3 rounded-xl bg-white/80 p-3 text-sm font-medium text-red-700">{run.error_message}</p>}
      {run.status === "completed" && (run.insights.audience?.length ?? 0) > 0 && (
        <div className="mt-4 border-t border-emerald-200 pt-4 text-sm text-stone-600">
          <span className="font-bold text-stone-700">今回見つかった視聴者ニーズ：</span>
          {run.insights.audience?.slice(0, 3).join(" / ")}
        </div>
      )}
    </section>
  );
}

function ResearchRunHistory({ runs }: { runs: ResearchRun[] }) {
  return (
    <details className="rounded-2xl border border-stone-200 bg-white shadow-sm">
      <summary className="cursor-pointer px-5 py-4 text-sm font-bold text-stone-700">
        このモードの過去の実行履歴（{runs.length}件）
      </summary>
      <div className="divide-y divide-stone-100 border-t border-stone-100">
        {runs.map((run) => (
          <div key={run.id} className="flex flex-col gap-2 px-5 py-3 text-xs text-stone-500 md:flex-row md:items-center md:justify-between">
            <div>
              <span className="font-bold text-stone-700">
                {run.status === "completed" ? "完了" : run.status === "failed" ? "失敗" : "実行中"}
              </span>
              <span className="ml-3">{new Date(run.created_at).toLocaleString("ja-JP")}</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <span>動画 {run.stats.video_count ?? 0}件</span>
              <span>コメント {run.stats.comment_count ?? 0}件</span>
              <span>企画 {run.stats.idea_count ?? 0}件</span>
            </div>
          </div>
        ))}
      </div>
    </details>
  );
}

function ScoreInput({ label, max, value, onChange }: { label: string; max: number; value: number; onChange: (value: number) => void }) {
  return <label className="text-xs font-bold text-stone-600"><span className="mb-2 flex justify-between"><span>{label}</span><span>{value}/{max}</span></span><input type="range" min={0} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-red-700" /></label>;
}

function CommentAnalysisCard({ analysis }: { analysis: ReturnType<typeof analyzeResearchComments> }) {
  const ranked = Object.entries(analysis.categoryCounts).filter(([, count]) => count > 0).sort((a, b) => b[1] - a[1]).slice(0, 5);
  return <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4"><div className="mb-3 flex items-center gap-2 text-sm font-bold text-amber-900"><MessageCircleQuestion className="h-4 w-4" />コメント分析プレビュー</div><div className="text-2xl font-bold text-amber-950">{analysis.totalComments}<span className="ml-1 text-xs font-normal text-amber-700">件</span></div>{ranked.length === 0 ? <p className="mt-4 text-xs leading-relaxed text-amber-700">コメントを貼ると、悩みの分類と質問を表示します。</p> : <div className="mt-4 space-y-2">{ranked.map(([category, count]) => <div key={category} className="flex items-center justify-between text-xs text-amber-900"><span>{category}</span><span className="font-bold">{count}</span></div>)}</div>}{analysis.questions.length > 0 && <div className="mt-4 border-t border-amber-200 pt-3 text-xs leading-relaxed text-amber-900"><span className="font-bold">質問例：</span>{analysis.questions[0]}</div>}</div>;
}

function EmptyState({ icon: Icon, text }: { icon: typeof FileText; text: string }) {
  return <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-stone-50 py-12 text-center text-sm text-stone-400"><Icon className="mb-3 h-8 w-8" /><p>{text}</p><ChevronRight className="mt-3 h-4 w-4" /></div>;
}
