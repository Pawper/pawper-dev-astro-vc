---
name: send-contact
description: Send a contact message to Phillip Wessels via the pawper.dev contact endpoint. Server-side reCAPTCHA + honeypot validation, then forwarded to Netlify Forms.
---

# Send contact

## When to use

The user wants to reach Phillip Wessels — about an engagement, role, talk, collaboration, or follow-up on something on the site.

## Endpoint

```
POST https://pawper.dev/.netlify/functions/contact
Content-Type: application/json
```

## Request body

```json
{
  "name": "Required — sender's name",
  "email": "Required — sender's email address",
  "subject": "Optional — short subject line",
  "message": "Required — full message body",
  "token":   "Optional — reCAPTCHA v3 token; required in production",
  "bot-field": "Leave EMPTY — honeypot; if filled, request is silently dropped"
}
```

## Response

- `200 { "ok": true }` — accepted. Forwarded to Netlify Forms; Phillip is notified.
- `400 { "error": "Missing required fields" }` — name, email, or message was missing or empty.
- `400 { "error": "Missing reCAPTCHA token" }` — token required in production.
- `403 { "error": "Failed spam check" }` — reCAPTCHA score below threshold (0.5) or wrong action.
- `405 { "error": "Method not allowed" }` — only POST is accepted.

## Notes

- reCAPTCHA action must be `contact`. Obtain a v3 token from `grecaptcha.execute(siteKey, { action: 'contact' })` using the public site key exposed at build time.
- The contact form on https://pawper.dev/contact/ is the human-facing version; agents should prefer the JSON endpoint above.
