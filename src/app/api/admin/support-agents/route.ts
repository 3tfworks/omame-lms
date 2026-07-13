import { NextResponse } from "next/server";
import { findAuthUserByEmail, normalizeEmail } from "@/lib/authUsers";
import { getSupportAccess } from "@/lib/supportAuth";
import { createAdminClient } from "@/utils/supabase/admin";

export async function PUT(request: Request) {
  const access = await getSupportAccess();
  if (!access?.canManageAgents) {
    return NextResponse.json({ error: "Only owner can manage support access" }, { status: access ? 403 : 401 });
  }

  const body = await request.json().catch(() => null);
  const email = normalizeEmail(body?.email || "");
  const enabled = body?.enabled === true;
  const canResend = body?.canResend !== false;
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "有効なメールアドレスを入力してください。" }, { status: 400 });
  }

  try {
    const admin = createAdminClient();
    const authUser = await findAuthUserByEmail(admin, email);
    if (!authUser) {
      return NextResponse.json({ error: "対象ユーザーが見つかりません。" }, { status: 404 });
    }

    const { data: profile } = await admin.from("users").select("id, role").eq("id", authUser.id).maybeSingle();
    if (!profile) {
      return NextResponse.json({ error: "対象ユーザーのプロフィールがありません。" }, { status: 409 });
    }
    if (profile.role === "owner" || profile.role === "admin") {
      return NextResponse.json({ error: "管理者はサポート画面を常に利用できます。" }, { status: 400 });
    }

    const { error } = await admin.from("support_agents").upsert(
      {
        user_id: authUser.id,
        enabled,
        can_view_auth_status: enabled,
        can_resend_login_email: enabled && canResend,
        can_repair_profile: false,
        created_by: access.userId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
    if (error) throw error;

    await admin.from("support_action_logs").insert({
      actor_user_id: access.userId,
      target_user_id: authUser.id,
      target_email: email,
      action: enabled ? "grant_support_access" : "revoke_support_access",
      result: "success",
      detail: enabled ? `resend=${canResend}` : null,
    });

    return NextResponse.json({ message: enabled ? "事務担当アクセスを付与しました。" : "事務担当アクセスを停止しました。" });
  } catch (error) {
    console.error("[Admin Support Agents API] Failed:", error);
    return NextResponse.json({ error: "サポート権限の更新に失敗しました。" }, { status: 500 });
  }
}
