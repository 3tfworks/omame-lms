import assert from "node:assert/strict";
import test from "node:test";
import {
  BOOKMARK_CONTENT_MAX,
  formatBookmarkTime,
  validateBookmarkContent,
  validateBookmarkVisibility,
  validateTimestampSeconds,
  validateUuid,
  validateVideoId,
} from "./bookmarks.ts";

test("validateVideoId accepts curriculum video IDs", () => {
  assert.deepEqual(validateVideoId(" video-1188100383 "), {
    ok: true,
    value: "video-1188100383",
  });
  assert.equal(validateVideoId("1188100383").ok, false);
  assert.equal(validateVideoId("video-1?admin=true").ok, false);
});

test("validateBookmarkVisibility accepts only private and shared", () => {
  assert.deepEqual(validateBookmarkVisibility("private"), { ok: true, value: "private" });
  assert.deepEqual(validateBookmarkVisibility("shared"), { ok: true, value: "shared" });
  assert.equal(validateBookmarkVisibility("public").ok, false);
  assert.equal(validateBookmarkVisibility(null).ok, false);
});

test("validateBookmarkContent trims content and enforces the maximum", () => {
  assert.deepEqual(validateBookmarkContent("  気づき  "), { ok: true, value: "気づき" });
  assert.equal(validateBookmarkContent("   ").ok, false);
  assert.equal(validateBookmarkContent("a".repeat(BOOKMARK_CONTENT_MAX)).ok, true);
  assert.equal(validateBookmarkContent("a".repeat(BOOKMARK_CONTENT_MAX + 1)).ok, false);
});

test("validateTimestampSeconds floors valid seconds and rejects unsafe values", () => {
  assert.deepEqual(validateTimestampSeconds(12.9), { ok: true, value: 12 });
  assert.equal(validateTimestampSeconds(-1).ok, false);
  assert.equal(validateTimestampSeconds(Number.NaN).ok, false);
  assert.equal(validateTimestampSeconds("12").ok, false);
});

test("validateUuid accepts UUIDs and rejects arbitrary identifiers", () => {
  assert.equal(validateUuid("a2576046-5894-4adb-8669-5c218882d07b").ok, true);
  assert.equal(validateUuid("../../bookmark").ok, false);
});

test("formatBookmarkTime formats timestamps for the lesson UI", () => {
  assert.equal(formatBookmarkTime(0), "00:00");
  assert.equal(formatBookmarkTime(255), "04:15");
  assert.equal(formatBookmarkTime(3605), "60:05");
});
