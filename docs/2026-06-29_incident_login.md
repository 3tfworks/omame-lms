# 障害レポート: apex/www ドメイン不一致による Magic Link 認証 callback 失敗

**発生日**: 2026-06-25 以降(再ログインフェーズへ移行した購入者に潜在発症)
**検知日**: 2026-06-29(月)21:00 頃 JST(購入者からの LINE / メール問い合わせ複数件)
**収束日**: 2026-06-29(月)22:32 JST(Supabase URL Configuration 修正完了 + 検証合格)
**影響**: 6/25 以降の購入者のうち、初回ログイン後にセッションが切れて再ログインを試みた全員
**金銭的損失**: なし(課金・データ損失ゼロ。サービス再入場のみ不能)
**重大度**: HIGH(再ログイン購入者全員に影響、ただし収益・データ損失はゼロ)

---

## 0. 要約(TL;DR)

Vercel が `omamepiano.com`(apex)を `www.omamepiano.com` へ **308 リダイレクト**(www 統一)している一方、Supabase の **URL Configuration が apex のみ**(Site URL = apex、Redirect URLs も apex のみ)だったことが原因。

ユーザーは常に www でアクセスするため、ログイン画面の `signInWithOtp`(クライアント側 **PKCE**)が生成する `code_verifier` cookie は **www に host-only で発行**される。しかし `emailRedirectTo = www` が allowlist に無いため、Supabase が **Site URL = apex にフォールバック** → メール内リンクは apex → クリックで apex 着地 → Vercel 308 で www へ → この **host ホップ中に PKCE の code_verifier 整合が崩れ** `exchangeCodeForSession` が失敗。`/ja/login?error=Invalid+Link` に戻されるが、ログイン画面は `?error=` を表示しないため、ユーザーには「何も起きずに login 画面に戻った」と見えていた。

**コード変更は不要**。Supabase Dashboard の URL Configuration を以下のように修正して解消:
1. Site URL を apex → **www** に変更
2. Redirect URLs に **www の2件を追加**(既存の apex 2件は維持)

検知から約 1 時間半で収束。コミット・Vercel・DB はいずれも無変更。

---

## 1. 障害の発生〜検知

### 1.1 タイムライン

| 日時(JST) | 出来事 |
|---|---|
| 2026-06-21 18:33 | 販売開始。以降、apex/www 不一致は潜在していたが再ログイン未到達のため不可視 |
| 2026-06-25 15:05 | webhook 障害復旧デプロイ(dpl_J1348)。**新規購入者の auth.users 作成が正常化** |
| 2026-06-25 以降 | 購入者が順次「セッション切れ後の再ログイン」フェーズへ突入 → 障害が表面化 |
| 2026-06-29 21:00 頃 | 購入者から「ログインできない」報告(LINE / メール 複数件) |
| 2026-06-29 21:35 | SQL (a) で auth.users 健全を確定 → H1(削除巻き込み)を否定 |
| 2026-06-29 21:50 | Resend ダッシュボード確認、メール送信は **全件 Delivered** と判明(送信側を除外) |
| 2026-06-29 22:02 | Supabase URL Configuration のスクショで **apex/www mismatch** を発見 |
| 2026-06-29 22:10 | 仮説 H8(PKCE host 不一致)に収束、最終監査を実施 |
| 2026-06-29 22:25 | Magic Link テンプレートの clean(host 手書きなし)を確認、**GO 判定** |
| 2026-06-29 22:30 | URL Configuration 修正実施(Site URL を www に変更 + Redirect URLs 追加) |
| 2026-06-29 22:32 | シークレットウィンドウで Test 1・Test 2 ともに `/ja/lms` 着地確認、**修正完了** |

### 1.2 検知のきっかけ

購入者からの **LINE / メール問い合わせ複数件**。前回障害(6/25)の対応で LP / LMS / ログイン画面の3箇所に追加した公式 LINE 窓口が、今回の早期検知に寄与した。

### 1.3 障害の数値・影響範囲

```
症状:           メール届く → リンク押下 → ログインできず login 画面に戻る → エラー UI 出ない
影響ユーザー数(推定): 6/25 以降の購入者 15〜20 名(Resend の OTP 送信履歴ベース)
直接報告:        2名(yuka4778@yahoo.co.jp / cherish.862.naoko@gmail.com)
メール配信:      全件 Delivered(送信・配信は正常)
auth.users:      健全(削除・BAN なし)
被害金額:        0円
```

高頻度試行ユーザー(救済優先度が高い):

| メール | 試行回数 |
|---|---|
| yuka4778@yahoo.co.jp | 6h で 5 回 |
| cherish.862.naoko@gmail.com | 6h で 3 回 |
| marotanrum39 | 5h で 4 回 |
| play_rythmique | 12h で 4 回 |

---

## 2. 原因究明のプロセス

### 2.1 仮説の変遷と棄却

| 仮説 | 内容 | 判定 | 根拠 |
|---|---|---|---|
| H1 | §4.2 クリーンアップで該当ユーザーを巻き込み削除 | **棄却** | SQL で auth.users 健全(削除・BAN なし)を確認 |
| H2 | 6/25 以降のコミット(308ab4a / e590e47)による認証回帰 | **棄却** | auth 系コードは 5/14 以降不変。308ab4a は login/page.tsx に LINE CTA を**追加しただけ**、e590e47 は Stripe に1行追加のみ。いずれも auth 未接触 |
| H3 | Supabase 側のメール送信障害(SMTP / rate limit) | **棄却** | Resend 全件 Delivered |
| H8 | **apex/www ドメイン不一致による PKCE callback 失敗** | **確定** | URL Configuration が apex のみ + Vercel 308(www 統一)の組み合わせ |

### 2.2 確定した根本原因(H8)

- **Vercel**: `omamepiano.com`(apex)→ `www.omamepiano.com` に 308 リダイレクト(www 統一)
- **Supabase**: Site URL = `https://omamepiano.com`(apex)、Redirect URLs も apex のみ
- **ブラウザ**: ユーザーは常に www でアクセス → PKCE の `code_verifier` cookie は **www で host-only 発行**(`@supabase/ssr` は cookie に `domain` を指定しないため host-only)
- ユーザーが `signInWithOtp` すると `emailRedirectTo = www` だが allowlist に無く、Supabase が **Site URL = apex にフォールバック**
- メール内リンクは apex → クリックで apex に着地 → Vercel が **308 で www へリダイレクト**
- `exchangeCodeForSession` 時に PKCE の `code_verifier` が不一致、または code が消費済みで**失敗**
- `/ja/login?error=Invalid+Link` にリダイレクトされるが、ログイン画面は `error` param を読まず**無表示**
- ユーザーには「何も起きずに login 画面に戻った」と認識される

### 2.3 なぜ初回ログインは成功していたか

- **Stripe webhook 経由の OTP** は内部で PKCE を使わない(`code_verifier` 不要)ため、**host ホップに耐性がある**
- ログイン画面からの OTP(**クライアント側 PKCE**)だけが host 不一致で破綻
- この「初回成功・再ログイン失敗」の非対称性が、PKCE 有無の差を示す決定的な手がかりだった

### 2.4 なぜ 6/25 以降に表面化したか

- 6/25 の webhook 修正(dpl_J1348)で、新規購入者の auth.users 作成が**正常化**
- 販売開始(6/21)以降のユーザーが続々と「セッション切れ後の再ログイン」フェーズに入り始めた
- それまでは webhook 障害で auth.users 自体が存在せず、**再ログイン以前の問題で潜在原因が隠れていた**

---

## 3. 修正対応

### 3.1 修正内容(コード変更なし)

Supabase Dashboard → **Authentication → URL Configuration** で以下を変更:

**(a) Site URL**

```
before: https://omamepiano.com
after:  https://www.omamepiano.com
```

**(b) Redirect URLs に追加(既存2件は維持)**

```
追加: https://www.omamepiano.com/**
追加: https://www.omamepiano.com/api/auth/callback**
維持: https://omamepiano.com/**
維持: https://omamepiano.com/api/auth/callback**
```

> apex を**残した**理由: webhook の `emailRedirectTo`(`NEXT_PUBLIC_SITE_URL || apex`)や、過去メール・ブックマークの apex リンクを巻き込まないため。両方残すことで初回ログイン経路を一切壊さない。

### 3.2 修正後の成立経路

```
www で再ログイン → code_verifier cookie を www に保存
emailRedirectTo = www/api/auth/callback
  ↓ allowlist に www あり → Supabase が emailRedirectTo を尊重(フォールバック不発)
メール内リンクの redirect_to = www
  ↓ クリック → supabase verify → 302 → www/api/auth/callback?code=X(apex を経由しない＝308 なし)
www/api/auth/callback で server client が www の cookie を読む
  → code_verifier 一致 → exchangeCodeForSession 成功 → セッション cookie を www に発行
  ↓ redirect /ja/lms
proxy.ts getUser() が www の新セッションを検証 → 通過 → /lms 表示 ⭕
```

### 3.3 実施順序

1. www の Redirect URLs 2件を入力(**純加算・副作用ゼロ**)
2. Site URL を www に変更
3. 一括 Save(同一フォームのため実質的に同時適用)

---

## 4. 検証

シークレットウィンドウ(クリーン cookie)で実施:

| テスト | 内容 | 結果 |
|---|---|---|
| Test 1 | 初回ログイン → `/ja/lms` 着地 | ⭕ OK |
| Test 2 | ログアウト → **再ログイン** → `/ja/lms` 着地 | ⭕ OK(本丸テスト合格) |

判定に用いたログ:

- **Supabase Auth Logs**: `flow_state_not_found` / `otp_expired` が出ないこと
- **Vercel Logs(/api/auth/callback)**: `302 → /ja/lms`(`?error=Invalid+Link` でないこと)、`Auth callback error` ログ無し

---

## 5. 再発防止策(TODO)

| 対策 | 優先度 |
|---|---|
| (a) `NEXT_PUBLIC_SITE_URL` の確認と www への統一(現在は apex デフォルト) | HIGH |
| (b) Vercel デプロイドメインと Supabase Site URL の整合性を起動時 or CI で検証 | HIGH |
| (c) handover 文書に「最終本番デプロイ ID」を明示するルール(下記参照) | MEDIUM |
| (d) コミットメッセージで auth/login パスを変更する場合は "UIのみ" と書かず、ファイルパスを必ず明記(下記参照) | MEDIUM |
| (e) ログイン画面で `?error=` パラメータを表示する(現在は無視されユーザーが障害を認識できなかった) | MEDIUM |
| (f) 本番デプロイは `git push origin main` 経由のみとし、`vercel --prod` 等の直 deploy を禁止(git 履歴と本番状態の drift 防止) | HIGH |

補足:

- **(c) について**: 今回 handover に「最終本番デプロイ = dpl_J1348」と記載されていたが、実際は後続に **dpl_DEo64(6/25 16:22)・dpl_EGjp8(6/26 00:53)** が存在した。調査初期に基準デプロイの取り違えを招いた。
- **(d) について**: コミット 308ab4a は handover 上「UIのみ」とされていたが、実際は `src/app/[lang]/login/page.tsx` を変更していた(内容は LINE CTA の追加で auth ロジックには無関係)。パス明記があれば容疑切り分けが早まった。
- **(f) について**: 本番デプロイは `git push origin main` 経由のみとする。`vercel --prod` 等の直 deploy は禁止する。直 deploy は git 履歴と本番状態の drift を発生させ、(1) handover で「何が本番にいるか」を正確に書けなくなり、(2) 次の git push で想定外コミットが連れていかれる事故を起こす。2026-06-30 の §7.5 push で計6コミットが意図せず一括反映された事象が実例。今回は過去の直 deploy で既に本番化済みだったため drift 解消で済んだが、僥倖であり再発防止策として禁止する。

---

## 6. 同じ症状が出たら最初に確認すること(チェックリスト)

将来「購入者がログインできない(リンク後に進めない)」報告を受けたら、上から順に確認:

### Step 1: メールは届いているか?(送信側 vs callback 側の切り分け)

```
Resend Dashboard → Emails → 該当メアドで検索
```

- ❌ 届いていない → **送信側**(rate limit / SMTP / shouldCreateUser:false でユーザー不在)を疑う
- ⭕ 届いている(Delivered) → Step 2 へ(**callback 側**を疑う)

### Step 2: auth.users は健全か?

```sql
SELECT id, email, deleted_at, banned_until, last_sign_in_at
  FROM auth.users
 WHERE email = '<該当メアド>';
```

- 行が無い / `deleted_at` あり / `banned_until` あり → データ側(削除・BAN)を疑う
- 健全 → Step 3 へ

### Step 3: リンク押下後どこに着地するか?(本障害の核心)

ブラウザの URL バーと Vercel Logs を確認:

| 着地 / ログ | 想定原因 |
|---|---|
| `/ja/login?error=Invalid+Link` に戻る | **本障害と同じ。URL Configuration の apex/www 不一致を確認** |
| `/api/auth/callback` が呼ばれていない | メール未到達側(Step 1 に戻る) |
| `flow_state_not_found` / `otp_expired` | PKCE verifier 不一致 or リンク期限切れ |

### Step 4: Supabase URL Configuration を確認

```
Authentication → URL Configuration
  - Site URL が実アクセス host(www)と一致しているか
  - Redirect URLs に www / apex 両方の callback が含まれているか
```

Vercel のドメインリダイレクト(apex↔www)と**矛盾していないか**を必ず突き合わせる。

---

## 7. 教訓

### 7.1 技術的教訓

1. **ドメイン正規化と認証設定の整合は盲点**: 「Vercel の apex→www 308 リダイレクト」と「Supabase の URL Configuration」の整合性は、コードレビューや handover では気付きにくい
2. **PKCE の code_verifier cookie は host-only**: `@supabase/ssr` のデフォルト挙動。host が変わると verifier が引き継がれず callback が落ちる
3. **「初回成功・再ログイン失敗」は PKCE 非対称性のサイン**: webhook 経由(非 PKCE)とログイン画面(PKCE)でフローが異なるため起こり得る

### 7.2 運用的教訓

1. **障害切り分けは「送信側 vs callback 側」を分けて聞く**: 「メールが届いているか」「リンククリック後どうなるか」を分離しないと原因系統を特定できない
2. **基準(最終デプロイ・変更ファイル)は ID / パスで残す**: 曖昧な記載(「最終デプロイ」「UIのみ」)は調査の初動を遅らせる

---

## 8. 関連リソース

- **前回障害**: `docs/2026-06-25_incident_webhook.md`(webhook 起因の auth.users 未作成)
- **関連コミット**: なし(**コード変更なしで解消**)
- 容疑として精査したコミット(いずれも auth 無関係と確定):
  - `308ab4a` feat(support): add LINE inquiry CTA(login/page.tsx に CTA 追加のみ)
  - `e590e47` feat(checkout): enable promotion code(Stripe に1行追加のみ)
- **関連デプロイ(現本番)**: `dpl_EGjp8hjxiAweAZAkBUze2t6sTpwq`(2026-06-26 00:53 JST)
- 調査で判明した本番デプロイ時系列:
  - `dpl_J1348Sg5TRrYSYJFMR9fbzp9wa74`(6/25 15:05、webhook 復旧)
  - `dpl_DEo64TqSzndifj4fhrnDvtCGpJTC`(6/25 16:22、308ab4a)
  - `dpl_EGjp8hjxiAweAZAkBUze2t6sTpwq`(6/26 00:53、e590e47、現本番)
- 改修対象: Supabase Dashboard → Authentication → URL Configuration(**コード・Vercel・DB は無変更**)
- Vercel project: omame-lms(org: 3tfworks-projects)
- Supabase project: Omame project(main / PRODUCTION)
- 認証フロー実体: `src/app/[lang]/login/page.tsx` / `src/app/api/auth/callback/route.ts` / `src/proxy.ts` / `src/utils/supabase/{client,server}.ts`

---

*Last updated: 2026-06-29 by 甲斐 / Claude*
