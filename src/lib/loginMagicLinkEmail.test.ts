import assert from "node:assert/strict";
import test from "node:test";
import {
  buildBrowserIndependentLoginUrl,
  buildLoginMagicLinkEmail,
  sanitizeInternalNextPath,
} from "./loginMagicLinkEmail.ts";

test("browser-independent login URL carries the token hash and an internal next path", () => {
  const url = new URL(
    buildBrowserIndependentLoginUrl({
      siteUrl: "https://www.omamepiano.com/",
      tokenHash: "hashed token/value",
      next: "/ja/lms",
    }),
  );

  assert.equal(url.origin, "https://www.omamepiano.com");
  assert.equal(url.pathname, "/ja/login/confirm");
  assert.equal(url.searchParams.get("token_hash"), "hashed token/value");
  assert.equal(url.searchParams.get("next"), "/ja/lms");
});

test("external and protocol-relative redirects fall back to the LMS", () => {
  assert.equal(sanitizeInternalNextPath("https://evil.example"), "/ja/lms");
  assert.equal(sanitizeInternalNextPath("//evil.example"), "/ja/lms");
  assert.equal(sanitizeInternalNextPath("/ja/lms/video/1"), "/ja/lms/video/1");
});

test("login email escapes its URL in HTML and keeps it usable in text", () => {
  const loginUrl = "https://example.com/confirm?token_hash=a&next=/ja/lms";
  const email = buildLoginMagicLinkEmail({ loginUrl });

  assert.match(email.subject, /ログイン用リンク/);
  assert.match(email.text, /token_hash=a&next=/);
  assert.match(email.html, /token_hash=a&amp;next=/);
  assert.match(email.html, /ログイン画面を開く/);
});
