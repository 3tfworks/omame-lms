import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseAdmin = createAdminClient();
    const { data, error } = await supabaseAdmin
      .from("system_settings")
      .select("value")
      .eq("id", "todays_message")
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error("[Message API] Error fetching message:", error);
      return NextResponse.json({ error: "Failed to fetch message" }, { status: 500 });
    }

    return NextResponse.json({ message: data?.value || "「重力に従う」感覚が少しずつ掴めてきた頃だね！焦らず、自分の指先が鍵盤の底とどう対話しているか、その感覚だけを一緒に大切にしていこうね！" });
  } catch (error) {
    console.error("[Message API] Unhandled error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseAdmin = createAdminClient();
    const { data: requester } = await supabaseAdmin
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!requester || (requester.role !== "owner" && requester.role !== "admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { message } = body;

    if (typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Upsert (存在すれば更新、なければ作成)
    const { error } = await supabaseAdmin
      .from("system_settings")
      .upsert({ 
        id: "todays_message", 
        value: message,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) {
      console.error("[Message API] Error saving message:", error);
      return NextResponse.json({ error: "Failed to save message" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Message API] Unhandled error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
