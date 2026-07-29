import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const requestedNext = requestUrl.searchParams.get("next") ?? "/ja/lms";
  const next =
    requestedNext.startsWith("/") && !requestedNext.startsWith("//")
      ? requestedNext
      : "/ja/lms";

  if (!tokenHash) {
    return NextResponse.redirect(new URL("/ja/login?error=Invalid+Link", request.url));
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({
    type: "magiclink",
    token_hash: tokenHash,
  });

  try {
    await createAdminClient().from("auth_callback_events").insert({
      user_id: data.user?.id ?? null,
      outcome: error ? "failure" : "success",
      error_code: error?.code || null,
      request_host: requestUrl.host,
    });
  } catch (logError) {
    console.warn("[Auth Verify] Could not store callback event:", logError);
  }

  if (error) {
    return NextResponse.redirect(new URL("/ja/login?error=Invalid+Link", request.url));
  }
  return NextResponse.redirect(new URL(next, request.url));
}
