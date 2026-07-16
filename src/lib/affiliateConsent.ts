import type { SupabaseClient } from "@supabase/supabase-js";
import { AFFILIATE_TERMS_VERSION } from "@/lib/affiliateProgram";
import { createAdminClient } from "@/utils/supabase/admin";

export async function hasAcceptedCurrentAffiliateTerms(
  userId: string,
  client?: SupabaseClient,
): Promise<boolean> {
  if (!userId) return false;
  const supabase = client ?? createAdminClient();
  const { data, error } = await supabase
    .from("affiliate_terms_acceptances")
    .select("id")
    .eq("user_id", userId)
    .eq("terms_version", AFFILIATE_TERMS_VERSION)
    .maybeSingle();

  if (error) {
    console.error("[Affiliate Consent] Failed to read acceptance:", error);
    return false;
  }
  return Boolean(data);
}
