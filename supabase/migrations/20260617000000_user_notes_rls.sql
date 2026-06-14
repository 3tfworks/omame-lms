-- user_notes の RLS ポリシーを（再）作成する。
--
-- 背景: init_lms_schema には user_notes 用のポリシー定義が含まれていたが、
--   実 DB には反映されておらず（pg_policies で 0 rows）、RLS 有効化のみされた状態だった。
--   ポリシーが 1 つも無いと「全アクセス拒否」となり、INSERT/SELECT が 403 で失敗する。
--   そのため自分の行だけ read/write できる 4 ポリシーをここで確実に作成する。
--
-- 冪等性: enable は IF を介して安全に、各ポリシーは drop if exists → create で貼り直す。
--   再適用しても壊れない。user_notes 以外のテーブルには一切触れない。

-- RLS を有効化（既に有効でも無害）
alter table public.user_notes enable row level security;

-- SELECT: 自分のノートだけ閲覧できる
drop policy if exists "Users can view their own notes" on public.user_notes;
create policy "Users can view their own notes" on public.user_notes
  for select using (auth.uid() = user_id);

-- INSERT: 自分のノートだけ作成できる
drop policy if exists "Users can insert their own notes" on public.user_notes;
create policy "Users can insert their own notes" on public.user_notes
  for insert with check (auth.uid() = user_id);

-- UPDATE: 自分のノートだけ更新できる（更新後も自分の行であることを保証）
drop policy if exists "Users can update their own notes" on public.user_notes;
create policy "Users can update their own notes" on public.user_notes
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- DELETE: 自分のノートだけ削除できる
drop policy if exists "Users can delete their own notes" on public.user_notes;
create policy "Users can delete their own notes" on public.user_notes
  for delete using (auth.uid() = user_id);
