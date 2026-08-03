import "server-only";

import crypto from "crypto";
import { buildBrowserIndependentLoginUrl, buildLoginMagicLinkEmail } from "@/lib/loginMagicLinkEmail";
import { sendTransactionalEmail } from "@/lib/resendTransactionalEmail";
import { createAdminClient } from "@/utils/supabase/admin";

export function getCanonicalSiteUrl(requestUrl: string) {
  return (process.env.NEXT_PUBLIC_SITE_URL || new URL(requestUrl).origin).replace(/\/+$/, "");
}

export async function sendBrowserIndependentMagicLink(input: {
  admin: ReturnType<typeof createAdminClient>;
  email: string;
  requestUrl: string;
  next?: string;
  idempotencyScope: string;
}) {
  const { data, error } = await input.admin.auth.admin.generateLink({
    type: "magiclink",
    email: input.email,
  });

  if (error || !data.properties.hashed_token) {
    throw error ?? new Error("Magic link token was not returned");
  }

  const loginUrl = buildBrowserIndependentLoginUrl({
    siteUrl: getCanonicalSiteUrl(input.requestUrl),
    tokenHash: data.properties.hashed_token,
    next: input.next,
  });
  const emailContent = buildLoginMagicLinkEmail({ loginUrl });
  const providerId = await sendTransactionalEmail({
    to: input.email,
    ...emailContent,
    idempotencyKey: `${input.idempotencyScope}/${crypto.randomUUID()}`,
    category: "login_magic_link",
  });

  return { providerId };
}
