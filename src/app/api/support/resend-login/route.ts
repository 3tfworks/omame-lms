import { NextResponse } from "next/server";
import { findAuthUserByEmail, normalizeEmail } from "@/lib/authUsers";
import { getSupportAccess } from "@/lib/supportAuth";
import { createAdminClient } from "@/utils/supabase/admin";

const RESEND_COOLDOWN_MS = 60_000;

export async function POST(request: Request) {
  const access = await getSupportAccess();
  if (!access?.canResend) {
    return NextResponse.json({ error: "Forbidden" }, { status: access ? 403 : 401 });
  }

  const body = await request.json().catch(() => null);
  const email = normalizeEmail(body?.email || "");
  if (!email || email.length > 320 || !email.includes("@")) {
    return NextResponse.json({ error: "有効なメールアドレスを入力してください。" }, { status: 400 });
  }

  const admin = createAdminClient();

  try {
    const authUser = await findAuthUserByEmail(admin, email);
    if (!authUser) {
      return NextResponse.json({ error: "Supabase Authにユーザーが見つかりません。" }, { status: 404 });
    }

    const since = new Date(Date.now() - RESEND_COOLDOWN_MS).toISOString();
    const { data: recent } = await admin
      .from("support_action_logs")
      .select("created_at")
      .eq("target_email", email)
      .eq("action", "resend_login_email")
      .eq("result", "success")
      .gte("created_at", since)
      .limit(1);

    if (recent?.length) {
      return NextResponse.json(
        { error: "連続送信を防ぐため、前回の再送から60秒お待ちください。" },
        { status: 429 },
      );
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
    const redirectUrl = `${siteUrl.replace(/\/$/, "")}/api/auth/callback?next=/ja/lms`;
    const { error } = await admin.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectUrl, shouldCreateUser: false },
    });

    await admin.from("support_action_logs").insert({
      actor_user_id: access.userId,
      target_user_id: authUser.id,
      target_email: email,
      action: "resend_login_email",
      result: error ? "failure" : "success",
      detail: error ? `${error.code || "auth_error"}: ${error.message}`.slice(0, 500) : null,
    });

    if (error) {
      console.error("[Support Resend API] Failed:", error);
      return NextResponse.json({ error: "ログインメールの再送に失敗しました。" }, { status: 502 });
    }

    return NextResponse.json({ message: "ログインメールを再送しました。" });
  } catch (error) {
    console.error("[Support Resend API] Unhandled error:", error);
    return NextResponse.json({ error: "ログインメールの再送に失敗しました。" }, { status: 500 });
  }
}
