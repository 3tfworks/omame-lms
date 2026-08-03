import crypto from "crypto";
import { NextResponse } from "next/server";
import { findAuthUserByEmail, normalizeEmail } from "@/lib/authUsers";
import { sendBrowserIndependentMagicLink } from "@/lib/browserIndependentMagicLink";
import { createAdminClient } from "@/utils/supabase/admin";

const EMAIL_COOLDOWN_MS = 60_000;
const FINGERPRINT_WINDOW_MS = 10 * 60_000;
const FINGERPRINT_MAX_REQUESTS = 10;
const GENERIC_MESSAGE = "ご登録が確認できた場合、ログイン用メールをお送りします。";

function hash(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function requestFingerprint(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const remoteAddress = forwardedFor || request.headers.get("x-real-ip") || "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";
  return hash(`${remoteAddress}|${userAgent}`);
}

async function claimRequest(
  admin: ReturnType<typeof createAdminClient>,
  emailHash: string,
  fingerprint: string,
) {
  const { data, error } = await admin.rpc("claim_auth_login_request", {
    p_email_hash: emailHash,
    p_request_fingerprint: fingerprint,
    p_email_cooldown_seconds: Math.floor(EMAIL_COOLDOWN_MS / 1000),
    p_fingerprint_window_seconds: Math.floor(FINGERPRINT_WINDOW_MS / 1000),
    p_fingerprint_max_requests: FINGERPRINT_MAX_REQUESTS,
  });
  const claim = Array.isArray(data) ? data[0] : null;
  if (error || !claim) throw error ?? new Error("Login request was not recorded");
  return { allowed: Boolean(claim.allowed), requestId: Number(claim.request_id) };
}

async function recordOutcome(
  admin: ReturnType<typeof createAdminClient>,
  requestId: number,
  outcome: "sent" | "skipped_unknown" | "failed",
) {
  const { error } = await admin
    .from("auth_login_requests")
    .update({ outcome })
    .eq("id", requestId);
  if (error) console.warn("[Public Login] Could not update request outcome:", error.message);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = normalizeEmail(body?.email || "");
  if (!email || email.length > 320 || !email.includes("@")) {
    return NextResponse.json({ error: "有効なメールアドレスを入力してください。" }, { status: 400 });
  }

  const admin = createAdminClient();
  let requestId: number | null = null;

  try {
    const claim = await claimRequest(admin, hash(email), requestFingerprint(request));
    requestId = claim.requestId;
    if (!claim.allowed) {
      return NextResponse.json({ message: GENERIC_MESSAGE }, { status: 202 });
    }

    const authUser = await findAuthUserByEmail(admin, email);
    if (!authUser) {
      await recordOutcome(admin, requestId, "skipped_unknown");
      return NextResponse.json({ message: GENERIC_MESSAGE }, { status: 202 });
    }

    await sendBrowserIndependentMagicLink({
      admin,
      email,
      requestUrl: request.url,
      next: "/ja/lms",
      idempotencyScope: "public-login",
    });
    await recordOutcome(admin, requestId, "sent");
    return NextResponse.json({ message: GENERIC_MESSAGE }, { status: 202 });
  } catch (error) {
    console.error("[Public Login] Request failed:", error);
    if (requestId !== null) await recordOutcome(admin, requestId, "failed");

    // メール送信時の成否からアカウントの存在を推測されないよう、通常は共通応答を返す。
    // レート制限テーブル自体が利用できない場合だけ、安全側に倒して送信を停止する。
    if (requestId === null) {
      return NextResponse.json(
        { error: "現在ログインメールを送信できません。時間をおいてお試しください。" },
        { status: 503 },
      );
    }
    return NextResponse.json({ message: GENERIC_MESSAGE }, { status: 202 });
  }
}
