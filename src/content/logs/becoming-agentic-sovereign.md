---
title: "Becoming Agentic & Sovereign with Obsidian"
devto: ""
date: "2026.05.28"
kicker: "Tutorial"
tags: ["OpenClaw", "Hermes", "Obsidian", "Syncthing", "Personal OS", "Second Brain", "Discord", "Telegram"]
image: "https://res.cloudinary.com/dr1sonbsi/image/upload/v1780006590/pawper.dev/logs/ChatGPT_Image_May_28_2026_03_16_00_PM_gsizzv.png"
hook: "You've built your first agent. Now it's time to build your life around it. A personal operating system—a knowledge vault, a task extraction engine, a daily ritual—is how you stop being reactive and start being agentic. Learn to architect your own sovereignty."
series:
  name: "Foundations of Digital Agency"
  part: 10
  total: 13
mentor: true
---

Your agent is running. But what are you using it for?

Most people use agents reactively: "I need to write an email." "I need to debug this code." "Can I learn about X?" One-off queries. Useful, but not transformative.

To be truly agentic—to gain real agency and sovereignty—you need a system: a **Personal OS**. This is not about productivity hacks or optimization theater. It's about reducing tedium, clarifying what matters, and reclaiming your time and attention for what's human.

This guide teaches you how to build that system with Obsidian (your knowledge vault), Syncthing (cross-device sync), and your agent (OpenClaw or Hermes). Then we'll wire them together.

---

## What is a Personal Operating System (Personal OS)?

You have an operating system on your computer—Windows, macOS, Linux. It manages processes, memory, permissions. It's the layer that lets applications do their work.

A **personal OS** is analogous. It is the operating system for your life and work — including goals, workflows, decisions, habits, priorities, automation, and knowledge. It's the layer that lets *you* do your best work. A Personal OS governs:

* how work flows,
* how decisions happen,
* how priorities evolve,
* and how information turns into action.

Most people don't have one. They exist in reactive mode: email comes in, they respond. Notifications fire, they react. They struggle to keep up and get lost in tedium and distraction. A personal OS offloads that burden. It becomes the external memory, the task manager, the intention tracker. Your brain is free to focus on what's important.

### Evolution path people often follow

Many people naturally progress through stages:

| Stage | Description |
| --- | --- |
| Notes | Simple note-taking. |
| Second Brain | Connected knowledge management (Obsidian). |
| Productivity system | Tasks + projects + goals. |
| Personal OS | Unified life/work operating architecture. |
| AI-augmented OS | AI agents integrated into retrieval, planning, writing, automation, and decision support. |

In effect, there have been people with Personal OSs prior to agents or even without computer use, relying on analog methods such as bullet journaling -- but the AI-augmented personal OS is so much more liberating.

## The Second Brain

The Second Brain is a *component* inside a Personal OS—a digital extension of your knowledge and thinking. It's not about having *more* memory. It's about having *better* memory. Organized. Networked. Searchable. Integrated with your agent.

| Concept      | Primary Question                                  |
| ------------ | ------------------------------------------------- |
| Personal OS  | "How do I operate effectively as a human system?" |
| Second Brain | "How do I remember and connect knowledge?"        |

A second brain typically includes:

- **Knowledge vault** — All the things you've learned, read, thought about, organized in a way you can find and connect them.
- **Daily notes** — Journaling -- the record of what you did, thought, and learned each day.
- **Habit tracking** — Behaviors you're trying to change or promote.
- **Intentions** — Goals, checklists, todo's.

### Why Obsidian?

Obsidian is a networked note-taking tool. You write notes in markdown (plain text), the same readable format agents use. Notes link to each other. The graph is visual. Everything is local—your data lives on your machine, not on someone's servers.

### Why Syncthing?

Once you have a knowledge vault on one machine, you want it everywhere: your phone, your tablet, another machine, even your cloud-hosted agent. Syncthing is peer-to-peer file sync. Your devices sync directly with each other. No cloud necessary, no corporation holding your data. It's encrypted, open-source, and gives you resiliency in case a device can't be used.

## The Agent is a Filesystem

It's important to remember that agents are just a model given a file tree -- usually markdown files, though there are other forms of memory, such as vector databases.

Aside from the Second Brain, a Personal OS includes definitions and documentation of:

| System | Includes |
| --- | --- |
| Decision systems | goal frameworks, prioritization, planning horizons, review cycles |
| Action systems | task management, project execution, routines, automation |
| Feedback systems | journaling, metrics, reflection, habit tracking |
| Identity systems | values, life areas, principles, long-term direction |
| Integration systems | calendar, tasks, notes, email, AI, automation tools |

### How They Work Together

The Personal OS directs. The Second Brain informs. The Agent executes.

You define your goals and values in your Personal OS. Your Second Brain contains the knowledge and context needed. Your agent uses both—your guardrails + your context—to autonomously work on your behalf.

This transforms the relationship. Your agent becomes an aide—not just answering isolated questions, but understanding your broader context, your goals, your life. It can give you morning prompts that know what you committed to yesterday. It can help you extract tasks from conversations. It can suggest connections between ideas in your vault. It can execute decisions within your rules.

---

## The Caveat: Independence, Not Dependence

Here's what I need to say before we proceed:

**Do not let agents replace your judgment, your memory, or your ability to struggle with ideas.**

This is the critical caveat. Agents are powerful. It's tempting to offload everything—task extraction, decision-making, even thinking. "Let the agent figure it out." But if you do that, you atrophy. You lose the capability. You become dependent.

The goal is **interdependence**. Your agent is useful because you understand what you're doing. You push back. You challenge the agent. You engage with the friction of your systems and your learning.

When you're setting up your personal OS:
- Don't create a system so optimized that you never have to think. Thinking is the point.
- Don't let reminders and notifications fragment your attention (we'll address this).
- Don't abstract away the friction of planning, prioritizing, or deciding. That friction is where growth lives.
- Check in regularly. Is this system serving your agency? Or is it automating it away?

Your agent should make you *more* capable, not less. If you find yourself depending on it to remember what you committed to, to extract your own tasks, to clarify your own intentions—something's wrong. The agent is a tool. You're the sovereign.

---

## Deep Work vs. Agentic Multitasking

Here's a hard truth: **humans cannot multitask.**

Research from neuroscience is clear. What we call "multitasking" is actually rapid task-switching. It's cognitively expensive. Every time you switch tasks, you pay a switching cost—a few minutes where your brain is recalibrating. Do that 10 times a day and you've lost an hour to recalibration alone.

Flow states—the state where you do your best work—require *sustained attention*. Deep work requires a clear context, no interruptions, time to actually think.

**But agents can multitask.** An agent can manage multiple projects, monitor different streams, respond to different people, all simultaneously. It doesn't have a brain that needs continuity.

This is the trick: **use agents to handle the cognitive load that would fragment your attention.** Your agent can:
- Monitor your task queue and resurface urgent things at the right time
- Process multiple conversations and extract what's relevant to you
- Handle context-switching for things that don't require your judgment

But you should use that freed attention for deep work. For flow. For sustained thinking on what actually matters to you.

**Design your system to support focus, not fragment it.**

Before we install anything, I want to be clear on what we're building and why:

**You are designing a system that:**
1. Captures your knowledge so you can think better
2. Extracts your tasks so you can act clearly
3. Tracks your intentions so you don't drift
4. Surfaces rituals so you stay present
5. Lets agents augment all of this without replacing your judgment

**You are NOT designing a system that:**
- Automates your life away
- Creates notification/reminder hell
- Replaces your thinking with agent output
- Optimizes you into burnout
- Turns you into a manager of your own productivity theater

This distinction matters. Everything that follows is in service of agency and sovereignty, not optimization and hustle.

---

## Set Up Obsidian

### Installation and First Steps

1. Download Obsidian: https://obsidian.md/download
2. Install and launch it
3. Create a new vault. Call it something meaningful: "MyOS", "LifeVault", "SecondBrain"—whatever resonates. Put it in a place you can back up (like your home directory)

### Basic Structure

Your vault should have these core folders:

```
MyOS/
├── Daily/          # Daily notes, journaling, daily rituals
├── Projects/       # Active projects and their notes
├── Inbox/          # Things captured quickly, to be processed
├── Reference/      # Reference material, things you want to remember
├── Habits/         # Habit tracking, goals, intentions
└── Archive/        # Old notes, no longer active
```

### Daily Notes

Your daily note is the hub. Create one every morning. Use this template:

```markdown
# 2026-05-28

## Carryover
- [ ] From yesterday: [task]
- [ ] From yesterday: [task]

## Intentions for Today
(What am I prioritizing? What does today need from me?)
- [ ] 
- [ ] 
- [ ] 

## Habits
- [ ] Meditation
- [ ] Exercise
- [ ] Deep work block

## Log
(Throughout the day, write what happened, what you learned, decisions made)

## Evening: Three Blessings
(At the end of the day—tonight, fill this in. What went well today and why? What am I grateful for?)
- 
- 
- 
```

The key is this: **start your day with carryover and intentions, end your day with reflection.** This is where your agent will prompt you.

### Projects and Reference

As you work, capture things in Obsidian:
- **Projects**: "Writing a book", "Learning Rust", "Building an app"—one note per project, with links to related notes
- **Reference**: "Design principles I like", "Recipes I want to try", "People I've met"—organized by topic

Link things. If you write about "flow state" in a project note, link it to your note on "Deep Work". Your vault becomes a web of understanding.

---

## Set Up Syncthing

Syncthing keeps your Obsidian vault synced across devices without a cloud provider.

### Installation

1. Download Syncthing: https://syncthing.net/downloads/
2. Install on your primary machine (laptop)
3. On launch, Syncthing creates a UI at `http://localhost:8384`
4. Go there and set a password for the web interface

### Adding Devices

1. In Syncthing, go to **Settings** → **This Device** → give it a name (e.g., "Laptop")
2. Note the Device ID (long string at top)
3. Install Syncthing on your second device (phone, tablet, etc.)
4. In Syncthing on both devices, go to **Settings** → **Connections**
5. Add each device using its Device ID
6. Accept the connection on both sides

### Syncing Your Vault

1. On your laptop, go to **Folder** and add your Obsidian vault folder
2. Under folder settings, mark it as "Send & Receive"
3. On your second device, Syncthing will ask to add this folder. Accept it.
4. Now your vault syncs in real-time across devices

**Privacy note:** Everything is encrypted end-to-end. Syncthing isn't storing your data. It's just coordinating sync between your devices.

---

## Set Up Your Agent with Vault Access

Now we connect your agent to your knowledge vault. Since you already have Syncthing running on your machine, we'll add your agent as another Syncthing device—so your vault syncs directly to the Docker container, just like your phone or tablet.

### Add Syncthing to Your Agent

Update your `compose.yaml` to include Syncthing as a sidecar service:

:::tabs
::tab[OpenClaw]
```yaml
services:
  openclaw:
    image: ghcr.io/openclaw/openclaw:latest
    container_name: openclaw
    volumes:
      - openclaw-workspace:/workspace
      - vault:/vault
    environment:
      - OPENCLAW_WORKSPACE=/workspace
      - OPENCLAW_STATE_DIR=/workspace/.openclaw
      - OBSIDIAN_VAULT=/vault
    stdin_open: true
    tty: true

  openclaw-gateway:
    image: ghcr.io/openclaw/openclaw:latest
    container_name: openclaw-gateway
    restart: unless-stopped
    volumes:
      - openclaw-workspace:/workspace
      - vault:/vault
    environment:
      - OPENCLAW_WORKSPACE=/workspace
      - OPENCLAW_STATE_DIR=/workspace/.openclaw
      - OBSIDIAN_VAULT=/vault
    ports:
      - "127.0.0.1:18789:18789"
    command: openclaw gateway run --bind lan

  syncthing:
    image: syncthing/syncthing
    container_name: openclaw-syncthing
    restart: unless-stopped
    volumes:
      - vault:/vault
      - syncthing-config:/var/syncthing
    ports:
      - "127.0.0.1:8384:8384"    # Web UI (for setup)
      - "22001:22000"  # Sync protocol (22000 is typically used by host Syncthing)

volumes:
  openclaw-workspace:
    name: openclaw-workspace
  vault:
  syncthing-config:
```

### How State Persists

The key is `openclaw-workspace:/workspace` — both OpenClaw services mount the same volume alongside the `vault` volume. This tells Docker: "Create a persistent storage called `openclaw-workspace` and mount it at `/workspace` inside the container."

Your agent's configuration, memories, and state go into `/workspace`. Your vault goes into `/vault`. Both survive container restarts because they're mounted volumes.

::tab[Hermes]
```yaml
services:
  hermes:
    image: nousresearch/hermes-agent:latest
    container_name: hermes
    volumes:
      - hermes-workspace:/opt/data
      - vault:/vault
    environment:
      - HERMES_VAULT=/vault
      # Keep your existing API key and bot token env vars from your original compose.yaml (e.g. ANTHROPIC_API_KEY, TELEGRAM_BOT_TOKEN)
    stdin_open: true
    tty: true

  hermes-gateway:
    image: nousresearch/hermes-agent:latest
    container_name: hermes-gateway
    restart: unless-stopped
    volumes:
      - hermes-workspace:/opt/data
      - vault:/vault
    environment:
      - HERMES_VAULT=/vault
      # Keep your existing API key and bot token env vars from your original compose.yaml
    command: hermes gateway run

  hermes-dashboard:
    image: nousresearch/hermes-agent:latest
    container_name: hermes-dashboard
    restart: unless-stopped
    volumes:
      - hermes-workspace:/opt/data
      - vault:/vault
    environment:
      - HERMES_VAULT=/vault
      # Keep your existing API key and bot token env vars from your original compose.yaml
    ports:
      - "127.0.0.1:9119:9119"
    command: hermes dashboard --port 9119 --host 0.0.0.0 --insecure

  syncthing:
    image: syncthing/syncthing
    container_name: hermes-syncthing
    restart: unless-stopped
    volumes:
      - vault:/vault
      - syncthing-config:/var/syncthing
    ports:
      - "127.0.0.1:8384:8384"    # Web UI (for setup)
      - "22001:22000"  # Sync protocol (22000 is typically used by host Syncthing)

volumes:
  hermes-workspace:
    name: hermes-workspace
  vault:
  syncthing-config:
```

### How State Persists

The key is `hermes-workspace:/opt/data` — all Hermes services mount the same volume alongside the `vault` volume. This tells Docker: "Create a persistent storage called `hermes-workspace` and mount it at `/opt/data` inside the container."

Your agent's configuration, memories, and state go into `/opt/data`. Your vault goes into `/vault`. Both survive container restarts because they're mounted volumes.
:::

### Connect Your Vault

1. Start the services: `docker compose up -d`
2. Open Syncthing's web UI at `http://localhost:8384` (or your server IP if remote)
3. Note the Device ID shown at the top
4. On your machine's Syncthing, add your agent as a new device using that ID
5. Share your vault folder to your agent's Syncthing instance
6. Accept the folder on your agent's Syncthing—point it to `/vault`

Your vault now syncs to your agent the same way it syncs to your other devices. Any change you make in Obsidian propagates to the container automatically.

### What This Does

Your agent can now read and write your vault at `/vault`. It is no longer isolated. It understands your broader context.

## Skills

A skill is a reusable instruction file that tells your agent how to perform a specific task — step by step, in plain language. You write it once, and the agent reads and executes it whenever it's invoked.

:::tabs
::tab[OpenClaw]
Skills are markdown files in your workspace at `/workspace/skills/`, each with YAML frontmatter. Invoke any skill in chat with `/skill-name`, or just describe what you want — the model detects eligible skills from context and calls them automatically.

::tab[Hermes]
Skills are directories — each one lives at `/opt/data/skills/<category>/<name>/` and contains a `SKILL.md` file with YAML frontmatter and a markdown body. Invoke any skill in chat with `/skill-name`.

Hermes can also create and refine skills on its own. After completing a complex task, it writes a new skill documenting the approach. A background process called `hermes curator` manages this skill library — reviewing, improving, and pruning skills over time. It runs alongside your gateway without any extra configuration.
:::

---

## Morning Ritual

Every morning, your agent can prompt you to initialize your daily note. Here's how to set it up.

### Create a Skill for Morning Ritual

:::tabs
::tab[OpenClaw]
Create `/workspace/skills/morning-ritual.md`:

```markdown
---
name: morning-ritual
description: Initialize the daily note and check in on today's intentions
---

# Morning Ritual

## Steps

1. Get today's date and yesterday's date.
2. Read yesterday's daily note from `/vault/Daily/[yesterday's date].md`.
3. Extract all incomplete tasks (unchecked `- [ ]` items).
4. Create today's daily note at `/vault/Daily/[today's date].md` using the template at `/vault/Templates/Daily.md`. Pre-populate the Carryover section with the incomplete tasks from step 3.
5. Send a message to the user on Discord or Telegram:
   - Say good morning
   - List the carried-over tasks
   - Ask: "What are your intentions for today? Anything to add, drop, or reprioritize?"
6. Wait for the user's reply.
7. Parse the reply:
   - Add any new tasks to the Intentions section of today's daily note
   - Mark dropped tasks as cancelled in the Carryover section
   - Write the updated note back to `/vault/Daily/[today's date].md`
8. Reply in Discord along the lines of: "Done. Today's note is set. Have a good day."
```

Invoke it in chat with `/morning-ritual`.

::tab[Hermes]
Hermes skills are directories, not single files. Create the directory and `SKILL.md` at `/opt/data/skills/personal/morning-ritual/SKILL.md`:

```markdown
---
name: morning-ritual
description: Initialize the daily note and check in on today's intentions
---

# Morning Ritual

## Steps

1. Get today's date and yesterday's date.
2. Read yesterday's daily note from `/vault/Daily/[yesterday's date].md`.
3. Extract all incomplete tasks (unchecked `- [ ]` items).
4. Create today's daily note at `/vault/Daily/[today's date].md` using the template at `/vault/Templates/Daily.md`. Pre-populate the Carryover section with the incomplete tasks from step 3.
5. Send a message to the user on Discord or Telegram:
   - Say good morning
   - List the carried-over tasks
   - Ask: "What are your intentions for today? Anything to add, drop, or reprioritize?"
6. Wait for the user's reply.
7. Parse the reply:
   - Add any new tasks to the Intentions section of today's daily note
   - Mark dropped tasks as cancelled in the Carryover section
   - Write the updated note back to `/vault/Daily/[today's date].md`
8. Reply in Discord along the lines of: "Done. Today's note is set. Have a good day."
```

Invoke it in chat with `/morning-ritual`.
:::

### Schedule It

Add a cron job to run this skill every morning. On the host machine:

```bash
crontab -e
```

Add the line:

:::tabs
::tab[OpenClaw]
```
0 7 * * * docker exec openclaw-gateway openclaw agent --message "/morning-ritual"
```
::tab[Hermes]
```
0 7 * * * docker exec hermes-gateway hermes chat -q "/morning-ritual"
```
:::

This fires at 7\:00 AM daily. Adjust the time to match when you actually start your day.

### The Exchange

**Agent:** "Good morning. Carried over from yesterday: [task list]. What are your intentions for today?"

**You:** Reply in Discord—add tasks, drop things that no longer matter, reprioritize.

**Agent:** Parses your reply, updates the daily note, confirms in Discord.

You're not automating your morning. You're being prompted to think about it—and the output lands directly in your vault without manual entry.

Now your agent knows what you're working on. That context improves everything it does for you throughout the day.

## Evening Ritual—Three Blessings

Add another skill cron job -- At the end of your day, another prompt:

**Agent:** "Let's close out the day. What went well today? Why? What are you grateful for?"

**You:** Reflect. Write the three blessings in your daily note.

This is not a productivity trick. This is a ritual. A moment to step back, recognize what worked, practice gratitude. Research shows gratitude practice improves mental health, resilience, and clarity.

Your agent facilitates this. It prompts at the right time. It logs your reflection. But *you* do the thinking.

---

## Design for Flow (Not Notification Hell)

Here's where we get intentional about *not* creating a system that fragments your attention.

### No Constant Notifications

Your agent should not:
- Send you Slack/Discord messages throughout the day
- Ring alarms or pop up reminders constantly
- Interrupt deep work with "helpful" notifications
- Create urgency that isn't real

Your agent should:
- Batch updates (check once or twice a day)
- Respect your focus time (you tell it when you're in deep work)
- Resurface truly important things at ritual times (morning, evening, weekly review)

### Hourly Chimes for Time Awareness

One exception: consider a **hourly chime**—a gentle audio cue (bell, chime) that marks the passing hour. Not a notification. Just a mindfulness anchor. "An hour has passed. Am I still focused on what I intended?" This maintains time awareness without being intrusive. I use the following app on my Pixel Watch:
https://play.google.com/store/apps/details?id=com.andyxsoft.hourlychimewear&pcampaignid=web_share

### Pomodoro and Ritual-Based Work

Use **pomodoro sessions** (25 minutes of focused work, 5 minute break) or longer deep work blocks (90 minutes of sustained focus). If your intentions block out time for these and you stick to those times, your agent knows when you're in these and doesn't interrupt.

Use **ritual-based work**: same place, same time, same preparation. Your body learns the signal and drops into focus faster.

Your agent can help:
- Block calendar time for deep work
- Prepare the context (pull up relevant notes, tasks)
- Avoid interruptions during this time
- Log what you accomplished

### Right Place, Right Time, Right Tools

The point of your system is to be **at the right place, at the right time, with what you need for the task at hand.**

Your agent helps you prepare. You do the work.

---

## Weekly and Monthly Rituals

Beyond daily rituals, add longer-cycle reviews:

### Weekly Review (Sunday Evening)
Add another skill cron job: 
- What did I do this week?
- Did I accomplish my intentions?
- What habits did I maintain?
- What do I want to adjust?
- What's next week's focus?

### Monthly Review (Last day of month)
Add another skill cron job: 
- What did I accomplish this month?
- What am I learning about myself?
- How is my personal OS serving me?
- What needs to change?

Your agent can facilitate these too. But they're still *your* reflection.

## The Check-In: Is This Serving You?
Add another skill cron job: Every 90 days, have your agent ask you:
- **Are you more autonomous or less?** If you're more dependent on the system, something's wrong.
- **Is your focus better or fragmented?** You should have *more* uninterrupted time, not less.
- **Do you understand your own intentions?** The system should clarify, not obscure.
- **Are you engaging with the friction?** You should still struggle with decisions, learning, prioritization. That's where growth is.
- **What's working? What needs to change?**

And have it adjust accordingly. This system is for you. Not the other way around.

---

## The Bigger Picture

You now have:

1. **A personal OS** — Obsidian vault with daily notes, projects, reference, habits
2. **Cross-device sync** — Syncthing keeping it everywhere
3. **An agentic aide** — your agent with vault access via Syncthing
4. **Daily and evening rituals** — Scheduled skills, Discord exchange, vault updates
5. **Design for flow** — No notification hell, protected deep work
6. **Regular check-ins** — Making sure the system serves you, not controls you

One thing is still missing: your agent needs to know *who you are*. Your Obsidian vault exists, but your agent has no instructions to care about it.

### SOUL.md vs. AGENTS.md — Two Files, Two Purposes

Your agent already has a personality file — the `SOUL.md` you wrote during setup. But there's another, equally important file: `AGENTS.md`. They serve different purposes and it's crucial to understand the distinction.

**SOUL.md — WHO the agent is:**
This is your agent's personality, voice, values, and principles. It's the deep character file. Examples:
- "You are thoughtful, direct, and challenge assumptions."
- "You care about clarity over speed."
- "You never assume—you always ask for confirmation."
- "You speak in a friendly but professional tone."
- "You prioritize the user's autonomy above all else."

SOUL.md rarely changes. You write it once, during setup. You might refine it after 6 months or a year of working together, but it's relatively stable. It's the bedrock of your relationship with the agent.

**AGENTS.md — WHAT the agent does:**
This is your agent's operational manual. It defines guardrails, task routing, knowledge structures, workflow patterns, and rituals. Examples:
- "When the user shares a conversation, extract tasks and add them to /vault/Inbox/."
- "Check my daily note before suggesting new tasks—I may already be overloaded."
- "Morning ritual runs at 7:00 AM. Evening ritual runs at 9:00 PM."
- "If I ask you to do something that violates my deep work hours, remind me and propose an alternative time."
- "Access my Projects folder to understand context before suggesting changes."

AGENTS.md changes often. As your workflow matures, you'll add new rituals, adjust task routing, expand guardrails, change knowledge paths. You're constantly refining how your agent operates in practice.

**The distinction matters:**
- SOUL.md is *timeless*. You're defining the kind of aide you want.
- AGENTS.md is *living*. You're documenting how that aide works with your life right now.

Think of it this way: SOUL.md is like hiring someone for a job and telling them your expectations and values. AGENTS.md is like giving them the current project specs, workflow, and task list. The expectations (SOUL.md) stay constant. The specifications (AGENTS.md) evolve.

When you make AGENTS.md updates, you're not changing who your agent is. You're teaching it how to work better with the current shape of your life.

:::tabs
::tab[OpenClaw]
Create it at `/workspace/AGENTS.md`. OpenClaw reads this at session start automatically.
::tab[Hermes]
Create it at `/opt/data/AGENTS.md`. Hermes reads `AGENTS.md` from its workspace when running tasks, just as it would from a project directory. For guaranteed session-start loading, add a line to your `SOUL.md`: `Always read /opt/data/AGENTS.md at the start of every session.`
:::

This is your sovereign system prompt. Not a one-liner—a living document that defines the relationship between you and your agent.

Here's a starter template:

:::tabs
::tab[OpenClaw]
```markdown
# AGENTS.md — My Agentic Aide

## Identity

You are my agentic aide. Your role is to augment my agency, not replace it.
You act in my interest. You propose—I decide.

## Values & Guardrails

- I prioritize deep work and flow. Don't interrupt during scheduled focus blocks.
- I make final decisions on anything important. Propose, don't assume.
- I value clarity over speed. Ask rather than guess.
- Don't automate my judgment. Surface options—let me choose.

## Knowledge

- My vault is at `/vault`. Use it to understand my context, goals, and past thinking.
- My daily note is at `/vault/Daily/[today's date].md`. Check it before suggesting tasks.
- My projects are in `/vault/Projects/`. Reference them when I'm working on something.
- My values and principles are in `/vault/Identity/`.

## Execution

- When I share a conversation or document, extract actionable tasks and add them to `/vault/Inbox/`.
- Suggest connections between ideas in my vault—but don't reorganize without asking.
- Log significant decisions and interactions in my daily note.
- When in doubt: summarize what you're about to do and ask for confirmation.

## Rituals

- Morning ritual runs at 7:00 AM — `/workspace/skills/morning-ritual.md`
- Evening ritual runs at 9:00 PM — `/workspace/skills/evening-ritual.md`
- Weekly review runs Sunday at 6:00 PM — `/workspace/skills/weekly-review.md`
- Monthly review runs last day of the month at 6:00 PM — `/workspace/skills/monthly-review.md`
- 90-day check-in runs every quarter — `/workspace/skills/quarterly-checkin.md`
```

::tab[Hermes]
```markdown
# AGENTS.md — My Agentic Aide

## Identity

You are my agentic aide. Your role is to augment my agency, not replace it.
You act in my interest. You propose—I decide.

## Values & Guardrails

- I prioritize deep work and flow. Don't interrupt during scheduled focus blocks.
- I make final decisions on anything important. Propose, don't assume.
- I value clarity over speed. Ask rather than guess.
- Don't automate my judgment. Surface options—let me choose.

## Knowledge

- My vault is at `/vault`. Use it to understand my context, goals, and past thinking.
- My daily note is at `/vault/Daily/[today's date].md`. Check it before suggesting tasks.
- My projects are in `/vault/Projects/`. Reference them when I'm working on something.
- My values and principles are in `/vault/Identity/`.

## Execution

- When I share a conversation or document, extract actionable tasks and add them to `/vault/Inbox/`.
- Suggest connections between ideas in my vault—but don't reorganize without asking.
- Log significant decisions and interactions in my daily note.
- When in doubt: summarize what you're about to do and ask for confirmation.

## Rituals

- Morning ritual runs at 7:00 AM — `/opt/data/skills/personal/morning-ritual/SKILL.md`
- Evening ritual runs at 9:00 PM — `/opt/data/skills/personal/evening-ritual/SKILL.md`
- Weekly review runs Sunday at 6:00 PM — `/opt/data/skills/personal/weekly-review/SKILL.md`
- Monthly review runs last day of the month at 6:00 PM — `/opt/data/skills/personal/monthly-review/SKILL.md`
- 90-day check-in runs every quarter — `/opt/data/skills/personal/quarterly-checkin/SKILL.md`
```
:::

Edit this to match your actual life. The guardrails should reflect your real values. The knowledge paths should match your vault structure. The rituals should match your schedule.

This file is never finished. You'll update it as your system matures—as you learn what works, what the agent gets wrong, what you want more or less of.

---

When you're grounded in this system—when your knowledge is captured, your intentions are clear, your rituals are running, and your agent knows who you are—you're ready to be a builder. You can direct an agent to build something because you understand what you're building *and why*.

You're agentic. You're sovereign. You're ready for what's next.

---

> **Sources / additional material:**
>
> https://obsidian.md — Obsidian official documentation
>
> https://syncthing.net — Syncthing documentation
>
> https://en.wikipedia.org/wiki/Task_switching — Task switching and cognitive cost
>
> https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3032808/ — Research on flow states
>
> https://greatergood.berkeley.edu/topic/gratitude/definition — Research on gratitude practice
>
> https://www.calnewport.com/books/deep-work/ — Deep Work: Cal Newport on sustained focus
>
> https://github.com/openclaw/openclaw — OpenClaw repository
>
> https://github.com/nousresearch/hermes-agent — Hermes repository
>
> https://hermes-agent.nousresearch.com/docs/ — Hermes documentation
>
> https://obsidian.md/plugins — Obsidian plugin ecosystem

_This article was generated with AI for the purpose of providing practical information. I have reviewed it and edited it appropriately._
