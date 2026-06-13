import Stripe from "stripe";

// サーバーサイド専用の Stripe クライアント。
// STRIPE_SECRET_KEY を使用するため、クライアント(ブラウザ)側からは絶対に import しないこと。
//
// apiVersion は明示せず、Stripe アカウント側で固定されたバージョンを使用する。
// （単発購入・将来のサブスク対応のいずれもこの初期化を共有する想定）

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  throw new Error("Missing STRIPE_SECRET_KEY environment variable.");
}

export const stripe = new Stripe(secretKey, {
  appInfo: {
    name: "omame-project",
  },
});
