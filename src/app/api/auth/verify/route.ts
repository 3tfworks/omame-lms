import { NextResponse } from "next/server";
import { sanitizeInternalNextPath } from "@/lib/loginMagicLinkEmail";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

function noStore(response: NextResponse) {
  response.headers.set("Cache-Control", "no-store, max-age=0");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}

async function recordVerifyOutcome(input: {
  userId?: string | null;
  errorCode?: string | null;
  requestHost: string;
}) {
  try {
    await createAdminClient().from("auth_callback_events").insert({
      user_id: input.userId ?? null,
      outcome: input.errorCode ? "failure" : "success",
      error_code: input.errorCode || null,
      request_host: input.requestHost,
    });
  } catch (logError) {
    console.warn("[Auth Verify] Could not store callback event:", logError);
  }
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const next = sanitizeInternalNextPath(requestUrl.searchParams.get("next"));

  if (!tokenHash) {
    return noStore(NextResponse.redirect(new URL("/ja/login?error=Invalid+Link", request.url)));
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({
    type: "magiclink",
    token_hash: tokenHash,
  });

  await recordVerifyOutcome({
    userId: data.user?.id,
    errorCode: error?.code,
    requestHost: requestUrl.host,
  });

  if (error) {
    return noStore(NextResponse.redirect(new URL("/ja/login?error=Invalid+Link", request.url)));
  }
  return noStore(NextResponse.redirect(new URL(next, request.url)));
}

// 新しい通常ログインでは、メールのリンクを開いただけではtokenを消費しない。
// 確認画面で利用者がボタンを押したPOSTだけが、セッションを確立する。
export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const formData = await request.formData().catch(() => null);
  const rawTokenHash = formData?.get("token_hash");
  const rawNext = formData?.get("next");
  const tokenHash = typeof rawTokenHash === "string" ? rawTokenHash : "";
  const next = sanitizeInternalNextPath(typeof rawNext === "string" ? rawNext : null);

  if (!tokenHash || tokenHash.length > 4096) {
    return noStore(
      NextResponse.redirect(new URL("/ja/login?error=Invalid+Link", request.url), 303),
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({
    type: "magiclink",
    token_hash: tokenHash,
  });

  await recordVerifyOutcome({
    userId: data.user?.id,
    errorCode: error?.code,
    requestHost: requestUrl.host,
  });

  if (error) {
    return noStore(
      NextResponse.redirect(new URL("/ja/login?error=Invalid+Link", request.url), 303),
    );
  }

  return noStore(NextResponse.redirect(new URL(next, request.url), 303));
}
