-- 購入者管理用の本名（legal_name）を users に追加する。
--
-- 方針:
--   legal_name   : 購入者管理・問い合わせ対応用。受講画面や招待状には表示しない。
--   display_name : LMS 画面で使うニックネーム。
--   referral_display_name : サロンメンバーの招待状など、紹介先に見える名前。
--
-- 更新は SECURITY DEFINER RPC に閉じ込め、users 全体の UPDATE RLS は開けない。

alter table public.users
  add column if not exists legal_name text;

create or replace function public.update_my_legal_name(new_name text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  caller  uuid := auth.uid();
  trimmed text := btrim(new_name);
begin
  if caller is null then
    raise exception 'AUTH_REQUIRED' using errcode = '28000';
  end if;
  if trimmed is null or trimmed = '' then
    raise exception 'LEGAL_NAME_REQUIRED' using errcode = '22000';
  end if;
  if char_length(trimmed) > 50 then
    raise exception 'LEGAL_NAME_TOO_LONG' using errcode = '22000';
  end if;
  if trimmed ~ '[\n\r\t]' then
    raise exception 'LEGAL_NAME_INVALID' using errcode = '22000';
  end if;

  update public.users
     set legal_name = trimmed,
         updated_at = timezone('utc'::text, now())
   where id = caller;
end;
$$;

revoke all on function public.update_my_legal_name(text) from public;
revoke all on function public.update_my_legal_name(text) from anon;
grant execute on function public.update_my_legal_name(text) to authenticated;
