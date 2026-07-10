import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { validateUuid } from "@/lib/bookmarks";

type RouteContext = { params: Promise<{ id: string }> };

async function getRequestContext(context: RouteContext) {
  const { id } = await context.params;
  const bookmarkId = validateUuid(id, "付箋ID");
  if (!bookmarkId.ok) {
    return { error: NextResponse.json({ error: bookmarkId.message }, { status: 400 }) };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  return { bookmarkId: bookmarkId.value, supabase, user: data.user };
}

export async function POST(_request: Request, context: RouteContext) {
  try {
    const requestContext = await getRequestContext(context);
    if ("error" in requestContext) return requestContext.error;

    const { error } = await requestContext.supabase.from("bookmark_likes").insert({
      bookmark_id: requestContext.bookmarkId,
      user_id: requestContext.user.id,
    });

    if (error && error.code !== "23505") {
      console.error("[Bookmark Likes API] Failed to add reaction:", error);
      return NextResponse.json(
        { error: "この付箋には「助かった！」を付けられません。" },
        { status: 400 },
      );
    }

    const { count, error: countError } = await requestContext.supabase
      .from("bookmark_likes")
      .select("id", { count: "exact", head: true })
      .eq("bookmark_id", requestContext.bookmarkId);

    if (countError) {
      console.error("[Bookmark Likes API] Failed to count reactions:", countError);
      return NextResponse.json({ error: "リアクション件数を取得できませんでした。" }, { status: 500 });
    }

    return NextResponse.json({ success: true, isLiked: true, likes: count ?? 0 });
  } catch (error) {
    console.error("[Bookmark Likes API] Unhandled POST error:", error);
    return NextResponse.json({ error: "リアクションを保存できませんでした。" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const requestContext = await getRequestContext(context);
    if ("error" in requestContext) return requestContext.error;

    const { error } = await requestContext.supabase
      .from("bookmark_likes")
      .delete()
      .eq("bookmark_id", requestContext.bookmarkId)
      .eq("user_id", requestContext.user.id);

    if (error) {
      console.error("[Bookmark Likes API] Failed to remove reaction:", error);
      return NextResponse.json({ error: "リアクションを解除できませんでした。" }, { status: 500 });
    }

    const { count, error: countError } = await requestContext.supabase
      .from("bookmark_likes")
      .select("id", { count: "exact", head: true })
      .eq("bookmark_id", requestContext.bookmarkId);

    if (countError) {
      console.error("[Bookmark Likes API] Failed to count reactions:", countError);
      return NextResponse.json({ error: "リアクション件数を取得できませんでした。" }, { status: 500 });
    }

    return NextResponse.json({ success: true, isLiked: false, likes: count ?? 0 });
  } catch (error) {
    console.error("[Bookmark Likes API] Unhandled DELETE error:", error);
    return NextResponse.json({ error: "リアクションを解除できませんでした。" }, { status: 500 });
  }
}
