-- お豆メッセンジャープログラムの規約同意履歴。
-- 規約変更後も「誰が・いつ・どの版・どの確認文に同意したか」を上書きせず保持する。

create table if not exists public.affiliate_terms_acceptances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  terms_version text not null,
  accepted_at timestamptz not null default timezone('utc'::text, now()),
  confirmations jsonb not null,
  terms_snapshot jsonb not null,
  unique (user_id, terms_version)
);

create index if not exists affiliate_terms_acceptances_user_id_idx
  on public.affiliate_terms_acceptances (user_id, accepted_at desc);

alter table public.affiliate_terms_acceptances enable row level security;

drop policy if exists "Users can view their own affiliate terms acceptances"
  on public.affiliate_terms_acceptances;
create policy "Users can view their own affiliate terms acceptances"
  on public.affiliate_terms_acceptances for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own affiliate terms acceptances"
  on public.affiliate_terms_acceptances;
create policy "Users can insert their own affiliate terms acceptances"
  on public.affiliate_terms_acceptances for insert
  with check (auth.uid() = user_id);

comment on table public.affiliate_terms_acceptances is
  'お豆メッセンジャープログラム規約の版ごとの同意証跡';

-- 報酬は購入後30日間を確認期間とし、返金・決済取消・規約違反等を管理できるようにする。
alter table public.affiliate_rewards
  add column if not exists eligible_for_payout_at timestamptz,
  add column if not exists paid_at timestamptz,
  add column if not exists cancelled_at timestamptz,
  add column if not exists cancellation_reason text,
  add column if not exists stripe_checkout_session_id text,
  add column if not exists stripe_payment_intent_id text;

create index if not exists affiliate_rewards_stripe_payment_intent_id_idx
  on public.affiliate_rewards (stripe_payment_intent_id)
  where stripe_payment_intent_id is not null;

update public.affiliate_rewards
set eligible_for_payout_at = created_at + interval '30 days'
where eligible_for_payout_at is null;

update public.affiliate_rewards
set paid_at = created_at
where status = 'paid' and paid_at is null;

alter table public.affiliate_rewards
  alter column eligible_for_payout_at set default (timezone('utc'::text, now()) + interval '30 days'),
  alter column eligible_for_payout_at set not null;

alter table public.affiliate_rewards drop constraint if exists chk_status;
alter table public.affiliate_rewards
  add constraint chk_status check (status in ('pending', 'paid', 'cancelled'));
