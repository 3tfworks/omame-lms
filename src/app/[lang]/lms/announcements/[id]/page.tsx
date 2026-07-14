import Link from "next/link";
import { ArrowLeft, Bell, TriangleAlert } from "lucide-react";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { announcementAudienceLabels, formatAnnouncementDate, type Announcement, type AnnouncementAudience } from "@/lib/announcements";
import { MarkRead } from "./MarkRead";

export default async function AnnouncementDetailPage({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const { lang, id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("announcements")
    .select("id, title, body, audience, is_important, is_published, published_at, created_at, updated_at")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();
  const announcement = data as Announcement;

  return (
    <article className="pb-12">
      <MarkRead announcementId={announcement.id} />
      <Link href={`/${lang}/lms/announcements`} className="inline-flex items-center gap-2 text-sm font-bold text-stone-500 hover:text-amber-800">
        <ArrowLeft size={17} /> お知らせ一覧へ
      </Link>
      <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm md:p-10">
        <div className="flex flex-wrap items-center gap-2 text-xs text-stone-400">
          {announcement.is_important ? <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 font-bold text-amber-800"><TriangleAlert size={14} />重要</span> : null}
          <span className="inline-flex items-center gap-1"><Bell size={14} />{announcementAudienceLabels[announcement.audience as AnnouncementAudience]}</span>
          <time dateTime={announcement.published_at}>{formatAnnouncementDate(announcement.published_at)}</time>
        </div>
        <h1 className="mt-5 text-2xl font-bold leading-relaxed text-stone-800 md:text-3xl">{announcement.title}</h1>
        <div className="mt-8 whitespace-pre-wrap border-t border-stone-100 pt-8 leading-8 text-stone-700">{announcement.body}</div>
      </div>
    </article>
  );
}
