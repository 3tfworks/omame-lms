import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    // 1. リクエストボディの取得 (会費ペイからのPOSTデータ)
    // ※会費ペイからのデータがJSONかFormデータかによって適宜パースします。
    // 今回は一般的なJSONを想定します。
    const body = await request.json();
    console.log("[Kaihipay Webhook] Received body:", body);

    // TODO: ここで本来は会費ペイからのWebhookであることを検証するシークレットキーのチェックを入れます
    // const secret = request.headers.get("x-kaihipay-signature");

    // 会費ペイ側で設定した項目（名前、メールアドレスなど）
    const email = body.email;
    const name = body.name || body.lastName + " " + body.firstName;
    const planId = body.plan_id; // コースやプランの識別子

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();

    // 2. ユーザーが既に存在するかチェック
    const { data: existingUsers, error: searchError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (searchError) {
       console.error("[Kaihipay Webhook] Error fetching users:", searchError);
       return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

    const isExistingUser = existingUsers.users.find(u => u.email === email);

    if (isExistingUser) {
      console.log(`[Kaihipay Webhook] User already exists: ${email}`);
      // 既にユーザーがいる場合は、ロールのアップデートだけ行う（必要に応じて）
      // 例: 動画購入者からサロンメンバーへのアップグレードなど
      return NextResponse.json({ message: "User already exists. Updated roles if necessary." });
    }

    // 3. 新規ユーザーの作成 (Auth)
    // パスワードはランダム生成（マジックリンクでログインさせるため、パスワードは使用しない）
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

    // 4. public.users テーブルへのレコード作成
    // プランIDに応じて Role を決定する（動画のみなら'user'、サロンなら'salon_member'など）
    const role = (planId === "salon_plan_id") ? "salon_member" : "user";

    const { error: dbError } = await supabaseAdmin.from("users").insert({
      id: userId,
      email: email,
      role: role,
    });

    if (dbError) {
      console.error("[Kaihipay Webhook] Error inserting to public.users:", dbError);
      // Authの作成には成功したがDBへのINSERTに失敗した場合のリトライ処理等が本来は必要です
      return NextResponse.json(
        { error: "Failed to create user profile" },
        { status: 500 }
      );
    }

    console.log(`[Kaihipay Webhook] Successfully created user: ${email} (ID: ${userId})`);

    // 5. 成功レスポンスを返す（会費ペイ側でエラーにならないように200を返す）
    return NextResponse.json({ message: "Webhook processed successfully" }, { status: 200 });

  } catch (error: any) {
    console.error("[Kaihipay Webhook] Unhandled Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
