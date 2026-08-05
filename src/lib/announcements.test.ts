import assert from "node:assert/strict";
import test from "node:test";
import { validateAnnouncementInput } from "./announcements.ts";

const validInput = {
  title: "動画再生障害は復旧しました",
  body: "現在は通常どおり動画を再生できます。",
  audience: "all",
  publishedAt: "2026-08-05T05:00:00.000Z",
  isPublished: true,
  showInInfoBar: true,
  infoBarVariant: "resolved",
  infoBarEndsAt: "2026-08-08T05:00:00.000Z",
  infoBarDismissible: true,
};

test("インフォバー設定を含むお知らせを正規化する", () => {
  const result = validateAnnouncementInput(validInput);
  if (!("value" in result) || !result.value) assert.fail("入力が受理される必要があります");
  assert.equal(result.value.show_in_info_bar, true);
  assert.equal(result.value.info_bar_variant, "resolved");
  assert.equal(result.value.info_bar_ends_at, "2026-08-08T05:00:00.000Z");
});

test("終了日時が公開日時以前なら拒否する", () => {
  const result = validateAnnouncementInput({ ...validInput, infoBarEndsAt: validInput.publishedAt });
  assert.deepEqual(result, { error: "インフォバーの終了日時は公開日時より後にしてください" });
});

test("未指定の閉じる設定は許可として扱う", () => {
  const input: Record<string, unknown> = { ...validInput };
  delete input.infoBarDismissible;
  const result = validateAnnouncementInput(input);
  if (!("value" in result) || !result.value) assert.fail("入力が受理される必要があります");
  assert.equal(result.value.info_bar_dismissible, true);
});
