import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

// キャンペーン期間（campaign_periods）の管理 API。
// 報酬率の「日付スケジュール方式」を運用するための CRUD。
//
// 認可: owner / admin のみ。書き込みは service-role クライアント（RLS バイパス）で行う。
//  ※ campaign_periods には書込 RLS ポリシーを置かず、本 API の役割チェックで担保する設計。
// 重複防止: アプリ層でプリチェックして親切なエラーを返しつつ、DB の EXCLUDE 制約（23P01）でも
//  二重に守る。

// owner / admin かどうかを判定。OK なら admin クライアントを返し、NG なら NextResponse を返す。
async function authorizeAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const supabaseAdmin = createAdminClient();
  const { data: requester } = await supabaseAdmin
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!requester || (requester.role !== "owner" && requester.role !== "admin")) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { supabaseAdmin };
}

type CampaignInput = {
  name?: unknown;
  start_at?: unknown;
  end_at?: unknown;
  reward_rate?: unknown;
  is_active?: unknown;
};

type NormalizedCampaign = {
  name: string;
  start_at: string;
  end_at: string;
  reward_rate: number;
  is_active: boolean;
};

// 入力のバリデーション＋正規化。OK なら value、NG なら message を返す。
function validateCampaign(body: CampaignInput):
  | { ok: true; value: NormalizedCampaign }
  | { ok: false; message: string } {
  const { name, start_at, end_at, reward_rate, is_active } = body;

  if (typeof name !== "string" || !name.trim()) {
    return { ok: false, message: "キャンペーン名を入力してください" };
  }
  if (typeof start_at !== "string" || typeof end_at !== "string") {
    return { ok: false, message: "開始日時・終了日時を指定してください" };
  }
  const start = new Date(start_at);
  const end = new Date(end_at);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return { ok: false, message: "日時の形式が正しくありません" };
  }
  if (start >= end) {
    return { ok: false, message: "開始日時は終了日時より前にしてください" };
  }
  if (
    typeof reward_rate !== "number" ||
    !Number.isInteger(reward_rate) ||
    reward_rate < 1 ||
    reward_rate > 100
  ) {
    return { ok: false, message: "報酬率は1〜100の整数で指定してください" };
  }

  return {
    ok: true,
    value: {
      name: name.trim(),
      start_at: start.toISOString(),
      end_at: end.toISOString(),
      reward_rate,
      is_active: typeof is_active === "boolean" ? is_active : true,
    },
  };
}

// 有効キャンペーン同士の期間重複をアプリ層でプリチェック（excludeId は自分自身を除外）。
// 重なり条件: 既存.start_at < 新.end_at AND 既存.end_at > 新.start_at
async function hasActiveOverlap(
  supabaseAdmin: ReturnType<typeof createAdminClient>,
  start_at: string,
  end_at: string,
  excludeId?: string,
): Promise<boolean> {
  let query = supabaseAdmin
    .from("campaign_periods")
    .select("id")
    .eq("is_active", true)
    .lt("start_at", end_at)
    .gt("end_at", start_at);

  if (excludeId) query = query.neq("id", excludeId);

  const { data } = await query.limit(1);
  return !!(data && data.length > 0);
}

// Postgres の排他制約違反（23P01）かどうか。
function isExclusionViolation(error: unknown): boolean {
  return !!error && typeof error === "object" && "code" in error && (error as { code?: string }).code === "23P01";
}

// GET: 全キャンペーンを start_at 降順で返す（過去・現在・未来をまとめて）。
export async function GET() {
  try {
    const auth = await authorizeAdmin();
    if (auth.error) return auth.error;
    const { supabaseAdmin } = auth;

    const { data: campaigns, error } = await supabaseAdmin
      .from("campaign_periods")
      .select("*")
      .order("start_at", { ascending: false });

    if (error) {
      console.error("[Admin Campaign API] Fetch Error:", error);
      return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
    }

    return NextResponse.json({ campaigns: campaigns ?? [] });
  } catch (error) {
    console.error("[Admin Campaign API] Unhandled Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: 新規キャンペーン作成。
export async function POST(request: Request) {
  try {
    const auth = await authorizeAdmin();
    if (auth.error) return auth.error;
    const { supabaseAdmin } = auth;

    const body = await request.json().catch(() => ({}));
    const v = validateCampaign(body);
    if (!v.ok) return NextResponse.json({ error: v.message }, { status: 400 });

    if (v.value.is_active && (await hasActiveOverlap(supabaseAdmin, v.value.start_at, v.value.end_at))) {
      return NextResponse.json(
        { error: "他の有効なキャンペーンと期間が重複しています" },
        { status: 400 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from("campaign_periods")
      .insert(v.value)
      .select()
      .single();

    if (error) {
      if (isExclusionViolation(error)) {
        return NextResponse.json(
          { error: "他の有効なキャンペーンと期間が重複しています" },
          { status: 400 },
        );
      }
      console.error("[Admin Campaign API] Insert Error:", error);
      return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 });
    }

    return NextResponse.json({ campaign: data });
  } catch (error) {
    console.error("[Admin Campaign API] Unhandled Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT: 既存キャンペーンの編集・停止（is_active 切替含む）。body に id 必須。
export async function PUT(request: Request) {
  try {
    const auth = await authorizeAdmin();
    if (auth.error) return auth.error;
    const { supabaseAdmin } = auth;

    const body = await request.json().catch(() => ({}));
    const { id } = body;
    if (typeof id !== "string" || !id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const v = validateCampaign(body);
    if (!v.ok) return NextResponse.json({ error: v.message }, { status: 400 });

    if (v.value.is_active && (await hasActiveOverlap(supabaseAdmin, v.value.start_at, v.value.end_at, id))) {
      return NextResponse.json(
        { error: "他の有効なキャンペーンと期間が重複しています" },
        { status: 400 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from("campaign_periods")
      .update(v.value)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (isExclusionViolation(error)) {
        return NextResponse.json(
          { error: "他の有効なキャンペーンと期間が重複しています" },
          { status: 400 },
        );
      }
      console.error("[Admin Campaign API] Update Error:", error);
      return NextResponse.json({ error: "Failed to update campaign" }, { status: 500 });
    }

    return NextResponse.json({ campaign: data });
  } catch (error) {
    console.error("[Admin Campaign API] Unhandled Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE: キャンペーン削除。body に id 必須。
export async function DELETE(request: Request) {
  try {
    const auth = await authorizeAdmin();
    if (auth.error) return auth.error;
    const { supabaseAdmin } = auth;

    const body = await request.json().catch(() => ({}));
    const { id } = body;
    if (typeof id !== "string" || !id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from("campaign_periods").delete().eq("id", id);

    if (error) {
      console.error("[Admin Campaign API] Delete Error:", error);
      return NextResponse.json({ error: "Failed to delete campaign" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Admin Campaign API] Unhandled Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
