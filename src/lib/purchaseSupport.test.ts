import assert from "node:assert/strict";
import test from "node:test";
import { getJstSearchWindow, namesLikelyMatch } from "./purchaseSupport.ts";

test("姓と名の順番が逆でも同じ購入者候補として扱う", () => {
  assert.equal(namesLikelyMatch("河越敦子", "敦子 河越"), true);
});

test("異なる氏名は候補にしない", () => {
  assert.equal(namesLikelyMatch("河越敦子", "青木文恵"), false);
});

test("購入日は日本時間の1日としてStripe検索範囲へ変換する", () => {
  const window = getJstSearchWindow("2026-07-14");
  assert.equal(window?.start.toISOString(), "2026-07-13T15:00:00.000Z");
  assert.equal(window?.end.toISOString(), "2026-07-14T15:00:00.000Z");
});
