import { NextResponse } from "next/server";
import { findAuthUserByEmail, normalizeEmail } from "@/lib/authUsers";
import { getSupportAccess } from "@/lib/supportAuth";
import { createAdminClient } from "@/utils/supabase/admin";

function isValidEmail(email: string) {
  return email.length <= 320 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  const access = await getSupportAccess();
  if (!access?.canRepair) {
    return NextResponse.json({ error: "Forbidden" }, { status: access ? 403 : 401 });
  }

  const body = await request.json().catch(() => null);
  const currentEmail = normalizeEmail(body?.currentEmail || "");
  const newEmail = normalizeEmail(body?.newEmail || "");
  const customerConfirmed = body?.customerConfirmed === true;

  if (!isValidEmail(currentEmail) || !isValidEmail(newEmail)) {
    return NextResponse.json({ error: "有効なメールアドレスを入力してください。" }, { status: 400 });
  }
  if (currentEmail === newEmail) {
    return NextResponse.json({ error: "現在と異なるメールアドレスを入力してください。" }, { status: 400 });
  }
  if (!customerConfirmed) {
    return NextResponse.json({ error: "お客様本人の変更希望を確認してください。" }, { status: 400 });
  }

  const admin = createAdminClient();
  let targetUserId: string | null = null;

  try {
    const currentUser = await findAuthUserByEmail(admin, currentEmail);
    if (!currentUser) {
      return NextResponse.json({ error: "現在のメールアドレスに対応するユーザーが見つかりません。" }, { status: 404 });
    }
    targetUserId = currentUser.id;

    const [duplicateAuth, profileResult, duplicateProfileResult] = await Promise.all([
      findAuthUserByEmail(admin, newEmail),
      admin.from("users").select("id, email").eq("id", currentUser.id).maybeSingle(),
      admin.from("users").select("id").eq("email", newEmail).neq("id", currentUser.id).limit(1),
    ]);

    if (duplicateAuth && duplicateAuth.id !== currentUser.id) {
      return NextResponse.json({ error: "変更先のメールアドレスは、別のアカウントで使用されています。" }, { status: 409 });
    }
    if (duplicateProfileResult.data?.length) {
      return NextResponse.json({ error: "変更先のメールアドレスは、別の顧客情報で使用されています。" }, { status: 409 });
    }
    if (profileResult.error || !profileResult.data) {
      return NextResponse.json({ error: "顧客プロフィールが見つからないため、変更できません。" }, { status: 409 });
    }

    const { error: authError } = await admin.auth.admin.updateUserById(currentUser.id, {
      email: newEmail,
      email_confirm: true,
    });
    if (authError) throw authError;

    const { error: profileError } = await admin
      .from("users")
      .update({ email: newEmail, updated_at: new Date().toISOString() })
      .eq("id", currentUser.id);

    if (profileError) {
      const { error: rollbackError } = await admin.auth.admin.updateUserById(currentUser.id, {
        email: currentEmail,
        email_confirm: true,
      });
      if (rollbackError) {
        console.error("[Support Change Email API] Auth rollback failed:", rollbackError);
      }
      throw profileError;
    }

    await admin.from("support_action_logs").insert({
      actor_user_id: access.userId,
      target_user_id: currentUser.id,
      target_email: newEmail,
      action: "change_customer_email",
      result: "success",
      detail: `${currentEmail} -> ${newEmail}`.slice(0, 500),
    });

    return NextResponse.json({
      message: "登録メールアドレスを変更しました。続けて新しいアドレスへログインメールを送信してください。",
      email: newEmail,
    });
  } catch (error) {
    console.error("[Support Change Email API] Failed:", error);
    await admin.from("support_action_logs").insert({
      actor_user_id: access.userId,
      target_user_id: targetUserId,
      target_email: currentEmail || newEmail || "unknown",
      action: "change_customer_email",
      result: "failure",
      detail: error instanceof Error ? error.message.slice(0, 500) : "unknown_error",
    });
    return NextResponse.json({ error: "登録メールアドレスの変更に失敗しました。システム担当へ連絡してください。" }, { status: 500 });
  }
}
