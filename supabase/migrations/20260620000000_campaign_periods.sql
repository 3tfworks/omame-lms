-- =============================================================================
-- campaign_periods : アフィリエイト報酬率の「日付スケジュール方式」キャンペーン
-- =============================================================================
-- 決済成立日時が [start_at, end_at) に入る is_active=true の行があれば、その reward_rate を
-- 適用する。無ければ system_settings/affiliate_reward_rate.default を使う（判定は
-- src/lib/affiliateRate.ts の getAffiliateRewardRate() が担当）。
-- タイムゾーン: timestamptz（UTC基準で保持）。入力/表示の JST 変換はアプリ層で行う。

-- 期間重複の DB レベル防止（GiST 排他制約）に必要。Supabase で利用可。
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE IF NOT EXISTS public.campaign_periods (
  id          uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name        text        NOT NULL,
  start_at    timestamptz NOT NULL,
  end_at      timestamptz NOT NULL,
  reward_rate integer     NOT NULL,
  is_active   boolean     NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at  timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),

  CONSTRAINT chk_campaign_period_range CHECK (start_at < end_at),
  CONSTRAINT chk_campaign_reward_rate  CHECK (reward_rate BETWEEN 1 AND 100),

  -- 「有効な」キャンペーン同士は期間が重複してはならない（payout の一意性を DB で保証）。
  -- 半開区間 '[)' により、前期間の end と次期間の start が同時刻に接するだけなら重複扱いしない。
  CONSTRAINT excl_campaign_active_overlap
    EXCLUDE USING gist (tstzrange(start_at, end_at, '[)') WITH &&)
    WHERE (is_active)
);

-- 期間検索 (is_active AND tstzrange(start_at,end_at,'[)') @> at) は、上の排他制約が作る
-- 部分 GiST インデックスをそのまま利用できるため、追加インデックスは張らない
-- （行数が少なく過剰インデックスを避ける設計判断）。

-- updated_at 自動更新トリガ
CREATE OR REPLACE FUNCTION public.touch_campaign_periods_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at := timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_touch_campaign_periods ON public.campaign_periods;
CREATE TRIGGER trg_touch_campaign_periods
  BEFORE UPDATE ON public.campaign_periods
  FOR EACH ROW EXECUTE FUNCTION public.touch_campaign_periods_updated_at();

-- RLS
ALTER TABLE public.campaign_periods ENABLE ROW LEVEL SECURITY;

-- SELECT は公開（紹介者画面で現在率を表示する要件）。実表示は server API + service-role 経由だが、
-- 要件に従い anon/authenticated にも読取を許可する。
CREATE POLICY "campaign_periods are publicly readable"
  ON public.campaign_periods FOR SELECT
  USING (true);

-- INSERT/UPDATE/DELETE のポリシーは「あえて作らない」。
--  → service-role（createAdminClient）経由のみ書込可能（service-role は RLS をバイパス）。
--  既存の役割名不整合（sys_admin/instructor vs owner/admin）には今回触れない方針のため、
--  役割ベースの書込ポリシーは将来のロール統一リファクタ時にまとめて整備する。
--  それまでは管理API (/api/admin/campaign) 側の owner/admin チェック＋service-role で担保する。
