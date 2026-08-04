import assert from "node:assert/strict";
import test from "node:test";
import { buildPurchaseConfirmationEmail } from "./purchaseConfirmationEmail.ts";

test("purchase email includes login and receipt guidance", () => {
  const email = buildPurchaseConfirmationEmail({
    customerName: "山田 花子",
    productName: "おうちで学べるお豆奏法基礎講座",
    amount: 29800,
    currency: "jpy",
    purchasedAt: new Date("2026-07-29T00:00:00.000Z"),
    loginUrl:
      "https://www.omamepiano.com/ja/login/confirm?token_hash=secret&next=%2Fja%2Flms",
    purchasesUrl: "https://www.omamepiano.com/ja/lms/purchases",
  });

  assert.match(email.subject, /ご購入ありがとうございます/);
  assert.match(email.text, /￥29,800/);
  assert.match(email.text, /Stripeから別のメール/);
  assert.match(email.text, /確認画面で「ログインを続ける」/);
  assert.match(email.html, /ログイン画面を開く/);
  assert.match(email.html, /「ログインを続ける」/);
  assert.doesNotMatch(email.html, /講座へログインする/);
  assert.match(email.html, /購入履歴・領収書を確認する/);
});

test("purchase email escapes customer-controlled HTML", () => {
  const email = buildPurchaseConfirmationEmail({
    customerName: "<script>alert(1)</script>",
    productName: "<b>course</b>",
    amount: 100,
    currency: "jpy",
    purchasedAt: new Date("2026-07-29T00:00:00.000Z"),
    loginUrl: "https://example.com/?a=1&b=2",
    purchasesUrl: "https://example.com/purchases",
  });

  assert.doesNotMatch(email.html, /<script>/);
  assert.doesNotMatch(email.html, /<b>course<\/b>/);
  assert.match(email.html, /&lt;script&gt;/);
  assert.match(email.html, /a=1&amp;b=2/);
});
