import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import {
  formatBookmarkTime,
  validateBookmarkContent,
  validateBookmarkVisibility,
  validateTimestampSeconds,
  validateUuid,
  validateVideoId,
} from "@/lib/bookmarks";

type BookmarkUser = { display_name: string | null };
type BookmarkLike = { user_id: string };

function getDisplayName(users: BookmarkUser | BookmarkUser[] | null): string | null {
  return Array.isArray(users) ? users[0]?.display_name ?? null : users?.display_name ?? null;
}

function getLikes(likes: BookmarkLike[] | null, currentUserId: string) {
  const rows = likes ?? [];
  return {
    likes: rows.length,
    isLiked: rows.some((like) => like.user_id === currentUserId),
  };
}

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  return { supabase, user: error ? null : data.user };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const videoIdValidation = validateVideoId(searchParams.get("videoId"));
    if (!videoIdValidation.ok) {
      return NextResponse.json({ error: videoIdValidation.message }, { status: 400 });
    }

    const { user } = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // service role はRLSを迂回するため、このクエリ自身で公開条件を必ず限定する。
    // クライアントへ返すのは表示名を含む付箋DTOだけで、メール等は取得しない。
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("video_bookmarks")
      .select(`
        id,
        video_id,
        user_id,
        timestamp_seconds,
        content,
        status,
        visibility,
        created_at,
        users:user_id (display_name),
        bookmark_likes (user_id)
      `)
      .eq("video_id", videoIdValidation.value)
      .or(`and(visibility.eq.shared,status.eq.approved),user_id.eq.${user.id}`)
      .order("timestamp_seconds", { ascending: true })
      .limit(200);

    if (error) {
      console.error("[Bookmarks API] Failed to fetch bookmarks:", error);
      return NextResponse.json({ error: "付箋を読み込めませんでした。" }, { status: 500 });
    }

    const bookmarks = (data ?? []).map((bookmark) => {
      const reaction = getLikes(bookmark.bookmark_likes, user.id);
      return {
        id: bookmark.id,
        timeSeconds: bookmark.timestamp_seconds,
        timeStr: formatBookmarkTime(bookmark.timestamp_seconds),
        content: bookmark.content,
        author: getDisplayName(bookmark.users) || "名無しのお豆さん",
        likes: reaction.likes,
        isLiked: reaction.isLiked,
        createdAt: bookmark.created_at,
        status: bookmark.status,
        visibility: bookmark.visibility,
        isOwn: bookmark.user_id === user.id,
      };
    });

    return NextResponse.json({ bookmarks });
  } catch (error) {
    console.error("[Bookmarks API] Unhandled GET error:", error);
    return NextResponse.json({ error: "付箋を読み込めませんでした。" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, user } = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: unknown = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "送信内容が不正です。" }, { status: 400 });
    }

    const values = body as Record<string, unknown>;
    const videoId = validateVideoId(values.videoId);
    const timestamp = validateTimestampSeconds(values.timestampSeconds);
    const content = validateBookmarkContent(values.content);
    const visibility = validateBookmarkVisibility(values.visibility ?? "private");
    if (!videoId.ok || !timestamp.ok || !content.ok || !visibility.ok) {
      const message = !videoId.ok
        ? videoId.message
        : !timestamp.ok
          ? timestamp.message
          : !content.ok
            ? content.message
            : visibility.ok
              ? "送信内容が不正です。"
              : visibility.message;
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("video_bookmarks")
      .insert({
        video_id: videoId.value,
        user_id: user.id,
        timestamp_seconds: timestamp.value,
        content: content.value,
        visibility: visibility.value,
        status: visibility.value === "private" ? "approved" : "pending",
      })
      .select("id, timestamp_seconds, content, status, created_at")
      .single();

    if (error) {
      console.error("[Bookmarks API] Failed to submit bookmark:", error);
      return NextResponse.json({ error: "付箋を投稿できませんでした。" }, { status: 500 });
    }

    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("users")
      .select("display_name")
      .eq("id", user.id)
      .maybeSingle();

    return NextResponse.json(
      {
        bookmark: {
          id: data.id,
          timeSeconds: data.timestamp_seconds,
          timeStr: formatBookmarkTime(data.timestamp_seconds),
          content: data.content,
          author: profile?.display_name || "あなた",
          likes: 0,
          isLiked: false,
          createdAt: data.created_at,
          status: data.status,
          visibility: visibility.value,
          isOwn: true,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[Bookmarks API] Unhandled POST error:", error);
    return NextResponse.json({ error: "付箋を投稿できませんでした。" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { user } = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: unknown = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "送信内容が不正です。" }, { status: 400 });
    }

    const values = body as Record<string, unknown>;
    const bookmarkId = validateUuid(values.bookmarkId, "付箋ID");
    const visibility = validateBookmarkVisibility(values.visibility);
    if (!bookmarkId.ok || !visibility.ok) {
      return NextResponse.json(
        { error: bookmarkId.ok ? visibility.message : bookmarkId.message },
        { status: 400 },
      );
    }

    const admin = createAdminClient();
    const { data: existing, error: fetchError } = await admin
      .from("video_bookmarks")
      .select("id, user_id, visibility")
      .eq("id", bookmarkId.value)
      .maybeSingle();

    if (fetchError) {
      console.error("[Bookmarks API] Failed to fetch bookmark before visibility update:", fetchError);
      return NextResponse.json({ error: "付箋の公開範囲を変更できませんでした。" }, { status: 500 });
    }
    if (!existing || existing.user_id !== user.id) {
      return NextResponse.json({ error: "付箋が見つからないか、変更権限がありません。" }, { status: 404 });
    }
    if (existing.visibility === visibility.value) {
      return NextResponse.json({ success: true, visibility: visibility.value });
    }

    const now = new Date().toISOString();
    const update =
      visibility.value === "private"
        ? {
            visibility: "private",
            status: "approved",
            reviewed_by: null,
            reviewed_at: null,
            rejection_reason: null,
            updated_at: now,
          }
        : {
            visibility: "shared",
            status: "pending",
            reviewed_by: null,
            reviewed_at: null,
            rejection_reason: null,
            updated_at: now,
          };

    const { data, error } = await admin
      .from("video_bookmarks")
      .update(update)
      .eq("id", bookmarkId.value)
      .eq("user_id", user.id)
      .select("id, visibility, status")
      .maybeSingle();

    if (error) {
      console.error("[Bookmarks API] Failed to update bookmark visibility:", error);
      return NextResponse.json({ error: "付箋の公開範囲を変更できませんでした。" }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: "付箋が見つかりません。" }, { status: 404 });
    }

    return NextResponse.json({ success: true, visibility: data.visibility, status: data.status });
  } catch (error) {
    console.error("[Bookmarks API] Unhandled PATCH error:", error);
    return NextResponse.json({ error: "付箋の公開範囲を変更できませんでした。" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { supabase, user } = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: unknown = await request.json().catch(() => null);
    const bookmarkId = validateUuid(
      body && typeof body === "object" ? (body as Record<string, unknown>).bookmarkId : null,
      "付箋ID",
    );
    if (!bookmarkId.ok) {
      return NextResponse.json({ error: bookmarkId.message }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("video_bookmarks")
      .delete()
      .eq("id", bookmarkId.value)
      .eq("user_id", user.id)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("[Bookmarks API] Failed to delete bookmark:", error);
      return NextResponse.json({ error: "付箋を削除できませんでした。" }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: "付箋が見つからないか、削除権限がありません。" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Bookmarks API] Unhandled DELETE error:", error);
    return NextResponse.json({ error: "付箋を削除できませんでした。" }, { status: 500 });
  }
}
