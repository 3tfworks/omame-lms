import InvalidReferralPage from "@/components/InvalidReferralPage";
import { getValidReferrer } from "@/lib/invite";
import { getProductPricing } from "@/lib/pricing";
import InviteClient from "./InviteClient";
import { getReferralPrice, isReferralDiscountActive } from "@/lib/affiliateProgram";

// Server Component: 紹介者名をサーバ側で取得し、クライアントへ name 文字列のみを渡す。
// referrer 取得は admin client（サーバ専用）で行い、email 等はクライアントへ渡さない。
export default async function InvitePage({
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
    <InviteClient
      lang={lang}
      userId={userId}
      referrerName={referrer.displayName}
      regularPrice={pricing.salePrice}
      referralPrice={referralPrice}
      referralDiscountActive={isReferralDiscountActive()}
    />
  );
}
