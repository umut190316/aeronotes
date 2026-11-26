/*
 * The visitor's IP address, used only (hashed) for rate limits.
 *
 * Visitors from Turkey reach the site through Netlify (aeronotesblog.netlify.app), because
 * *.pages.dev is blocked there. Netlify then calls Cloudflare from its own servers, so
 * cf-connecting-ip is Netlify's address and the real visitor is in the forwarded headers.
 * Forwarded headers can be faked by someone calling pages.dev directly, so they are combined
 * with cf-connecting-ip (faking them only splits that caller's own bucket); the endpoints also
 * keep site-wide limits that no header can get around.
 */
export function clientIp(request) {
  const cf = request.headers.get("cf-connecting-ip") || "unknown";
  const fwd =
    request.headers.get("x-nf-client-connection-ip") ||
    (request.headers.get("x-forwarded-for") || "").split(",")[0].trim();
  return fwd && fwd !== cf ? cf + ">" + fwd : cf;
}
