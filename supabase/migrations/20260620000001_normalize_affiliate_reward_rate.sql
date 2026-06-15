-- =============================================================================
-- affiliate_reward_rate の value を「日付スケジュール方式」へ正規化
-- =============================================================================
-- 旧方式（手動トグル）の value { default, campaign, active? } から、campaign / active キーを
-- 除去し { default } のみへ正規化する。報酬率の「期間」は campaign_periods が担うため、
-- system_settings 側はフォールバック用の default 値だけを保持する。
-- value は text 列に JSON 文字列で保持する既存方式に合わせる。

-- 既存 default を尊重しつつ campaign / active キーを除去（無ければ 35）。
UPDATE public.system_settings
SET value = jsonb_build_object(
      'default', COALESCE((value::jsonb ->> 'default')::int, 35)
    )::text,
    updated_at = timezone('utc'::text, now())
WHERE id = 'affiliate_reward_rate';

-- レコード不在環境向けの保険。
INSERT INTO public.system_settings (id, value, updated_at)
VALUES ('affiliate_reward_rate', '{"default": 35}', timezone('utc'::text, now()))
ON CONFLICT (id) DO NOTHING;
