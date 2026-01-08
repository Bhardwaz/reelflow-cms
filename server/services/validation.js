const crypto = require('crypto')

function verifyHmac(params = {}) {
  // Extract HMAC (adjust if your object structure differs)
  const hmac = params.hmac || "";

  if(hmac == '') return false 
  // Clone params so we don't mutate the original
  const data = { ...params };
  delete data.hmac;

  // Sort keys like ksort()
  const sortedKeys = Object.keys(data).sort();

  // Build query string like http_build_query()
  const message = sortedKeys
    .map(
      key =>
        encodeURIComponent(key) +
        "=" +
        encodeURIComponent(String(data[key]))
    )
    .join("&");

  const calculatedHmac = crypto
    .createHmac("sha256", JOONWEB_CLIENT_SECRET)
    .update(message)
    .digest("hex");

  // Timing-safe comparison
  return crypto.timingSafeEqual(
    Buffer.from(hmac, "hex"),
    Buffer.from(calculatedHmac, "hex")
  );
}

module.exports = verifyHmac