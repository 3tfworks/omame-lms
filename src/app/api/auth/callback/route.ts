import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  // リクエストURLからパラメータを取得
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/ja/lms";

  if (code) {
    const supabase = await createClient();
    // 取得したコードでセッションを確立
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // 成功時は指定されたリダイレクト先（デフォルトは /ja/lms）へ
      return NextResponse.redirect(new URL(next, request.url));
    } else {
      console.error("Auth callback error:", error);
    }
  }

  // エラー時、またはコードがない場合はログイン画面に戻す
  return NextResponse.redirect(new URL("/ja/login?error=Invalid+Link", request.url));
}
