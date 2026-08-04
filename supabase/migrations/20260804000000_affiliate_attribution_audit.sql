alter table public.affiliate_rewards
  add column if not exists attribution_source text not null default 'legacy',
  add column if not exists checkout_discount_percent smallint,
  add column if not exists review_required boolean not null default false,
  add column if not exists review_reason text,
  add column if not exists reviewed_at timestamptz;

alter table public.affiliate_rewards
  drop constraint if exists affiliate_rewards_attribution_source_check;
alter table public.affiliate_rewards
  add constraint affiliate_rewards_attribution_source_check
  check (attribution_source in ('checkout_metadata', 'email_fallback', 'legacy'));

alter table public.affiliate_rewards
  drop constraint if exists affiliate_rewards_checkout_discount_percent_check;
alter table public.affiliate_rewards
  add constraint affiliate_rewards_checkout_discount_percent_check
  check (checkout_discount_percent is null or checkout_discount_percent between 0 and 100);

create index if not exists affiliate_rewards_review_required_idx
  on public.affiliate_rewards (created_at desc)
  where review_required = true;

comment on column public.affiliate_rewards.attribution_source is
  '紹介経路。checkout_metadataは決済開始時に紹介者を引き継ぎ、email_fallbackは購入メールと招待記録で復元、legacyは移行前データ。';
