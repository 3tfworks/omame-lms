import { BarChart3, CheckCircle2, Clock3, Trophy } from "lucide-react";
import { curriculumData } from "@/lib/lmsData";
import { extractActionItems } from "@/lib/actionItems";
import { createClient } from "@/utils/supabase/server";
import { ProgressList, type ProgressChapter } from "./ProgressList";

type ProgressRow = {
  video_id: string;
  is_completed: boolean | null;
  completed_at: string | null;
  last_watched_at: string | null;
};

type ActionProgressRow = {
  video_id: string;
  item_key: string;
  created_at: string;
};

export default async function LearningProgressPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const videoIds = curriculumData.flatMap((chapter) => chapter.videos.map((video) => video.id));

  let rows: ProgressRow[] = [];
  let actionRows: ActionProgressRow[] = [];
  let loadError = false;

  if (user) {
    const [videoProgressResult, actionProgressResult] = await Promise.all([
      supabase
        .from("user_progress")
        .select("video_id, is_completed, completed_at, last_watched_at")
        .eq("user_id", user.id)
        .in("video_id", videoIds),
      supabase
        .from("action_item_progress")
        .select("video_id, item_key, created_at")
        .eq("user_id", user.id)
        .in("video_id", videoIds),
    ]);

    if (videoProgressResult.error || actionProgressResult.error) {
      console.error("Failed to load learning progress:", videoProgressResult.error ?? actionProgressResult.error);
      loadError = true;
    }
    rows = videoProgressResult.data ?? [];
    actionRows = actionProgressResult.data ?? [];
  }

  const progressByVideo = new Map(rows.map((row) => [row.video_id, row]));
  const actionProgressByKey = new Map(
    actionRows.map((row) => [`${row.video_id}:${row.item_key}`, row.created_at]),
  );
  const chapters: ProgressChapter[] = curriculumData.map((chapter) => ({
    id: chapter.id,
    title: chapter.title,
    videos: chapter.videos.map((video) => {
      const progress = progressByVideo.get(video.id);
      return {
        id: video.id,
        title: video.title,
        completed: progress?.is_completed === true,
        completedAt: progress?.completed_at ?? null,
        lastWatchedAt: progress?.last_watched_at ?? null,
        actionItems: extractActionItems(video.memoContent).map((text, index) => {
          const key = `action-${index}`;
          return {
            key,
            text,
            completedAt: actionProgressByKey.get(`${video.id}:${key}`) ?? null,
          };
        }),
      };
    }),
  }));

  const allVideos = chapters.flatMap((chapter) => chapter.videos);
  const completedVideos = allVideos.filter((video) => video.completed).length;
  const watchedVideos = allVideos.filter((video) => video.lastWatchedAt).length;
  const progressPercent = allVideos.length > 0
    ? Math.round((completedVideos / allVideos.length) * 100)
    : 0;

  return (
    <div className="space-y-8 pb-12">
      <header>
        <div className="flex items-center gap-2 text-sm font-bold text-omame-gold">
          <BarChart3 size={18} />
          LEARNING PROGRESS
        </div>
        <h1 className="mt-2 text-2xl font-bold text-stone-800 md:text-3xl">現在の学習状況</h1>
        <p className="mt-2 text-sm leading-relaxed text-stone-500">
          動画の完了状況と学習した日時を、章ごとに確認できます。
        </p>
      </header>

      {loadError ? (
        <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          学習状況を読み込めませんでした。時間をおいて再度お試しください。
        </p>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <Trophy className="text-omame-gold" size={22} />
          <p className="mt-4 text-3xl font-black text-stone-800">{progressPercent}<span className="ml-1 text-base text-stone-400">%</span></p>
          <p className="mt-1 text-sm font-medium text-stone-500">全体の進捗</p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <CheckCircle2 className="text-emerald-600" size={22} />
          <p className="mt-4 text-3xl font-black text-stone-800">{completedVideos}<span className="ml-1 text-base text-stone-400">/ {allVideos.length}本</span></p>
          <p className="mt-1 text-sm font-medium text-stone-500">完了した動画</p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <Clock3 className="text-amber-600" size={22} />
          <p className="mt-4 text-3xl font-black text-stone-800">{watchedVideos}<span className="ml-1 text-base text-stone-400">本</span></p>
          <p className="mt-1 text-sm font-medium text-stone-500">視聴履歴のある動画</p>
        </div>
      </section>

      <ProgressList chapters={chapters} lang={lang} />
    </div>
  );
}
