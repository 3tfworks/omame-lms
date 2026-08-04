export function calculateAffiliateRewardAfterRefund(input: {
  chargeAmount: number;
  amountRefunded: number;
  rewardRate: number;
}): number {
  const chargeAmount = Math.max(0, Math.floor(input.chargeAmount));
  const amountRefunded = Math.min(
    chargeAmount,
    Math.max(0, Math.floor(input.amountRefunded)),
  );
  const rewardRate = Math.min(100, Math.max(0, input.rewardRate));
  const netAmount = chargeAmount - amountRefunded;

  return Math.floor((netAmount * rewardRate) / 100);
}
