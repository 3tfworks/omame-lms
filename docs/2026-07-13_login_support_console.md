# ログインサポート画面 導入・運用手順

## 目的

顧客のログイン問い合わせについて、管理者または事務担当者が次を1画面で確認する。

- `public.users` の顧客プロフィール
- Supabase Authの登録・確認・最終ログイン・停止状態
- Resendの送信・配信・失敗・開封・クリックイベント
- Stripe Checkoutの決済成功・未払い・3Dセキュア未完了・期限切れ
- サポート担当者による再送履歴
- 上記を組み合わせた自動診断

## 画面

- 管理者: `/ja/admin/support`
- 事務担当者: `/ja/support`

管理者（`owner` / `admin`）は常に利用できる。事務担当者は `support_agents` で許可された本人だけが利用でき、既存の管理画面には入れない。

## 本番反映前に必要な設定

### 1. Supabase Migration

`supabase/migrations/20260713000000_login_support_console.sql` を本番DBへ適用する。

作成されるテーブル:

- `support_agents`
- `auth_email_events`
- `support_action_logs`
- `auth_callback_events`

### 2. Resend Webhook

Resend DashboardでWebhookを作成する。

- Endpoint: `https://www.omamepiano.com/api/webhooks/resend`
- Events:
  - `email.sent`
  - `email.delivered`
  - `email.delivery_delayed`
  - `email.failed`
  - `email.bounced`
  - `email.suppressed`
  - `email.opened`
  - `email.clicked`

発行されたSigning Secretを、VercelのProduction環境変数 `RESEND_WEBHOOK_SECRET` に登録する。値やMagic Link本体をDB・ログ・画面へ記録しない。

### 3. 反映順序

1. Supabase Migrationを適用
2. `RESEND_WEBHOOK_SECRET` を登録
3. コードをデプロイ
4. Resend Webhookを有効化
5. テスト用メールで `sent` / `delivered` が画面に出ることを確認

コードを先にデプロイすると、管理者は画面を開けるがメール履歴と事務担当権限は利用できない。画面には未設定の案内が表示される。

## 事務担当者への権限付与

1. 対象者自身の受講者アカウントをあらかじめ作成する
2. ownerで `/ja/admin/support` を開く
3. 対象者のメールアドレスを検索する
4. 「事務担当アクセスを付与」を押す
5. 対象者は `/ja/support` を開く

事務担当者へ許可される操作:

- 顧客の認証状態・メール履歴の確認
- ログインメールの再送
- 顧客向け案内文のコピー

許可されない操作:

- 価格・キャンペーン・報酬の変更
- 顧客ロールの変更
- アカウント削除・BAN解除
- 他の事務担当者への権限付与

## 問い合わせ対応の基本順序

1. 顧客のメールアドレスを完全一致で検索
2. 「Stripe決済状況」で決済が成立しているか確認
3. 画面上部の自動診断を確認
4. 「顧客の確認待ち」「事務担当で対応可能」は案内または1回再送
5. 「システム調査が必要」は再送や再決済を案内せずシステム担当へ連絡

再送は同一顧客に対して60秒に1回まで。実行者・対象・結果は `support_action_logs` に保存される。

## 表示上の注意

- `email.sent`: Resendが送信要求を受け付けた状態
- `email.delivered`: 受信側メールサーバーへ到達した状態。顧客が受信箱で読んだ保証ではない
- `email.opened` / `email.clicked`: セキュリティソフト等による自動アクセスを含む可能性がある補助情報
- `last_sign_in_at`: ログイン成功履歴。現在もセッションが有効であることまでは保証しない
- `3Dセキュア失敗`: Stripeで本人認証が必要になった後に決済が成立しなかった状態。認証失敗と顧客による途中中断を含む
- `決済成功`なのに顧客プロフィールまたはSupabase Authがない場合は、購入Webhookの不整合としてシステム担当へ連絡する
- Stripe照会は管理者・許可済み事務担当者のみ実行できる。住所・カード番号など、切り分けに不要な情報は画面へ返さない
