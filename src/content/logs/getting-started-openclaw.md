---
title: "Getting Started with OpenClaw: Your First Agent in a Box"
devto: ""
date: "2026.06.24"
kicker: "Tutorial"
tags: ["OpenClaw", "Docker", "Containers", "Nebius", "Claude", "WSL", "Aider", "Telegram", "Deployment"]
hook: "You have a laptop, some curiosity, and maybe no AI subscription at all. By the end you have a running OpenClaw agent with a web dashboard — and your coding agent does every terminal command for you. No terminal homework."
series:
  name: "ClawCamp Campout @ Dual Tech Summit 2026"
  part: 2
  total: 5
mentor: true
---

This is Part 1 of the **[ClawCamp Campout @ Dual Tech Summit 2026](https://pawper.dev/l/clawcamp-campout-overview/)** series — the hands-on one. The goal is one concrete thing: **a running OpenClaw agent you can open in your browser.**

Here's the promise that makes this beginner-friendly: **you will not type terminal commands.** A coding agent does all of that for you. You'll answer a few questions, click a couple of links, and at the end you'll have a web dashboard you can chat with. That dashboard *is* your agent.

A note on expectations: account and API setup can still hiccup — a billing page that won't load, a slow confirmation email. If something stalls, getting partway is a real win; you can finish tonight. But the path below is designed to actually finish in the time we have.

---

## Why OpenClaw?

When people picture "an AI," they picture a chat window. That's the smallest version of the idea.

**OpenClaw is an agent in a box** — a model wired to *tools* and a *filesystem*, running as a persistent service you talk to through a web dashboard (and later, Telegram or Discord). The difference that matters:

- A chatbot answers the message in front of it and forgets.
- An agent has a workspace it can read and write, tools it can call, and instructions that persist. It can *act*, not just reply.

OpenClaw gives you that with a polished web UI and a one-shot setup. We'll run it inside Docker so it stays safely in its box.

---

## Step 1 — Get your Nebius credits FIRST

Do this before anything else, because **Nebius takes about 5–10 minutes to process and activate your credits.** Start it now and let it cook in the background while you do the installs in Step 2 — don't sit and watch it.

For the campout we're using **Nebius**: they're giving attendees free credits, so you need no existing AI subscription and no credit card.

1. Open the campout promo link: **[nebius.com/promo-code (ClawCamp SF)](https://nebius.com/promo-code?utm_promo_event_code=2026-claw-camps&utm_promo_activation_code=2026-05-04-CLAWCAMP-SF)**
2. Sign up / sign in and **activate the credits.**
3. Create an **API key** and copy it somewhere safe — you'll paste it into your coding agent and the setup prompt later. (Nebius is OpenAI-compatible; the key is all OpenClaw needs.)

Now **move straight to Step 2 while the credits process.** Come back and confirm they've landed before you run the big prompt in Step 4.

> **Already have AI access?** You can use it instead of Nebius:
> - **OpenRouter / OpenAI / Gemini** API keys work directly — say so in the prompt and swap the key.
> - **A Claude subscription** does *not* automatically work with OpenClaw. Third-party agents need Anthropic's separate **Agent SDK credit (extra usage)** or a pay-as-you-go key from [console.anthropic.com](https://console.anthropic.com) — your base Claude plan alone won't authenticate here.
>
> If any of that is friction today, just use the Nebius credits. That's the whole point of them.

---

## Step 2 — Two installs (while Nebius processes)

You need two things on your machine. Do them now, in the 5–10 minutes your credits are activating. These are the only manual installs in this whole guide.

### Docker Desktop (everyone)

Your agent runs inside Docker. Grab **Docker Desktop** from [docker.com](https://www.docker.com/products/docker-desktop/), install it, and **make sure it's running** (you'll see the whale icon in your menu bar / system tray). That's it — your coding agent does everything else with it.

### WSL — Windows users only

> **Windows heads-up.** The commands your coding agent runs are Linux commands (Docker, `docker compose`, file permissions). On Windows those run inside **WSL** (Windows Subsystem for Linux), not PowerShell. Install it once: open **PowerShell as Administrator** and run:
>
> ```powershell
> wsl --install
> ```
>
> Reboot when it asks. This gives you Ubuntu, and Docker Desktop will use it automatically (its **Settings → Resources → WSL Integration** should have Ubuntu enabled). When you run your coding agent, run it **inside Ubuntu (WSL)** so its commands land in the right place. *(Mac and Linux users: skip this — your terminal is already Unix.)*

By the time these finish, your Nebius credits should be active. Full prerequisite list: Docker for everyone, plus WSL on Windows. Everything past here is automated.

---

## Step 3 — Your coding agent (it does the work)

This is the key idea: **a coding agent runs the setup for you.** You give it one prompt; it writes the files and runs every command.

**If you already have one** — Claude Code, Codex, Cursor, or Windsurf — open it on an empty folder and skip to Step 4. *(Windows: open it inside WSL/Ubuntu.)*

**If you don't have one**, the most beginner-friendly option is a GUI editor with a built-in agent:
- **Cursor** — free download, point-and-click: [cursor.com](https://cursor.com)
- **Claude Code** — if you have Claude access

**Terminal fallback — Aider, pointed at Nebius.** If you'd rather use the lightweight, open-source [Aider](https://aider.chat), it runs in your terminal (inside **WSL** on Windows; your normal terminal on Mac/Linux). The nice part: you can point Aider at the *same* Nebius credits, so it reuses one key for everything.

```bash
pipx install aider-chat

# Use your Nebius credits for Aider's own reasoning (Nebius is OpenAI-compatible):
export NEBIUS_API_KEY="<your Nebius API key from Step 1>"
aider --model nebius/meta-llama/Llama-3.3-70B-Instruct
```

That's it — Aider now thinks with Nebius, the same credits that will power your agent. (If you want to make it permanent, add the `export` line to your `~/.bashrc` so you don't set it each session.)

Whichever option you pick, the principle holds: **the agent runs the commands, not you.**

---

## Why it runs in a container

One thing worth understanding before you run an autonomous agent:

**An agent with full access to your machine is dangerous.** It acts without asking permission for each step. With your whole filesystem, it could read, change, or delete anything. You want it **contained.**

Docker gives you exactly that — a sandbox:

- **Isolation** — the agent only touches what you explicitly hand it. Your files stay invisible.
- **Reproducibility** — same setup, same behavior, on any machine.
- **Reliability** — if it crashes, the container restarts it. Your always-on agent stays on.

That's why everything here runs in Docker. The full mental model is in [Containers & Agents with Docker](https://pawper.dev/l/docker-fundamentals/); for now: **the container is the box, and the box is the safety.**

---

## Step 4 — The one prompt that does it all

Make sure your Nebius credits from Step 1 have finished activating, then open your coding agent (in an empty folder; Windows users inside WSL) and paste the prompt below. It tells the agent to do the entire setup itself and hand you back a dashboard link. **You only answer three questions and click the final link.**

```text
Set up OpenClaw in Docker, using Nebius as the AI model, and give me back a
web dashboard link I can open. I am a beginner — do NOT ask me to open a
terminal or run any commands. You run every command yourself. Ask me only for
the §0 inputs and for any link/code you need me to click. WAIT = hard gate.

§0. Ask me (WAIT for all three before continuing):
1. Nebius API key — from nebius.com/promo-code (ClawCamp SF promo).
   (If I tell you I'm using OpenRouter/OpenAI/Gemini instead, use that key.)
2. Agent name — something short (e.g. "Scout").
3. Agent description — one sentence: who I am + how the agent should behave.

§1. Write ~/projects/openclaw/compose.yaml:

services:
  openclaw:
    image: ghcr.io/openclaw/openclaw:latest
    container_name: openclaw
    volumes:
      - openclaw-workspace:/workspace
    environment:
      - OPENCLAW_WORKSPACE=/workspace
      - OPENCLAW_STATE_DIR=/workspace/.openclaw
    stdin_open: true
    tty: true
  openclaw-gateway:
    image: ghcr.io/openclaw/openclaw:latest
    container_name: openclaw-gateway
    restart: unless-stopped
    volumes:
      - openclaw-workspace:/workspace
    environment:
      - OPENCLAW_WORKSPACE=/workspace
      - OPENCLAW_STATE_DIR=/workspace/.openclaw
    ports:
      - "127.0.0.1:18789:18789"
    command: openclaw gateway run --bind lan
volumes:
  openclaw-workspace:
    name: openclaw-workspace

Validate it yourself: cd ~/projects/openclaw && docker compose config --quiet

§2. Fix volume ownership (a fresh named volume is root-owned; the container
runs as uid 1000 — skip this and onboarding fails with EACCES):
docker run --rm --user root -v openclaw-workspace:/workspace ghcr.io/openclaw/openclaw:latest chown -R 1000:1000 /workspace

§3. Wire up Nebius. Nebius is an OpenAI-COMPATIBLE provider:
  - Base URL: https://api.studio.nebius.ai/v1
  - API key: the Nebius key from §0
First discover this build's exact flags — run, yourself, and read the output:
  docker compose run --rm openclaw openclaw onboard --help
  docker compose run --rm openclaw openclaw models list
Then onboard non-interactively, configuring the OpenAI-compatible provider to
point at the Nebius base URL with the Nebius key (use the openai/base-url flags
this build exposes — adapt to what --help shows). Start from this shape and fix
flag names as needed:
  docker compose run --rm openclaw openclaw onboard --non-interactive --accept-risk --flow quickstart --auth-choice apiKey --openai-api-key '<NEBIUS_API_KEY>' --openai-base-url 'https://api.studio.nebius.ai/v1' --workspace /workspace --skip-channels --skip-search --skip-skills --skip-hooks --no-install-daemon --skip-health
Then set a Nebius model that appears in `models list` (a good default is
meta-llama/Llama-3.3-70B-Instruct; if the id needs a provider prefix, use the
exact form from the list):
  docker compose run --rm openclaw openclaw models set meta-llama/Llama-3.3-70B-Instruct
Enable web search + session memory:
  docker compose run --rm openclaw openclaw plugins enable duckduckgo
  docker compose run --rm openclaw openclaw hooks enable session-memory

§4. Write my persona (insert <DESCRIPTION> verbatim as a complete sentence):
docker exec openclaw openclaw stop 2>/dev/null || true
docker compose run --rm openclaw sh -c 'printf "# <AGENT_NAME>\n\nYou are <AGENT_NAME>, my personal AI assistant. <DESCRIPTION>\n" > /workspace/SOUL.md'

§5. Start the gateway and verify — all yourself, no terminal for me:
docker compose up -d openclaw-gateway && sleep 6
docker exec openclaw-gateway openclaw models status
docker logs openclaw-gateway 2>&1 | grep -i "unknown model" && echo "BAD: model not in catalog — re-pick from models list"
curl -s -o /dev/null -w "dashboard HTTP %{http_code}\n" http://127.0.0.1:18789/
If the model errors, re-run `models list`, pick a valid Nebius id, `models set`
it, and restart: docker compose restart openclaw-gateway

§6. Give me my dashboard link. The UI is token-gated, so read the token and
build the full URL for me — don't make me find it:
docker exec openclaw-gateway sh -c 'node -e "console.log(require(process.env.OPENCLAW_STATE_DIR+\"/openclaw.json\").gateway.auth.token)"'
Then tell me, in plain language:
"Your agent is live. Open this link (it logs you in automatically — keep it
private): http://127.0.0.1:18789/#token=<GATEWAY_TOKEN>"
```

That prompt is the deliverable. When the agent finishes §6, you click the link and you're talking to your agent in the browser.

> **Want it on Telegram or Discord too?** That's an integration, and it's covered with boundaries in [Part 3](https://pawper.dev/l/getting-going-with-your-agent/). The dashboard alone is enough to call this done.

---

## Step 5 — What "done" looks like (and what to do if it stalls)

You're done when the agent gives you a line like:

> Your agent is live. Open this link… `http://127.0.0.1:18789/#token=…`

Click it. The OpenClaw dashboard opens, already logged in, and you can chat with your agent. **That's the win.**

You never ran a command — so if something breaks, you don't debug it either. **You paste the error back to your coding agent and let it fix itself.** Useful things to tell it:

- *"It said EACCES / permission denied."* → It should re-run the §2 ownership fix.
- *"It said 'Unknown model.'"* → It should run `openclaw models list` and pick a real Nebius id.
- *"The dashboard link didn't load."* → Ask it to confirm Docker Desktop is running and re-read the token.
- *"Nebius says invalid key / no credits."* → Your credits may not have finished activating from Step 1 — give it a few minutes and have the agent retry.

If you only get partway — say, the container runs but the model isn't wired — that's still a real foundation. Capture the agent's last message and finish later.

---

## Outcome / next step

By the end you should have **one of**:

- A running OpenClaw agent open in your browser, or
- A clear next action — the one link or key standing between you and that dashboard.

Either is a success.

Then read the *why* underneath all of this:

→ [Part 2 — Beyond Assistants: The Agentic Personal OS](https://pawper.dev/l/beyond-assistants-agentic-personal-os/)

---

> **Sources / additional material:**
>
> https://github.com/openclaw/openclaw — OpenClaw repository
>
> https://nebius.com/promo-code?utm_promo_event_code=2026-claw-camps&utm_promo_activation_code=2026-05-04-CLAWCAMP-SF — Nebius ClawCamp credits
>
> https://docs.tokenfactory.nebius.com — Nebius AI Studio / Token Factory docs (OpenAI-compatible API)
>
> https://www.docker.com/products/docker-desktop/ — Docker Desktop
>
> https://learn.microsoft.com/windows/wsl/install — WSL install (`wsl --install`)
>
> https://cursor.com — Cursor (GUI coding agent)
>
> https://aider.chat — Aider (terminal coding agent)
>
> https://pawper.dev/l/docker-fundamentals/ — Containers & Agents with Docker (full provider matrix)

_This article was generated with AI for the purpose of providing practical information. I have reviewed it and edited it appropriately._
