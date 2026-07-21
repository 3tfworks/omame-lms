-- ログインサポート担当者が、本人確認後に登録メールアドレスを修正できるようにする。
-- can_repair_profile は、顧客プロフィールとAuthの不整合修正を許可する既存権限。
alter table public.support_agents
  alter column can_repair_profile set default true;

update public.support_agents
set can_repair_profile = true,
    updated_at = now()
where enabled = true;
