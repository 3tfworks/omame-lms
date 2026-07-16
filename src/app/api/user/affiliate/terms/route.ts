import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import {
  AFFILIATE_CONFIRMATIONS,
  AFFILIATE_TERMS_VERSION,
  createAffiliateTermsSnapshot,
  type AffiliateConfirmationId,
} from "@/lib/affiliateProgram";

const VALID_ROLES = ["salon_member", "owner", "admin"];

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();
    if (!profile || !VALID_ROLES.includes(profile.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json().catch(() => null) as {
      termsVersion?: unknown;
      confirmations?: unknown;
      fullTermsAccepted?: unknown;
    } | null;
    if (body?.termsVersion !== AFFILIATE_TERMS_VERSION) {
      return NextResponse.json(
        { error: "規約が更新されています。画面を再読み込みしてご確認ください。" },
        { status: 409 },
      );
    }

    if (!body.confirmations || typeof body.confirmations !== "object") {
      return NextResponse.json({ error: "すべての重要事項をご確認ください。" }, { status: 400 });
    }
    const submitted = body.confirmations as Partial<Record<AffiliateConfirmationId, unknown>>;
    const allConfirmed = AFFILIATE_CONFIRMATIONS.every(({ id }) => submitted[id] === true);
    if (!allConfirmed || body.fullTermsAccepted !== true) {
      return NextResponse.json({ error: "すべての重要事項をご確認ください。" }, { status: 400 });
    }

    const confirmations: Record<string, { confirmed: boolean; text: string }> = Object.fromEntries(
      AFFILIATE_CONFIRMATIONS.map(({ id, checkbox }) => [id, { confirmed: true, text: checkbox }]),
    );
    confirmations.full_terms = {
      confirmed: true,
      text: "お豆メッセンジャープログラム利用規約を確認し、内容に同意します",
    };
    const { data: existing } = await supabase
      .from("affiliate_terms_acceptances")
      .select("accepted_at")
      .eq("user_id", user.id)
      .eq("terms_version", AFFILIATE_TERMS_VERSION)
      .maybeSingle();
    if (existing) {
      return NextResponse.json({
        success: true,
        termsVersion: AFFILIATE_TERMS_VERSION,
        acceptedAt: existing.accepted_at,
      });
    }

    const { data, error } = await supabase
      .from("affiliate_terms_acceptances")
      .insert({
        user_id: user.id,
        terms_version: AFFILIATE_TERMS_VERSION,
        confirmations,
        terms_snapshot: createAffiliateTermsSnapshot(),
      })
      .select("accepted_at")
      .single();

    if (error) {
      console.error("[Affiliate Terms API] Failed to save acceptance:", error);
      return NextResponse.json({ error: "同意内容を保存できませんでした。" }, { status: 500 });
    }
    return NextResponse.json({
      success: true,
      termsVersion: AFFILIATE_TERMS_VERSION,
      acceptedAt: data.accepted_at,
    });
  } catch (error) {
    console.error("[Affiliate Terms API] Unhandled error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
