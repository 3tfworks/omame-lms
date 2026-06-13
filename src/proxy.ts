// プロキシ: 言語リダイレクト + 認証セッション管理 + 管理画面のBasic認証
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import crypto from "crypto";

const locales = ["ja", "en", "fr"];
const defaultLocale = "ja";

// タイミング攻撃を緩和する定数時間の文字列比較。
// 長さが異なる場合もダミー比較を1回挟んでから false を返す。
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf-8");
  const bb = Buffer.from(b, "utf-8");
  if (ab.length !== bb.length) {
    crypto.timingSafeEqual(ab, ab);
    return false;
  }
  return crypto.timingSafeEqual(ab, bb);
}

// 管理画面(/admin, /api/admin)向けの Basic 認証チェック。
// 戻り値:
//   "skip" … 環境変数(BASIC_AUTH_USER / BASIC_AUTH_PASSWORD)が未設定 → 認証をスキップ（既存動作を維持）
//   true   … 認証成功
//   false  … 認証失敗（ヘッダ無し・不正含む） → 呼び出し側で 401 を返す
function checkBasicAuth(request: NextRequest): boolean | "skip" {
  const expectedUser = process.env.BASIC_AUTH_USER;
  const expectedPass = process.env.BASIC_AUTH_PASSWORD;

  // どちらか未設定ならスキップ（ローカル開発・未設定の本番でも壊れないように）
  if (!expectedUser || !expectedPass) {
    return "skip";
  }

  const header = request.headers.get("authorization");
  if (!header || !header.startsWith("Basic ")) {
    return false;
  }

  let decoded: string;
  try {
    decoded = Buffer.from(header.slice(6), "base64").toString("utf-8");
  } catch {
    return false;
  }

  // "user:pass" 形式。パスワードに ":" が含まれてもよいよう最初の ":" で分割。
  const separatorIndex = decoded.indexOf(":");
  if (separatorIndex === -1) {
    return false;
  }
  const user = decoded.slice(0, separatorIndex);
  const pass = decoded.slice(separatorIndex + 1);

  // 短絡評価を避け、両方を必ず比較する
  const userOk = safeEqual(user, expectedUser);
  const passOk = safeEqual(pass, expectedPass);
  return userOk && passOk;
}

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

  // --- 管理画面の Basic 認証（/admin ページ と /api/admin の両方が対象） ---
  // Supabase ログインの「手前」にもう一段のアクセス制限を設ける。
  // 環境変数が未設定の場合はスキップされ、既存の挙動は一切変わらない。
  if (pathname.includes("/admin")) {
    const basicAuth = checkBasicAuth(request);
    if (basicAuth === false) {
      // 標準的な 401 + WWW-Authenticate でブラウザにID/PW入力を促す
      return new NextResponse("Authentication required", {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="Admin Area", charset="UTF-8"',
        },
      });
    }
    // basicAuth === true / "skip" の場合はそのまま後続処理へ
  }

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
  // 1つ目: 通常ページ（_next / api / images / 拡張子付きファイルを除外）
  // 2つ目: 管理APIにも Basic 認証を適用するため /api/admin 配下を追加でマッチ
  matcher: ["/((?!_next|api|images|.*\\..*).*)", "/api/admin/:path*"],
};
