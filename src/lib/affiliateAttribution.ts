import { AFFILIATE_COOKIE_DAYS } from "./affiliateProgram.ts";

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

/** 紹介記録として照合できる最古の日時を返す。 */
export function getAffiliateAttributionCutoff(now = new Date()): Date {
  return new Date(now.getTime() - AFFILIATE_COOKIE_DAYS * MILLISECONDS_PER_DAY);
}

/**
 * 紹介トラッキングに使う紹介者IDを、明示的な `?ref=`、紹介ページURLの順で解決する。
 * 紹介ページを開いた時点で記録することで、フォーム未送信のまま後日購入した場合も
 * 30日間のラストクリック判定を維持できる。
 */
export function resolveReferralTrackingId(
  pathname: string,
  explicitRef: string | null,
): string | null {
  const normalizedExplicitRef = explicitRef?.trim();
  if (normalizedExplicitRef) return normalizedExplicitRef;

  const invitePathMatch = pathname.match(
    /^\/(?:(?:ja|en|fr)\/)?invite\/([^/]+)(?:\/|$)/,
  );
  return invitePathMatch?.[1]?.trim() || null;
}
