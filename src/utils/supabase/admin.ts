import { createClient } from "@supabase/supabase-js";

// このクライアントはサーバーサイド専用であり、Service Role Keyを使用して
// RLS(Row Level Security)をバイパスして強制的なDB操作を行います。
// ※クライアント(ブラウザ)側には絶対にエクスポートしないでください。
export const createAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables."
    );
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
