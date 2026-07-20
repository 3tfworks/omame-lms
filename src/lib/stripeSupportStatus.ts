export type StripePaymentStatus =
  | "succeeded"
  | "unpaid"
  | "three_d_secure_failed"
  | "expired";

export type StripePaymentSummary = {
  checkoutSessionId: string;
  paymentIntentId: string | null;
  status: StripePaymentStatus;
  sessionStatus: "open" | "complete" | "expired" | null;
  paymentStatus: "paid" | "unpaid" | "no_payment_required";
  paymentIntentStatus: string | null;
  amountTotal: number | null;
  currency: string | null;
  productType: "general" | "salon" | null;
  customerEmail: string | null;
  customerName: string | null;
  managedPurchase: boolean;
  createdAt: string;
  expiresAt: string | null;
};

export type StripeSupportLookup = {
  configured: boolean;
  available: boolean;
  payments: StripePaymentSummary[];
};

export function classifyStripePayment(input: {
  sessionStatus: StripePaymentSummary["sessionStatus"];
  paymentStatus: StripePaymentSummary["paymentStatus"];
  paymentIntentStatus: string | null;
  hadAuthenticationEvent: boolean;
}): StripePaymentStatus {
  if (input.paymentStatus === "paid" || input.paymentIntentStatus === "succeeded") {
    return "succeeded";
  }

  if (input.hadAuthenticationEvent || input.paymentIntentStatus === "requires_action") {
    return "three_d_secure_failed";
  }

  if (input.sessionStatus === "expired") {
    return "expired";
  }

  return "unpaid";
}
