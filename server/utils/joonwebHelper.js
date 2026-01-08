const verifyHmac = (params) => {
  const crypto = require('crypto');

  if (!params.hmac) return false;

  const hmac = params.hmac;
  delete params.hmac;

  // 1️⃣ Sort params
  const message = Object.keys(params)
    .sort()
    .map((key) => {
      const k = encodeURIComponent(key).replace(/%20/g, '+');
      const v = encodeURIComponent(String(params[key])).replace(/%20/g, '+');
      return `${k}=${v}`;
    })
    .join('&');

  // 2️⃣ Calculate HMAC (hex)
  const calculatedHmac = crypto
    .createHmac('sha256', process.env.JOONWEB_CLIENT_SECRET)
    .update(message)
    .digest('hex');

  // 3️⃣ Timing-safe hex comparison
  return crypto.timingSafeEqual(
    Buffer.from(hmac, 'hex'),
    Buffer.from(calculatedHmac, 'hex')
  );
}

module.exports = verifyHmac