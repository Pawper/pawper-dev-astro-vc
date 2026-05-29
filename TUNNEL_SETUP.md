# Cloudflare Tunnel Setup for Mobile Preview

## Quick Start

Run these commands in separate terminals:

**Terminal 1: Dev Server**
```bash
npm run dev
```
Server runs on http://localhost:4321

**Terminal 2: Ad-hoc Tunnel**
```bash
cloudflared tunnel --url http://localhost:4321
```
This generates a public HTTPS URL like: `https://[random-words].trycloudflare.com`

## Important: allowedHosts Config

When you get a new tunnel URL, you must add it to `astro.config.mjs`:

```javascript
vite: {
  server: {
    allowedHosts: [
      "your-new-tunnel-url.trycloudflare.com",
      // ... other URLs
    ],
  },
},
```

Then **restart the dev server** so Astro picks up the new config.

## Why This is Needed

- Vite (Astro's bundler) blocks requests from unknown hosts for security
- Ad-hoc tunnels generate a new random URL each time they start
- Each new URL must be whitelisted in `allowedHosts`

## Note on Ad-hoc vs Named Tunnels

- **Ad-hoc**: No authentication needed, new URL each restart, perfect for temporary mobile preview
- **Named**: Requires `cloudflared tunnel login` to authenticate, fixed URL, more setup

We use ad-hoc here because it's simpler and doesn't require managing credentials.
