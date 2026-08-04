import assert from "node:assert/strict";
import test from "node:test";
import { buildStripeCheckoutRequest } from "./stripeCheckoutRequest.ts";

test("紹介販売ページのCheckoutリクエストに紹介者IDを明示する", () => {
  assert.deepEqual(
    buildStripeCheckoutRequest({
      priceType: "general",
      referrerId: " referrer-id ",
    }),
    { priceType: "general", referrerId: "referrer-id" },
  );
});

test("通常購入では紹介者IDを送信しない", () => {
  assert.deepEqual(buildStripeCheckoutRequest({ priceType: "general" }), {
    priceType: "general",
  });
});

test("サロン価格の指定を維持する", () => {
  assert.deepEqual(buildStripeCheckoutRequest({ priceType: "salon" }), {
    priceType: "salon",
  });
});
