# YouTubeリサーチ全自動化

## 実行フロー

1. 保存済みキーワード（最大5件）を取得
2. YouTube Data APIで各キーワード上位8動画を検索
3. 動画統計・チャンネル登録者数・上位20コメントを取得
4. 再生/日と登録者比で有望動画を並べ替え
5. AI Gatewayで視聴者ニーズ、コンテンツギャップ、企画8件を生成
6. 100点採点して企画ボードへドラフト登録
7. 毎週月曜10:00（JST）に自動実行

公開や予約投稿は行わない。生成物は必ず `candidate`（企画候補）として保存する。

## 必要な本番設定

### Supabase

`supabase/migrations/20260713020000_youtube_research_automation.sql` を適用する。

### Vercel環境変数

- `YOUTUBE_API_KEY`: YouTube Data API v3を有効化したGoogle Cloud APIキー
- `CRON_SECRET`: 32文字以上のランダム文字列
- `YOUTUBE_RESEARCH_AI_MODEL`: 任意。未設定時は `openai/gpt-5.4-mini`

APIキーはVercelのProduction環境だけに登録し、ブラウザへ公開しない。Google Cloud側ではAPI制限を「YouTube Data API v3」に限定する。

AI GatewayはVercelが発行する `VERCEL_OIDC_TOKEN` を利用するため、通常はAIプロバイダーの秘密鍵を追加しない。

## 既定の消費量（1回）

- `search.list`: 最大5回
- `videos.list`: 1回
- `channels.list`: 1回
- `commentThreads.list`: 最大40回（コメント無効動画を含む）
- AI生成: 1回

キーワード、動画数、コメント数、企画数は管理APIの入力で上限内に調整できる。

## 監視と再実行

- 管理画面の最新実行カードに、待機・収集・保存・AI生成・完了・失敗を表示
- Vercel Observability > Workflowsで各ステップ、再試行、エラーを確認
- APIの一時エラーはWorkflowステップ単位で再試行
- 同一URLの動画はupsert、同一タイトルの企画は重複登録しない
