const CANONICAL_HOST = "www.omamepiano.com";
const LEGACY_PRODUCTION_HOSTS = new Set(["omame-lms.vercel.app"]);

/**
 * Redirect only the stable legacy Vercel hostname to the public custom domain.
 * Unique preview deployment hostnames intentionally remain available.
 */
export function getCanonicalHostRedirectUrl(requestUrl: string): URL | null {
  const redirectUrl = new URL(requestUrl);

  if (!LEGACY_PRODUCTION_HOSTS.has(redirectUrl.hostname.toLowerCase())) {
    return null;
  }

  redirectUrl.protocol = "https:";
  redirectUrl.hostname = CANONICAL_HOST;
  redirectUrl.port = "";

  return redirectUrl;
}
