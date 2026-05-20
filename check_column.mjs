import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

// .env.local を手動読み込み
const envContent = readFileSync(".env.local", "utf-8");
const env = {};
envContent.split("\n").forEach(line => {
  const [key, ...vals] = line.split("=");
  if (key && vals.length) env[key.trim()] = vals.join("=").trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

// display_name カラムを追加するSQLをRPC経由で実行するのは難しいので、
// ダミーのupdateを試して、エラーにならなければカラムがあるか、
// カラムが無ければREST API等で追加...というのは難しい。
// 代わりに、直接SQLを実行できるか試すか、あるいはエラーメッセージから判断する。
// とりあえず1件取得して、display_nameが含まれるか確認
async function checkAndAddColumn() {
  const { data, error } = await supabase.from("users").select("display_name").limit(1);
  if (error) {
    console.log("おそらくカラムがありません。エラー:", error.message);
    // カラムを追加するSQLをrpcで実行できるか？
    // pgcrypto等がないと無理かも。
    // 今回は、エラー内容を確認するためにこのスクリプトを使います。
  } else {
    console.log("カラムは既に存在します:", data);
  }
}

checkAndAddColumn();
