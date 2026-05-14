import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // refreshing the auth token
  const { data: { user } } = await supabase.auth.getUser();

  // 保護されたルートの定義 (/lms または /admin)
  const isProtectedRoute = request.nextUrl.pathname.includes("/lms") || request.nextUrl.pathname.includes("/admin");

  if (isProtectedRoute && !user) {
    // ログインしていない場合はログイン画面にリダイレクト
    const lang = request.nextUrl.pathname.split('/')[1] || 'ja';
    return NextResponse.redirect(new URL(`/${lang}/login`, request.url));
  }

  // ログイン済みユーザーがログイン画面に行こうとした場合はLMSにリダイレクト
  if (request.nextUrl.pathname.includes("/login") && user) {
    const lang = request.nextUrl.pathname.split('/')[1] || 'ja';
    return NextResponse.redirect(new URL(`/${lang}/lms`, request.url));
  }

  // ログイン済みユーザーがトップページ(LP)にアクセスした場合もLMSにリダイレクト（フェイルセーフ）
  const isRootOrLangRoot = request.nextUrl.pathname === "/" || /^\/[a-z]{2}$/.test(request.nextUrl.pathname);
  if (isRootOrLangRoot && user) {
    const lang = request.nextUrl.pathname.split('/')[1] || 'ja';
    return NextResponse.redirect(new URL(`/${lang}/lms`, request.url));
  }

  return supabaseResponse;
}
