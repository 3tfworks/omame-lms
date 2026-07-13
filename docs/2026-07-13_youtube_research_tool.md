# YouTube企画リサーチツール 実装・運用計画

更新日: 2026-07-13

## 目的

お豆奏法のYouTube集客に特化し、検索キーワード、競合動画、視聴者コメント、動画企画を一つの管理画面で扱う。

管理画面: `/ja/admin/youtube-research`

## フェーズ

### Phase 1: APIキー不要MVP（実装済み）

- 種キーワードから検索候補を生成
- 各候補のYouTube検索をワンクリックで開く
- 採用候補キーワードを保存
- 競合動画のタイトル、URL、再生数、登録者数、公開日、メモを保存
- コメントを1行1件で貼り付け、悩み・質問を自動分類
- 競合動画から動画企画フォームへ引き継ぐ
- 動画企画を100点で採点
- 候補から効果測定まで制作状態を管理
- 企画一覧をCSV出力

### Phase 2: YouTube Data API連携

- キーワード検索結果を自動取得
- 動画・チャンネル統計を自動取得
- コメントを自動取得
- 日次スナップショットから再生速度を算出
- 小規模チャンネルの突出動画を自動検出

必要なもの:

- Google Cloudプロジェクト
- YouTube Data API v3 APIキー
- サーバー専用環境変数

### Phase 3: YouTube Analytics・集客成果連携

- チャンネル所有者のGoogle OAuth
- 自チャンネルの再生時間、流入元、登録者増加を取得
- 動画別UTM、LINE登録、講座購入を紐付け
- 1,000再生あたりのLINE登録数・購入数を表示

## データベース

マイグレーション:

`supabase/migrations/20260713010000_youtube_research.sql`

テーブル:

- `youtube_research_keywords`
- `youtube_research_videos`
- `youtube_research_ideas`

全テーブルでRLSを有効化し、公開ポリシーは作成しない。読み書きはowner/admin認可済みの管理APIからservice-roleで行う。

## 運用順序

1. 「キーワード」で種キーワードを入力する。
2. 生成候補からYouTube検索を開き、検索候補と上位動画を確認する。
3. 有望なキーワードを保存する。
4. 上位動画とコメントを「競合・コメント」へ登録する。
5. コメント分析で多い悩み・質問を確認する。
6. 「企画化」から企画フォームへ移動する。
7. 100点採点し、70点以上を優先する。
8. 制作状況を候補、台本、撮影予定、編集、公開、効果測定の順に更新する。
9. 定例会ではCSVを出力して企画一覧を共有する。

## 検証コマンド

```powershell
npm.cmd run test:youtube-research
npx.cmd eslint src/lib/youtubeResearch.ts src/lib/youtubeResearch.test.ts src/app/api/admin/youtube-research/route.ts src/components/admin/YouTubeResearchConsole.tsx src/app/[lang]/admin/youtube-research/page.tsx src/app/[lang]/admin/layout.tsx
npx.cmd tsc --noEmit --pretty false
npm.cmd run build
```

## 次の承認ポイント

本番Supabaseへのマイグレーションは2026-07-13に適用済み。確認SQLで次の3テーブルが存在することを確認した。

- `youtube_research_ideas`
- `youtube_research_keywords`
- `youtube_research_videos`

次の承認ポイントはVercel本番デプロイ。デプロイ後に管理画面でキーワード保存からCSV出力までのスモークテストを行う。
