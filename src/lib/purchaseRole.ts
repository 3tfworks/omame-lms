export type PurchaseRole = "user" | "salon_member";

// Checkout 作成時にサーバー側で設定した price_type だけを権限へ変換する。
// 未設定・未知の値は権限昇格させず、通常会員として扱う（fail-closed）。
export function getPurchaseRole(priceType: string | null | undefined): PurchaseRole {
  return priceType === "salon" ? "salon_member" : "user";
}
