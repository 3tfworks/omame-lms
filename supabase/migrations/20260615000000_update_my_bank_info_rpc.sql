-- アフィリエイト還元の振込先（users.bank_info）を、ログインユーザー自身の行に限り
-- 安全に更新するための RPC を定義する。
--
-- ■ なぜ RPC（SECURITY DEFINER）なのか
--   public.users には UPDATE 用の RLS ポリシーが存在しない。そのため従来は API ルートが
--   service role（createAdminClient）で RLS をバイパスして bank_info を更新しており、
--   「自分の行だけ」「bank_info カラムだけ」という制約がアプリ層にしか無かった（防御が一重）。
--
--   かといって users に素朴な `for update using (auth.uid() = id)` を足すと、ユーザーが
--   自分の行の role や referred_by まで書き換えられてしまう（権限昇格のリスク）。
--
--   そこで「bank_info カラムだけ」を「auth.uid() の行だけ」更新する処理を SECURITY DEFINER の
--   関数に閉じ込め、authenticated ロールにのみ EXECUTE を許可する。これにより、
--   service role を使わずとも DB レベルで「他人の bank_info を書けない／他カラムを触れない」
--   ことが担保される。

create or replace function public.update_my_bank_info(new_bank_info jsonb)
returns void
language plpgsql
security definer
-- 関数実行中の検索パスを固定し、search_path 乗っ取りを防ぐ
set search_path = public
as $$
declare
  caller uuid := auth.uid();
begin
  -- 未認証（auth.uid() が無い）コンテキストからは実行させない
  if caller is null then
    raise exception 'AUTH_REQUIRED' using errcode = '28000';
  end if;

  -- 呼び出し本人の行の bank_info カラムのみを更新する。
  -- WHERE 句が auth.uid() に固定されているため、他人の行は対象にならない。
  update public.users
     set bank_info = new_bank_info,
         updated_at = timezone('utc'::text, now())
   where id = caller;
end;
$$;

-- 既定で付与され得る PUBLIC / anon の実行権限を剥がし、authenticated にのみ許可する
revoke all on function public.update_my_bank_info(jsonb) from public;
revoke all on function public.update_my_bank_info(jsonb) from anon;
grant execute on function public.update_my_bank_info(jsonb) to authenticated;
