import assert from "node:assert/strict";
import test from "node:test";
import { classifyStripePayment } from "./stripeSupportStatus.ts";

test("classifyStripePayment treats a paid Checkout Session as succeeded", () => {
  assert.equal(
    classifyStripePayment({
      sessionStatus: "complete",
      paymentStatus: "paid",
      paymentIntentStatus: "succeeded",
      hadAuthenticationEvent: false,
    }),
    "succeeded",
  );
});

test("classifyStripePayment detects an unfinished 3D Secure flow before expiration", () => {
  assert.equal(
    classifyStripePayment({
      sessionStatus: "expired",
      paymentStatus: "unpaid",
      paymentIntentStatus: "canceled",
      hadAuthenticationEvent: true,
    }),
    "three_d_secure_failed",
  );
});

test("classifyStripePayment labels an expired session without authentication history", () => {
  assert.equal(
    classifyStripePayment({
      sessionStatus: "expired",
      paymentStatus: "unpaid",
      paymentIntentStatus: "canceled",
      hadAuthenticationEvent: false,
    }),
    "expired",
  );
});

test("classifyStripePayment keeps open and incomplete sessions as unpaid", () => {
  assert.equal(
    classifyStripePayment({
      sessionStatus: "open",
      paymentStatus: "unpaid",
      paymentIntentStatus: "requires_payment_method",
      hadAuthenticationEvent: false,
    }),
    "unpaid",
  );
});
