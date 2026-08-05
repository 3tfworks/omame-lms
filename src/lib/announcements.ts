export const ANNOUNCEMENT_AUDIENCES = ["all", "course", "salon"] as const;
export type AnnouncementAudience = (typeof ANNOUNCEMENT_AUDIENCES)[number];

export const INFO_BAR_VARIANTS = ["info", "warning", "incident", "resolved"] as const;
export type InfoBarVariant = (typeof INFO_BAR_VARIANTS)[number];

export const infoBarVariantLabels: Record<InfoBarVariant, string> = {
  info: "ご案内",
  warning: "ご注意",
  incident: "障害発生中",
  resolved: "復旧済み",
};

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
  show_in_info_bar: boolean;
  info_bar_variant: InfoBarVariant;
  info_bar_ends_at: string | null;
  info_bar_dismissible: boolean;
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
  const infoBarVariant = typeof body.infoBarVariant === "string" ? body.infoBarVariant : "info";
  const infoBarEndsAt = typeof body.infoBarEndsAt === "string" ? body.infoBarEndsAt.trim() : "";
  if (!title || title.length > 120) return { error: "タイトルは1〜120文字で入力してください" } as const;
  if (!content || content.length > 10000) return { error: "本文は1〜10,000文字で入力してください" } as const;
  if (!ANNOUNCEMENT_AUDIENCES.includes(audience as AnnouncementAudience)) return { error: "公開対象が不正です" } as const;
  if (!publishedAt || Number.isNaN(Date.parse(publishedAt))) return { error: "公開日時が不正です" } as const;
  if (!INFO_BAR_VARIANTS.includes(infoBarVariant as InfoBarVariant)) return { error: "インフォバーの種別が不正です" } as const;
  if (infoBarEndsAt && Number.isNaN(Date.parse(infoBarEndsAt))) return { error: "インフォバーの終了日時が不正です" } as const;
  if (infoBarEndsAt && Date.parse(infoBarEndsAt) <= Date.parse(publishedAt)) {
    return { error: "インフォバーの終了日時は公開日時より後にしてください" } as const;
  }
  return {
    value: {
      title,
      body: content,
      audience,
      published_at: new Date(publishedAt).toISOString(),
      is_important: body.isImportant === true,
      is_published: body.isPublished === true,
      show_in_info_bar: body.showInInfoBar === true,
      info_bar_variant: infoBarVariant,
      info_bar_ends_at: infoBarEndsAt ? new Date(infoBarEndsAt).toISOString() : null,
      info_bar_dismissible: body.infoBarDismissible !== false,
      updated_at: new Date().toISOString(),
    },
  } as const;
}
