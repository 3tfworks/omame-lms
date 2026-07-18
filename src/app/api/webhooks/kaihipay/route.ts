import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { getAffiliateRewardRate } from "@/lib/affiliateRate";
import { getValidReferrer } from "@/lib/invite";
import { findAuthUserByEmail } from "@/lib/authUsers";
import { getAffiliateAttributionCutoff } from "@/lib/affiliateAttribution";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    // 1. セキュリティ検証 (URLの?token=XXXが一致するか確認)
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    const secret = process.env.KAIHIPAY_WEBHOOK_SECRET;

    if (!secret || token !== secret) {
      console.warn("[Kaihipay Webhook] Unauthorized access attempt.");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. リクエストボディの取得 (会費ペイからのPOSTデータ)
    const body = await request.json().catch(() => ({}));
    console.log("[Kaihipay Webhook] Received body:", JSON.stringify(body));

    // 会費ペイ側で設定した項目（名前、メールアドレスなど）
    const email = body.email || body.mail || body.MailAddress; 
    const name = body.name || (body.last_name ? body.last_name + " " + body.first_name : "受講生");
    
    // コース情報の取得
    let planId = body.plan_id || body.PlanId;
    let courseName = "";
    if (body.contracted_courses && body.contracted_courses.length > 0) {
      planId = body.contracted_courses[0].course_id;
      courseName = body.contracted_courses[0].course_name;
    }

    console.log(`[Kaihipay Webhook] Parsed data - Email: ${email}, Name: ${name}, Course: ${courseName}`);

    if (!email) {
      console.error("[Kaihipay Webhook] Error: Email is missing in payload.");
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();

    // 3. ユーザーが既に存在するかチェック
    // 全ページを検索し、ユーザー数が50名を超えても既存ユーザーを見落とさない。
    const isExistingUser = await findAuthUserByEmail(supabaseAdmin, email);

    if (isExistingUser) {
      console.log(`[Kaihipay Webhook] User already exists: ${email}`);
      return NextResponse.json({ message: "User already exists. Skipping creation." });
    }

    // 4. 新規ユーザーの作成 (Auth)
    const randomPassword = crypto.randomBytes(16).toString("hex") + "aA1!";

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: randomPassword,
      email_confirm: true, // 自動的に確認済みにする
      user_metadata: {
        full_name: name,
      },
    });

    if (authError) {
      console.error("[Kaihipay Webhook] Error creating auth user:", authError);
      return NextResponse.json(
        { error: "Failed to create user account" },
        { status: 500 }
      );
    }

    const userId = authData.user.id;

    // 5. public.users テーブルへのレコード作成
    const role = (planId && String(planId).includes("salon")) ? "salon_member" : "user";

    const { error: dbError } = await supabaseAdmin.from("users").insert({
      id: userId,
      email: email,
      role: role,
    });

    if (dbError) {
      console.error("[Kaihipay Webhook] Error inserting to public.users:", dbError);
      return NextResponse.json(
        { error: "Failed to create user profile" },
        { status: 500 }
      );
    }

    // 6. アフィリエイト報酬の記録（失敗してもユーザー作成は成功扱い）
    try {
      const paymentAmount: number =
        body.amount ??
        body.price ??
        body.total_price ??
        body.total_amount ??
        body.contracted_courses?.[0]?.price ??
        0;

      if (paymentAmount > 0) {
        // 会費ペイの通知には確実な決済日時がないため、通知受信時刻から30日以内に
        // 登録された紹介フォームだけを成果の候補にする。
        const attributionCutoff = getAffiliateAttributionCutoff().toISOString();
        const { data: lead } = await supabaseAdmin
          .from("invite_leads")
          .select("id, referrer_id")
          .eq("email", email.trim().toLowerCase())
          .eq("converted", false)
          .gte("created_at", attributionCutoff)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (lead && await getValidReferrer(lead.referrer_id)) {
          // 会費ペイの payload に確実な決済日時が無いため、webhook 受信時刻を基準に判定する。
          const { rate: rewardRate } = await getAffiliateRewardRate(
            new Date(),
            supabaseAdmin,
          );
          const rewardAmount = Math.floor((paymentAmount * rewardRate) / 100);

          const { error: rewardError } = await supabaseAdmin
            .from("affiliate_rewards")
            .insert({
              referrer_id: lead.referrer_id,
              buyer_id: userId,
              amount: rewardAmount,
              reward_rate: rewardRate,
              status: "pending",
            });

          if (rewardError) {
            console.error("[Kaihipay Webhook] Failed to insert affiliate reward:", rewardError);
          } else {
            await supabaseAdmin
              .from("invite_leads")
              .update({ converted: true })
              .eq("id", lead.id);

            console.log(`[Kaihipay Webhook] Affiliate reward recorded: referrer=${lead.referrer_id}, amount=${rewardAmount}, rate=${rewardRate}%`);
          }
        } else if (lead) {
          console.warn(
            `[Kaihipay Webhook] Affiliate reward skipped because referrer is not currently eligible: referrer=${lead.referrer_id}`,
          );
          await supabaseAdmin.from("invite_leads").update({ converted: true }).eq("id", lead.id);
        }
      }
    } catch (affiliateErr) {
      console.error("[Kaihipay Webhook] Affiliate reward step failed:", affiliateErr);
    }

    // 7. 完了のご案内メール（Magic Link）を自動送信する
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://omamepiano.com";
    const redirectUrl = `${siteUrl}/api/auth/callback?next=/ja/lms`;
    
    const { error: otpError } = await supabaseAdmin.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (otpError) {
      console.error("[Kaihipay Webhook] Error sending magic link:", otpError);
      // メールの送信に失敗しても、ユーザー作成自体は成功しているので200を返す
    }

    if (!otpError) {
      console.log(`[Kaihipay Webhook] Successfully created user and requested Magic Link: ${email} (ID: ${userId})`);
    }

    // 8. 成功レスポンスを返す（会費ペイ側でエラーにならないように200を返す）
    return NextResponse.json({ message: "Webhook processed successfully" }, { status: 200 });

  } catch (error) {
    console.error("[Kaihipay Webhook] Unhandled Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
