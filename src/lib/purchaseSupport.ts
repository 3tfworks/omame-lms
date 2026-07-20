export type PurchaseSearchCandidate = {
  chargeId: string;
  paymentIntentId: string | null;
  checkoutSessionId: string | null;
  createdAt: string;
  amount: number;
  currency: string;
  status: string;
  paid: boolean;
  customerEmail: string | null;
  customerName: string | null;
  productType: "general" | "salon" | null;
  managedPurchase: boolean;
  emailMatchesInquiry: boolean | null;
};

export function normalizePersonName(value: string) {
  return value.normalize("NFKC").toLocaleLowerCase("ja-JP").replace(/[\s・._-]/g, "");
}

function sortedCharacters(value: string) {
  return Array.from(value).sort((a, b) => a.localeCompare(b, "ja-JP")).join("");
}

export function namesLikelyMatch(query: string, candidate: string) {
  const normalizedQuery = normalizePersonName(query);
  const normalizedCandidate = normalizePersonName(candidate);
  if (!normalizedQuery || !normalizedCandidate) return false;
  return (
    normalizedQuery === normalizedCandidate ||
    normalizedQuery.includes(normalizedCandidate) ||
    normalizedCandidate.includes(normalizedQuery) ||
    sortedCharacters(normalizedQuery) === sortedCharacters(normalizedCandidate)
  );
}

export function getJstSearchWindow(date: string) {
  const start = new Date(`${date}T00:00:00+09:00`);
  if (Number.isNaN(start.getTime())) return null;
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}
