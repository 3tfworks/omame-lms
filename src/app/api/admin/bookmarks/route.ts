import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { getVideoById } from "@/lib/lmsData";
import { formatBookmarkTime, validateUuid, validateVideoId } from "@/lib/bookmarks";

const VALID_STATUSES = ["pending", "approved", "rejected"] as const;
type ModerationStatus = (typeof VALID_STATUSES)[number];
type BookmarkUser = { display_name: string | null };

function getDisplayName(users: BookmarkUser | BookmarkUser[] | null) {
  return Array.isArray(users) ? users[0]?.display_name ?? null : users?.display_name ?? null;
}

async function authorizeAdmin() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const admin = createAdminClient();
  const { data: requester, error: profileError } = await admin
    .from("users")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profileError || !requester || !["owner", "admin"].includes(requester.role)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { admin, user: data.user };
}

export async function GET(request: Request) {
  try {
    const auth = await authorizeAdmin();
    if ("error" in auth) return auth.error;

    const { searchParams } = new URL(request.url);
    const requestedStatus = searchParams.get("status") ?? "pending";
    if (requestedStatus !== "all" && !VALID_STATUSES.includes(requestedStatus as ModerationStatus)) {
      return NextResponse.json({ error: "状態の指定が不正です。" }, { status: 400 });
    }

    const requestedVideoId = searchParams.get("videoId");
    if (requestedVideoId) {
      const videoId = validateVideoId(requestedVideoId);
      if (!videoId.ok) {
        return NextResponse.json({ error: videoId.message }, { status: 400 });
      }
    }

    let query = auth.admin
      .from("video_bookmarks")
      .select(`
        id,
        video_id,
        user_id,
        timestamp_seconds,
        content,
        status,
        rejection_reason,
        created_at,
        reviewed_at,
        users:user_id (display_name),
        bookmark_likes (id)
      `)
      .order("created_at", { ascending: false })
      .eq("visibility", "shared")
      .limit(300);

    if (requestedStatus !== "all") query = query.eq("status", requestedStatus);
    if (requestedVideoId) query = query.eq("video_id", requestedVideoId);

    const { data, error } = await query;
    if (error) {
      console.error("[Admin Bookmarks API] Failed to fetch bookmarks:", error);
      return NextResponse.json({ error: "付箋を読み込めませんでした。" }, { status: 500 });
    }

    const bookmarks = (data ?? []).map((bookmark) => ({
      id: bookmark.id,
      videoId: bookmark.video_id,
      videoTitle: getVideoById(bookmark.video_id)?.title ?? bookmark.video_id,
      timeSeconds: bookmark.timestamp_seconds,
      timeStr: formatBookmarkTime(bookmark.timestamp_seconds),
      content: bookmark.content,
      author: getDisplayName(bookmark.users) || "名無しのお豆さん",
      status: bookmark.status,
      rejectionReason: bookmark.rejection_reason,
      likes: bookmark.bookmark_likes?.length ?? 0,
      createdAt: bookmark.created_at,
      reviewedAt: bookmark.reviewed_at,
    }));

    return NextResponse.json({ bookmarks });
  } catch (error) {
    console.error("[Admin Bookmarks API] Unhandled GET error:", error);
    return NextResponse.json({ error: "付箋を読み込めませんでした。" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await authorizeAdmin();
    if ("error" in auth) return auth.error;

    const body: unknown = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "送信内容が不正です。" }, { status: 400 });
    }

    const values = body as Record<string, unknown>;
    const bookmarkId = validateUuid(values.bookmarkId, "付箋ID");
    if (!bookmarkId.ok) {
      return NextResponse.json({ error: bookmarkId.message }, { status: 400 });
    }

    const status = values.status;
    if (status !== "approved" && status !== "rejected") {
      return NextResponse.json({ error: "承認状態が不正です。" }, { status: 400 });
    }

    const rejectionReason =
      status === "rejected" && typeof values.rejectionReason === "string"
        ? values.rejectionReason.trim().slice(0, 500) || null
        : null;

    const { data, error } = await auth.admin
      .from("video_bookmarks")
      .update({
        status,
        rejection_reason: rejectionReason,
        reviewed_by: auth.user.id,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookmarkId.value)
      .select("id, status, reviewed_at, rejection_reason")
      .maybeSingle();

    if (error) {
      console.error("[Admin Bookmarks API] Failed to moderate bookmark:", error);
      return NextResponse.json({ error: "付箋の状態を更新できませんでした。" }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: "付箋が見つかりません。" }, { status: 404 });
    }

    return NextResponse.json({ bookmark: data });
  } catch (error) {
    console.error("[Admin Bookmarks API] Unhandled PATCH error:", error);
    return NextResponse.json({ error: "付箋の状態を更新できませんでした。" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await authorizeAdmin();
    if ("error" in auth) return auth.error;

    const body: unknown = await request.json().catch(() => null);
    const bookmarkId = validateUuid(
      body && typeof body === "object" ? (body as Record<string, unknown>).bookmarkId : null,
      "付箋ID",
    );
    if (!bookmarkId.ok) {
      return NextResponse.json({ error: bookmarkId.message }, { status: 400 });
    }

    const { data, error } = await auth.admin
      .from("video_bookmarks")
      .delete()
      .eq("id", bookmarkId.value)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("[Admin Bookmarks API] Failed to delete bookmark:", error);
      return NextResponse.json({ error: "付箋を削除できませんでした。" }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: "付箋が見つかりません。" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Admin Bookmarks API] Unhandled DELETE error:", error);
    return NextResponse.json({ error: "付箋を削除できませんでした。" }, { status: 500 });
  }
}
