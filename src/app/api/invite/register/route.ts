import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

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

  const { data: referrer, error: referrerError } = await adminClient
    .from("users")
    .select("id, role")
    .eq("id", referrerId)
    .single();

  if (referrerError || !referrer) {
    return NextResponse.json({ error: "Referrer not found" }, { status: 404 });
  }

  if (referrer.role !== "salon_member" && referrer.role !== "owner" && referrer.role !== "admin") {
    return NextResponse.json({ error: "Referrer not found" }, { status: 404 });
  }

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

  return NextResponse.json({ ok: true });
}
