import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // usersテーブルからプロフィールを取得
    const { data: profile, error: dbError } = await supabase
      .from("users")
      .select("id, email, role, display_name")
      .eq("id", user.id)
      .single();

    if (dbError) {
      console.error("[User Profile API] DB Error:", dbError);
      return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("[User Profile API] Unhandled Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
