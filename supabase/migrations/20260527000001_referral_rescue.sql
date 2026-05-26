ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS referral_prompt_shown boolean NOT NULL DEFAULT false;

ALTER TABLE public.affiliate_rewards
  DROP CONSTRAINT IF EXISTS chk_amount;

ALTER TABLE public.affiliate_rewards
  ADD CONSTRAINT chk_amount CHECK (amount >= 0);
