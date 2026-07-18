import test from "node:test";
import assert from "node:assert/strict";
import { getAffiliateAttributionCutoff } from "./affiliateAttribution.ts";

test("紹介フォームの照合対象は基準日時から30日以内", () => {
  const cutoff = getAffiliateAttributionCutoff(new Date("2026-08-20T03:00:00.000Z"));

  assert.equal(cutoff.toISOString(), "2026-07-21T03:00:00.000Z");
});
