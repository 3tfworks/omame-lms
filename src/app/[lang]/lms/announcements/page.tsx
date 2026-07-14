import Link from "next/link";
import { Bell, ChevronRight, Megaphone } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { announcementAudienceLabels, formatAnnouncementDate, type Announcement, type AnnouncementAudience } from "@/lib/announcements";

export default async function AnnouncementsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [announcementsResult, readsResult] = await Promise.all([
    supabase
      .from("announcements")
      .select("id, title, body, audience, is_important, is_published, published_at, created_at, updated_at")
      .order("is_important", { ascending: false })
      .order("published_at", { ascending: false }),
    user
      ? supabase.from("announcement_reads").select("announcement_id").eq("user_id", user.id)
      : Promise.resolve({ data: [], error: null }),
  ]);

  const announcements = (announcementsResult.data ?? []) as Announcement[];
  const readIds = new Set((readsResult.data ?? []).map((row) => row.announcement_id));

  return (
    <div className="space-y-8 pb-12">
      <header>
        <div className="flex items-center gap-2 text-sm font-bold text-omame-gold"><Megaphone size={18} /> NEWS</div>
        <h1 className="mt-2 text-2xl font-bold text-stone-800 md:text-3xl">お知らせ</h1>
        <p className="mt-2 text-sm text-stone-500">新しい動画や教材の更新、運営からのご案内を確認できます。</p>
      </header>

      {announcements.length === 0 ? (
        <div className="rounded-2xl border border-stone-200 bg-white p-10 text-center text-stone-500">現在、お知らせはありません。</div>
      ) : (
        <ul className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm divide-y divide-stone-100">
          {announcements.map((item) => {
            const isUnread = !readIds.has(item.id);
            return (
              <li key={item.id}>
                <Link href={`/${lang}/lms/announcements/${item.id}`} className="group flex items-start gap-4 p-5 hover:bg-amber-50/50 md:p-6">
                  <span className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isUnread ? "bg-amber-100 text-amber-700" : "bg-stone-100 text-stone-400"}`}>
                    <Bell size={19} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {isUnread ? <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">未読</span> : null}
                      {item.is_important ? <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">重要</span> : null}
                      <span className="text-xs text-stone-400">{announcementAudienceLabels[item.audience as AnnouncementAudience]}</span>
                    </div>
                    <h2 className="mt-2 font-bold leading-relaxed text-stone-800 group-hover:text-amber-900">{item.title}</h2>
                    <p className="mt-2 line-clamp-2 whitespace-pre-wrap text-sm leading-relaxed text-stone-500">{item.body}</p>
                    <time className="mt-3 block text-xs text-stone-400" dateTime={item.published_at}>{formatAnnouncementDate(item.published_at)}</time>
                  </div>
                  <ChevronRight className="mt-2 shrink-0 text-stone-300 group-hover:text-amber-600" size={20} />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
