import assert from "node:assert/strict";
import test from "node:test";
import { getAffiliateAttributionAudit } from "./affiliateAttributionAudit.ts";

test("marks email fallback attribution for review", () => {
  const audit = getAffiliateAttributionAudit({
    matchedByEmail: true,
    metadataDiscountPercent: null,
  });

  assert.equal(audit.source, "email_fallback");
  assert.equal(audit.discountPercent, null);
  assert.equal(audit.reviewRequired, true);
  assert.match(audit.reviewReason ?? "", /メール/);
});

test("records checkout metadata attribution without review", () => {
  assert.deepEqual(
    getAffiliateAttributionAudit({
      metadataReferrerId: "referrer-id",
      metadataDiscountPercent: "10",
      matchedByEmail: false,
    }),
    {
      source: "checkout_metadata",
      discountPercent: 10,
      reviewRequired: false,
      reviewReason: null,
    },
  );
});

test("rejects invalid discount metadata", () => {
  const audit = getAffiliateAttributionAudit({
    metadataReferrerId: "referrer-id",
    metadataDiscountPercent: "101",
    matchedByEmail: false,
  });

  assert.equal(audit.discountPercent, null);
});
