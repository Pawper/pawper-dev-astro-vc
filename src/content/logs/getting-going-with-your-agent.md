---
title: "Getting Going with Your Agent: Human-in-the-Loop Integrations That Matter"
devto: ""
date: "2026.06.24"
kicker: "Tutorial"
tags: ["OpenClaw", "Hermes", "Telegram", "Obsidian", "Agentic Systems", "Personal OS", "Agent Memory"]
hook: "Your agent is running. Now connect it to real tools — Telegram, Gmail, Calendar, and an Obsidian vault — without losing control. The agent prepares, drafts, reminds, and asks. You decide."
series:
  name: "ClawCamp Campout @ Dual Tech Summit 2026"
  part: 4
  total: 5
mentor: true
---

This is Part 3 of **[ClawCamp Campout @ Dual Tech Summit 2026](https://pawper.dev/l/clawcamp-campout-overview/)**. You have a basic agent running from [Part 1](https://pawper.dev/l/getting-started-openclaw/), and from [Part 2](https://pawper.dev/l/beyond-assistants-agentic-personal-os/) you have the frame: agency, and the A2H edge. Now we connect the agent to the tools your life actually runs on — with boundaries.

This part has some manual account setup (a Telegram bot, a Google OAuth client, an Obsidian install). Do those first; then one pasteable prompt wires it all into your agent. Direct links throughout so you're not hunting.

---

## The HITL principle

There's a tempting fantasy where you connect everything and the agent just runs your life. Resist it — that's the failure mode, not the goal.

> The point is not to let the agent run your life. The point is to create controlled surfaces where the agent can **prepare, draft, remind, route, and ask** — while the human decides.

Human-in-the-loop (HITL) isn't a limitation you tolerate. It *is* the design. Every integration below starts at the least-powerful setting that's still useful, and only earns more when you trust it.

| Tool | Starts at | What it gives you |
| --- | --- | --- |
| **Telegram** | Chat / check-ins / capture | An always-on surface to talk to your agent from your phone |
| **Google Calendar** | Read existing; write only to a *dedicated* calendar | Context for your day; confirmed, isolated event writes |
| **Gmail** | Read-only → draft-only | Summaries and prepared replies — never auto-sent |
| **Obsidian** | A vault your agent reads and appends to | The human-readable home for notes, tasks, and memory |

---

## 1. Telegram — install on phone *and* laptop

Telegram is your always-on chat surface. You want it in **two places**:

- **Phone** — install from the [App Store](https://apps.apple.com/app/telegram-messenger/id686449807) or [Google Play](https://play.google.com/store/apps/details?id=org.telegram.messenger). This is how you'll talk to your agent on the go.
- **Laptop/desktop** — install from [desktop.telegram.org](https://desktop.telegram.org/). This is where you'll grab tokens and codes during setup without retyping them from your phone.

Sign in with the same number on both — Telegram keeps them in sync.

Then create a bot for your agent — it's one conversation, no developer portal:

1. Open [@BotFather](https://t.me/BotFather) in Telegram and start the chat.
2. Send `/newbot`.
3. Give it a display name (e.g. "Scout"), then a username ending in `bot` (e.g. `scout_for_me_bot`).
4. BotFather replies with a **bot token** (`12345:ABC-…`). Copy it — you'll paste it into the setup prompt.

> The token is a password for your bot. Don't share it or paste it anywhere public.

After setup you'll message the bot `/start`, and it replies with a **pairing code** you hand back to your agent — that's how it learns this Telegram account is *yours*. Keep that flow in mind; the prompt walks you through it.

---

## 2. Google — Calendar (read) and Gmail (draft-only)

For your agent to know your day and help with email, it needs a **Google OAuth client** — a credential you create once that lets *your* agent talk to *your* Google account, scoped to exactly what you allow. This is the fiddliest part; the payoff is real context.

### a. Turn on the APIs

In the [Google Cloud Console](https://console.cloud.google.com/):

1. Create or select a project (top bar → project dropdown → **New Project**).
2. Enable the two APIs you'll use:
   - **[Google Calendar API](https://console.cloud.google.com/apis/library/calendar-json.googleapis.com)** → **Enable**
   - **[Gmail API](https://console.cloud.google.com/apis/library/gmail.googleapis.com)** → **Enable**

### b. Configure the consent screen

Go to **[OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent)**:

1. User type: **External**, then **Create**.
2. Fill the required app name + your email; you can skip the optional fields.
3. On **Test users**, add your own Google address. (Leaving the app in "Testing" is fine — it just means only the test users you list can authorize it, which is exactly what you want for a personal agent.)

### c. Add the scopes (least privilege)

When prompted for scopes, add only these four. They're deliberately minimal — read your calendar and mail, write to a *dedicated* calendar, draft (but never send) mail:

```text
https://www.googleapis.com/auth/calendar.readonly     # read your existing calendars
https://www.googleapis.com/auth/calendar.events       # create events (we'll restrict to one calendar)
https://www.googleapis.com/auth/gmail.readonly        # read + summarize mail
https://www.googleapis.com/auth/gmail.compose         # create drafts only — NOT gmail.send
```

> Note what's **absent**: there is no `gmail.send`. Your agent can prepare a reply and leave it in your Drafts. *You* press send. That single omission is the whole HITL boundary for email.

### d. Create the OAuth client + download the JSON

Go to **[Credentials](https://console.cloud.google.com/apis/credentials)** → **Create credentials** → **OAuth client ID** → application type **Desktop app** → **Create**. Then **Download JSON**. That file (`credentials.json`) is what your agent uses to authenticate — you'll point the setup prompt at it.

### e. Make a dedicated write calendar

In [Google Calendar](https://calendar.google.com/), create a new calendar called **`Agent`** (or `Hermes-Lodestar`, whatever you like). Your agent writes *only* here, so anything it adds is visually separate from your real calendar and trivially deletable. Your existing calendars stay read-only.

---

## 3. Obsidian — do this last

Your agent needs a human-readable home for notes — the A2H edge from Part 2, made of plain markdown. The trick: **let your agent create the folder structure**, then point Obsidian at it. That way the vault and the agent agree on where everything lives from day one.

1. **Download Obsidian** from [obsidian.md/download](https://obsidian.md/download) and install it. *Don't create a vault yet.*
2. Run the setup prompt below — it creates the vault folders for you.
3. Back in Obsidian: **Open folder as vault** → choose the folder your agent created (it'll tell you the path). Done.

The structure your agent will scaffold (a clean starting point):

```
Vault/
├── 00 Meta/          # templates, rules, indexes
├── 01 Journal/       # daily notes, intentions, reflections
├── 02 Inbox/         # quick capture, to be processed
├── 03 Action Items/  # tasks, follow-ups, active loops
└── 04 Reference/     # saved, durable notes
```

---

## The policy table — the heart of HITL

Before you connect anything, decide *in writing* what the agent may do at each level of trust. This is the actual contract (and it's what the prompt encodes):

| Action | Auto (no ask) | Preview first | Explicit confirm |
| --- | --- | --- | --- |
| Summarize inbox / day | ✅ | | |
| Read calendar (existing) | ✅ | | |
| Append to vault Inbox / Action Items | ✅ | | |
| Draft an email reply | | ✅ (lands in Drafts) | |
| **Send** an email | | | ✅ *you* send it |
| Create a calendar event | | ✅ | ✅ on the dedicated `Agent` calendar only |
| Reorganize vault structure | | | ✅ |
| Anything with money, identity, or other people | | | ✅ always |

Two rules worth burning in, straight from a working setup: **calendar events go only to the dedicated calendar, reminders off by default**, and **email never sends — it drafts.**

---

## The one prompt that wires it together

This builds on the agent you stood up in Part 1. Have these five things ready first:

1. **Telegram bot token** (from BotFather, step 1).
2. Your phone nearby to send the bot `/start` and read back the **pairing code**.
3. **`credentials.json`** — your downloaded Google OAuth client (step 2d). Know its path.
4. The **dedicated calendar name** you made (e.g. `Agent`).
5. Obsidian installed but no vault opened yet (step 3).

Paste this into your coding agent (or your running OpenClaw agent):

```text
Extend my existing OpenClaw agent with human-in-the-loop integrations:
Telegram, an Obsidian vault, Google Calendar (read + dedicated-write), and
Gmail (read + draft-only). Run every command yourself — never tell me to open
a terminal. Ask me only for the §0 inputs and the in-app codes. WAIT = hard gate.

§0. Ask me (WAIT for each as you reach it):
1. Telegram bot token — from @BotFather (12345:ABC-…).
2. Path to my Google OAuth credentials.json (Desktop-app client I downloaded).
3. The name of my dedicated Google calendar for agent writes (e.g. "Agent").

§1. Scaffold the Obsidian vault inside the agent workspace at /workspace/vault:
  00 Meta/Templates, 01 Journal/Daily, 02 Inbox, 03 Action Items, 04 Reference
Write a starter daily-note template into 00 Meta/Templates/Daily Note.md
(sections: Carryover, Intentions, Calendar, Log, Evening reflection).
Tell me the exact host path so I can open it in Obsidian via "Open folder as vault".

§2. Connect Telegram with the bot token. Then tell me:
"Message your bot /start in Telegram and paste the pairing code here." WAIT for
the code, then approve the pairing so the bot only talks to me.

§3. Connect Google using my credentials.json. Enable these scopes only:
  calendar.readonly, calendar.events, gmail.readonly, gmail.compose
Run the OAuth flow yourself: print the consent URL, have me approve it, and I'll
paste back the redirect (localhost) URL. WAIT for that. Then:
  - Calendar: read my existing calendars for context; create events ONLY on the
    calendar I named in §0; preview every event and require my "yes"; reminders OFF.
  - Gmail: read + summarize; create DRAFTS only. Never send. (No gmail.send scope.)

§4. Write the operating rules to /workspace/AGENTS.md so they persist:
  - Calendar writes go only to the dedicated calendar; preview-first; reminders off.
  - Email: summarize and draft only; never send.
  - Vault: append to 02 Inbox / 03 Action Items freely; never reorganize without asking.
  - Anything involving money, identity, or other people: always confirm with me first.

§5. Verify and report back, in plain language:
  - Telegram paired? Send me a test "hello" from the bot.
  - Calendar readable? Show me today's events.
  - Gmail readable? Summarize my last 3 unread.
  - Vault created? Give me the path to open in Obsidian.
Then stop and let me try it.
```

When it finishes §5, message your bot, then open the vault folder in Obsidian. You now have an agent that sees your day, drafts your email, and writes into a vault you control.

---

## The question to end on

The most important deliverable here isn't a connected tool. It's the answer to one question, written into your agent's `AGENTS.md`:

**What should your agent never do without you?**

Answer that clearly and every integration becomes safe to add, because the boundary is explicit. (For email it's already answered: *never send.*) Can't answer it? No amount of capability will make the system trustworthy.

Next, we give the agent something to *remember*, so it can hold continuity across all of this over time.

→ [Part 4 — Memory for Your Agent](https://pawper.dev/l/memory-for-your-agent/)

---

> **Sources / additional material:**
>
> https://t.me/BotFather — Telegram BotFather (bot setup)
>
> https://desktop.telegram.org/ — Telegram desktop app
>
> https://console.cloud.google.com/apis/library/calendar-json.googleapis.com — enable Google Calendar API
>
> https://console.cloud.google.com/apis/library/gmail.googleapis.com — enable Gmail API
>
> https://console.cloud.google.com/apis/credentials — create the OAuth client (Desktop app)
>
> https://developers.google.com/identity/protocols/oauth2/scopes — full list of Google API scopes
>
> https://obsidian.md/download — Obsidian
>
> https://pawper.dev/l/becoming-agentic-sovereign/ — daily notes, rituals, and AGENTS.md

_This article was generated with AI for the purpose of providing practical information. I have reviewed it and edited it appropriately._
