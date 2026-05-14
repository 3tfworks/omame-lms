import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * 以下のパスは除外:
     * - _next/static (静的ファイル)
     * - _next/image (画像最適化)
     * - favicon.ico (ファビコン)
     * - images/ (公開画像)
     * - api/auth/callback (認証コールバック自体は除外しない→含める)
     */
    "/((?!_next/static|_next/image|favicon.ico|images/).*)",
  ],
};
