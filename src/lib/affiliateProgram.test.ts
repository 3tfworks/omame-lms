import test from "node:test";
import assert from "node:assert/strict";
import {
  getReferralPrice,
  isReferralDiscountActive,
  REFERRAL_DISCOUNT_END_AT,
} from "./affiliateProgram.ts";

test("紹介割引は2026年8月31日中（JST）まで有効", () => {
  assert.equal(isReferralDiscountActive(new Date("2026-08-31T14:59:59.999Z")), true);
  assert.equal(getReferralPrice(29_800, new Date("2026-08-31T14:59:59.999Z")), 26_820);
});
test("2026年9月1日0時（JST）以降は全チャネル同額", () => {
  assert.equal(isReferralDiscountActive(REFERRAL_DISCOUNT_END_AT), false);
  assert.equal(getReferralPrice(29_800, REFERRAL_DISCOUNT_END_AT), 29_800);
});
