import InvalidReferralPage from "@/components/InvalidReferralPage";
import { getValidReferrer } from "@/lib/invite";
import { getProductPricing } from "@/lib/pricing";
import ThanksClient from "./ThanksClient";
import { getReferralPrice, isReferralDiscountActive } from "@/lib/affiliateProgram";

export default async function ThanksPage({
  params,
}: {
  params: Promise<{ lang: string; userId: string }>;
}) {
  const { lang, userId } = await params;
  const [referrer, pricing] = await Promise.all([
    getValidReferrer(userId),
    getProductPricing("general"),
  ]);
  if (!referrer) return <InvalidReferralPage lang={lang} />;

  const referralPrice = getReferralPrice(pricing.salePrice);

  return (
    <ThanksClient
      lang={lang}
      userId={userId}
      referrerName={referrer.displayName}
      regularPrice={pricing.salePrice}
      referralPrice={referralPrice}
      referralDiscountActive={isReferralDiscountActive()}
    />
  );
}
