export function buildStripeCheckoutRequest(input: {
  priceType?: "general" | "salon";
  referrerId?: string | null;
}) {
  const referrerId = input.referrerId?.trim();

  return {
    priceType: input.priceType ?? "general",
    ...(referrerId ? { referrerId } : {}),
  };
}
