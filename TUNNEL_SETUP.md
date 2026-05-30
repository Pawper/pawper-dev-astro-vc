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

## allowedHosts Config

**No action needed** — the config uses a wildcard:

```javascript
vite: {
  server: {
    allowedHosts: [".trycloudflare.com"]
  },
},
```

The leading dot allows all subdomains of `.trycloudflare.com`, so new tunnel URLs work automatically. No restart needed.

## Why allowedHosts Exists

- Vite (Astro's bundler) blocks requests from unknown hosts for security
- Without allowedHosts, a fresh tunnel URL would return a 403 (Blocked request)

## Note on Ad-hoc vs Named Tunnels

- **Ad-hoc**: No authentication needed, new URL each restart, perfect for temporary mobile preview
- **Named**: Requires `cloudflared tunnel login` to authenticate, fixed URL, more setup

We use ad-hoc here because it's simpler and doesn't require managing credentials.
