import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { getValidReferrer } from "@/lib/invite";

export async function POST(request: Request) {
  let body: { name?: string; email?: string; referrerId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { name, email, referrerId } = body;

  if (!name || !email || !referrerId) {
    return NextResponse.json({ error: "name, email, referrerId are required" }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  const adminClient = createAdminClient();

  // 役割だけでなく、現行のお豆メッセンジャー規約への同意も確認する。
  const referrer = await getValidReferrer(referrerId);
  if (!referrer) return NextResponse.json({ error: "Referrer not found" }, { status: 404 });

  const { error: insertError } = await adminClient
    .from("invite_leads")
    .insert({
      referrer_id: referrerId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
    });

  if (insertError) {
    console.error("[invite/register] insert error:", insertError);
    return NextResponse.json({ error: "Failed to save registration" }, { status: 500 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("referrer_id", referrerId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return response;
}
