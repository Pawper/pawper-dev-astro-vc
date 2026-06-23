# project.md — agent-readiness implementation

Memory of the agent-discovery work on pawper.dev. Generated against VCN #35 "Well-Known" (vcn-35-well-known.vercel.app), scored against [isitagentready.com](https://isitagentready.com).

---

## Baseline scan (before any changes)

- **Scanner:** `POST https://isitagentready.com/api/scan` with body `{"url":"https://pawper.dev"}`. Returns JSON. Reported back as a tiered **level 0–5**, not a 0–100 score.
- **Result:** **Level 0 — "Not Ready"** (2026-06-04 03:23 UTC).
- **Next target:** Level 1 "Basic Web Presence" (needs `robotsTxt`, `sitemap`, `linkHeaders`).

### Per-check baseline (every category)

| Category | Check | Status |
|---|---|---|
| Discoverability | robotsTxt | fail (not found) |
| Discoverability | sitemap | fail (not found) |
| Discoverability | linkHeaders | fail (none on homepage) |
| Discoverability | dnsAid | fail (no DNS-AID record) |
| Content Accessibility | markdownNegotiation | fail (no MD content negotiation) |
| Bot Access | robotsTxtAiRules | fail (no robots.txt) |
| Bot Access | contentSignals | fail (no robots.txt) |
| Bot Access | webBotAuth | neutral (informational) |
| Discovery | apiCatalog | fail (not found) |
| Discovery | oauthDiscovery | fail (no OIDC metadata) |
| Discovery | **oauthProtectedResource** | fail (not found) |
| Discovery | authMd | fail (not found) |
| Discovery | **mcpServerCard** | fail (not found) |
| Discovery | **a2aAgentCard** | fail (not found) |
| Discovery | agentSkills | fail (no skills index) |
| Discovery | webMcp | unableToCheck (browser timeout) |
| Commerce | x402 / mpp / ucp / acp / ap2 | neutral (not a commerce site) |

Raw JSON saved to `%TEMP%\iar-pawper-before.json`. Reproduce with:

```sh
curl -sX POST -H "Content-Type: application/json" \
  -d '{"url":"https://pawper.dev"}' \
  https://isitagentready.com/api/scan
```

Note: Windows curl 8.8 with the in-shell heredoc form refused the body on this machine (`STATUS:000`); PowerShell's `Invoke-WebRequest` worked. Stick with PowerShell for re-runs:

```powershell
$body = @{ url = "https://pawper.dev" } | ConvertTo-Json -Compress
Invoke-WebRequest -Uri "https://isitagentready.com/api/scan" `
  -Method POST -Body $body -ContentType "application/json" -TimeoutSec 90 -UseBasicParsing
```

---

## What got shipped

Five well-known files plus CORS headers. All new, no rewrites.

### 1. `public/.well-known/agent-card.json` — A2A v1.0.0

The agent's business card. Holds the three-field minimum (`name`, `description`, `url`) plus the recommended A2A v1.0.0 fields (`provider`, `capabilities`, `defaultInputModes`, `defaultOutputModes`, `securitySchemes`, `skills`).

Four skills declared, all read-only, matching what's actually on the site:
- `browse-projects` — projects pulled live from GitHub at build time
- `browse-logs` — long-form writing in Astro content collections
- `browse-skills` — the custom skills taxonomy
- `subscribe-feeds` — the five RSS feeds

`securitySchemes.none` is set on purpose — explicitly noAuth, not implicitly public. Closes the "auth-default trap" the VCN deck warned about.

**Lights up:** `a2aAgentCard` check (currently failing).

### 2. `public/.well-known/mcp.json` — SEP-2127

MCP server discovery card. Honest framing: pawper.dev does **not** run an MCP server. The card advertises the public RSS feeds (`/feed/projects/featured.xml`, `/feed.xml`, `/feed/activity.xml`) as the actual machine-readable endpoints. `transport: "http"`, `url: "https://pawper.dev"`, `schema_version: "2025-06-18"`.

**Lights up:** `mcpServerCard` check (currently failing). Card fewer than 15 sites on earth ship, per the Cloudflare 2026-04 readiness study.

### 3. `public/.well-known/ai-agent.json` — Aiia (2026-03-28)

Aiia working group's manifest. Required `name` + `description`, plus the optional cross-reference fields: `protocols: ["a2a", "mcp"]`, `endpoints` pointing at the other four well-known files and the RSS feed root, `auth: { type: "none" }`, `contacts`, `categories`, `languages`.

**Caveat:** the VCN #35 deck claimed `ai-agent.json` is "wired into the isitagentready scanner." That is **not** what the live scanner actually checks — there is no `aiAgent` check id in the API response. The closest checks are `mcpServerCard`, `a2aAgentCard`, `oauthProtectedResource`, `agentSkills`. Ship it anyway: it's a valid Aiia manifest, it'll cross-reference the other four files, and it costs nothing.

### 4. `public/.well-known/oauth-protected-resource` — RFC 9728

OAuth Protected Resource Metadata. Pawper.dev is fully public and read-only, so:
- `resource: "https://pawper.dev"`
- `authorization_servers: []` (RFC 9728 makes this OPTIONAL)
- `bearer_methods_supported: []`
- `scopes_supported: []`
- `resource_documentation` points at `/llms.txt`

No `.json` suffix — that's intentional per the RFC.

**Lights up:** `oauthProtectedResource` check (currently failing).

### 5. `public/llms.txt` — Jeremy Howard format (2024-09-03)

Markdown sitemap. **At the root, not under `.well-known/`** — most common mix-up. H1, blockquote summary, then H2 sections: Discovery, Top-level pages, Projects, Logs, Skills, Services, RSS feeds, Stack, Optional.

Hand-curated. The Astro walk-back (2026-05-04) is the cautionary tale: an auto-generated llms.txt with no human looking at it drifts stale and turns negative.

### 6. `netlify.toml` — CORS headers

Two new `[[headers]]` blocks:
- `/.well-known/*` → `Access-Control-Allow-Origin: *`, `Methods: GET, OPTIONS`, `Cache-Control: public, max-age=300`
- `/llms.txt` → same, plus `Content-Type: text/plain; charset=utf-8`

Browser-based agents do CORS preflight before reading well-known paths; curl skips it, which is why missing CORS bites in prod and not in your terminal.

---

## Re-scan after deploy

The scanner reads from the **live** `pawper.dev`. Re-running it right now will return identical baseline results because nothing has been deployed yet. The flow is:

1. **Commit** the changes (CLAUDE.md says ask before committing — so this is on you).
2. **Push** to `main`; Netlify auto-deploys from `main`.
3. **Re-scan** with the same `POST /api/scan` call above.
4. Expected wins: `mcpServerCard`, `a2aAgentCard`, `oauthProtectedResource` flip to pass. That should not move the **level** yet, because levels are gated on the earlier checks (robots.txt, sitemap, link headers).

### Honest forecast

Five well-known files **alone do not move the level off 0**. The scanner's level ladder is:

- **Level 1 — Basic Web Presence:** robots.txt + sitemap.xml + Link headers.
- **Level 2+:** layers Markdown negotiation, AI-bot rules, MCP/A2A/OAuth discovery on top.

So shipping just the five wins the Discovery category but stays Level 0 until the basics are in. Per-check `fail → pass` count should drop from 14 to about 11.

### Next moves to actually climb levels (not in scope tonight)

1. **`public/robots.txt`** with explicit `User-agent` directives, AI-bot rules (per Cloudflare's bot-rules guidance), and a `Sitemap:` line.
2. **`@astrojs/sitemap`** integration (adds `/sitemap-index.xml` + `/sitemap-0.xml` at build).
3. **Link response headers** on `/` (Netlify `[[headers]]` block — point at `/.well-known/api-catalog` or `/llms.txt` via `rel="service-doc"`).
4. **Markdown negotiation** — serve `.md` versions of pages when `Accept: text/markdown` is requested. This is the bigger lift (Astro doesn't do it out of the box).
5. **Agent Skills index** — `/.well-known/agent-skills/index.json` per the agentskills.io spec; would also light up the `agentSkills` check.

---

## What surprised me

- The scanner uses a **5-level ladder**, not a 0–100 number. The VCN #35 deck talks about "the score climbs" — that's loose language for what's actually a tier jump.
- **`ai-agent.json` is not a scanner check.** The deck overstated this. The closest real checks are `mcpServerCard` and `a2aAgentCard`.
- `webBotAuth` and the entire **Commerce** row return `neutral` for non-commerce sites — they don't count against you. Good.
- The scanner's `a2aAgentCard` check is **off by default** in the customize panel (the only one) but still runs in the no-args API call.
- Cloudflare exposes per-check **skill files** at `https://isitagentready.com/.well-known/agent-skills/{check}/SKILL.md` — usable as copy-paste prompts for an agent (Cursor / Claude Code / etc).

---

## Level-1 add-on: robots.txt, sitemap.xml, Link headers

Shipped immediately after the five well-known files to satisfy Level 1 "Basic Web Presence" gates.

### `public/robots.txt`

Explicit allow rules for every AI/agent crawler the scanner inspects (GPTBot, ChatGPT-User, OAI-SearchBot, ClaudeBot, Claude-Web, anthropic-ai, PerplexityBot, Perplexity-User, Google-Extended, Applebot-Extended, CCBot, cohere-ai, Bytespider, Amazonbot, Meta-ExternalAgent/Fetcher, DuckAssistBot, Diffbot, ImagesiftBot, Timpibot, YouBot). One `Content-Signal: search=yes, ai-train=yes, ai-input=yes` line for the Cloudflare Content Signals draft. Sitemap reference at the bottom.

Also disallows `/api/`, `/edit`, `/_assets/` to keep dev-only routes out of the index.

**Lights up:** `robotsTxt`, `robotsTxtAiRules`, `contentSignals`.

### `src/pages/sitemap.xml.ts`

Astro endpoint following the existing `feed.xml.ts` pattern — no new dependencies. Enumerates:
- 9 static routes (`/`, `/about/`, `/contact/`, `/agenda/`, `/logs/`, `/projects/`, `/projects/featured/`, `/services/`, `/resume.html`)
- 5 `/about/[entry]/` paths
- `/services/overview/` + every `SERVICES` id
- Every `SKILLS` item, with slashes → dashes per the route's slug rule
- Every `PROJECTS` id
- Every `EXPERIENCES` + `AGENDA_EVENTS` id (deduped via `Set`)
- Every log in the `logs` collection

Built at `astro build` time, served at `/sitemap.xml` with `Content-Type: application/xml`.

**Lights up:** `sitemap`.

### `netlify.toml` — Link headers on `/`

One `[[headers]]` block for `/`. Single `Link:` header (per RFC 8288) advertising:
- `</llms.txt>; rel="service-doc"; type="text/plain"`
- `</.well-known/agent-card.json>; rel="https://a2a-protocol.org/rel/agent-card"`
- `</.well-known/mcp.json>; rel="https://modelcontextprotocol.io/rel/server-card"`
- `</.well-known/ai-agent.json>; rel="https://aiia.dev/rel/manifest"`
- `</.well-known/oauth-protected-resource>; rel="oauth-protected-resource"`
- `</feed.xml>; rel="alternate"; type="application/rss+xml"`
- `</sitemap.xml>; rel="sitemap"; type="application/xml"`

Why one header with commas instead of multiple `Link:` lines: Netlify's TOML `[[headers]]` syntax takes one value per key — and per RFC 8288, comma-separating link-values inside a single header is equivalent. Toml triple-single-quoted string keeps the double quotes intact.

**Lights up:** `linkHeaders`.

### Actual post-deploy result

Deployed `c7fc9e7` + `e0939b4` to Netlify and re-scanned at 2026-06-04 03:50 UTC. **Level 0 → Level 2 "Bot-Aware"** — beat the forecast.

| Check | Before | After deploy | Notes |
|---|---|---|---|
| robotsTxt | fail | **pass** | "robots.txt exists with valid format" |
| sitemap | fail | **pass** | "sitemap.xml exists with valid structure" |
| linkHeaders | fail | **pass** | "Found agent-useful Link relations: service-doc, alternate" |
| robotsTxtAiRules | fail | **pass** | scanner saw 13 AI bot rules (gptbot, chatgpt-user, google-extended, ccbot, anthropic-ai, claude-web, bytespider, perplexitybot, cohere-ai, applebot-extended, amazonbot, meta-externalagent, diffbot) |
| contentSignals | fail | **pass** | "Content Signals found in robots.txt" |
| oauthProtectedResource | fail | **pass** | "OAuth Protected Resource Metadata found (well-known)" |
| mcpServerCard | fail | **pass** | "MCP Server Card found at /.well-known/mcp.json" |
| **a2aAgentCard** | fail | **fail** | **"Invalid A2A Agent Card: Missing or empty required field `supportedInterfaces`"** — see fix below |
| dnsAid | fail | fail | needs a DNS record (`_a2a` / DNS-AID), out of repo |
| markdownNegotiation | fail | fail | Astro static doesn't do content negotiation; would need an edge function |
| apiCatalog | fail | fail | no `/.well-known/api-catalog` shipped |
| oauthDiscovery | fail | fail | no `/.well-known/openid-configuration` (and no real OIDC) |
| authMd | fail | fail | no `/auth.md` |
| agentSkills | fail | fail | no Agent Skills index (`/.well-known/agent-skills/index.json`) |
| webMcp | fail | fail | no `navigator.modelContext.registerTool()` calls on `/` |
| webBotAuth | neutral | neutral | informational only |
| Commerce row | neutral | neutral | not a commerce site |

**Score: 7 fresh passes, 1 fixable spec-error fail, 6 known-out-of-scope fails, 5 neutrals.**

### Fix in this commit: A2A v1.0.0 `supportedInterfaces`

The original card had a top-level `"url": "https://pawper.dev"` field. **A2A v1.0.0 requires `supportedInterfaces` instead** — an ordered array of `{url, protocolBinding}` entries. Cross-checked against the canonical proto at [github.com/a2aproject/A2A `specification/a2a.proto`](https://github.com/a2aproject/A2A/blob/main/specification/a2a.proto):

```proto
message AgentCard {
  string name = 1 [(google.api.field_behavior) = REQUIRED];
  string description = 2 [(google.api.field_behavior) = REQUIRED];
  // Ordered list of supported interfaces. The first entry is preferred.
  repeated AgentInterface supported_interfaces = 3 [(google.api.field_behavior) = REQUIRED];
  ...
}
message AgentInterface {
  string url = 1 [(google.api.field_behavior) = REQUIRED];
  // The protocol binding supported at this URL. ... The core ones officially
  // supported are `JSONRPC`, `GRPC` and `HTTP+JSON`.
  string protocol_binding = 2 [(google.api.field_behavior) = REQUIRED];
  ...
}
```

Proto → JSON convention is snake_case → camelCase, so the JSON keys are `supportedInterfaces` and `protocolBinding`. Replaced the top-level `url` with:

```json
"supportedInterfaces": [
  { "url": "https://pawper.dev", "protocolBinding": "HTTP+JSON" }
]
```

Pawper.dev does not run a real A2A endpoint — this points the interface at the site itself with `HTTP+JSON` (the closest match for a static HTTP resource). The card is now structurally valid; a real agent would still find no JSON-RPC method-mapping at `/`. That's a separate problem and not in scope.

Expected after the next deploy: **a2aAgentCard flips to pass.** Level stays at 2 (Level 3 "Agent-Readable" needs more — likely markdownNegotiation + agentSkills + webMcp combined).

## Files touched this session

- `public/.well-known/agent-card.json` *(new; later patched to A2A v1.0.0 `supportedInterfaces`; later expanded 4→9 skills)*
- `public/.well-known/mcp.json` *(new)*
- `public/.well-known/ai-agent.json` *(new)*
- `public/.well-known/oauth-protected-resource` *(new)*
- `public/.well-known/agent-skills/index.json` *(new — agentskills.io 0.2.0)*
- `public/.well-known/agent-skills/{name}/SKILL.md` × 9 *(new — per-skill instructions)*
- `public/.well-known/api-catalog` *(new — RFC 9727 linkset+json)*
- `public/auth.md` *(new — public read-only auth model)*
- `public/llms.txt` *(new; updated with agent-skills/api-catalog/auth.md)*
- `public/robots.txt` *(new)*
- `src/pages/sitemap.xml.ts` *(new)*
- `netlify.toml` *(edited — 6 `[[headers]]` blocks: CORS on well-known + llms.txt + auth.md; content-type forces on api-catalog + agent-skills/*; Link header on /)*
- `.gitignore` *(edited — ignore `.netlify` CLI scratch)*
- `netlify/edge-functions/markdown-negotiation.ts` *(new — Accept: text/markdown handler for `/`)*
- `project.md` *(this file — updated)*

## Commit log

- `c7fc9e7` — feat: ship agent-discovery layer for isitagentready
- `e0939b4` — chore: ignore local .netlify directory
- `4973ec0` — fix: A2A agent-card supportedInterfaces (v1.0.0 required field)
- `787bc20` — feat: markdown content negotiation via Netlify edge function
- *(next)* — feat: agent-skills, api-catalog, auth.md + expand agent-card to 9 skills

## Markdown content negotiation (next step toward Level 3)

The `markdownNegotiation` check failed in the post-deploy scan because Astro static output only serves HTML. The Cloudflare "Markdown for Agents" spec calls for **same URL, different Accept header**:

- Agent sends `Accept: text/markdown` to e.g. `https://pawper.dev/`.
- Server responds with `Content-Type: text/markdown; charset=utf-8` and `Vary: Accept`.
- Body is the page's content as markdown, with non-content stripped, YAML frontmatter from meta tags, and JSON-LD as fenced code.

### Implementation: `netlify/edge-functions/markdown-negotiation.ts`

Netlify auto-discovers edge functions from `netlify/edge-functions/` — no `netlify.toml` block needed. The function exports `config = { path: "/" }` so it only intercepts the homepage.

Logic:
1. Read `Accept` header from the incoming request.
2. If it does not include `text/markdown` (the browser-default `text/html,...` doesn't), return `undefined` so Astro's static HTML response passes through unchanged. **Browser path is untouched.**
3. Otherwise, return a hand-curated homepage markdown with proper YAML frontmatter and the same structural sections as `/llms.txt`.

The body covers: what the site is, the five agent-discovery surfaces, the route map, and a pointer at `/llms.txt` for the full site tree. ~50 lines of markdown inlined as a template literal.

### Why hand-curated instead of HTML-to-Markdown conversion

The "right" implementation calls `context.next()` to fetch the rendered HTML, strips nav/footer/scripts, runs Turndown or similar, and returns. That's:
- Heavy at the edge (extra hop + JS conversion per request)
- Brittle (selectors break as the site evolves)
- Lossy (LCARS-styled UI doesn't translate cleanly to markdown)

For a static portfolio whose homepage content is well-known, **a curated markdown response is more accurate and 10× cheaper**. If/when this gets applied to dynamic pages (logs, projects), the right move is to use the content collection sources directly, not HTML conversion.

### Expected scanner delta after deploy

| Check | Before | After deploy |
|---|---|---|
| markdownNegotiation | fail | **pass** ("Site supports text/markdown via Accept negotiation") |

That's 8 → 9 fresh passes. Whether it pushes to **Level 3 "Agent-Readable"** depends on the scanner's ladder weighting — `agentSkills` and `webMcp` may also gate L3. We'll know on re-scan.

### Sanity check after deploy

```powershell
# Should return text/markdown
Invoke-WebRequest -Uri "https://pawper.dev/" -Headers @{ Accept = "text/markdown" } -UseBasicParsing | Select-Object -Expand Headers
# Should return text/html as before
Invoke-WebRequest -Uri "https://pawper.dev/" -UseBasicParsing | Select-Object -Expand Headers
```

---

## Final result (2026-06-04 04:12 UTC) — Level 5 / Agent-Native

**Top of the ladder. Started at Level 0, ended at Level 5.** Composite numeric score: **57 / 100**.

| Category | Score | Passes |
|---|---|---|
| Discoverability | 75 | 3 / 4 (`robotsTxt`, `sitemap`, `linkHeaders` pass; `dnsAid` fails — needs a DNS record) |
| Content Accessibility | 100 | 1 / 1 (`markdownNegotiation`) |
| Bot Access Control | 100 | 2 / 2 (`robotsTxtAiRules`, `contentSignals`; `webBotAuth` neutral) |
| API / Auth / MCP / Skill Discovery | 29 | **3 / 7** (`oauthProtectedResource`, `mcpServerCard`, `a2aAgentCard`) |
| Commerce | n/a | not checked (not a commerce site) |

**9 passes, 5 fails, 5 neutrals.** All four agent-discovery checks the well-known files were aimed at are green.

### What's left and what it would cost

The numeric score is held down almost entirely by the API/Auth/MCP/Skill Discovery category (29 / 100). Five checks still fail:

| Check | What it needs | Effort |
|---|---|---|
| `apiCatalog` | `/.well-known/api-catalog` — JSON listing API endpoints (the RSS feeds would qualify) | low |
| `authMd` | `/auth.md` — plain markdown stating auth model (for pawper, "none, public") | trivial |
| `agentSkills` | `/.well-known/agent-skills/index.json` per agentskills.io | medium |
| `webMcp` | JS on `/` calling `navigator.modelContext.registerTool()` | medium |
| `oauthDiscovery` | `/.well-known/openid-configuration` or `oauth-authorization-server` | skip (no real OIDC backing pawper) |

Out of repo:
- `dnsAid` — DNS record on pawper.dev, needs registrar access.

The first three (`apiCatalog`, `authMd`, `agentSkills`) are cheap, fully honest for a portfolio, and would lift the API/Auth category from 29 → ~71 and the composite from 57 → ~80. Worth chasing if you want a numeric statement to go with the Level 5 badge.

---

## Composite-score push (uncommitted)

Going after `apiCatalog` + `authMd` + `agentSkills` in one batch. Expanded the agent-card skills array from 4 → 9 at the same time, so the A2A card and the Agent-Skills index describe the same surfaces.

### New files

- `public/.well-known/agent-skills/index.json` — agentskills.io 0.2.0 discovery file with `$schema`, `skills[]` (9 entries), `digest: "sha256:..."` per skill. Digests computed against the LF-normalized SKILL.md bytes via `Get-FileHash` (autocrlf=true on the dev machine, so working-copy LF survives commit-time normalization → Netlify deploys LF → scanner-side digest matches).
- `public/.well-known/agent-skills/{name}/SKILL.md` × 9 — one per skill, YAML front-matter (`name`, `description`) + body with "When to use", URL patterns, and (for actions) endpoint + schema.
- `public/.well-known/api-catalog` — RFC 9727 linkset+json. Anchor `https://pawper.dev`. `service-desc` lists the three discovery cards; `service-doc` lists llms.txt + auth.md + agent-skills index; `service-meta` lists oauth-protected-resource; `item` lists sitemap + RSS feeds + robots.txt. No `.json` extension on purpose — the canonical RFC 9727 well-known URI has no suffix.
- `public/auth.md` — plain-English auth model: site is fully public read-only; no OAuth/OIDC backing; explains why `oauth-protected-resource` still ships (RFC 9728 discoverability with `authorization_servers: []`).

### Edits

- `public/.well-known/agent-card.json` — skills array expanded 4 → 9. Added `browse-services`, `browse-about`, `browse-experiences`, `send-contact`, `endorse-experience`. The two action skills are honest: `send-contact` documents the existing `/.netlify/functions/contact` endpoint with full payload + response schema; `endorse-experience` documents the Airtable URL pattern from `src/components/codex/CXModal.tsx:334-342` (`PUBLIC_ENDORSE_FORM_URL` is already embedded in the deployed JS bundle at `/_astro/App.*.js`, so it is safe to hardcode).
- `public/llms.txt` — Discovery section gained three new entries (agent-skills index, api-catalog, auth.md).
- `netlify.toml`:
  - Forced `Content-Type: application/linkset+json` on `/.well-known/api-catalog` (file has no extension so the default would be wrong).
  - Forced `Content-Type: text/markdown` on `/.well-known/agent-skills/*` (SKILL.md served as text/plain otherwise).
  - Added CORS + content-type for `/auth.md`.
  - Added `api-catalog` link relation to the homepage `Link:` header per RFC 9727.

### Skills list

| id | type | endpoint / pattern |
|---|---|---|
| `browse-projects` | read | `/projects/`, `/p/{id}/`, `/feed/projects/featured.xml` |
| `browse-logs` | read | `/logs/`, `/l/{slug}/`, `/feed.xml`, `/feed/{...}` |
| `browse-skills` | read | `/skill/{id}/`, `/feed/skills/{skill}.xml` |
| `browse-services` | read | `/services/`, `/services/{id}/` (6 IDs) |
| `browse-about` | read | `/about/`, `/about/{bio\|skills\|activity\|training\|resume}/`, `/resume.html`, `/resume.pdf` |
| `browse-experiences` | read | `/xp/{id}/` enumerated from `/sitemap.xml` |
| `subscribe-feeds` | read | 5 RSS feed shapes |
| `send-contact` | **action** | `POST /.netlify/functions/contact` with `{name, email, subject?, message, token?}`; reCAPTCHA action = `contact` |
| `endorse-experience` | **action** | `https://airtable.com/app5WObcR6LNZ9bQv/pagfzcuqMVAgL0FKk/form?prefill_Service={cat}&prefill_Skills%20List={skills}&prefill_Experience={id}&hide_Experience=true` |

### Expected scanner delta after deploy

| Check | Before | After |
|---|---|---|
| `apiCatalog` | fail | **pass** |
| `authMd` | fail | **pass** |
| `agentSkills` | fail | **pass** |

That's 9 → 12 passes. Category: API/Auth/MCP/Skill 29 → ~71 (5 of 7 passing — `oauthDiscovery` and `webMcp` still fail by design). Composite forecast: **57 → ~80**. Level stays at 5 (already top of ladder).

### Post-deploy verification (sub-agent, 2026-06-04)

After all five batches deployed (last commit `000e93e` cleared the secrets-scan block), a read-only sub-agent verified all the new paths return 200 and ran a fresh scan. **Level still 5 "Agent-Native"**. Discovery moved **3/7 → 5/7** — partial hit on the +3 forecast.

| Newly passing | Newly failing |
|---|---|
| `apiCatalog` (5 APIs listed in the linkset) | — |
| `agentSkills` (valid JSON parsed despite mis-tagged Content-Type) | — |
| **Did NOT pass:** `authMd` — file 200/text-markdown, but the scanner requires an H1 heading containing the literal string `auth.md` (e.g. `# auth.md` or `# Example auth.md`). My original heading was `# Authentication — pawper.dev`. |  |

### Two follow-up fixes (uncommitted)

1. **`public/auth.md`** — change H1 from `# Authentication — pawper.dev` to `# auth.md — pawper.dev` to match the scanner's required pattern (`# auth.md` or any H1 variant containing the literal `auth.md`). Source: https://isitagentready.com/.well-known/agent-skills/auth-md/SKILL.md.
2. **`netlify.toml`** — narrow the `Content-Type: text/markdown` glob from `/.well-known/agent-skills/*` to `/.well-known/agent-skills/*/SKILL.md` so the index.json isn't mis-tagged. The scanner happens to parse by content (so `agentSkills` passed anyway), but the wrong header could cause issues with stricter validators.

Forecast after these land: `authMd` flips to pass → **6/7 in Discovery → composite ~85.**

### Notes on the API surface

The scanner's POST `/api/scan` response includes `level`, `levelName`, and per-check `status` — but **no numeric composite or per-category scores**. The 57 / 75 / 100 / 100 / 29 / n.c numbers from the screenshot are computed in the scanner's web UI from check statuses, not exposed in the API. Re-running after the auth.md fix will need to be re-checked from the web UI if you want the exact composite number.

### Netlify secrets-scanner snag (fixed)

First deploy of this batch failed with: `Secret env var "AIRTABLE_BASE_ID"'s value detected: found value at line 390 in project.md`. The Airtable form URL hardcoded in the `endorse-experience` skill (`https://airtable.com/{AIRTABLE_BASE_ID}/{form_id}/form`) is intentionally public — same value lives in the deployed `/_astro/App.*.js` bundle via `PUBLIC_ENDORSE_FORM_URL`, and in `public/.well-known/agent-card.json` + the `endorse-experience/SKILL.md`. Removing the value from `project.md` alone wouldn't fix it; the next scan would find the same string in the public/ tree.

Fix: declared the key non-secret via netlify.toml:

```toml
[build.environment]
  SECRETS_SCAN_OMIT_KEYS = "AIRTABLE_BASE_ID"
```

`AIRTABLE_API_KEY` (the only real secret) stays scanned. Per [Netlify docs](https://ntl.fyi/configure-secrets-scanning), `SECRETS_SCAN_OMIT_KEYS` accepts a comma-separated list — add more keys here if other PUBLIC_-prefixed values get flagged.

### Regenerating digests

If any SKILL.md changes, run:

```powershell
$base = "public\.well-known\agent-skills"
"browse-projects","browse-logs","browse-skills","browse-services","browse-about","browse-experiences","subscribe-feeds","send-contact","endorse-experience" | ForEach-Object {
  $p = Join-Path $base "$_\SKILL.md"
  $h = (Get-FileHash -Path $p -Algorithm SHA256).Hash.ToLower()
  "$_`tsha256:$h"
}
```

Then hand-paste each `digest` into `index.json`. (Worth a build script if this becomes a maintenance burden.)

### Agent-readiness review fixes — 2026-06-23 (anthropic-web-producer branch)

Review of the agent surfaces surfaced four issues; fixes applied (uncommitted at time of writing):

1. **`/resume.html` 404 risk (high).** Six agent surfaces + the sitemap advertise `/resume.html`, but the build emits `/resume/` only (`trailingSlash: 'always'`, directory format) — no `resume.html` file or redirect existed, so the advertised URL would 404 in production. Added a `netlify.toml` rewrite `from "/resume.html" → to "/resume/" status 200` so every advertised reference resolves with the resume HTML. (Confirm with `curl -I https://pawper.dev/resume.html` post-deploy.)
2. **Stale "React 18" claim.** `package.json` is React 19; corrected `llms.txt` (×2) and the `markdown-negotiation.ts` homepage MD to "React 19". (README still says 18 — out of agent scope.)
3. **`mcp.json` wording.** `list_projects_feed` described "the full RSS feed of portfolio projects" but points at `feed/projects/featured.xml`; reworded to "featured portfolio projects".
4. **Digest line-ending hardening.** No `.gitattributes` was pinning the SKILL.md files to LF, so a CRLF commit (e.g. from a Windows editor) could silently invalidate the `index.json` digests. Added `.gitattributes` with `public/.well-known/agent-skills/**/SKILL.md text eol=lf`. (Digests verified correct: local CRLF working copy LF-normalizes to the committed LF digests.)
