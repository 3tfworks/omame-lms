import type { User } from "@supabase/supabase-js";
import { createAdminClient } from "@/utils/supabase/admin";

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function findAuthUserByEmail(
  admin: ReturnType<typeof createAdminClient>,
  email: string,
): Promise<User | null> {
  const target = normalizeEmail(email);
  const perPage = 1000;
  let page = 1;

  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const match = data.users.find((user) => normalizeEmail(user.email || "") === target);
    if (match) return match;

    if (!data.nextPage || data.users.length < perPage) return null;
    page = data.nextPage;
  }
}
