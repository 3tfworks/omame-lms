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
  const { pathname } = request.nextUrl;

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

  // 言語コードがない場合、自動判定してリダイレクト
  if (!pathnameHasLocale) {
    const locale = getLocale(request);
    request.nextUrl.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(request.nextUrl);
  }

  // --- 認証セッション管理 ---
  // Supabaseクライアントを作成してセッションをリフレッシュ
  let supabaseResponse = NextResponse.next({ request });

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

  // 保護されたルート（/lms, /admin）へ未ログインでアクセスした場合 → ログイン画面へ
  // ⚠️ 一時的に認証チェックを無効化中（確認後に戻すこと）
  // const isProtectedRoute = pathname.includes("/lms") || pathname.includes("/admin");
  // if (isProtectedRoute && !user) {
  //   const lang = pathname.split('/')[1] || 'ja';
  //   return NextResponse.redirect(new URL(`/${lang}/login`, request.url));
  // }

  // ログイン済みユーザーがログイン画面にアクセスした場合 → LMSへ
  if (pathname.includes("/login") && user) {
    const lang = pathname.split('/')[1] || 'ja';
    return NextResponse.redirect(new URL(`/${lang}/lms`, request.url));
  }

  // ログイン済みユーザーがトップページ（LP）にアクセスした場合 → LMSへ（フェイルセーフ）
  const isRootOrLangRoot = /^\/[a-z]{2}$/.test(pathname);
  if (isRootOrLangRoot && user) {
    const lang = pathname.split('/')[1] || 'ja';
    return NextResponse.redirect(new URL(`/${lang}/lms`, request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next|api|images|.*\\..*).*)" ],
};
