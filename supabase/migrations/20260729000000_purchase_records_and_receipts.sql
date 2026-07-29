-- Stripeの領収書本体や期限付きURLは保存せず、
-- 会員と決済を安全に結び付けるための購入記録だけを保持する。
create table if not exists public.purchase_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  provider text not null default 'stripe' check (provider in ('stripe')),
  product_key text not null,
  product_name text not null,
  amount_total integer not null check (amount_total >= 0),
  currency text not null,
  status text not null default 'paid'
    check (status in ('paid', 'partially_refunded', 'refunded', 'disputed')),
  purchased_email text not null,
  stripe_checkout_session_id text not null unique,
  stripe_payment_intent_id text,
  stripe_charge_id text,
  purchased_at timestamp with time zone not null,
  last_receipt_sent_at timestamp with time zone,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone('utc'::text, now())
);

create index if not exists purchase_records_user_purchased_idx
  on public.purchase_records (user_id, purchased_at desc);

create unique index if not exists purchase_records_payment_intent_key
  on public.purchase_records (stripe_payment_intent_id)
  where stripe_payment_intent_id is not null;

create index if not exists purchase_records_charge_idx
  on public.purchase_records (stripe_charge_id)
  where stripe_charge_id is not null;

alter table public.purchase_records enable row level security;

drop policy if exists "Users can view their own purchase records" on public.purchase_records;
create policy "Users can view their own purchase records"
  on public.purchase_records
  for select
  using (auth.uid() = user_id);

-- 更新・追加は署名検証済みWebhookまたは認証済みサーバーAPIから
-- service roleでのみ行うため、利用者向けのinsert/update policyは作成しない。

create table if not exists public.purchase_receipt_logs (
  id uuid primary key default gen_random_uuid(),
  purchase_record_id uuid not null references public.purchase_records(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  destination_email text not null,
  result text not null check (result in ('success', 'failure')),
  detail text,
  created_at timestamp with time zone not null default timezone('utc'::text, now())
);

create index if not exists purchase_receipt_logs_purchase_created_idx
  on public.purchase_receipt_logs (purchase_record_id, created_at desc);

alter table public.purchase_receipt_logs enable row level security;

-- 送信履歴にはメールアドレスが含まれるため、service role以外には公開しない。
