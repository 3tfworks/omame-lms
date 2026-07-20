import "server-only";

import type Stripe from "stripe";
import { normalizeEmail } from "@/lib/authUsers";
import {
  getJstSearchWindow,
  namesLikelyMatch,
  type PurchaseSearchCandidate,
} from "@/lib/purchaseSupport";

const MAX_CHARGES = 100;
const MAX_CANDIDATES = 20;

function getChargeEmail(charge: Stripe.Charge) {
  return charge.billing_details.email || charge.receipt_email || null;
}

export async function searchStripePurchases(input: {
  inquiryEmail?: string;
  customerName?: string;
  purchaseDate: string;
  amount?: number;
}): Promise<PurchaseSearchCandidate[]> {
  const window = getJstSearchWindow(input.purchaseDate);
  if (!window) throw new Error("購入日の形式が正しくありません。");

  const { stripe } = await import("@/lib/stripe");
  const charges = await stripe.charges.list({
    created: {
      gte: Math.floor(window.start.getTime() / 1000),
      lt: Math.floor(window.end.getTime() / 1000),
    },
    limit: MAX_CHARGES,
  });

  const inquiryEmail = input.inquiryEmail ? normalizeEmail(input.inquiryEmail) : "";
  const filtered = charges.data
    .filter((charge) => {
      const nameMatches = Boolean(
        input.customerName &&
        namesLikelyMatch(input.customerName, charge.billing_details.name || ""),
      );
      const amountMatches = input.amount !== undefined && charge.amount === input.amount;
      return nameMatches || amountMatches;
    })
    .sort((a, b) => {
      const score = (charge: Stripe.Charge) => {
        const email = getChargeEmail(charge);
        const emailMatch = inquiryEmail && email && normalizeEmail(email) === inquiryEmail ? 4 : 0;
        const nameMatch = input.customerName && namesLikelyMatch(input.customerName, charge.billing_details.name || "") ? 2 : 0;
        const amountMatch = input.amount !== undefined && charge.amount === input.amount ? 1 : 0;
        return emailMatch + nameMatch + amountMatch;
      };
      return score(b) - score(a);
    })
    .slice(0, MAX_CANDIDATES);

  return Promise.all(
    filtered.map(async (charge): Promise<PurchaseSearchCandidate> => {
      const paymentIntentId =
        typeof charge.payment_intent === "string"
          ? charge.payment_intent
          : charge.payment_intent?.id || null;
      const sessions = paymentIntentId
        ? await stripe.checkout.sessions.list({ payment_intent: paymentIntentId, limit: 1 })
        : null;
      const session = sessions?.data[0] || null;
      const productType =
        session?.metadata?.price_type === "general" || session?.metadata?.price_type === "salon"
          ? session.metadata.price_type
          : null;
      const customerEmail = session?.customer_details?.email || session?.customer_email || getChargeEmail(charge);

      return {
        chargeId: charge.id,
        paymentIntentId,
        checkoutSessionId: session?.id || null,
        createdAt: new Date(charge.created * 1000).toISOString(),
        amount: charge.amount,
        currency: charge.currency,
        status: charge.status,
        paid: charge.paid,
        customerEmail,
        customerName: charge.billing_details.name || session?.customer_details?.name || null,
        productType,
        managedPurchase: Boolean(productType),
        emailMatchesInquiry: inquiryEmail && customerEmail
          ? normalizeEmail(customerEmail) === inquiryEmail
          : null,
      };
    }),
  );
}
