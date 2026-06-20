# お豆奏法プロジェクト ページ構成 / 設計メモ

- **作成日:** 2026-06-21
- **対象 commit:** `c5995f7`（フェーズ2 フロントエンド）
- **関連 commit:** フェーズ1 `6451e27` / フェーズ2 BE `6431fdc` / フェーズ2 FE `c5995f7`
- **記述方針:** 実装（コード）を読んだ事実ベース。仕様書と実体に差異がある場合は実体を採用し注記。推測・提案は含めない。

> すべてのページは `src/app/[lang]/...` 配下にあり、`[lang]` は `ja` / `en` / `fr`。本書の URL 例は `ja` 表記。言語判定は `src/proxy.ts` が担当（言語コード無しアクセスは Accept-Language で自動付与してリダイレクト）。

---

## 🔐 認証ゲートの全体像（`src/proxy.ts`）

ページの「認証要否」は各ページではなく **proxy（ミドルウェア）** が一括で決めている。事実関係:

| 保護対象 | 条件 | 未満たし時の挙動 |
|---|---|---|
| `/lms` 配下・`/admin` 配下・`/setup-name` | ログイン必須（Supabase セッション） | `/${lang}/login` へリダイレクト |
| `/admin` 配下（ページ＋ `/api/admin/*`） | **Basic 認証**（`BASIC_AUTH_USER` / `BASIC_AUTH_PASSWORD` 設定時のみ。未設定なら skip） | 401 + `WWW-Authenticate` |
| `/admin` 配下 | `users.role` が `admin` または `owner` | `/${lang}/lms` へリダイレクト |
| `/lms` 配下（`display_name` 空） | 表示名設定済み | `/${lang}/setup-name?next=...` へ誘導 |
| `/login`（ログイン済み） | — | `/${lang}/lms` へ |
| トップページ `/[lang]` | 公開（ログイン済みでもリダイレクトしない） | — |

`matcher`: `["/((?!_next|api|images|.*\\..*).*)", "/api/admin/:path*"]`（通常ページ全般＋ `/api/admin` のみ Basic 認証対象）。

---

## 📄 Section 1: 全ルート一覧

### ① 公開・販売 LP 系

| URL | 実装パス | 役割 | 認証 | 価格表示 | Stripe 決済 | アフィリエイト報酬 | noindex | 状態 | 備考 |
|---|---|---|---|---|---|---|---|---|---|
| `/ja` | `page.tsx` | 公式トップ HP | 不要 | なし | なし | 対象外 | なし | ✅稼働中 | ログイン/LMS への導線 |
| `/ja/lp` | `lp/page.tsx` | **本番販売 LP（一般）** | 不要 | あり ¥29,800 | 直結 | 対象 | なし | ✅稼働中 | `LpV2Page` の再エクスポート（`export default LpV2Page`）。正本 URL |
| `/ja/lp-v2` | `lp-v2/page.tsx` | 販売 LP 本体（正本実体） | 不要 | あり ¥29,800 | 直結 | 対象 | なし | ✅稼働中 | `/lp` と同一コンポーネント・同一表示 |
| `/ja/lp-salon` | `lp-salon/page.tsx` | **サロンメンバー特別価格 LP** | 不要 | あり ¥9,800 | 直結 | **対象外** | **あり** | ✅稼働中 | `c5995f7` 新規。`<LpV2Page priceType="salon" />` 薄ラッパー。`force-dynamic` |
| `/ja/offer` | `offer/page.tsx` | 公式 LINE 登録導線 LP | 不要 | なし | なし | 対象外 | なし | ✅稼働中 | CTA は `https://lin.ee/RmeCAtQ`（価格・決済なし） |
| `/ja/offer-demo` | `offer-demo/page.tsx` | 旧・購入デモ LP（価格＋決済） | 不要 | あり ¥29,800 | 直結 | 対象 | なし | ❄️凍結 | lp-v2 が決済完結化したため不要。i18n 対応・`/api/pricing` で価格取得 |

> **アフィリエイト報酬「対象/対象外」の意味**: そのページ経由の購入が紹介者報酬を発生させ得るか。`general`（lp/lp-v2/offer-demo/thanks）は紹介者がいれば計上。`salon`（lp-salon）は webhook が `price_type==="salon"` で報酬ブロックを全スキップ → 常に対象外。

### ② LMS（受講者向け・**ログイン必須**）

| URL | 実装パス | 役割 | 認証 | 価格 | Stripe | noindex | 状態 |
|---|---|---|---|---|---|---|---|
| `/ja/lms` | `lms/page.tsx` | 受講者ホーム（マイページ） | 必須 | なし | なし | なし※ | ✅稼働中 |
| `/ja/lms/guide` | `lms/guide/page.tsx` | この講座の進め方ガイド | 必須 | なし | なし | なし※ | ✅稼働中 |
| `/ja/lms/search` | `lms/search/page.tsx` | お豆ナビ検索 | 必須 | なし | なし | なし※ | ✅稼働中 |
| `/ja/lms/notes` | `lms/notes/page.tsx` | マイノート | 必須 | なし | なし | なし※ | ✅稼働中 |
| `/ja/lms/affiliate` | `lms/affiliate/page.tsx` | 受講者向けアフィリエイト（お豆メッセンジャー/紹介） | 必須 | なし | なし | なし※ | ✅稼働中 |
| `/ja/lms/practice-course` | `lms/practice-course/page.tsx` | 練習コース | 必須 | なし | なし | なし※ | ✅稼働中 |
| `/ja/lms/bookmarks-guide` | `lms/bookmarks-guide/page.tsx` | ブックマーク（付箋）ガイド | 必須 | なし | なし | なし※ | ✅稼働中 |
| `/ja/lms/video/[id]` | `lms/video/[id]/page.tsx` | 動画プレイヤー（Vimeo カスタム） | 必須 | なし | なし | なし※ | ✅稼働中 |

> ※ LMS/admin は明示的 `noindex` メタは無いが、proxy のログインゲートで未認証アクセスはリダイレクトされる（実質クロール不可）。明示 `noindex` を持つのは `/ja/lp-salon` のみ。

### ③ 管理画面（`/admin`・**admin/owner ロール＋ Basic 認証**）

| URL | 実装パス | 役割 | 認証 | 状態 |
|---|---|---|---|---|
| `/ja/admin` | `admin/page.tsx` | 管理ダッシュボード（運営メッセージ編集 / `/api/admin/message`） | admin/owner + Basic | ✅稼働中 |
| `/ja/admin/pricing` | `admin/pricing/page.tsx` | 商品価格管理（**general 5キーのみ編集**） | admin/owner + Basic | ✅稼働中 |
| `/ja/admin/users` | `admin/users/page.tsx` | ユーザー管理（ロール変更等） | admin/owner + Basic | ✅稼働中 |
| `/ja/admin/affiliate` | `admin/affiliate/page.tsx` | アフィリエイト報酬・報酬率管理 | admin/owner + Basic | ✅稼働中 |
| `/ja/admin/campaign` | `admin/campaign/page.tsx` | キャンペーン期間管理（報酬率スケジュール） | admin/owner + Basic | ✅稼働中 |

### ④ 招待状システム（`invite`）

| URL | 実装パス | 役割 | 認証 | 価格 | Stripe | アフィリエイト | 状態 |
|---|---|---|---|---|---|---|---|
| `/ja/invite/[userId]` | `invite/[userId]/page.tsx` | 招待状ランディング＋登録フォーム（`userId`=紹介者ID） | 不要 | なし | なし | （登録のみ） | ✅稼働中 |
| `/ja/invite/[userId]/thanks` | `invite/[userId]/thanks/page.tsx` | 登録完了＋動画コンテンツ申込 | 不要 | なし（表示なし） | 直結 | 対象（`referrerId=userId` 明示） | ✅稼働中 |

- `invite/[userId]/page.tsx` は Server Component（紹介者名のみサーバで取得しクライアントへ）。`thanks` は Client Component。

### ⑤ その他（認証・法務・ユーティリティ）

| URL | 実装パス | 役割 | 認証 | noindex | 状態 |
|---|---|---|---|---|---|
| `/ja/login` | `login/page.tsx` | ログイン（Magic Link） | 不要（ログイン済→/lms） | なし | ✅稼働中 |
| `/ja/setup-name` | `setup-name/page.tsx` | 表示名（display_name）設定 | 必須（/lms ガード経由） | なし | ✅稼働中 |
| `/ja/privacy` | `privacy/page.tsx` | プライバシーポリシー（静的・3ロケール） | 不要 | なし | ✅稼働中 |
| `/ja/terms` | `terms/page.tsx` | 利用規約（静的・3ロケール） | 不要 | なし | ✅稼働中 |
| `/ja/tokutei` | `tokutei/page.tsx` | 特定商取引法に基づく表記（静的・3ロケール） | 不要 | なし | ✅稼働中 |

---

## 🔌 Section 2: API ルート一覧（`src/app/api/`）

| エンドポイント | メソッド | 役割 | 認証 | 主要な処理 |
|---|---|---|---|---|
| `/api/checkout/stripe` | POST | Stripe Checkout Session 作成 | public（認証ゲートなし） | `priceType`（general/salon・既定 general・未知値は 400）検証 → `getProductPricing(priceType)` で Price ID 取得 → `metadata.price_type` 付与＋`referrer_id`（body→cookie 解決）→ Session URL 返却 |
| `/api/webhooks/stripe` | POST | Stripe Webhook 受信 | 署名検証（`STRIPE_WEBHOOK_SECRET`）+ admin client | `checkout.session.completed`(payment) で ①ユーザー作成/`public.users` INSERT ②**salon 以外**はアフィリエイト報酬計上 ③Magic Link 送信。`price_type==="salon"` は報酬ブロック全スキップ |
| `/api/webhooks/kaihipay` | POST | 会費ペイ Webhook（旧・並行運用） | admin client | 旧決済経路の受講登録系 |
| `/api/pricing` | GET | 公開・LP 価格表示用 API | public | `getProductPricing()`（**general**）を返す。offer-demo 等の表示で使用 |
| `/api/admin/pricing` | GET / PUT | 商品価格設定の取得・更新 | `authorizeAdmin`（owner/admin）+ Basic（proxy） | GET=general 5キー返却。PUT=salePrice 変更時のみ Stripe 新 Price 作成→旧 archive→切替。**salon 2キーは passthrough で保持**（編集はしない） |
| `/api/admin/users` | GET / PATCH | ユーザー一覧・ロール変更 | `getUser` + admin client + role 判定 + Basic | ユーザー管理画面のデータ source |
| `/api/admin/affiliate` | GET / PUT / PATCH | アフィリエイト報酬・報酬率管理 | `getUser` + admin client + Basic | 報酬一覧・支払状態・率設定 |
| `/api/admin/campaign` | GET / POST / PUT / DELETE | キャンペーン期間 CRUD | `authorizeAdmin` + Basic | `campaign_periods`（報酬率スケジュール）管理 |
| `/api/admin/message` | GET / POST | 運営メッセージの取得・保存 | `getUser` + admin client + Basic | 管理ダッシュボードのメッセージ |
| `/api/auth/callback` | GET | Supabase Magic Link コールバック | public（コード交換） | 認証コード→セッション確立→ `next` へリダイレクト |
| `/api/bookmarks` | GET / POST / PATCH / DELETE | 動画ブックマーク（付箋）CRUD | `getUser`（本人のみ） | LMS の付箋機能 |
| `/api/invite/redeem` | POST | 招待コード redeem | `getUser` + admin client | 招待の引き換え処理 |
| `/api/invite/register` | POST | 招待経由の新規登録 | admin client | `referrerId` を受けてリード/ユーザー登録 |
| `/api/user/affiliate` | GET / PATCH | 受講者自身のアフィリエイト情報 | `getUser`（本人） | お豆メッセンジャー/紹介情報 |
| `/api/user/profile` | GET / PATCH | プロフィール取得・更新 | `getUser`（本人） | display_name 等 |
| `/api/user/referral-name` | PATCH | 紹介表示名の更新 | `getUser`（本人） | 招待ページに出る紹介者名 |

---

## 🔀 Section 3: データフロー（重要）

### 3.1 価格データの取得経路

```
system_settings.product_pricing (DB: text/JSON 1行)
        │  ※ getProductPricing(priceType="general"|"salon", client?)  [src/lib/pricing.ts]
        ▼
  priceType で分岐:
    general → salePrice=29800 / stripePriceId=price_1ThrC2...
    salon   → salePrice=salonPrice(9800) / stripePriceId=salonStripePriceId(price_1TkOk1...)
        │   （regularPrice/campaignLabel/showCampaign は共通。戻り型 ProductPricing は不変）
        ├───────────────► [表示] lp-v2/page.tsx → §11 Section11Price / §14 Section14FinalCta に props 伝搬
        │                         （/ja/lp-salon は priceType="salon" を渡す）
        └───────────────► [決済] /api/checkout/stripe が getProductPricing(priceType) で
                                  stripePriceId を取得 → Stripe Checkout の line_items.price に使用
```

- **general / salon の分岐が決まる場所**:
  - フロント表示: `lp-v2/page.tsx` の `priceType` prop（`/ja/lp`=未指定→general、`/ja/lp-salon`=`"salon"`）。
  - 決済: `/api/checkout/stripe` が **POST body の `priceType`** を受け取り `getProductPricing(priceType)`。
- **`/admin/pricing` PUT と salon passthrough の関係**:
  - PUT は `value`（JSON 全体）を置換するため、保存時に **現行の `salonPrice` / `salonStripePriceId` を SELECT して持ち越す（passthrough）**。これが無いと general 価格保存のたびに salon 2キーが消える（`6431fdc` で対策）。
  - PUT が Stripe 新 Price を作るのは **`salePrice` が変化した時のみ**（general 用）。salon Price は管理画面では作成・編集しない。
- **fail-closed**: salon の Price ID が DB にも env（`STRIPE_PRICE_ID_SALON`・現状未設定）にも無い場合、`getProductPricing("salon")` は空 ID を返しログ出力 → `/api/checkout/stripe` が 500（Server misconfiguration）で安全停止。

### 3.2 referrer_id の伝搬経路（アフィリエイト紐付け）

```
紹介リンク /ja/lp?ref=<userId>
        │  proxy.ts が cookie 発行: referrer_id（httpOnly / SameSite=lax / 30日）
        ▼
ユーザーが CTA クリック → CtaButton onClick → POST /api/checkout/stripe（body は referrer 情報を含めない）
        ▼
/api/checkout/stripe が referrer_id を解決（優先順位）:
   1. body.referrerId      … 明示指定（招待フロー /invite/[userId]/thanks が渡す）
   2. cookie referrer_id   … LP の ?ref=xxx 経路（httpOnly のためサーバ側で読む）
   3. なし                  … metadata 未設定
        ▼
Stripe Session metadata.referrer_id
        ▼
/api/webhooks/stripe (checkout.session.completed):
   - metadata.referrer_id があれば affiliate_rewards に INSERT
   - 無ければ email → invite_leads 逆引きフォールバック
   - （ただし price_type==="salon" の場合は §3.3 によりこのブロック全体をスキップ）
```

- **招待フロー（明示）との優先順位**: `body.referrerId`（招待フロー）が **cookie より優先**。`/invite/[userId]/thanks` はパスの `userId` を `referrerId` として body に渡す。
- **フェーズ1 `6451e27` で解消した silent attribution loss**: それ以前は proxy が cookie を発行していても **`/api/checkout/stripe` が cookie を読まず**、LP 経由の `?ref=` 購入は Stripe に紹介者が渡らなかった（招待フローの明示 referrer か webhook の email フォールバックのみ機能）。`6451e27` で「cookie の server-side consumer」を追加し、`?ref=` → cookie → checkout → webhook の一気通貫が成立。

### 3.3 priceType の伝搬経路（フェーズ2 で新設）

```
/ja/lp-salon (lp-salon/page.tsx, noindex)
        │  <LpV2Page params={params} priceType="salon" />
        ▼
LpV2Page (lp-v2/page.tsx)  priceType を以下へ伝搬:
   - §1 Section01Hero(priceType)        → salon 時 eyebrow を "For Salon Members" に置換
   - §11 Section11Price(priceType)      → salon 時 "サロンメンバー特別価格" バッジ + ¥9,800
   - §14 Section14FinalCta(priceType)   → 同上
   - 各 CtaButton(priceType)
        ▼
CtaButton onClick → fetch POST /api/checkout/stripe
        body: { priceType: priceType ?? "general" }
        ▼
/api/checkout/stripe: priceType 検証 → getProductPricing(priceType) → salon Price ID
        → Stripe Session metadata.price_type = "salon"
        ▼
/api/webhooks/stripe: metadata.price_type === "salon" の場合、
        アフィリエイト報酬ブロック（referrer_id 計算 + invite_leads 逆引き + affiliate_rewards INSERT）
        を**全スキップ**。受講登録 / Magic Link は通常実行。
```

- `/ja/lp`（無引数 `LpV2Page`）は `priceType` 未指定＝`"general"`。CtaButton も body に `priceType:"general"` を送る（後方互換）。

---

## 💰 Section 4: 価格情報の管理体系

`system_settings.product_pricing`（**text 列に JSON 文字列**で保存。`id="product_pricing"`）の現在のスキーマ:

| キー | 用途 | 現在値 | 編集経路 |
|---|---|---|---|
| `regularPrice` | 見せ消し用通常価格 | `34800` | `/admin/pricing`（PUT） |
| `salePrice` | 一般販売価格 | `29800` | `/admin/pricing`（PUT・変更時 Stripe 新 Price 自動生成） |
| `salonPrice` | サロン特別価格 | `9800` | **SQL 直接**（管理画面 UI 未対応・PUT は passthrough 保持のみ） |
| `stripePriceId` | 一般用 LIVE Price ID | `price_1ThrC2InPC8i74zBcrHR8Isr` | `/admin/pricing` から自動更新 |
| `salonStripePriceId` | サロン用 LIVE Price ID | `price_1TkOk1InPC8i74zBNPFPTito` | **SQL 直接**（管理画面 UI 未対応） |
| `showCampaign` | キャンペーン表示制御 | `true` | `/admin/pricing`（PUT） |
| `campaignLabel` | キャンペーン文言 | `"発売記念キャンペーン特別価格"` | `/admin/pricing`（PUT） |

- 読み取りは `getProductPricing()` 専用（Service Role の admin client）。DB 欠落/パース失敗時は env + 既定値へフォールバック（general=`STRIPE_PRICE_ID_OMAME_BASIC`、salon=`STRIPE_PRICE_ID_SALON`〔現状未設定〕）。
- フェーズ1 時点の既知課題として DB の `stripePriceId` が **test mode Price** だったため LIVE キーで `resource_missing` になる事象があり、SQL 直接更新で LIVE Price（`price_1ThrC2...`）へ修正済み。

---

## ❄️ Section 5: 凍結・廃止予定の整理

| 対象 | 状態 | 理由 | 廃止予定 |
|---|---|---|---|
| `/ja/offer-demo` | ❄️凍結 | lp-v2 が決済完結化したため購入導線として不要 | 販売開始の安定運用を確認後に撤去判断 |
| `/api/webhooks/kaihipay` | 🟡並行運用（旧） | 旧・会費ペイ決済経路。Stripe 経路と並存中 | 旧経路の終息後に撤去判断（明記された廃止期日なし） |
| `/ja/lp-v2`（URL として） | ✅実体・併存 | 正本は `/ja/lp`。`lp-v2` も同一表示で直アクセス可 | 撤去予定なし（実装の正本ディレクトリ） |

---

## 🗂 Section 6: 今夜の変更で影響を受けたファイル一覧

### フェーズ1 — `6451e27`（lp-v2 を決済完結化＋referrer_id cookie 解決）

| ファイル | 役割 |
|---|---|
| `src/app/[lang]/lp-v2/ui.tsx` | `CtaButton` を `<a href=offer-demo target=_blank>` → `<button onClick>` で Stripe 直結・同タブ化。二度押し防止（loading/disabled） |
| `src/app/[lang]/lp-v2/sections/Section11Price.tsx` | CtaButton 呼び出しから未使用 `lang` 除去 |
| `src/app/[lang]/lp-v2/sections/Section14FinalCta.tsx` | 同上（§14 自身の footer 用 `lang` は維持） |
| `src/app/[lang]/lp-v2/page.tsx` | `Section11Price` への `lang` 受け渡し除去 |
| `src/app/api/checkout/stripe/route.ts` | referrer_id を body→**httpOnly cookie**→none で解決。`cancel_url` を `/ja/offer` → `/ja/lp` |

### フェーズ2 バックエンド — `6431fdc`（salon 価格種別＋報酬除外）

| ファイル | 役割 |
|---|---|
| `src/lib/pricing.ts` | `getProductPricing(priceType="general"\|"salon", client?)`。`PriceType` 型 export。salon 時 salePrice/stripePriceId 差し替え・fail-closed ログ |
| `src/app/api/admin/pricing/route.ts` | PUT に salon 2キー passthrough（データ消失防止） |
| `src/app/api/checkout/stripe/route.ts` | body `priceType` 受領・検証（不正値 400）・`metadata.price_type` 付与 |
| `src/app/api/webhooks/stripe/route.ts` | `price_type==="salon"` で報酬ブロック全スキップ（受講登録/Magic Link は通常実行） |

### フェーズ2 フロントエンド — `c5995f7`（/lp-salon ＋ salon UI）

| ファイル | 役割 |
|---|---|
| `src/app/[lang]/lp-v2/page.tsx` | `LpV2Page({ params, priceType="general" })`。`getProductPricing(priceType)`＋§1/§11/§14 へ伝搬 |
| `src/app/[lang]/lp-v2/ui.tsx` | `CtaButton` に `priceType` prop。fetch body に `priceType` を含める |
| `src/app/[lang]/lp-v2/sections/Section01Hero.tsx` | salon 時 eyebrow を「For Salon Members」に置換 |
| `src/app/[lang]/lp-v2/sections/Section11Price.tsx` | salon バッジ「サロンメンバー特別価格」＋ CtaButton へ priceType |
| `src/app/[lang]/lp-v2/sections/Section14FinalCta.tsx` | 同上（バッジ＋ CtaButton priceType） |
| `src/app/[lang]/lp-salon/page.tsx` | **新規**。`<LpV2Page priceType="salon" />` 薄ラッパー＋`force-dynamic`＋noindex/nofollow metadata |

---

## 🧩 Section 7: 既知の技術的負債（ページ構成に関わるもの）

| # | 内容 | 事実 |
|---|---|---|
| 1 | **価格管理画面に salon 編集 UI なし** | `/admin/pricing`（ページ・GET/PUT）は general 5キーのみ。`salonPrice` / `salonStripePriceId` は **SQL 直接**でしか変更できない（PUT は passthrough 保持のみ） |
| 2 | **checkout の success_url / cancel_url がドメイン環境変数依存** | `siteUrl = NEXT_PUBLIC_SITE_URL || request.origin || "https://omamepiano.com"`。`NEXT_PUBLIC_SITE_URL` 未設定時はリクエスト origin にフォールバックするため、プレビュー環境（`*.vercel.app`）等では意図しないドメインになり得る。success=`/ja/lms`、cancel=`/ja/lp` |
| 3 | **offer-demo の最終撤去判断保留** | ❄️凍結中（Section 5）。コード・ルートとも残存 |
| 4 | **`STRIPE_PRICE_ID_SALON`（env）未設定** | salon は DB の `salonStripePriceId` のみに依存。DB から消えると fail-closed（salon checkout 500） |
| 5 | **`main` 直 push 運用** | フェーズ1/2 とも feature ブランチ・PR を介さず `main` へ直 push（branch protection 未設定の既存運用） |
| 6 | **ローカル `.env.local` が LIVE Stripe キー** | 開発用テストキーではなく本番 LIVE キーを参照。テストカード不可・ローカル検証は incomplete セッション作成のみで実施した経緯あり |
| 7 | **旧 `kaihipay` webhook の並行運用** | `/api/webhooks/stripe` と `/api/webhooks/kaihipay` が併存（旧決済経路の終息待ち） |
| 8 | **`/ja/lp` と `/ja/lp-v2` の二重 URL** | 同一コンポーネントが2 URL で配信（正本は `/lp`）。SEO 上の重複の可能性 |

---

*以上。実装（commit `c5995f7` 時点）をコードから読み取った事実ベースの記述。`/admin/*` の細部やロール判定の厳密さは各 API ルート実装（`authorizeAdmin` または `getUser`＋role）を要参照。*
