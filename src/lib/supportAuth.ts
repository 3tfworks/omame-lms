import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

export type SupportAccess = {
  userId: string;
  role: string;
  isAdmin: boolean;
  canView: boolean;
  canResend: boolean;
  canRepair: boolean;
  canManageAgents: boolean;
};

export async function getSupportAccess(): Promise<SupportAccess | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const admin = createAdminClient();
  const { data: profile, error: profileError } = await admin
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) return null;

  const isAdmin = profile.role === "owner" || profile.role === "admin";
  if (isAdmin) {
    return {
      userId: user.id,
      role: profile.role,
      isAdmin: true,
      canView: true,
      canResend: true,
      canRepair: true,
      canManageAgents: profile.role === "owner",
    };
  }

  const { data: agent, error: agentError } = await admin
    .from("support_agents")
    .select("enabled, can_view_auth_status, can_resend_login_email, can_repair_profile")
    .eq("user_id", user.id)
    .maybeSingle();

  if (agentError || !agent?.enabled || !agent.can_view_auth_status) return null;

  return {
    userId: user.id,
    role: profile.role,
    isAdmin: false,
    canView: true,
    canResend: agent.can_resend_login_email,
    canRepair: agent.can_repair_profile,
    canManageAgents: false,
  };
}
