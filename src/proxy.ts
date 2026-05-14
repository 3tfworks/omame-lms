// プロキシ: ブラウザの言語設定を自動判定して適切な言語にリダイレクト
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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

export function proxy(request: NextRequest) {
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

  if (pathnameHasLocale) return;

  // 言語コードがない場合、自動判定してリダイレクト
  const locale = getLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: ["/((?!_next|api|images|.*\\..*).*)"],
};
