ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS bank_info jsonb;

CREATE TABLE public.affiliate_rewards (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  buyer_id    uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount      integer     NOT NULL,
  reward_rate integer     NOT NULL,
  status      text        NOT NULL DEFAULT 'pending',
  created_at  timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT chk_amount CHECK (amount > 0),
  CONSTRAINT chk_reward_rate CHECK (reward_rate BETWEEN 1 AND 100),
  CONSTRAINT chk_status CHECK (status IN ('pending', 'paid'))
);

ALTER TABLE public.affiliate_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Referrers can view their own rewards"
  ON public.affiliate_rewards FOR SELECT
  USING (auth.uid() = referrer_id);

CREATE POLICY "Admins can manage all rewards"
  ON public.affiliate_rewards FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('sys_admin', 'instructor')
    )
  );

CREATE TABLE public.invite_leads (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name        text        NOT NULL,
  email       text        NOT NULL,
  line_added  boolean     NOT NULL DEFAULT false,
  converted   boolean     NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.invite_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage invite leads"
  ON public.invite_leads FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('sys_admin', 'instructor')
    )
  );

INSERT INTO public.system_settings (id, value, updated_at)
VALUES (
  'affiliate_reward_rate',
  '{"default": 35, "campaign": 50}',
  timezone('utc'::text, now())
)
ON CONFLICT (id) DO NOTHING;
