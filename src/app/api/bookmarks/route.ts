import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get("videoId");

    if (!videoId) {
      return NextResponse.json({ error: "videoId is required" }, { status: 400 });
    }

    const supabase = await createClient();

    // video_bookmarks を取得 (userの表示名もjoinで取得)
    const { data, error } = await supabase
      .from("video_bookmarks")
      .select(`
        id,
        video_id,
        timestamp_seconds,
        content,
        likes_count,
        created_at,
        users:user_id (
          display_name
        )
      `)
      .eq("video_id", videoId)
      .order("timestamp_seconds", { ascending: true });

    if (error) {
      console.error("Error fetching bookmarks:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // クライアントで使いやすい形に整形
    const formatted = data.map((bm: any) => ({
      id: bm.id,
      timeSeconds: bm.timestamp_seconds,
      timeStr: `${Math.floor(bm.timestamp_seconds / 60).toString().padStart(2, '0')}:${(bm.timestamp_seconds % 60).toString().padStart(2, '0')}`,
      content: bm.content,
      author: bm.users?.display_name || "名無しのお豆さん",
      likes: bm.likes_count,
      createdAt: bm.created_at
    }));

    return NextResponse.json({ bookmarks: formatted });
  } catch (error: any) {
    console.error("Exception in GET bookmarks:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = authData.user.id;
    const { videoId, timestampSeconds, content } = await request.json();

    if (!videoId || timestampSeconds === undefined || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("video_bookmarks")
      .insert({
        video_id: videoId,
        user_id: userId,
        timestamp_seconds: timestampSeconds,
        content: content
      })
      .select(`
        id,
        video_id,
        timestamp_seconds,
        content,
        likes_count,
        created_at,
        users:user_id (
          display_name
        )
      `)
      .single();

    if (error) {
      console.error("Error inserting bookmark:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 整形して返す
    const newBookmark = {
      id: data.id,
      timeSeconds: data.timestamp_seconds,
      timeStr: `${Math.floor(data.timestamp_seconds / 60).toString().padStart(2, '0')}:${(data.timestamp_seconds % 60).toString().padStart(2, '0')}`,
      content: data.content,
      author: data.users?.display_name || "あなた",
      likes: data.likes_count,
      createdAt: data.created_at
    };

    return NextResponse.json({ bookmark: newBookmark });
  } catch (error: any) {
    console.error("Exception in POST bookmarks:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    
    // 認証チェック
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookmarkId } = await request.json();
    if (!bookmarkId) {
      return NextResponse.json({ error: "bookmarkId is required" }, { status: 400 });
    }

    // RPCを使うのが確実だが、一旦現在の値を読んで+1する簡易実装にするか、
    // Supabaseの機能的に UPDATE likes_count = likes_count + 1 ができないため、
    // 現在のlikesを取得して+1する。
    // ※ 厳密には同時に押されると競合するが、初期リリースとしては許容範囲。
    const { data: current, error: fetchError } = await supabase
      .from("video_bookmarks")
      .select("likes_count")
      .eq("id", bookmarkId)
      .single();

    if (fetchError || !current) {
      return NextResponse.json({ error: "Bookmark not found" }, { status: 404 });
    }

    const newLikesCount = (current.likes_count || 0) + 1;

    const { error: updateError } = await supabase
      .from("video_bookmarks")
      .update({ likes_count: newLikesCount })
      .eq("id", bookmarkId);

    if (updateError) {
      console.error("Error updating likes:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, likes: newLikesCount });
  } catch (error: any) {
    console.error("Exception in PATCH bookmarks:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
