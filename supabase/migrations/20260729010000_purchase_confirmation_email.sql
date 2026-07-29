alter table public.purchase_records
  add column if not exists confirmation_email_status text not null default 'pending'
    check (confirmation_email_status in ('pending', 'sending', 'sent', 'failed')),
  add column if not exists confirmation_email_attempted_at timestamp with time zone,
  add column if not exists confirmation_email_sent_at timestamp with time zone,
  add column if not exists confirmation_email_provider_id text,
  add column if not exists confirmation_email_error text;

create index if not exists purchase_records_confirmation_email_status_idx
  on public.purchase_records (confirmation_email_status, purchased_at)
  where confirmation_email_status <> 'sent';
