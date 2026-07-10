import InvalidReferralPage from "@/components/InvalidReferralPage";
import { getValidReferrer } from "@/lib/invite";
import { getProductPricing } from "@/lib/pricing";
import ThanksClient from "./ThanksClient";

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

  const referralPrice = Math.floor(pricing.salePrice * 0.9);

  return (
    <ThanksClient
      lang={lang}
      userId={userId}
      referrerName={referrer.displayName}
      regularPrice={pricing.salePrice}
      referralPrice={referralPrice}
    />
  );
}
