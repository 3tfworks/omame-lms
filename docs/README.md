# お豆奏法プロジェクト — docs/ 索引

このディレクトリには、プロジェクトの handover（引き継ぎ書）とインシデント記録が時系列で蓄積されています。
**新しいセッションを始めるときは、最新の handover から読むこと。**

## 📌 最新

- **[2026-07-01_handover.md](./2026-07-01_handover.md)** — ログイン導線連携実装・本番反映 / LINE 内ブラウザ警告 / §5(e) 実装完了 / 実ユーザー4名サポート

## 引き継ぎ書（時系列・新しい順）

- [2026-07-01_handover.md](./2026-07-01_handover.md) — 2026-07-01
- [2026-06-30_handover.md](./2026-06-30_handover.md) — 2026-06-30
- [2026-06-25_handover.md](./2026-06-25_handover.md) — 2026-06-25
- [2026-06-21_handover.md](./2026-06-21_handover.md) — 2026-06-21

## インシデント記録（時系列・新しい順）

- [2026-06-29_incident_login.md](./2026-06-29_incident_login.md) — 6/29 ログイン障害（apex/www mismatch）
- [2026-06-25_incident_webhook.md](./2026-06-25_incident_webhook.md) — 6/25 webhook 障害

## 運用マニュアル

- [2026-06-25_gift_coupon_ops.md](./2026-06-25_gift_coupon_ops.md) — ギフトクーポン運用

## その他の資料

- [2026-06-21_page_structure.md](./2026-06-21_page_structure.md) — ページ構造メモ

## 重要ルール（随時更新）

- **§5(c)**: 本番デプロイ ID は handover に明示する
- **§5(e)**: ログイン画面で `?error=` 表示 → ✅ 2026-07-01 実装・本番反映済み
- **§5(f)**: 本番デプロイは `git push origin main` 経由のみ。`vercel --prod` 直 deploy は禁止
- （詳細は [2026-06-29_incident_login.md](./2026-06-29_incident_login.md) の §5 参照）
