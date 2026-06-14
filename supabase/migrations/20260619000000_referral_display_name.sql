-- サロンメンバーが「招待状に出す名前」を display_name とは別に上書きできるようにする。
--
-- 運用:
--   referral_display_name が NULL → 招待状には display_name を表示（フォールバック）
--   referral_display_name に値あり → 招待状にはこちらを表示（上書き）
--   空入力で保存 → NULL に正規化して上書き解除（display_name に戻る）
--
-- 更新は SECURITY DEFINER RPC で「自分の行の referral_display_name 列のみ」。
-- users 全体の UPDATE ポリシーは開けず（role / referred_by 等の権限昇格を防止）、
-- bank_info / display_name と同じ安全パターンを踏襲する。

alter table public.users
  add column if not exists referral_display_name text;

create or replace function public.update_my_referral_display_name(new_name text)
returns void
language plpgsql
security definer
-- 関数実行中の検索パスを固定し、search_path 乗っ取りを防ぐ
set search_path = public
as $$
declare
  caller  uuid := auth.uid();
  -- 空文字・空白のみは NULL 扱い（＝上書き解除し display_name にフォールバック）
  trimmed text := nullif(btrim(new_name), '');
begin
  -- 未認証（auth.uid() が無い）コンテキストからは実行させない
  if caller is null then
    raise exception 'AUTH_REQUIRED' using errcode = '28000';
  end if;
  -- 値がある場合のみ長さ・制御文字を検証（NULL=解除は常に許可）
  if trimmed is not null and char_length(trimmed) > 20 then
    raise exception 'NAME_TOO_LONG' using errcode = '22000';
  end if;
  if trimmed is not null and trimmed ~ '[\n\r\t]' then
    raise exception 'NAME_INVALID' using errcode = '22000';
  end if;

  -- 呼び出し本人の行の referral_display_name のみを更新する。
  update public.users
     set referral_display_name = trimmed,
         updated_at            = timezone('utc'::text, now())
   where id = caller;
end;
$$;

-- 既定で付与され得る PUBLIC / anon の実行権限を剥がし、authenticated にのみ許可する
revoke all on function public.update_my_referral_display_name(text) from public;
revoke all on function public.update_my_referral_display_name(text) from anon;
grant execute on function public.update_my_referral_display_name(text) to authenticated;
