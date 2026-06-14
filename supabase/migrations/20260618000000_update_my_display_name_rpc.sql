-- ログインユーザー自身の display_name のみを安全に更新する RPC。
--
-- ■ なぜ RPC（SECURITY DEFINER）なのか
--   public.users には UPDATE 用の RLS ポリシーが無い（role / referred_by 等の
--   権限昇格を防ぐため、あえて開けていない）。そのため bank_info と同じく、
--   「自分の行の display_name カラムだけ」を更新する処理を SECURITY DEFINER 関数に
--   閉じ込め、authenticated ロールにのみ EXECUTE を許可する。
--   これにより users 全体の UPDATE を開けずに、自分の表示名だけ安全に更新できる。
--
-- ■ 検証の二重化
--   API（Node）側でも validateDisplayName で検証するが、DB 側にも最小限の検証
--   （trim・1〜20文字・改行/制御文字禁止）を置き、直接 RPC を叩かれても壊れないようにする。

create or replace function public.update_my_display_name(new_name text)
returns void
language plpgsql
security definer
-- 関数実行中の検索パスを固定し、search_path 乗っ取りを防ぐ
set search_path = public
as $$
declare
  caller  uuid := auth.uid();
  trimmed text := btrim(new_name);
begin
  -- 未認証（auth.uid() が無い）コンテキストからは実行させない
  if caller is null then
    raise exception 'AUTH_REQUIRED' using errcode = '28000';
  end if;
  -- 空白のみ・空文字は不可
  if trimmed is null or trimmed = '' then
    raise exception 'NAME_REQUIRED' using errcode = '22000';
  end if;
  -- 上限 20 文字
  if char_length(trimmed) > 20 then
    raise exception 'NAME_TOO_LONG' using errcode = '22000';
  end if;
  -- 改行・タブ等の制御文字を禁止
  if trimmed ~ '[\n\r\t]' then
    raise exception 'NAME_INVALID' using errcode = '22000';
  end if;

  -- 呼び出し本人の行の display_name のみを更新する。
  -- WHERE 句が auth.uid() に固定されているため、他人の行は対象にならない。
  update public.users
     set display_name = trimmed,
         updated_at   = timezone('utc'::text, now())
   where id = caller;
end;
$$;

-- 既定で付与され得る PUBLIC / anon の実行権限を剥がし、authenticated にのみ許可する
revoke all on function public.update_my_display_name(text) from public;
revoke all on function public.update_my_display_name(text) from anon;
grant execute on function public.update_my_display_name(text) to authenticated;
