export const BOOKMARK_CONTENT_MAX = 500;

export type BookmarkStatus = "pending" | "approved" | "rejected";

export function validateVideoId(value: unknown) {
  if (typeof value !== "string") {
    return { ok: false as const, message: "動画IDが不正です。" };
  }

  const videoId = value.trim();
  if (!/^video-\d+$/.test(videoId)) {
    return { ok: false as const, message: "動画IDが不正です。" };
  }

  return { ok: true as const, value: videoId };
}

export function validateBookmarkContent(value: unknown) {
  if (typeof value !== "string") {
    return { ok: false as const, message: "付箋の内容を入力してください。" };
  }

  const content = value.trim();
  if (!content) {
    return { ok: false as const, message: "付箋の内容を入力してください。" };
  }
  if (content.length > BOOKMARK_CONTENT_MAX) {
    return {
      ok: false as const,
      message: `付箋は${BOOKMARK_CONTENT_MAX}文字以内で入力してください。`,
    };
  }

  return { ok: true as const, value: content };
}

export function validateTimestampSeconds(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return { ok: false as const, message: "動画の再生位置が不正です。" };
  }

  const seconds = Math.floor(value);
  if (seconds < 0 || seconds > 24 * 60 * 60) {
    return { ok: false as const, message: "動画の再生位置が不正です。" };
  }

  return { ok: true as const, value: seconds };
}

export function validateUuid(value: unknown, fieldName = "ID") {
  if (
    typeof value !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  ) {
    return { ok: false as const, message: `${fieldName}が不正です。` };
  }

  return { ok: true as const, value };
}

export function formatBookmarkTime(seconds: number) {
  return `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60)
    .toString()
    .padStart(2, "0")}`;
}
