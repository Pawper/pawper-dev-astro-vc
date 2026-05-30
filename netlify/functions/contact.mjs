// Contact form handler with spam protection.
//
// Validates a submission server-side before handing it to Netlify Forms:
//   1. Honeypot — if the hidden `bot-field` is filled, a bot did it. Silently
//      accept (200) so the bot thinks it succeeded and doesn't retry.
//   2. reCAPTCHA v3 — verify the token with Google and require a score above
//      the threshold. Skipped if RECAPTCHA_SECRET_KEY is unset (e.g. local dev).
//   3. Forward the clean submission to Netlify Forms so it still appears in the
//      Netlify dashboard and triggers any configured notifications.

const RECAPTCHA_THRESHOLD = 0.5;
const RECAPTCHA_ACTION = "contact";

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export default async (req) => {
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  let payload;
  try {
    payload = await req.json();
  } catch {
    return json(400, { error: "Invalid request body" });
  }

  const { name, email, subject, message, token } = payload;
  const honeypot = payload["bot-field"];

  // 1. Honeypot — pretend success so the bot moves on.
  if (honeypot) return json(200, { ok: true });

  // 2. Required fields.
  if (!name || !email || !message) {
    return json(400, { error: "Missing required fields" });
  }

  // 3. reCAPTCHA v3 verification.
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (secret) {
    if (!token) return json(400, { error: "Missing reCAPTCHA token" });
    try {
      const verifyRes = await fetch("https://www.google.com/recaptcha/api/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ secret, response: token }).toString(),
      });
      const verify = await verifyRes.json();
      const scoreOk = verify.success && (verify.score ?? 0) >= RECAPTCHA_THRESHOLD;
      const actionOk = !verify.action || verify.action === RECAPTCHA_ACTION;
      if (!scoreOk || !actionOk) {
        return json(403, { error: "Failed spam check" });
      }
    } catch {
      return json(502, { error: "reCAPTCHA verification unavailable" });
    }
  }

  // 4. Forward to Netlify Forms.
  const siteUrl = process.env.URL || process.env.DEPLOY_PRIME_URL;
  if (!siteUrl) return json(500, { error: "Site URL not configured" });
  try {
    const formBody = new URLSearchParams({
      "form-name": "contact",
      name,
      email,
      subject: subject || "",
      message,
    });
    const submitRes = await fetch(siteUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formBody.toString(),
    });
    if (!submitRes.ok) return json(502, { error: "Form submission failed" });
  } catch {
    return json(502, { error: "Form submission failed" });
  }

  return json(200, { ok: true });
};
