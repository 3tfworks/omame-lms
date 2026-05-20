// プロキシ: 言語リダイレクト + 認証セッション管理
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const locales = ["ja", "en", "fr"];
const defaultLocale = "ja";

// ブラウザの Accept-Language ヘッダーから最適な言語を判定
function getLocale(request: NextRequest): string {
  const acceptLanguage = request.headers.get("accept-language") || "";

  // 各言語の優先度を解析
  const preferred = acceptLanguage
    .split(",")
    .map((lang) => {
      const [code, quality] = lang.trim().split(";q=");
      return { code: code.split("-")[0].toLowerCase(), quality: quality ? parseFloat(quality) : 1 };
    })
    .sort((a, b) => b.quality - a.quality);

  // サポートしている言語の中から一番優先度が高いものを返す
  for (const { code } of preferred) {
    if (locales.includes(code)) {
      return code;
    }
  }

  return defaultLocale;
}

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // 認証コードがURLに含まれている場合、/api/auth/callback に転送
  // （Supabase Magic Linkクリック後のリダイレクト処理）
  const code = searchParams.get("code");
  if (code && !pathname.startsWith("/api/auth/callback")) {
    const callbackUrl = new URL("/api/auth/callback", request.url);
    callbackUrl.searchParams.set("code", code);
    callbackUrl.searchParams.set("next", searchParams.get("next") || "/ja/lms");
    return NextResponse.redirect(callbackUrl);
  }

  // 静的ファイルやAPIリクエストはスキップ
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/images") ||
    pathname.includes(".")
  ) {
    return;
  }

  // パスに言語コードが含まれているかチェック
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  let nextUrlModified = false;
  // 言語コードがない場合、自動判定してリダイレクト
  if (!pathnameHasLocale) {
    const locale = getLocale(request);
    request.nextUrl.pathname = `/${locale}${pathname}`;
    nextUrlModified = true;
  }

  // --- アフィリエイト（紹介リンク）トラッキング ---
  const ref = searchParams.get("ref");
  
  // --- 認証セッション管理 ---
  // Supabaseクライアントを作成してセッションをリフレッシュ
  let supabaseResponse = nextUrlModified 
    ? NextResponse.redirect(request.nextUrl)
    : NextResponse.next({ request });

  // リファラー情報があればCookieに保存（30日間有効）
  if (ref) {
    supabaseResponse.cookies.set("referrer_id", ref, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // セッションをリフレッシュ
  const { data: { user } } = await supabase.auth.getUser();

  // 保護されたルートへのアクセス制限
  const isProtectedRoute = pathname.includes("/lms") || pathname.includes("/admin");
  const isAdminRoute = pathname.includes("/admin");
  const lang = pathname.split('/')[1] || 'ja';

  if (isProtectedRoute && !user) {
    // 未ログインユーザー → ログイン画面へリダイレクト
    return NextResponse.redirect(new URL(`/${lang}/login`, request.url));
  }

  if (isAdminRoute && user) {
    // 管理者ページはadminロールのみアクセス可能
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || (profile.role !== "admin" && profile.role !== "owner")) {
      // admin/owner以外のユーザー → LMSへリダイレクト
      return NextResponse.redirect(new URL(`/${lang}/lms`, request.url));
    }
  }

  // ログイン済みユーザーがログイン画面にアクセスした場合 → LMSへ
  if (pathname.includes("/login") && user) {
    return NextResponse.redirect(new URL(`/${lang}/lms`, request.url));
  }

  // ※トップページは公式HPのため、ログイン済みでもリダイレクトしない
  // LMSへは「学習ページへログイン」ボタンから遷移する

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next|api|images|.*\\..*).*)" ],
};
