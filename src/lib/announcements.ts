export const ANNOUNCEMENT_AUDIENCES = ["all", "course", "salon"] as const;
export type AnnouncementAudience = (typeof ANNOUNCEMENT_AUDIENCES)[number];

export const announcementAudienceLabels: Record<AnnouncementAudience, string> = {
  all: "全員",
  course: "基礎講座受講者",
  salon: "サロン会員",
};

export type Announcement = {
  id: string;
  title: string;
  body: string;
  audience: AnnouncementAudience;
  is_important: boolean;
  is_published: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
};

export function formatAnnouncementDate(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Tokyo",
  }).format(new Date(value));
}

export function validateAnnouncementInput(body: Record<string, unknown>) {
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const content = typeof body.body === "string" ? body.body.trim() : "";
  const audience = typeof body.audience === "string" ? body.audience : "";
  const publishedAt = typeof body.publishedAt === "string" ? body.publishedAt : "";
  if (!title || title.length > 120) return { error: "タイトルは1〜120文字で入力してください" } as const;
  if (!content || content.length > 10000) return { error: "本文は1〜10,000文字で入力してください" } as const;
  if (!ANNOUNCEMENT_AUDIENCES.includes(audience as AnnouncementAudience)) return { error: "公開対象が不正です" } as const;
  if (!publishedAt || Number.isNaN(Date.parse(publishedAt))) return { error: "公開日時が不正です" } as const;
  return {
    value: {
      title,
      body: content,
      audience,
      published_at: new Date(publishedAt).toISOString(),
      is_important: body.isImportant === true,
      is_published: body.isPublished === true,
      updated_at: new Date().toISOString(),
    },
  } as const;
}
