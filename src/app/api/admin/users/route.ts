import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

// ユーザー一覧の取得（owner/adminのみ）
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // リクエスト者のロールを確認
    const supabaseAdmin = createAdminClient();
    const { data: requester } = await supabaseAdmin
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!requester || (requester.role !== "owner" && requester.role !== "admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 全ユーザーを取得
    const { data: users, error } = await supabaseAdmin
      .from("users")
      .select("id, email, role, display_name, created_at")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[Admin Users API] Error fetching users:", error);
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }

    return NextResponse.json({
      users,
      requesterRole: requester.role, // フロントでUI出し分けに使う
    });
  } catch (error) {
    console.error("[Admin Users API] Unhandled error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ユーザーのロール・名前変更（owner/admin可、ただしrole変更はownerのみ）
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseAdmin = createAdminClient();
    const { data: requester } = await supabaseAdmin
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!requester || (requester.role !== "owner" && requester.role !== "admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { targetUserId, newRole, newDisplayName } = body;

    if (!targetUserId) {
      return NextResponse.json({ error: "targetUserId is required" }, { status: 400 });
    }

    // 更新データの構築
    const updateData: any = { updated_at: new Date().toISOString() };

    // 名前の更新（adminもownerも可能）
    if (newDisplayName !== undefined) {
      updateData.display_name = newDisplayName;
    }

    // ロールの更新（ownerのみ可能）
    if (newRole !== undefined) {
      if (requester.role !== "owner") {
        return NextResponse.json({ error: "Only owner can change roles" }, { status: 403 });
      }
      
      const validRoles = ["user", "salon_member", "admin", "owner"];
      if (!validRoles.includes(newRole)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
      }
      if (targetUserId === user.id) {
        return NextResponse.json({ error: "Cannot change your own role" }, { status: 400 });
      }
      
      updateData.role = newRole;
    }

    // 何も更新するデータがない場合
    if (Object.keys(updateData).length === 1) { // updated_atのみ
      return NextResponse.json({ message: "No changes requested" });
    }

    // ロールと名前を更新
    const { error } = await supabaseAdmin
      .from("users")
      .update(updateData)
      .eq("id", targetUserId);

    if (error) {
      console.error("[Admin Users API] Error updating role:", error);
      return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
    }

    return NextResponse.json({ message: "Role updated successfully" });
  } catch (error) {
    console.error("[Admin Users API] Unhandled error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
