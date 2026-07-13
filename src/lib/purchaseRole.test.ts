import assert from "node:assert/strict";
import test from "node:test";
import { getPurchaseRole } from "./purchaseRole.ts";

test("getPurchaseRole grants salon_member to a salon-price purchase", () => {
  assert.equal(getPurchaseRole("salon"), "salon_member");
});

test("getPurchaseRole keeps general and unknown purchases as user", () => {
  assert.equal(getPurchaseRole("general"), "user");
  assert.equal(getPurchaseRole(undefined), "user");
  assert.equal(getPurchaseRole("unexpected"), "user");
});
