import crypto from "crypto";
import { NextResponse } from "next/server";
import { normalizeEmail } from "@/lib/authUsers";
import { createAdminClient } from "@/utils/supabase/admin";

const MAX_WEBHOOK_AGE_SECONDS = 5 * 60;

function safeEqualBase64(a: string, b: string) {
  const left = Buffer.from(a, "base64");
  const right = Buffer.from(b, "base64");
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function verifyWebhook(rawBody: string, headers: Headers, secret: string) {
  const id = headers.get("svix-id");
  const timestamp = headers.get("svix-timestamp");
  const signatureHeader = headers.get("svix-signature");
  if (!id || !timestamp || !signatureHeader) return false;

  const timestampNumber = Number(timestamp);
  if (!Number.isFinite(timestampNumber)) return false;
  if (Math.abs(Date.now() / 1000 - timestampNumber) > MAX_WEBHOOK_AGE_SECONDS) return false;

  try {
    const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
    const expected = crypto
      .createHmac("sha256", key)
      .update(`${id}.${timestamp}.${rawBody}`)
      .digest("base64");

    return signatureHeader
      .split(" ")
      .map((part) => part.split(","))
      .some(([version, signature]) => version === "v1" && Boolean(signature) && safeEqualBase64(expected, signature));
  } catch {
    return false;
  }
}

function textValue(value: unknown) {
  return typeof value === "string" ? value : null;
}

export async function POST(request: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[Resend Webhook] Missing RESEND_WEBHOOK_SECRET");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const rawBody = await request.text();
  if (!verifyWebhook(rawBody, request.headers, secret)) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = textValue(payload.type);
  const data = payload.data && typeof payload.data === "object" ? (payload.data as Record<string, unknown>) : {};
  const recipients = Array.isArray(data.to) ? data.to : [data.to];
  const recipient = recipients.map(textValue).find(Boolean);
  const eventId = request.headers.get("svix-id");

  if (!eventType?.startsWith("email.") || !recipient || !eventId) {
    return NextResponse.json({ received: true });
  }

  // payload.created_at はイベント発生時刻、data.created_at は元メールの作成時刻。
  // 配信→開封→クリックの順序を正しく並べるためイベント発生時刻を優先する。
  const createdAt = textValue(payload.created_at) || textValue(data.created_at) || new Date().toISOString();
  const subject = textValue(data.subject) || "";
  const tags = data.tags && typeof data.tags === "object" ? (data.tags as Record<string, unknown>) : {};
  const category = textValue(tags.category) || "";
  const errorObject = data.error && typeof data.error === "object" ? (data.error as Record<string, unknown>) : {};
  const bounceObject = data.bounce && typeof data.bounce === "object" ? (data.bounce as Record<string, unknown>) : {};
  const failureReason =
    textValue(errorObject.message) ||
    textValue(bounceObject.message) ||
    textValue(data.reason) ||
    textValue(data.message);

  const emailKind = /ログイン|認証|magic|sign[ -]?in|one.time|confirm.email/i.test(`${subject} ${category}`)
    ? "auth"
    : "other";
  const admin = createAdminClient();
  const { error } = await admin.from("auth_email_events").upsert(
    {
      provider_event_id: eventId,
      provider_email_id: textValue(data.email_id) || textValue(data.id),
      recipient_email: normalizeEmail(recipient),
      event_type: eventType,
      email_kind: emailKind,
      occurred_at: createdAt,
      failure_reason: failureReason?.slice(0, 1000) || null,
    },
    { onConflict: "provider_event_id", ignoreDuplicates: true },
  );

  if (error) {
    console.error("[Resend Webhook] Failed to store event:", error);
    return NextResponse.json({ error: "Failed to store event" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
