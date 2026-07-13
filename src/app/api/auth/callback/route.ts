import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  // リクエストURLからパラメータを取得
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const requestedNext = requestUrl.searchParams.get("next") ?? "/ja/lms";
  // 外部URLへのリダイレクトを防ぎ、アプリ内の絶対パスだけを許可する。
  const next = requestedNext.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/ja/lms";

  if (code) {
    const supabase = await createClient();
    // 取得したコードでセッションを確立
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // 問い合わせ時に成功履歴を確認できるようにする。認証コード自体は保存しない。
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await createAdminClient().from("auth_callback_events").insert({
            user_id: user.id,
            outcome: "success",
            request_host: requestUrl.host,
          });
        }
      } catch (logError) {
        console.warn("[Auth Callback] Could not store success event:", logError);
      }
      // 成功時は指定されたリダイレクト先（デフォルトは /ja/lms）へ
      return NextResponse.redirect(new URL(next, request.url));
    } else {
      console.error("Auth callback error:", error);
      try {
        await createAdminClient().from("auth_callback_events").insert({
          outcome: "failure",
          error_code: error.code || "exchange_failed",
          request_host: requestUrl.host,
        });
      } catch (logError) {
        console.warn("[Auth Callback] Could not store failure event:", logError);
      }
    }
  }

  // エラー時、またはコードがない場合はログイン画面に戻す
  return NextResponse.redirect(new URL("/ja/login?error=Invalid+Link", request.url));
}
