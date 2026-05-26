# お豆奏法プロジェクト 現状まとめ（2026-05-27時点、メッセンジャー計画追記）

> 新しいチャットでAIと作業を再開するときに、まずこのファイルを読み込ませてください。

---

## プロジェクト概要

えりな先生（たちえりな）の「お豆奏法」ピアノ教授法を提供する**自社製・動画コミュニティプラットフォーム**。

- 目的：FANTSなどの高額外部ツール（月数十万＋手数料）を捨て、自社インフラで月1.5万円以下で運営
- Mikaselプロジェクトのコード資産（Supabase・Vercel・UIパーツ）を流用して爆速構築

---

## 技術スタック

| レイヤー | 採用技術 |
|---------|---------|
| フロントエンド | Next.js 16.2.4 + React 19 + Tailwind CSS v4 |
| バックエンド/DB | Supabase（認証・DB・RLS） |
| 動画配信 | Vimeo（`@vimeo/player` SDK） |
| ホスティング | Vercel（デプロイ済み） |
| UI部品 | Framer Motion + Lucide React |
| 多言語 | `[lang]` ルーティング（ja / en / fr） |
| 決済 | KaiHiPay（webhookルートのみ実装、実連携は未確認） |

---

## ファイル構成（重要部分）

```
src/
├── app/
│   └── [lang]/
│       ├── page.tsx              # LP（トップページ）
│       ├── login/page.tsx        # ログイン画面
│       ├── lms/                  # 会員サイト（動画プラットフォーム）
│       │   ├── layout.tsx        # LMSサイドバー・ナビ
│       │   ├── page.tsx          # LMSダッシュボード（ホーム）
│       │   ├── video/[id]/       # 動画視聴ページ
│       │   ├── search/           # お豆ナビ検索
│       │   ├── bookmarks-guide/  # みんなの付箋とは？
│       │   ├── guide/            # はじめての方へ
│       │   ├── practice-course/  # 実践講座（アップセル）
│       │   └── affiliate/        # お豆メッセンジャー（紹介プログラム）
│       ├── admin/                # 管理者画面
│       │   ├── layout.tsx        # 管理者サイドバー
│       │   ├── page.tsx          # 今日の一言メッセージ管理
│       │   ├── users/            # ユーザー管理
│       │   ├── campaign/         # キャンペーン設定
│       │   └── affiliate/        # アフィリエイト管理
│       ├── lp/                   # LP（別バリエーション）
│       ├── offer/                # オファーページ
│       ├── offer-demo/
│       └── offer-water/
│   └── api/
│       ├── admin/message/        # 今日の一言 GET/POST
│       ├── admin/users/          # ユーザー管理API
│       ├── admin/campaign/       # キャンペーンAPI
│       ├── admin/affiliate/      # アフィリエイトAPI
│       ├── auth/callback/        # Supabase認証コールバック
│       ├── bookmarks/            # ブックマーク CRUD
│       ├── user/profile/         # ユーザープロフィール取得
│       ├── user/affiliate/       # 紹介コードAPI
│       └── webhooks/kaihipay/    # 決済Webhook
├── lib/
│   ├── lmsData.ts               # 動画カリキュラムデータ（全てハードコード）
│   ├── tenantConfig.ts          # デザインテーマ・デコレーション設定
│   └── i18n/                   # 多言語テキスト（ja/en/fr）
└── utils/supabase/              # Supabaseクライアント（server/client/admin/middleware）
```

---

## Supabaseテーブル構成

| テーブル | 用途 |
|---------|------|
| `users` | 会員情報（role / stripe / affiliate_code） |
| `videos` | 動画マスターデータ（将来移行先、現在はlmsData.tsがメイン） |
| `video_chapters` | タイムスタンプ別チャプター（お豆ナビ用、データ未投入） |
| `user_progress` | 視聴進捗・完了フラグ |
| `user_notes` | マイノート |
| `video_bookmarks` | ブックマーク（付箋） |
| `system_settings` | 「今日の一言」などシステム設定値 |

**userのrole一覧:** `sys_admin` / `instructor` / `user` / `salon_member`

---

## 実装済み機能

### 会員サイト（LMS）
- [x] LMSダッシュボード（進捗・続きから学ぶ・今日の一言表示）
- [x] 動画視聴（Vimeo埋め込み・完了トグル・前後ナビ・章クリア表示）
- [x] ブックマーク（付箋）追加・削除
- [x] 「みんなの付箋とは？」ガイドページ
- [x] お豆ナビ検索UI（`/lms/search`）
- [x] アフィリエイト（お豆メッセンジャー）ページ（salon_memberのみ表示）
- [x] はじめての方へガイド
- [x] 実践講座ページ（アップセルバナー、進捗50%以上でホームにも表示）

### 管理画面
- [x] 「今日の一言」メッセージ編集 → DBに保存 → LMSトップにリアルタイム反映
- [x] ユーザー管理ページ
- [x] キャンペーン設定ページ
- [x] アフィリエイト管理ページ

### 認証
- [x] Supabase Auth（メール/パスワード）
- [x] ログイン済みの場合 `/ja/lms` に自動リダイレクト
- [x] ログアウト

---

## 未実装・TODO

| 優先度 | 機能 | 状況 |
|--------|------|------|
| 高 | **お豆メッセンジャー（DBとパイプライン）** | 詳細は下記「お豆メッセンジャー実装計画」セクション参照 |
| 高 | **決済フロー（KaiHiPay）** | Webhookでユーザー作成は実装済み。アフィリエイト報酬記録は未実装 |
| 中 | **マイノート（`/lms/notes`）** | サイドバーにリンクはあるが、ページ未実装 |
| 中 | **付箋承認機能（管理画面）** | 管理画面サイドバーからコメントアウトして非表示中 |
| 低 | **管理画面「生徒の進捗を見る」** | ボタンはあるがonClickに何もなし |
| 低 | **管理画面ログアウト** | ボタンはあるが未実装 |
| 低 | **動画マスターをSupabaseに移行** | 現在は`lmsData.ts`のハードコードが正（DBのvideosテーブルは未使用） |

---

## お豆メッセンジャー 実装計画（MTG決定事項 2026-05-27）

### 採用パターン：パターン②（LPオプトインのみ型）

LMSシステム内にゲストとして入れない構成。招待状LP上で「名前・メール登録＋LINE友達追加＋お試し動画視聴」を完結させる。

### 招待された人の体験フロー

```
/invite/[userId] にアクセス
  ↓
招待状LP表示（えりな先生の世界観）
  ↓
名前・メール入力 + LINE友達追加ボタン（同一ページ）
  ↓
フォーム送信 → referrer_id と共に DB に保存（トラッキング完了）
  ↓
サンクスページ → お試し動画視聴
  ↓
興味があれば会費ペイで決済 → 会員へ昇格
```

### 救済措置（アプローチB）：招待LPを経由せず直接決済した人向け

LMSへの初回ログイン時に「お豆メッセンジャー（紹介）からのご入会ですか？」ポップアップを表示し、紹介コードを手動入力 → 紹介者を後から紐付ける。

### 決定事項まとめ

| # | 項目 | 決定内容 |
|---|------|---------|
| 1 | URL構造 | `/invite/[userId]`、referralCode は最初はユーザーIDのまま |
| 2 | 埋め込み動画 | 一旦ダミーデータで開発着手、後から差し替え |
| 3 | 登録フォーム | 名前＋メール＋公式LINE友達追加ボタンを同一ページに設置 |
| 4 | 報酬率管理 | 管理画面から変更できるように実装（通常35% / キャンペーン50%） |
| 5 | 救済ポップアップ | えりな先生の世界観に合わせた文言（テキスト要確認） |
| 6 | 振込オペレーション | 月1回、管理者がCSVダウンロードして手動振込 |

### 実装順序

| 順番 | 作業 | 備考 |
|------|------|------|
| 1 | **DBマイグレーション** | `affiliate_rewards` テーブル作成、`users` カラム追加（`bank_info` / `display_name`）、報酬率設定テーブル |
| 2 | **refトラッキング実装** | フォーム送信時に `referrer_id` を DB に保存 |
| 3 | **Webhook報酬記録ロジック** | 会費ペイ決済完了時に `affiliate_rewards` へ INSERT |
| 4 | **招待状LP新規作成** | `/invite/[userId]`、ダミー動画埋め込み、登録フォーム＋LINE追加ボタン |
| 5 | **管理画面に報酬率設定追加** | 35% / 50% を管理画面から変更可能に |
| 6 | **救済ポップアップ実装** | 初回ログイン時の紹介コード手動入力 |

### 必要なDBの追加・変更

```sql
-- ① users テーブルにカラム追加
ALTER TABLE public.users ADD COLUMN display_name text;
ALTER TABLE public.users ADD COLUMN bank_info jsonb;

-- ② 報酬率設定（system_settings に追加 or 専用テーブル）
-- system_settings の "affiliate_reward_rate" キーで管理（例: {"default": 35, "campaign": 50}）

-- ③ affiliate_rewards テーブル（新規作成）
CREATE TABLE public.affiliate_rewards (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id uuid REFERENCES public.users(id) NOT NULL,  -- 紹介した人
  buyer_id uuid REFERENCES public.users(id) NOT NULL,     -- 購入した人
  amount integer NOT NULL,       -- 報酬額（円）
  reward_rate integer NOT NULL,  -- 適用した報酬率（35 or 50）
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  created_at timestamptz DEFAULT now() NOT NULL
);

-- ④ invite_leads テーブル（招待LP経由のオプトイン記録）
CREATE TABLE public.invite_leads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id uuid REFERENCES public.users(id) NOT NULL,  -- 紹介したメンバーID
  name text NOT NULL,
  email text NOT NULL,
  line_added boolean DEFAULT false,
  converted boolean DEFAULT false,  -- 後から会員になったらtrue
  created_at timestamptz DEFAULT now() NOT NULL
);
```

### ファイル構成（追加予定）

```
src/app/
├── invite/[userId]/
│   ├── page.tsx          # 招待状LP（新規作成）
│   └── thanks/page.tsx   # サンクスページ＋お試し動画（新規作成）
└── api/
    ├── invite/register/route.ts   # オプトインフォーム送信 → invite_leads INSERT
    └── invite/redeem/route.ts     # 救済：紹介コード手動紐付け

supabase/migrations/
└── 20260527000000_affiliate_messenger.sql  # 上記DBの全変更をまとめて適用
```

### 動画埋め込みの注意点

- Vimeoのドメイン制限を設定し、`/invite/[userId]` ドメイン以外では再生できないようにする
- 動画の選定はえりな先生に確認後、ダミーから差し替え

### 現状のお豆メッセンジャー 実装済み／未済

| レイヤー | 状態 |
|---------|------|
| 会員ページ UI（`/lms/affiliate`） | ✅ 完成 |
| 管理者ページ UI（`/admin/affiliate`） | ✅ 完成 |
| APIロジック（user・admin） | ✅ 完成 |
| DBスキーマ（テーブル・カラム） | ❌ 未作成（実装順①） |
| refトラッキング → 購入連携 | ❌ 未実装（実装順②） |
| Webhook 報酬記録 | ❌ 未実装（実装順③） |
| 招待状LP（`/invite/[userId]`） | ❌ 未作成（実装順④） |
| 報酬率の管理画面設定 | ❌ 未作成（実装順⑤） |
| 救済ポップアップ | ❌ 未作成（実装順⑥） |

---

## 注意事項・既知の問題

- LMSレイアウトの管理者リンクは `role === "admin"` でチェックしているが、DBの正しいroleは `sys_admin`。管理者はLMSサイドバーの「管理者ページ」リンクが表示されない可能性あり。
- `user_progress.video_id` は文字列型（例: `"video-1188100383"`）で `lmsData.ts` の `id` と一致させている。DBの `videos.id` はUUID型のため、混在に注意。
- お豆ナビ検索は `video_chapters` テーブルにデータがないため、現状では何も検索できない。

---

## 開発サーバー起動

```bash
npm run dev   # port 3001 で起動
```

---

## 関連ドキュメント

- `omame_project_brief.md` — プロジェクト発足時の要件・インフラ戦略（Mikaselからの引き継ぎ書）
