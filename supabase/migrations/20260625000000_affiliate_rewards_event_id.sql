-- Make the Stripe checkout webhook idempotent for recovery replays.
--
-- Adds a nullable, unique `stripe_event_id` to affiliate_rewards so that
-- reprocessing the same checkout.session.completed event (manual resend or
-- the upcoming rescue script) cannot create duplicate affiliate payouts.
--
-- Safe to run against existing data: the column is added nullable (existing
-- rows — expected 0 — get NULL). Postgres allows multiple NULLs under a unique
-- index, so legacy rows are unaffected. The webhook always writes a non-null
-- event id going forward, which is what enforces dedup.

ALTER TABLE public.affiliate_rewards
  ADD COLUMN IF NOT EXISTS stripe_event_id text;

CREATE UNIQUE INDEX IF NOT EXISTS affiliate_rewards_stripe_event_id_key
  ON public.affiliate_rewards (stripe_event_id);
