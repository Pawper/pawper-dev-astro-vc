# Authentication — pawper.dev

pawper.dev is a fully **public, read-only static site**. There is no authentication on any public-facing route, and there is no token issuance, login endpoint, or API key surface.

## Auth model

| Surface | Auth |
|---|---|
| Browseable HTML (`/`, `/projects/`, `/logs/`, `/services/`, `/about/`, etc.) | None — public. |
| RSS feeds (`/feed.xml`, `/feed/**/*.xml`) | None — public. |
| `.well-known/*` discovery files | None — public. |
| Sitemap and llms.txt | None — public. |
| Contact endpoint (`POST /.netlify/functions/contact`) | None — but server-side reCAPTCHA v3 + honeypot anti-abuse. See [the send-contact skill](/.well-known/agent-skills/send-contact/SKILL.md). |
| Endorsement form (off-site, on Airtable) | None — but Airtable form is rate-limited and reviewed before publishing. See [the endorse-experience skill](/.well-known/agent-skills/endorse-experience/SKILL.md). |

## Why an `oauth-protected-resource` file then?

`/.well-known/oauth-protected-resource` is shipped for **RFC 9728 discoverability**, with `authorization_servers: []` to declare explicitly that no authorization server backs this resource. It exists so that agents looking for the file find a valid metadata document, not a 404 they then have to interpret.

## What is NOT exposed

- No `/api/*` routes beyond the contact function.
- No OAuth/OIDC discovery (`/.well-known/openid-configuration` is intentionally absent).
- No bearer token validation, no mutual TLS, no DPoP.
- No user accounts, sessions, or persistent server-side state.

## If you need access to private data

Phillip can be reached via the contact endpoint or by email — see the `send-contact` skill or `/contact/`.
