// Temporary check: which forwarding headers arrive through the Netlify front door (no values are returned).
export async function onRequest({ request }) {
  const h = request.headers;
  return new Response(JSON.stringify({
    viaNetlify: !!(h.get("x-nf-request-id") || h.get("x-nf-client-connection-ip")),
    hasXff: !!h.get("x-forwarded-for"), xffHops: (h.get("x-forwarded-for") || "").split(",").filter(Boolean).length,
    hasNfIp: !!h.get("x-nf-client-connection-ip"),
    fwdDiffersFromCf: !!(h.get("x-forwarded-for") && h.get("x-forwarded-for").split(",")[0].trim() !== h.get("cf-connecting-ip")),
  }), { headers: { "content-type": "application/json", "cache-control": "no-store" } });
}
