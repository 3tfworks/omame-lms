import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { referralCode?: string; dismiss?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const adminClient = createAdminClient();

  if (body.dismiss) {
    await adminClient
      .from("users")
      .update({ referral_prompt_shown: true })
      .eq("id", user.id);
    return NextResponse.json({ ok: true });
  }

  const { referralCode } = body;

  if (!referralCode || typeof referralCode !== "string" || !referralCode.trim()) {
    return NextResponse.json({ error: "紹介コードを入力してください" }, { status: 400 });
  }

  const code = referralCode.trim();

  if (code === user.id) {
    return NextResponse.json({ error: "自分自身のコードは使用できません" }, { status: 400 });
  }

  const { data: referrer } = await adminClient
    .from("users")
    .select("id")
    .eq("id", code)
    .single();

  if (!referrer) {
    return NextResponse.json({ error: "コードが見つかりません。招待URLをご確認ください" }, { status: 404 });
  }

  const { data: existing } = await adminClient
    .from("affiliate_rewards")
    .select("id")
    .eq("buyer_id", user.id)
    .maybeSingle();

  if (existing) {
    await adminClient
      .from("users")
      .update({ referral_prompt_shown: true })
      .eq("id", user.id);
    return NextResponse.json({ error: "すでに紹介コードが適用されています" }, { status: 409 });
  }

  const { data: setting } = await adminClient
    .from("system_settings")
    .select("value")
    .eq("id", "affiliate_reward_rate")
    .single();

  const rateConfig = setting
    ? JSON.parse(setting.value as string)
    : { default: 35, campaign: 50, active: "default" };
  const activeKey: "default" | "campaign" = rateConfig.active === "campaign" ? "campaign" : "default";
  const rewardRate: number = rateConfig[activeKey] ?? rateConfig.default ?? 35;

  const { error: rewardError } = await adminClient
    .from("affiliate_rewards")
    .insert({
      referrer_id: code,
      buyer_id: user.id,
      amount: 0,
      reward_rate: rewardRate,
      status: "pending",
    });

  if (rewardError) {
    console.error("[invite/redeem] insert error:", rewardError);
    return NextResponse.json({ error: "紐付けに失敗しました。もう一度お試しください" }, { status: 500 });
  }

  await adminClient
    .from("users")
    .update({ referral_prompt_shown: true })
    .eq("id", user.id);

  return NextResponse.json({ ok: true });
}
