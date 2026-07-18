import { AFFILIATE_COOKIE_DAYS } from "./affiliateProgram.ts";

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

/** 紹介記録として照合できる最古の日時を返す。 */
export function getAffiliateAttributionCutoff(now = new Date()): Date {
  return new Date(now.getTime() - AFFILIATE_COOKIE_DAYS * MILLISECONDS_PER_DAY);
}
