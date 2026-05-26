---
title: "Containers & Agents with Docker & OpenClaw"
devto: "https://dev.to/pawper/containers-agents-with-docker-openclaw-4pbd"
date: "2026.05.26"
kicker: "Tutorial"
tags: ["Docker", "Containers", "Agents", "OpenClaw", "Deployment"]
image: "https://res.cloudinary.com/dr1sonbsi/image/upload/v1779834795/pawper.dev/logs/ChatGPT_Image_May_26_2026_03_33_03_PM_sgiurt.png"
hook: "Containers are how modern systems stay reliable, reproducible, and always-on. Learn what Docker solves, how it works, and then deploy your first agent—OpenClaw—in a container where it can run continuously."
series:
  name: "Foundations of Digital Agency"
  part: 9
  total: 10
---

You have a fundamental problem in software: your code works on your machine, but breaks on someone else's. Different operating systems. Different versions of dependencies. Different configurations. "It works on my machine" is the oldest excuse in development.

There's another problem too: packages. You install npm packages to build things faster. But what if a package has malicious code? What if it goes rogue and tries to access your system files? Without isolation, one bad package can compromise everything.

**Containers solve both problems.** A container packages your application *plus everything it needs to run*—the exact runtime, the exact dependencies, the exact configuration—into a single, portable unit. It also isolates your application in a sandbox: if a package misbehaves, it's confined to that container. It can't touch your other projects or your system files. The same container runs on your laptop, a colleague's Mac, and a production server. No surprises. No risk spillover.

Docker is the standard tool for building and running containers. This guide teaches you what Docker does, how it works, and why it matters.

Once you understand Docker, we can apply it as a solution for a specific problem: **containing an agent**—OpenClaw—so it can run without accessing your entire system. We'll set that up, connect it to Discord, and you'll have deployed your first production system.

---

## The Problems Containers Solve

Imagine you're running an application on your laptop. It works fine. But then:

- Your application depends on Python 3.11, but you upgrade to Python 3.12 for another project. Now the first application breaks.
- You want to deploy the application to a server. You install dependencies, but the server has a different OS version or different package versions. Things behave differently.
- Your application crashes. It stays down until you manually restart it.
- You install a sketchy npm package for one project. It misbehaves and starts corrupting files. It affects your entire system.
- You want to run the same application on Windows and macOS. You need different installation instructions for each platform. Developers always forget a step.

These are the problems containers solve:

**Reproducibility** — The same container runs identically on your laptop, a colleague's Mac, a staging server, and production. No "works on my machine" surprises. No platform-specific configuration nightmares.

**Isolation** — Each container is sandboxed. One application's dependencies don't conflict with another's. A misbehaving package or crashed application or AI agent (like OpenClaw) is confined to its container—it can't damage your system or other projects.

**Reliability** — If an application crashes, the container can automatically restart it. Long-running services stay alive without manual intervention.

**Deployment simplicity** — You don't install your application on a server. You just run the container. Same image, same behavior, everywhere.

---

## What is Docker?

**Docker** is a containerization platform. It packages your application—plus everything it needs to run—into a single, portable unit. Think of it this way:
- **Without Docker** — You ship code to someone and say, "Install Node.js 24, npm 11, these 50 packages, and run this." Hope their setup matches yours.
- **With Docker** — You ship a container. It includes Node.js 24, npm 11, all 50 packages, and your code. It runs identically everywhere.

### The Mental Model: Images and Containers

**A Docker image** is a blueprint—a template that describes how to build an environment. It's like a recipe.

**A Docker container** is a running instance of that image. It's like baking a cookie from the recipe.

You create one image. You can run multiple containers from it. Each container is isolated and independent.

---

## The Dockerfile: Your Recipe

To build a Docker image, you write a `Dockerfile`—a set of instructions. Here's an example:

```dockerfile
FROM node:24-slim
WORKDIR /app
RUN npm install -g some-app
ENV PORT=3000
VOLUME ["/data"]
CMD ["some-app", "start"]
```

Each instruction does something:

| Instruction | Meaning |
|-------------|---------|
| `FROM node:24-slim` | Start with Node.js 24 (base OS + runtime) |
| `WORKDIR /app` | Create `/app` directory (where your app lives) |
| `RUN npm install -g some-app` | Install the application globally |
| `ENV PORT=3000` | Set an environment variable |
| `VOLUME ["/data"]` | Mark a directory for persistent storage |
| `CMD ["some-app", "start"]` | Default command to run |

When Docker builds this, it creates layers. Layer 1 is Node.js. Layer 2 is the app. If you rebuild and only change the app, Docker reuses layer 1 from cache. It's fast.

---

## Docker Compose: Orchestrating Containers

Real applications need more than just a Dockerfile. You need to:
- Set environment variables
- Mount persistent storage
- Handle restarts
- Configure networking

**Docker Compose** is a tool that manages all this. You write a `compose.yaml` file:

```yaml
services:
  myapp:
    build: .
    restart: unless-stopped
    volumes:
      - app-data:/data
    environment:
      - PORT=3000

volumes:
  app-data:
```

This tells Docker:
- Build the image from the Dockerfile in this directory
- If the container crashes, restart it automatically
- Mount persistent storage at `/data` (survives restarts)
- Pass environment variables into the container

Compose is the orchestrator—it keeps your container running, manages storage, handles restarts.

---

## Persistent State: Volumes and Data

Here's an important concept: **containers are ephemeral by default.** When you stop a container, any data stored inside it is lost.

This is actually a feature—it means containers are isolated and clean. But for applications that need to remember things (databases, agent configurations, user data), you need persistence.

**Volumes** are Docker's solution. A volume is a storage location outside the container that survives restarts. When you mount a volume in a container, it can read and write data that persists even after the container stops.

In your `compose.yaml`, you define volumes:

```yaml
volumes:
  openclaw-workspace:
```

And then mount them in your container:

```yaml
volumes:
  - openclaw-workspace:/workspace
```

This tells Docker: "Create a persistent storage called `openclaw-workspace`, and mount it at `/workspace` inside the container." When the container stops, the data stays. When you restart the container, it reconnects to the same volume and picks up where it left off.

This is how your agent remembers things between restarts.

---

## Docker Hub: The Registry Pattern (Again)

Remember NPM Registry? Docker Hub follows the same pattern.

**Docker Hub** is a registry of pre-built container images. When you write `FROM node:24-slim`, Docker automatically downloads that image from Hub.

You can push your own images to Docker Hub:

```bash
docker build -t yourname/myapp:1.0 .
docker push yourname/myapp:1.0
```

Anyone in the world can then run your container:

```bash
docker run yourname/myapp:1.0
```

This is how applications are distributed in the modern world—not as source code, but as ready-to-run containers.

---

## Install Docker

You need Docker Desktop running on your machine.

**Windows (with WSL):**
1. Download: https://docs.docker.com/desktop/setup/install/windows-install/
2. Run the installer. Keep "Use WSL 2 instead of Hyper-V" checked.
3. Reboot if prompted.
4. Launch Docker Desktop from the Start Menu.
5. In Docker Desktop: **Settings → Resources → WSL Integration** → enable Ubuntu.

**macOS:**
1. Download: https://docs.docker.com/desktop/setup/install/mac-install/ (choose your chip: Apple Silicon or Intel)
2. Open the `.dmg` and drag Docker to Applications.
3. Launch Docker from Applications.

**Linux:**
Follow your distribution's guide: https://docs.docker.com/engine/install/

**Verify it's working:**

```bash
docker run hello-world
```

You should see "Hello from Docker!" — you're good.

## Why OpenClaw in a Container?

OpenClaw is an AI agent. It's autonomous. It thinks, decides, and takes actions without you telling it each step. You could run it directly on your machine, but here's the problem: **an autonomous agent with full access to your system is dangerous.**

If you give OpenClaw permission to access your file system, it could read, modify, or delete files. If you give it access to your email or social media, it could send messages on your behalf. If it misbehaves, or if there's a bug in its reasoning, it could compromise your data or damage your system.

You don't want an autonomous agent running freely with full system access. You want it **contained**.

**A container provides a sandbox:**

- OpenClaw runs in an isolated environment. It can't access your file system, your other projects, or your personal data unless you explicitly give it permission.
- If OpenClaw misbehaves or causes damage, it's confined to the container. Your system stays safe.
- You control exactly what OpenClaw has access to (a specific folder, a specific API key, Discord) through configuration.
- If something goes wrong, you destroy the container and start fresh. Your system is unaffected.

This is why containers are essential for running autonomous agents safely. Containers let you run powerful systems—agents, untrusted code, experimental software—without putting your data at risk.

OpenClaw in a container means: powerful, but bounded.

---

## Create Your OpenClaw Project

Set up a working directory:

```bash
mkdir -p ~/projects/openclaw
cd ~/projects/openclaw
```

Create a `Dockerfile`:

```bash
cat > Dockerfile << 'EOF'
FROM node:24-slim

WORKDIR /openclaw

RUN npm install -g openclaw@latest

ENV OPENCLAW_WORKSPACE=/workspace

VOLUME ["/workspace"]

CMD ["openclaw", "onboard"]
EOF
```

What this does:
- `FROM node:24-slim` — Start with Node.js 24
- `WORKDIR /openclaw` — OpenClaw lives in `/openclaw` inside the container
- `RUN npm install -g openclaw@latest` — Install OpenClaw via npm (happens once, at build)
- `ENV OPENCLAW_WORKSPACE=/workspace` — Tell OpenClaw where to store config
- `VOLUME ["/workspace"]` — Persistent storage—survives container restarts
- `CMD ["openclaw", "onboard"]` — Default command: run onboarding

Create a `compose.yaml`:

```bash
cat > compose.yaml << 'EOF'
services:
  openclaw:
    build: .
    container_name: openclaw
    restart: unless-stopped
    volumes:
      - openclaw-workspace:/workspace
    environment:
      - OPENCLAW_WORKSPACE=/workspace
    stdin_open: true
    tty: true

volumes:
  openclaw-workspace:
EOF
```

What this does:
- `cat` command  —  outputs text. The `>` redirects it to a file. The `<< 'EOF'` means "read input until you see EOF"—so you can paste a multi-line block. If you mess up, press <kbd>Ctrl</kbd>+<kbd>C</kbd> to cancel.
- `build: .` — Build from the Dockerfile
- `restart: unless-stopped` — Keep the container always-on; auto-restart if it crashes
- `volumes:` — Persistent storage for agent config and state
- `stdin_open: true` and `tty: true` — Allow interactive terminal input during setup

### How OpenClaw's State Persists

The key line is `volumes: - openclaw-workspace:/workspace`. This tells Docker: "Create a persistent storage volume called `openclaw-workspace` and mount it at `/workspace` inside the container."

When you run OpenClaw and it saves your configuration, memories, and state—that all goes into `/workspace`. Because it's mounted as a volume, it survives container restarts.

**What this means in practice:**
- You run the gateway and chat with your agent. It learns things, stores memories.
- You stop the container (Ctrl+C in the terminal).
- You restart the container later with `docker compose run --rm openclaw openclaw gateway run`.
- Your agent picks up exactly where it left off. All memories, config, state—intact.

The volume is persistent. The container is ephemeral. When you destroy the container and start a new one, they both connect to the same volume. Your agent's data is safe.

This is why you don't lose your agent's state when the container restarts or crashes.

---

## Get API Keys

OpenClaw needs Claude to think. You need an Anthropic API key.

1. Go to https://console.anthropic.com and create an account
2. **API Keys** → **Create Key** → copy it
3. **Billing** → add $5+

> The API is pay-per-use, separate from Claude.ai. $5 lasts a while for personal use with Haiku.

## Set Up Discord

Your agent will chat remotely through Discord. Create a bot for it to control.

**First, create a Discord server** (if you don't have one already):
1. Open Discord (https://discord.com)
2. Click the **+** icon on the left sidebar
3. **Create My Own** → give it a name (e.g., "OpenClaw Test") → Create
4. You now have a private server where your agent will live

**Create the bot:**
1. Go to https://discord.com/developers/applications
2. **New Application** → name it (e.g., "OpenClaw") → Create
3. Left sidebar: **Bot**
4. **Reset Token** → **copy the token** (you won't see it again)
5. **Privileged Gateway Intents** → enable **Message Content Intent** → Save

**Invite the bot to a server:**
1. **OAuth2 → URL Generator**
2. Scopes: check **bot**
3. Permissions: check **Send Messages**, **Read Message History**, **View Channels**
4. Copy the URL → paste in browser → select your server → Authorize

You need a Discord server (even a private test one). Once the bot is in a server, you can DM it.

## Build and Run Onboarding

In your terminal:

```bash
cd ~/projects/openclaw
docker compose build
docker compose run --rm openclaw openclaw onboard
```

The build takes a few minutes the first time. Docker is downloading Node.js and OpenClaw. After that it's cached.

The onboarding wizard will prompt you:

| Prompt | Choose |
|--------|--------|
| Select channel | Discord (Bot API) |
| Discord bot token | Paste from Part 5 |
| Anthropic auth method | Anthropic API key |
| API key | Paste from Part 4 |
| Model | `claude-haiku-4-5-20251001` |
| Web search | DuckDuckGo |
| Install missing skill dependencies | Skip |
| Configure skills | Yes |
| API keys (Google, Notion, etc.) | No |
| Enable hooks | Select `session-memory`, skip rest |
| Hatch in Terminal | Yes |

**On the model:** Haiku is fast and cheap—perfect for always-on. Switch to Sonnet later if needed.

**On skills:** Don't install community skills yet. Get basics working first.

---

## Define Your Agent

After onboarding, you define who your agent is. When prompted:

> You are my personal AI assistant. I'm based in [city]. I'm a [background] focused on [goals]. Be direct, skip filler. Help me stay on top of tasks, research, and projects.

This gets saved to `SOUL.md` in your persistent volume. Edit it anytime to change how the agent behaves.

---

## Start the Gateway

The **gateway** is the key to your agent listening to Discord. Here's what it does:

Your agent needs to listen for messages. In Discord, messages come in. Your agent needs to respond. The gateway is the listening port—the connection between your agent and Discord. The agent is now listening to Discord 24/7. It receives messages, thinks, and responds.


---

## Start Your Agent

If you've already started a container and want to run the gateway (or restart it), don't use `docker compose run` again—that would start a *new* container. Instead, open another terminal window and use `docker exec` to start the gateway in the existing container:

```bash
docker exec openclaw openclaw gateway run
```

This runs the gateway in the container that's already running, without creating a duplicate.

You should see:

```
[gateway] loading configuration...
[gateway] resolving authentication...
[gateway] connected
```

Your agent should now be live on Discord. Tag it and send it a message in the Discord channel it's in. It will respond.

Leave this terminal open. Your agent stays connected as long as this process runs.

> Having trouble getting the gateway set up or navigating terminals?  You can insist OpenClaw do it for you -- and it can do it.

---

## The Power and Danger of Agents

Here's something important: your agent has direct access to its integrations. When you gave it your Discord bot token and your API key, you gave it authority to act on your behalf.

This is powerful. Your agent can:
- Set up its own Discord channels
- Create reminders, manage tasks
- Fetch and analyze data
- Take actions autonomously

**But be careful.** An agent with access to your API keys and authentication tokens can do a lot. If you give it permission to access your email, it can read and send emails. If you give it access to your file system, it can read and modify files.

This is why agents need isolation (containers) and why you should audit what permissions you grant them.

For now, you've only given OpenClaw access to Discord and the Anthropic API. That's safe.

---

## You've Deployed a Production System

You now have:

- **A containerized application** — OpenClaw runs in an isolated container
- **Persistent storage** — Configuration and state survive restarts
- **Automatic restarts** — If the agent crashes, the container restarts it
- **Always-on operation** — The gateway keeps your agent listening 24/7
- **Infrastructure as code** — Your Dockerfile and `compose.yaml` document everything

This is real deployment. The same architecture scales to multiple agents, multiple servers, millions of interactions.

You've moved from learning tools to building systems.

---

## Daily Use: Running Your Agent

Each time you start your machine, to start your agent:

```bash
cd ~/projects/openclaw
docker compose run --rm openclaw openclaw gateway run
```

Leave that terminal open. Open a new tab for other work.

### macOS: Auto-Start on Login (Optional)

To start your agent automatically when your Mac boots:

```bash
mkdir -p ~/Library/LaunchAgents
cat > ~/Library/LaunchAgents/ai.openclaw.gateway.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>ai.openclaw.gateway</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/local/bin/docker</string>
    <string>compose</string>
    <string>-f</string>
    <string>/Users/YOUR_USERNAME/projects/openclaw/compose.yaml</string>
    <string>run</string>
    <string>--rm</string>
    <string>openclaw</string>
    <string>openclaw</string>
    <string>gateway</string>
    <string>run</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
</dict>
</plist>
EOF
```

Replace `YOUR_USERNAME` with your Mac username. Then:

```bash
launchctl load ~/Library/LaunchAgents/ai.openclaw.gateway.plist
```

To disable: `launchctl unload ~/Library/LaunchAgents/ai.openclaw.gateway.plist`

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `docker: command not found` | Docker Desktop isn't running. Launch it. |
| `openclaw: command not found` | Expected—it's inside Docker. Use `docker compose run`. |
| Gateway says "Missing config" | Config wasn't saved. Re-run: `docker compose run --rm openclaw openclaw onboard` |
| Discord bot not responding | Check **Message Content Intent** is enabled in Discord Developer Portal. |
| Onboarding starts fresh every time | Workspace volume isn't being used. Verify `ENV OPENCLAW_WORKSPACE=/workspace` in Dockerfile and rebuild. |
| (Windows WSL) Docker can't find files | Keep files in WSL home (`~/`), not Windows side (`/mnt/c/`). |
| (macOS Apple Silicon) "Architecture" warnings | Normal—emulated via Rosetta. Performance is fine. |

---

> **Sources / additional material:**
>
> https://docs.docker.com/ — Docker official documentation
>
> https://docs.docker.com/get-started/ — Docker getting started
>
> https://docs.docker.com/compose/ — Docker Compose
>
> https://hub.docker.com/ — Docker Hub registry
>
> https://github.com/openclaw/openclaw — OpenClaw repository
>
> https://console.anthropic.com — Anthropic Console
>
> https://discord.com/developers/applications — Discord Developer Portal

_This article was generated with AI for the purpose of providing practical information. I have reviewed it and edited it appropriately._
