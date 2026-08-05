import assert from "node:assert/strict";
import test from "node:test";
import { getCanonicalHostRedirectUrl } from "./canonicalHost.ts";

test("redirects the stable Vercel hostname while preserving path and query", () => {
  const redirectUrl = getCanonicalHostRedirectUrl(
    "https://omame-lms.vercel.app/ja/lms/video?id=123&from=notice"
  );

  assert.equal(
    redirectUrl?.toString(),
    "https://www.omamepiano.com/ja/lms/video?id=123&from=notice"
  );
});

test("does not redirect the canonical custom domain", () => {
  assert.equal(getCanonicalHostRedirectUrl("https://www.omamepiano.com/ja/lms"), null);
});

test("does not redirect unique Vercel preview hostnames", () => {
  assert.equal(
    getCanonicalHostRedirectUrl(
      "https://omame-lms-git-feature-3tfworks-projects.vercel.app/ja/lms"
    ),
    null
  );
});
