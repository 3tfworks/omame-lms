-- 商品の価格設定（product_pricing）の初期値を system_settings に投入する。
--
-- system_settings は 1キー1レコード方式（id=text PK / value=JSON文字列 / updated_at）。
-- 価格変更は管理画面(/admin/pricing)から行い、salePrice 変更時のみ Stripe API で
-- 新しい Price を作成して stripePriceId を切り替える運用とする。
--
-- stripePriceId の初期値は、現在の環境変数 STRIPE_PRICE_ID_OMAME_BASIC の値。
-- 既存レコードがある場合は上書きしない（ON CONFLICT DO NOTHING）。

INSERT INTO public.system_settings (id, value, updated_at)
VALUES (
  'product_pricing',
  '{"regularPrice":34800,"salePrice":29800,"stripePriceId":"price_1ThkxFInPC8i74zBQxxqwEIF","campaignLabel":"発売記念キャンペーン特別価格","showCampaign":true}',
  timezone('utc'::text, now())
)
ON CONFLICT (id) DO NOTHING;
