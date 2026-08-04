import assert from "node:assert/strict";
import test from "node:test";
import { calculateAffiliateRewardAfterRefund } from "./affiliateRefund.ts";

test("紹介割引漏れの部分返金後は実売上額を基準に報酬を再計算する", () => {
  assert.equal(
    calculateAffiliateRewardAfterRefund({
      chargeAmount: 29_800,
      amountRefunded: 2_980,
      rewardRate: 50,
    }),
    13_410,
  );
});

test("複数回の部分返金でも累計返金額から現在の報酬を計算する", () => {
  assert.equal(
    calculateAffiliateRewardAfterRefund({
      chargeAmount: 26_820,
      amountRefunded: 1_820,
      rewardRate: 35,
    }),
    8_750,
  );
});

test("全額返金後の報酬は0円になる", () => {
  assert.equal(
    calculateAffiliateRewardAfterRefund({
      chargeAmount: 26_820,
      amountRefunded: 26_820,
      rewardRate: 50,
    }),
    0,
  );
});

test("Stripe金額を超える返金値や不正な報酬率を安全な範囲へ丸める", () => {
  assert.equal(
    calculateAffiliateRewardAfterRefund({
      chargeAmount: 10_000,
      amountRefunded: 20_000,
      rewardRate: 150,
    }),
    0,
  );
});
