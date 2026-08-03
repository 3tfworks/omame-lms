# ブラウザ非依存ログイン 実装・反映手順

## 目的

通常ログインを、開始したブラウザにPKCEのcode verifierが残っていることへ依存しない方式へ変更する。
Safariでログインメールを要求し、Chromeやメールアプリ経由でリンクを開いた場合も、リンクを開いたブラウザでセッションを確立できるようにする。

## 新しいフロー

1. `/ja/login` が `POST /api/auth/request-link` を呼ぶ
2. サーバーが既存のSupabase Authユーザーを確認する
3. サーバーがMagic Linkの`hashed_token`を生成し、Resendで独自メールを送る
4. メール内リンクから `/ja/login/confirm` を開く
5. 利用者が「ログインを続ける」を押す
6. `POST /api/auth/verify` が`verifyOtp`を実行し、そのブラウザへセッションCookieを設定する
7. `/ja/lms`へ303リダイレクトする

確認画面のGETではtokenを消費しない。メールサービスの自動リンク検査が先にアクセスしても、利用者のPOST操作まで認証は実行されない。

## セキュリティ

- Service Role Keyはサーバー内だけで使用する
- 未登録メールでも登録済みの場合と同じ202応答を返す
- Magic Link本体、token hash、IPアドレスの生値をDBへ保存しない
- メールアドレスとIP・User-AgentはSHA-256のハッシュだけを送信制限テーブルへ保存する
- 同一メールは60秒に1回、同一フィンガープリントは10分に10回まで
- `next`はアプリ内の絶対パスだけを許可する
- 確認画面はnoindex・no-referrer、検証レスポンスはno-storeとする

## 本番反映順序

本番環境への変更なので、以下は実行前に承認を得る。

1. `supabase/migrations/20260803010000_browser_independent_login.sql`を本番DBへ適用
2. Preview環境へコードを反映
3. テスト会員で実メールを送信
4. Safari要求→Chrome確認、Chrome要求→Safari確認を実機確認
5. 本番へコードを反映
6. 旧`/api/auth/callback`と旧`GET /api/auth/verify`を最低48時間維持

DBマイグレーションを先に適用しないと、新しい公開送信APIは503を返して安全側に停止する。

## 確認項目

- 登録済みメールにはログインメールが届く
- 未登録メールにも画面上は同じ完了表示が出るが、メールは送られない
- 同一メールの連続送信が抑止される
- メールリンクを開いただけではtokenが消費されない
- 確認ボタンを押したブラウザでLMSへ入れる
- 使用済み・期限切れリンクはログイン画面のエラー案内へ戻る
- 購入時に送信済みの旧リンクも引き続き利用できる
- サポート画面からの再送も新方式になる

## ローカル検証

```powershell
npm run test:auth-login
npm run lint
npm run build
```

## 切り戻し

問題発生時は、通常ログイン画面の送信処理を旧`signInWithOtp`へ戻す。すでに送信した新方式のメールを無効にしないため、`/ja/login/confirm`と`POST /api/auth/verify`は削除しない。

`auth_login_requests`テーブルと`claim_auth_login_request`関数は、切り戻し時も残して問題ない。
