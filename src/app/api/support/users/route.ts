import { NextResponse } from "next/server";
import { findAuthUserByEmail, normalizeEmail } from "@/lib/authUsers";
import { getSupportAccess } from "@/lib/supportAuth";
import { createAdminClient } from "@/utils/supabase/admin";

type EmailEvent = {
  provider_event_id: string;
  provider_email_id: string | null;
  event_type: string;
  email_kind: string;
  occurred_at: string;
  failure_reason: string | null;
};

function buildDiagnosis(args: {
  hasAuthUser: boolean;
  hasProfile: boolean;
  deletedAt?: string;
  bannedUntil?: string;
  lastSignInAt?: string;
  emailEvents: EmailEvent[];
}) {
  const latest = args.emailEvents[0];
  const failedEvents = new Set(["email.failed", "email.bounced", "email.suppressed"]);
  const currentMessageEvents = latest?.provider_email_id
    ? args.emailEvents.filter((event) => event.provider_email_id === latest.provider_email_id)
    : latest
      ? [latest]
      : [];
  const currentFailure = currentMessageEvents.find((event) => failedEvents.has(event.event_type));
  const currentDelivered = currentMessageEvents.find((event) => event.event_type === "email.delivered");
  const currentClicked = currentMessageEvents.find((event) => event.event_type === "email.clicked");

  if (!args.hasAuthUser && !args.hasProfile) {
    return {
      code: "not_found",
      level: "customer",
      title: "登録が見つかりません",
      detail: "購入時と異なるメールアドレスの可能性があります。購入完了メールの宛先を確認してください。",
      nextAction: "購入時のメールアドレスを確認",
    };
  }

  if (!args.hasAuthUser && args.hasProfile) {
    return {
      code: "auth_missing",
      level: "system",
      title: "認証ユーザーが欠落しています",
      detail: "顧客情報はありますが、Supabase Authにユーザーがありません。システム側の修復が必要です。",
      nextAction: "システム担当へエスカレーション",
    };
  }

  if (args.hasAuthUser && !args.hasProfile) {
    return {
      code: "profile_missing",
      level: "system",
      title: "顧客プロフィールが欠落しています",
      detail: "Supabase Authには存在しますが、顧客プロフィールがありません。購入Webhookの不整合が疑われます。",
      nextAction: "システム担当へエスカレーション",
    };
  }

  if (args.deletedAt || (args.bannedUntil && new Date(args.bannedUntil) > new Date())) {
    return {
      code: "account_blocked",
      level: "system",
      title: "アカウントが利用停止状態です",
      detail: args.deletedAt ? "認証ユーザーが削除状態です。" : "認証ユーザーがBANされています。",
      nextAction: "管理者が停止理由を確認",
    };
  }

  if (currentFailure) {
    return {
      code: "delivery_failed",
      level: "office",
      title: "メール配信に失敗しています",
      detail: currentFailure.failure_reason || "受信側で拒否されたか、配信抑止の対象になっています。",
      nextAction: "メールアドレス・受信設定を確認",
    };
  }

  if (args.lastSignInAt) {
    const signedInAt = new Date(args.lastSignInAt).getTime();
    const latestMailAt = latest ? new Date(latest.occurred_at).getTime() : 0;
    if (!latest || signedInAt >= latestMailAt) {
      return {
        code: "login_succeeded",
        level: "ok",
        title: "ログイン成功履歴があります",
        detail: "認証自体は成功しています。現在の端末・ブラウザ・LINE内ブラウザの利用状況を確認してください。",
        nextAction: "ブラウザと操作手順を案内",
      };
    }
  }

  if (currentClicked) {
    return {
      code: "clicked_not_signed_in",
      level: "office",
      title: "リンククリック後にログインが完了していません",
      detail: "リンククリックは検知されていますが、その後のログイン成功履歴がありません。リンク期限切れやブラウザ切り替えが疑われます。",
      nextAction: "Safari/Chromeを案内し、ログインメールを再送",
    };
  }

  if (currentDelivered) {
    return {
      code: "delivered_not_signed_in",
      level: "customer",
      title: "メールは配信済み・ログイン待ちです",
      detail: "受信側メールサーバーまでは到達しています。迷惑メールフォルダとリンクの有効期限を確認してください。",
      nextAction: "確認後、必要ならログインメールを再送",
    };
  }

  if (latest) {
    return {
      code: "delivery_in_progress",
      level: "customer",
      title: "メール送信処理中です",
      detail: "配信完了イベントをまだ受信していません。少し待ってから更新してください。",
      nextAction: "数分待って再確認",
    };
  }

  return {
    code: "no_delivery_history",
    level: "office",
    title: "メール配信履歴がありません",
    detail: "Resend Webhook導入前のメール、または送信処理が行われていない可能性があります。",
    nextAction: "ログインメールを再送",
  };
}

export async function GET(request: Request) {
  const access = await getSupportAccess();
  if (!access?.canView) {
    return NextResponse.json({ error: "Forbidden" }, { status: access ? 403 : 401 });
  }

  const email = normalizeEmail(new URL(request.url).searchParams.get("email") || "");
  if (!email || email.length > 320 || !email.includes("@")) {
    return NextResponse.json({ error: "有効なメールアドレスを入力してください。" }, { status: 400 });
  }

  try {
    const admin = createAdminClient();
    const authUser = await findAuthUserByEmail(admin, email);

    let profileQuery = admin
      .from("users")
      .select("id, email, role, legal_name, display_name, created_at, updated_at")
      .limit(1);
    profileQuery = authUser ? profileQuery.eq("id", authUser.id) : profileQuery.eq("email", email);
    const { data: profiles, error: profileError } = await profileQuery;
    if (profileError) throw profileError;
    const profile = profiles?.[0] || null;

    const { data: emailEvents, error: emailEventsError } = await admin
      .from("auth_email_events")
      .select("provider_event_id, provider_email_id, event_type, email_kind, occurred_at, failure_reason")
      .eq("recipient_email", email)
      .order("occurred_at", { ascending: false })
      .limit(20);

    const trackingConfigured = !emailEventsError;
    if (emailEventsError) {
      console.warn("[Support Users API] Email event lookup unavailable:", emailEventsError.message);
    }

    const targetUserId = authUser?.id || profile?.id || null;
    const callbackPromise = targetUserId
      ? admin
          .from("auth_callback_events")
          .select("outcome, error_code, request_host, created_at")
          .eq("user_id", targetUserId)
          .order("created_at", { ascending: false })
          .limit(10)
      : Promise.resolve({ data: [], error: null });
    const actionsPromise = admin
      .from("support_action_logs")
      .select("action, result, detail, created_at, actor_user_id")
      .eq("target_email", email)
      .order("created_at", { ascending: false })
      .limit(10);
    const agentPromise = targetUserId && access.canManageAgents
      ? admin
          .from("support_agents")
          .select("enabled, can_view_auth_status, can_resend_login_email, can_repair_profile")
          .eq("user_id", targetUserId)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null });

    const [callbacksResult, actionsResult, agentResult] = await Promise.all([
      callbackPromise,
      actionsPromise,
      agentPromise,
    ]);

    const events = (emailEvents || []) as EmailEvent[];
    const diagnosis = buildDiagnosis({
      hasAuthUser: Boolean(authUser),
      hasProfile: Boolean(profile),
      deletedAt: authUser?.deleted_at,
      bannedUntil: authUser?.banned_until,
      lastSignInAt: authUser?.last_sign_in_at,
      emailEvents: events,
    });

    return NextResponse.json({
      requester: {
        role: access.role,
        isAdmin: access.isAdmin,
        canResend: access.canResend,
        canManageAgents: access.canManageAgents,
      },
      customer: {
        email,
        profile,
        auth: authUser
          ? {
              id: authUser.id,
              createdAt: authUser.created_at,
              confirmationSentAt: authUser.confirmation_sent_at || null,
              emailConfirmedAt: authUser.email_confirmed_at || null,
              lastSignInAt: authUser.last_sign_in_at || null,
              updatedAt: authUser.updated_at || null,
              deletedAt: authUser.deleted_at || null,
              bannedUntil: authUser.banned_until || null,
            }
          : null,
        emailEvents: events,
        callbackEvents: callbacksResult.data || [],
        supportActions: actionsResult.data || [],
        supportAgent: agentResult.data || null,
      },
      diagnosis,
      trackingConfigured,
    });
  } catch (error) {
    console.error("[Support Users API] Failed:", error);
    return NextResponse.json({ error: "顧客情報の取得に失敗しました。" }, { status: 500 });
  }
}
