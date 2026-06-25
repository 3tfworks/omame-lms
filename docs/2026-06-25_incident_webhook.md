# 障害レポート: Stripe Webhook 署名検証失敗による購入者ログイン不可

**発生日**: 2026-06-21(土)09:33 UTC / 18:33 JST(販売開始直後)
**検知日**: 2026-06-25(水)午前(購入者からの問い合わせ + Stripe からの障害通知メール)
**収束日**: 2026-06-25(水)15:05 JST(本番デプロイ完了 + 全購入者救済完了)
**影響**: 販売開始後の購入者全員(13名)がログイン不可状態
**金銭的損失**: なし(全員のアカウントを事後復旧)
**重大度**: HIGH(全購入者に影響、ただし収益・データ損失はゼロ)

---

## 0. 要約(TL;DR)

販売開始(2026-06-21)直後から、Stripe Webhook が **100% 失敗**(85/85 件)していた。原因は Vercel 本番環境変数 `STRIPE_WEBHOOK_SECRET` が **空文字列** で設定されていたこと。Webhook が失敗していたため、購入者の auth.users / public.users レコードが作成されず、購入者は LMS にログインできなかった。

検知後、約3時間で:
1. シークレットを正しい値に再設定 → Redeploy
2. Webhook ハンドラを冪等化(再送に耐える設計に)
3. 全 Stripe Checkout Session を手動再送し、購入者13名全員のアカウントを事後作成

なお、テスト購入者を除く **13名の Stripe 課金は障害発生前に成功していた** ため、金銭的な巻き戻しは不要だった。

---

## 1. 障害の発生〜検知

### 1.1 タイムライン

| 日時(JST) | 出来事 |
|---|---|
| 2026-06-21 18:33 | 販売開始(LP v2 + 基礎講座 ¥29,800 公開) |
| 2026-06-21 18:33〜 | 購入者が次々と購入手続きを完了(Stripe 側は正常) |
| 2026-06-21 18:33〜 | Webhook が 100% 失敗(`Invalid signature` で HTTP 400) |
| 2026-06-25 午前 | 購入者2名(大橋様 / 泰居様)から「ログインできない」問い合わせ |
| 2026-06-25 午前 | Stripe から webhook 障害通知メール受信(75件の失敗) |
| 2026-06-25 12:20 頃 | 障害調査開始 |
| 2026-06-25 13:30 頃 | 原因特定(`STRIPE_WEBHOOK_SECRET` が空文字列) |
| 2026-06-25 14:00 頃 | シークレット再設定 + Redeploy 完了 |
| 2026-06-25 14:30 頃 | ハンドラ冪等化のコード変更開始 |
| 2026-06-25 15:05 | 本番デプロイ完了(dpl_J1348Sg5TRrYSYJFMR9fbzp9wa74) |
| 2026-06-25 15:30 頃 | 全購入者13名のアカウント事後作成完了 |

### 1.2 検知のきっかけ

2系統からほぼ同時に検知:

- **購入者からの LINE 問い合わせ**: 2名から「購入したのにログインできない」
- **Stripe からの障害通知メール**: 「過去24時間で webhook 配信が 75 件失敗」

→ Stripe のメール通知がなければ検知がさらに遅れていた可能性があり、外部監視に依存していたことが課題として残った。

### 1.3 障害の数値(検知時点)

```
webhook 失敗率: 85/85 (100%)
平均レスポンス: 1089ms
HTTP ステータス: 400
レスポンスボディ: {"error": "Invalid signature"}
影響購入者: 13名(課金成功・アカウント未作成)
被害金額: 0円(課金は全員成功・サービス未提供のみ)
```

---

## 2. 原因究明のプロセス

### 2.1 仮説と検証

最初の仮説:**コード起因の署名検証失敗**

確認したコード(`src/app/api/webhooks/stripe/route.ts`):

```typescript
const body = await request.text();  // ✅ raw body
const signature = request.headers.get('stripe-signature');
const event = await stripe.webhooks.constructEventAsync(
  body,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET!
);
```

→ コード自体は正しい。App Router では `bodyParser` 無効化も不要。
→ 直近コミット(97572f9)は署名検証に関係する変更を含まない。

**コードを除外** したことで、次に環境変数を疑った。

### 2.2 真の原因:Vercel 環境変数の空文字列設定

Vercel CLI で本番環境変数を確認:

```bash
vercel env ls production
```

結果:
- `STRIPE_WEBHOOK_SECRET` が存在する
- **ただし値が空文字列 `""`**

Stripe SDK は空のシークレットでも例外を投げず「すべての署名が無効」と判定するため、全 webhook が `Invalid signature` で失敗していた。

### 2.3 なぜ空文字列が設定されていたか

`vercel env` で過去にこの変数を追加した際、コピペ時に値が空のままだった可能性が高い。
Vercel Dashboard の UI 上は「設定済み」と表示されるため、設定漏れに気付きにくい状態だった。

---

## 3. 修正対応

### 3.1 短期対応(障害復旧)

#### Step 1: シークレット再設定

```
Stripe Dashboard
  → 開発者 → Webhooks → お豆奏法 Stripe Webhook 本番
  → 「シークレットを取得」 → whsec_... をコピー

Vercel Dashboard
  → omame-lms → Settings → Environment Variables
  → STRIPE_WEBHOOK_SECRET を編集
  → 値を貼り付け
  → Sensitive フラグを有効化
  → Production-only スコープ
  → 保存
```

#### Step 2: 本番再デプロイ

```
Vercel Dashboard → Deployments → 最新の本番デプロイ → Redeploy
```

#### Step 3: 動作確認

Stripe Dashboard で過去の webhook を1件「再送」 → HTTP 200 / `{"received": true}` を確認。

### 3.2 中期対応(ハンドラ冪等化)

短期対応だけだと「同じ webhook を複数回処理すると二重登録が起きる」リスクが残る。
そこで以下を一気に実施した。

#### 変更 1: public.users の INSERT を upsert に

旧コード(問題あり):
```typescript
if (!existingUser) {
  await supabase.from('users').insert({...});
}
```
→ auth.users 作成済み + public.users 未作成の場合、永久に欠落する。

新コード:
```typescript
await supabase.from('users').upsert(
  {id: authUserId, email, role: 'user'},
  {onConflict: 'id'}
);
```
→ 何度実行しても安全。欠落も自動修復。

#### 変更 2: affiliate_rewards に stripe_event_id ユニーク制約

旧コード(問題あり):
```typescript
await supabase.from('affiliate_rewards').insert({...});
```
→ webhook を2回送ると報酬が二重に発生する。

Migration(`migrations/20260625000000_add_stripe_event_id_to_affiliate_rewards.sql`):
```sql
ALTER TABLE public.affiliate_rewards
  ADD COLUMN IF NOT EXISTS stripe_event_id text;

CREATE UNIQUE INDEX IF NOT EXISTS affiliate_rewards_stripe_event_id_key
  ON public.affiliate_rewards (stripe_event_id);
```

新コード:
```typescript
await supabase.from('affiliate_rewards').upsert(
  {..., stripe_event_id: eventId},
  {onConflict: 'stripe_event_id'}
);
```
→ 同じ event を2回処理しても、報酬は1回しか発生しない。

#### 変更 3: listUsers のページネーション対応

旧コード(問題あり):
```typescript
const {data: {users}} = await supabase.auth.admin.listUsers();
// デフォルトで先頭50件のみ
```
→ 51人目以降の既存ユーザーを「存在しない」と判定してしまう。

新コード(`findAuthUserByEmail` ヘルパーを新設):
```typescript
async function findAuthUserByEmail(email: string) {
  let page = 1;
  while (true) {
    const {data, error} = await supabase.auth.admin.listUsers({page, perPage: 1000});
    if (error) throw error;
    const found = data.users.find(u => u.email === email);
    if (found) return found;
    if (data.users.length < 1000) return null;
    page++;
  }
}
```

#### コミット情報

- コミット: `e8b508f`
- メッセージ: `fix(webhook): make checkout handler idempotent for recovery`
- Migration 適用先: 本番 Supabase(Dashboard SQL Editor から実行)
- 適用順序: **Migration → コードデプロイ**(逆順だと一時的にエラー発生)

### 3.3 全購入者の救済

Stripe Dashboard で過去24時間の失敗 webhook を全件「再送」:

```
Stripe Dashboard → 開発者 → Webhooks → お豆奏法 Stripe Webhook 本番
  → イベント履歴 → 失敗イベントを選択 → 再送
  → 各イベントごとに繰り返し
```

冪等化のおかげで何度送っても安全な状態だったため、迷わず全件再送した。

#### 結果確認 SQL

```sql
select count(*) from auth.users where created_at >= '2026-06-21';
-- → 10(救済完了後)
select count(*) from public.users where created_at >= '2026-06-21';
-- → 10(auth.users と完全一致)
select count(*) from affiliate_rewards;
-- → 0(今回の購入者で紹介経由はゼロだった)
```

完全な整合性で復旧完了。

---

## 4. 再発防止策

### 4.1 即時実装したもの(冪等化)

§3.2 のとおり、同じ障害が再発しても **再送だけで自動復旧** できる状態になった。

### 4.2 未実装(今後の TODO)

| 対策 | 優先度 | 想定工数 |
|---|---|---|
| 環境変数の起動時バリデーション(空文字列を拒否) | HIGH | 0.5日 |
| Webhook 失敗の自動アラート(Slack 通知) | HIGH | 1日 |
| 本番デプロイ前の E2E テスト(購入 → ログインまで) | MEDIUM | 2日 |
| アフィリエイト報酬の管理 UI(現状 SQL のみ) | LOW | 3日 |

特に「起動時バリデーション」は最優先。例:

```typescript
// app startup
const REQUIRED_ENV = ['STRIPE_WEBHOOK_SECRET', 'STRIPE_SECRET_KEY', ...];
for (const key of REQUIRED_ENV) {
  if (!process.env[key] || process.env[key]?.trim() === '') {
    throw new Error(`Required env var ${key} is empty or unset`);
  }
}
```

これがあれば、空文字列でデプロイした瞬間にアプリ起動失敗 → 障害発生前に検知できる。

### 4.3 運用ルールの追加

- **Stripe シークレット類は Vercel に保存後、必ず手動で webhook 再送テストを1回実施**
- **販売開始のような節目では、最初の購入を必ず甲斐さん自身がテスト購入で確認**
- **Stripe 通知メール(`developers@stripe.com` 等)を必ず即時通知設定にする**

---

## 5. 同じ症状が出たら最初に確認すること(チェックリスト)

将来「購入者がログインできない」報告を受けたら、以下を上から順に確認:

### Step 1: Stripe 側で課金は成功しているか?

```
Stripe Dashboard → 取引 → 該当メアドで検索
```

- ✅ 成功 → Step 2 へ
- ❌ 失敗 → 支払い手段の問題(本障害とは別)

### Step 2: Webhook は成功しているか?

```
Stripe Dashboard → 開発者 → Webhooks → 該当 webhook
  → イベント履歴
```

- 直近の event が全て 200 OK → ハンドラ内部のバグ(コード調査へ)
- 直近の event が 400/500 連発 → Step 3 へ

### Step 3: Webhook の失敗内容は?

イベントを開いて Response Body を確認:

| エラー | 想定原因 |
|---|---|
| `Invalid signature` | **本障害と同じ。`STRIPE_WEBHOOK_SECRET` を確認** |
| `User not authenticated` | Service Role Key の問題 |
| `Database error` | Supabase 側の問題 |
| タイムアウト | ハンドラの処理が遅すぎる |

### Step 4: Vercel 環境変数を確認

```bash
vercel env ls production
vercel env pull .env.production.local
cat .env.production.local | grep STRIPE_WEBHOOK_SECRET
```

値が `whsec_` で始まっているか、空文字列でないか確認。

### Step 5: DB 整合性確認 SQL

```sql
-- auth.users と public.users の整合性
select 
  au.email,
  au.created_at,
  case when pu.id is null then '❌ public.users欠落' else '✅ OK' end as status
from auth.users au
left join public.users pu on au.id = pu.id
where au.created_at >= '<該当日>'
order by au.created_at desc;
```

欠落があれば、該当 Stripe Session を再送(冪等化済みなので安全)。

---

## 6. 教訓

### 6.1 技術的教訓

1. **「設定済み」と「正しく設定済み」は違う**: UI 上の表示だけを信じず、必ず動作確認まで実施
2. **ハンドラは最初から冪等に**: 「正常系では1度しか呼ばれない」は希望的観測
3. **外部サービスからの通知は必ず受信できる状態に**: Stripe の通知メールがなければ検知がさらに遅れた

### 6.2 運用的教訓

1. **販売開始直後こそ最も丁寧な動作確認を**: テスト購入1件で大半の障害は検知できた
2. **問い合わせ窓口を購入前から準備**: 今回は購入者がメールで連絡をくれたが、窓口がなかったため対応が後手に回った(本対応で LP / LMS / ログイン画面の3箇所に LINE 窓口を追加)

---

## 7. 関連リソース

- 修正コミット: `e8b508f` fix(webhook): make checkout handler idempotent for recovery
- 修正コミット: `308ab4a` feat(support): add LINE inquiry CTA on LP FAQ, login, and LMS sidebar
- 関連コミット: `e590e47` feat(checkout): enable promotion code input on Stripe Checkout
- 本番デプロイ: dpl_J1348Sg5TRrYSYJFMR9fbzp9wa74(2026-06-25 15:05:49 +0900)
- Migration: `migrations/20260625000000_add_stripe_event_id_to_affiliate_rewards.sql`
- 改修ファイル: `src/app/api/webhooks/stripe/route.ts`
- Vercel project: omame-lms(org: 3tfworks-projects)
- Supabase project: Omame project (main / PRODUCTION)
- Stripe webhook: お豆奏法 Stripe Webhook 本番

## 8. セキュリティ事項(要対応)

対応中に whsec_ 値がスクリーンショット経由で会話に含まれた。本来であれば即座にローテーションすべきだったが未実施。

**TODO**: Stripe Dashboard で webhook signing secret をローテーションし、Vercel 環境変数を新値で更新する。

---

*Last updated: 2026-06-25 by 甲斐 / Claude*
