import test from "node:test";
import assert from "node:assert/strict";
import {
  getAffiliateAttributionCutoff,
  resolveReferralTrackingId,
} from "./affiliateAttribution.ts";

test("紹介フォームの照合対象は基準日時から30日以内", () => {
  const cutoff = getAffiliateAttributionCutoff(new Date("2026-08-20T03:00:00.000Z"));

  assert.equal(cutoff.toISOString(), "2026-07-21T03:00:00.000Z");
});

test("紹介ページを開いた時点で紹介者IDを取得できる", () => {
  assert.equal(
    resolveReferralTrackingId(
      "/ja/invite/a0870751-bc73-44d7-a544-2ad3de82b09f",
      null,
    ),
    "a0870751-bc73-44d7-a544-2ad3de82b09f",
  );
  assert.equal(
    resolveReferralTrackingId(
      "/invite/a0870751-bc73-44d7-a544-2ad3de82b09f/thanks",
      null,
    ),
    "a0870751-bc73-44d7-a544-2ad3de82b09f",
  );
});

test("明示的なrefパラメータを紹介ページURLより優先する", () => {
  assert.equal(
    resolveReferralTrackingId("/ja/invite/path-referrer", " query-referrer "),
    "query-referrer",
  );
});

test("紹介情報のないURLではnullを返す", () => {
  assert.equal(resolveReferralTrackingId("/ja/lp-v2", null), null);
});
