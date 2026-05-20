import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");

  // Supabaseからの認証コードがURLに含まれている場合、
  // /api/auth/callback に転送してセッションを確立させる
  if (code && !request.nextUrl.pathname.startsWith("/api/auth/callback")) {
    const callbackUrl = new URL("/api/auth/callback", request.url);
    callbackUrl.searchParams.set("code", code);
    // デフォルトのリダイレクト先はLMSダッシュボード
    const next = searchParams.get("next") || "/ja/lms";
    callbackUrl.searchParams.set("next", next);
    return NextResponse.redirect(callbackUrl);
  }

  return NextResponse.next();
}

// middleware を適用するパス（API と静的ファイルは除外）
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
