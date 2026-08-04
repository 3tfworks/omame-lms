export type AffiliateAttributionSource = "checkout_metadata" | "email_fallback" | "legacy";

export type AffiliateAttributionAudit = {
  source: AffiliateAttributionSource;
  discountPercent: number | null;
  reviewRequired: boolean;
  reviewReason: string | null;
};

function parseDiscountPercent(value: string | null | undefined) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 && parsed <= 100 ? parsed : null;
}

export function getAffiliateAttributionAudit(input: {
  metadataReferrerId?: string | null;
  metadataDiscountPercent?: string | null;
  matchedByEmail: boolean;
}): AffiliateAttributionAudit {
  if (input.matchedByEmail) {
    return {
      source: "email_fallback",
      discountPercent: parseDiscountPercent(input.metadataDiscountPercent),
      reviewRequired: true,
      reviewReason: "紹介情報がCheckoutに無く、購入者メールと招待記録の照合で紹介関係を復元しました。割引適用状況を確認してください。",
    };
  }

  if (input.metadataReferrerId?.trim()) {
    return {
      source: "checkout_metadata",
      discountPercent: parseDiscountPercent(input.metadataDiscountPercent),
      reviewRequired: false,
      reviewReason: null,
    };
  }

  return {
    source: "legacy",
    discountPercent: null,
    reviewRequired: false,
    reviewReason: null,
  };
}
