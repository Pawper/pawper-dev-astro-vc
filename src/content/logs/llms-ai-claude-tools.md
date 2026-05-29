---
title: "All About AI & Using Claude"
devto: "https://dev.to/pawper/all-about-ai-using-claude-385e"
date: "2026.05.26"
kicker: "Tutorial"
tags: ["Claude", "Bash", "Terminal"]
image: "https://res.cloudinary.com/dr1sonbsi/image/upload/v1779833029/pawper.dev/logs/ChatGPT_Image_May_26_2026_03_03_32_PM_keam2k.png"
hook: "Large language models are reshaping what's possible in software development. Learn what they are, how they work, the tools available to you, and how to use them effectively. This is where agency meets capability."
series:
  name: "Foundations of Digital Agency"
  part: 8
  total: 9
mentor: true
---

AI tools are fundamentally changing what developers can build -- and who can be a developer.

Large Language Models (LLMs) and AI are no longer science fiction. They're tools in your hands, right now. But like any powerful tool, they require understanding: what they are, how to use them, and what their limitations are.

This isn't about becoming an AI expert. It's about understanding the landscape, recognizing the tools available to you, and learning to work with them effectively. By the end of this article, you'll understand LLMs, the Claude ecosystem, and how to start using these tools in your workflow.

---

## What is Machine Learning?

Machine Learning is the field where computers learn patterns from data instead of being explicitly programmed. Traditional programming means you write the rules; ML means you show the computer examples and it figures out the rules itself. Feed it enough temperature readings paired with AC on/off history and it learns when to predict the AC should run — no explicit `if temperature > 80` required. This matters because many useful patterns are too complex or too numerous for humans to write out by hand.

## What are Large Language Models?

A **Large Language Model (LLM)** is an AI trained on billions of words of text to predict and generate language. When you ask it a question, it doesn't look up an answer — it predicts, word by word, what text should come next based on patterns learned from everything it read. LLMs don't "understand" the way humans do, but the pattern recognition is sophisticated enough that the output often looks like they do.

## How Do LLMs Actually Work?
You don't need to understand the mathematics. But here's the conceptual flow:

1. **Training** — The model reads billions of words from the internet, books, code, etc.
2. **Pattern learning** — It learns statistical patterns about language (what words follow other words, how to structure responses, etc.)
3. **Your prompt** — You ask it a question
4. **Prediction** — The model predicts what text should come next, one word at a time
5. **Output** — Those predicted words form your answer

**Key concept: Tokens**

LLMs work with "tokens"—small pieces of text (usually a few characters). When you write a prompt, it's converted to tokens. When you use an LLM, you pay based on tokens (input tokens + output tokens).

**This matters because longer prompts cost more longer responses cost more.**

## A Brief History: How We Got Here
| Year | Milestone |
|------|-----------|
| 2012 | Deep learning emerges as a powerful ML technique |
| 2017 | Transformer architecture invented (the foundation for all modern LLMs) |
| 2018 | BERT and GPT-1 launched (early language models) |
| 2020 | GPT-3 (OpenAI) shocks the world with its capabilities |
| 2022 | ChatGPT launches, bringing AI to the mainstream |
| 2023 | Claude 1 (Anthropic), GPT-4, Gemini, and others compete |
| 2024–2026 | Frontier models become faster, cheaper, more capable |

The arc: models got bigger (more parameters, more training data) and better at following instructions. AI went from research novelty to practical tool.

## Frontier Models
"Frontier models" just means the newest, most capable ones — the cutting edge.

| Model | Who Makes It | Best For |
|---|---|---|
| **Claude Opus 4.7** | Anthropic | The writer and coder. Produces the most natural-sounding writing and is a favorite among software developers. |
| **GPT-5.5** | OpenAI (makers of ChatGPT) | The reliable all-rounder. Great default choice if you want one tool that does a bit of everything well. Has the biggest ecosystem of apps and add-ons. |
| **Gemini 3.1 Pro** | Google | The brainiac. Especially strong at science and logic questions, and works smoothly with Google apps like Docs and Gmail. |
| **Grok 4.3** | xAI (Elon Musk's company) | The deep thinker. Aimed at really hard, expert-level questions. |
| **DeepSeek V4** | DeepSeek (China) | The budget champion. Very cheap to use, which matters a lot for businesses. |
| **Kimi K2.6 / GLM-5.1 / Qwen 3.7** | Various (mostly China) | "Open" models you can download and run yourself. Increasingly competitive with the big closed ones. |

*Snapshot as of May 2026.*

> This field moves *fast* — new models launch almost every week, and today's leader can be overtaken in a month. Don't stress about always having the "best" one. Pick something that works for you, and know that they're all improving constantly.

## Open vs. closed
"Closed" models (like GPT-5.5) live on the company's servers — you rent access. "Open-weight" models can be downloaded and run on your own computer or servers.

## Business Models & Pricing
The frontier companies mostly earn money two ways: **monthly subscriptions** for everyday people, and **pay-as-you-go API access** for businesses building their own apps.

| Tier | Price | What you get |
|---|---|---|
| **Free** | $0 | Real access to a capable model, with daily/weekly limits. Fine for trying things out. |
| **Standard (Plus/Pro)** | ~$20/month | ChatGPT Plus, Claude Pro, and Google AI Pro all land at roughly $20 and unlock the flagship models plus higher limits. |
| **Premium / Max** | $100–$250/month | For heavy daily users and professionals — much higher usage and extra perks like video generation. |

## Cheaper/Free Alternatives

The $20/month flagship plans aren't your only option.
1. **Smaller models from the same companies.** Every big provider makes "mini" versions of their flagship — faster, cheaper, and still very capable for everyday tasks. Think Claude Haiku, GPT mini-tier, and Gemini Flash. They handle routine tasks at a tiny fraction of the flagship cost. For most casual use, these are plenty.
2. **Third-party "model hosting" providers.** These companies don't build their own models — they run open-source ones (Llama, Qwen, DeepSeek, and others) for you, usually much cheaper per use than the big labs.
  
  | Provider | Specialty | Best for |
  |---|---|---|
  | **Groq** | Speed | Ultra-fast inference |
  | **DeepInfra** | Cost | Cheapest rates |
  | **OpenRouter** | Flexibility | Switching between many models through one account |
  | **Nebius** | Privacy | Running inside Europe (data-privacy compliant) |
  | **Together.ai** | Open-source models | Building with Llama, Qwen, DeepSeek, and others |
  
3. **Local models — run AI on your own computer.** Free tools like Ollama and LM Studio let you download an open model (Llama, Gemma, Qwen, and similar) and run it entirely on your own machine. The upsides: it's free after setup, works offline, and nothing you type leaves your computer — great for privacy. The catches: you need a reasonably powerful computer, and these smaller local models aren't as sharp as the cloud-based frontier ones.

> **Rule of thumb:** Use a cheap "mini" model for everyday stuff, and only reach for an expensive flagship when a task is genuinely hard (tricky coding, deep reasoning, long documents).

## Coding Agents

| Coding Agent | Creator | Description |
|-------|---------|-------------|
| **Claude Code** | Anthropic | A developer favorite for real software work. |
| **Codex CLI** | OpenAI | OpenAI's command-line coding agent. |
| **GitHub Copilot** | GitHub/OpenAI | AI pair programmer integrated into VS Code. |
| **Cursor** | Anysphere | An AI-powered code editor (built on VS Code). |

## What Are Operator Agents?

An **Operator Agent** is an AI system that can autonomously perform tasks by:
1. Understanding a goal
2. Breaking it into steps
3. Taking actions (reading files, running code, making API calls)
4. Observing results
5. Adjusting and trying again

| Agent | Creator | Description |
|-------|---------|-------------|
| **OpenClaw** | Open-source | Operator agent for personal productivity and automation. Grew from a weekend prototype to GitHub's most-starred repository, with a big marketplace of community-made skills. |
| **Hermes Agent** | Nous Research | Learns your workflows over time. Markets itself as "the agent that grows with you" and recently surpassed OpenClaw as the most-used open-source agent by daily usage. |

---

## Basic Prompt Engineering

You don't need to be an expert. Four patterns cover most situations:
- **Be specific** — "Write a beginner-friendly explanation of Python lists with 2 code examples" beats "write something about Python." The model can't read your mind.
- **Provide context** — "I'm trying to read a CSV and count rows. Here's my code and the error I'm getting" gives the model something real to work with.
- **Ask for structure** — Tell it the sections or format you want. Structure forces clarity on both sides.
- **Use examples** — Paste in a sample of the style or output you're after. Examples communicate preferences better than descriptions of them.

## Risks and Guardrails

LLMs are powerful, but they have limitations and risks:

### Hallucinations

Models sometimes generates plausible-sounding but incorrect information. It might cite sources that don't exist or state facts that are wrong. **Always verify important information.**

### Outdated Information

A model's training data has a cutoff date. It doesn't know current events or recent changes. For up-to-date info, you need to provide context or use tools that can browse the web.

### Biases

LLMs learn from human-generated text, which contains biases. Models are generally trained to be helpful and harmless, but biases can still appear. Be aware of this, especially for sensitive decisions.

### Security & Privacy

- Don't share passwords, API keys, or sensitive credentials in prompts
- Don't assume your prompts are private (especially with free tiers)
- Treat conversations with LLMs as you would emails to a colleague

### Overreliance

An LLM is a tool, not a replacement for human judgment. For important decisions, use models to help think, not to make the decision.

---

## The Claude Ecosystem

Claude (the model) is made by Anthropic, a company focused on building safe, reliable AI. When you use Claude, you're accessing their LLMs through various interfaces. I choose to start folks off with Claude because it's great for development -- and agency is about building your own tools.

### Claude's Interfaces

Claude is available through different tools, and you'll choose based on your use case:

| Tool | What It Is | Best For | Plan |
|---|---|---|---|
| **Claude.ai** (Web) | Chat interface in the browser — the classic way to use Claude | Writing, research, analysis, brainstorming, everyday Q&A | Free (with limits) |
| **Claude Desktop** (Mac/Windows) | Standalone app — same chat as web, plus houses Cowork mode | Same as web chat, but on your computer. Required for Cowork. | Free (with limits) |
| **Claude Cowork** | Agentic mode inside Desktop — reads, writes, and organizes files on your computer | Mixed work, not necessarily coding, but it can start coding sessions. Supports Dispatch (control from phone). | Pro (with limits), Max recommended for daily use |
| **Claude Code** (Terminal CLI) | Command-line coding agent in your terminal | Software engineering: writing, refactoring, debugging across multi-file codebases | Pro (with limits), Max recommended for daily use |
| **Claude Code VS Code** | Native IDE extension — Claude Code inside your editor | Same coding tasks as CLI, but in a visual editor instead of raw terminal | Pro (with limits), Max recommended for daily use |
| **Claude Design** | AI-powered visual canvas inside claude.ai — describe what you want, get interactive prototypes | Prototypes, pitch decks, slides, one-pagers, UI mockups. Codebase-aware design systems. Hands off directly to Claude Code. | Pro (with limits) |
| **Claude in Chrome** (Beta) | Browser extension — Claude can see, click, navigate, and fill forms in Chrome | Automating repetitive browser tasks: data extraction, form filling, multi-site research. Pairs with Cowork. | Pro (Haiku only); Max (all models) |
| **Anthropic API** | Pay-per-token developer API — build Claude into your own apps | Developers embedding Claude in products, automating pipelines, running batch jobs. Full control, no UI. | Haiku ~$0.80/$4 per 1M tokens, Sonnet $3/$15, Opus $15/$75. No monthly minimum. |

---

## Understanding Claude Code (CLI)

**Claude Code** is a command-line interface that lets you use Claude directly from your terminal. It's designed for developers—Claude can read your code, suggest improvements, and even write and run code for you.

---

## Setting Up and Using Claude Code

Now let's get hands-on. Claude Code is a command-line tool that brings Claude into your terminal.

### Prerequisites

- Node.js 18+ installed (you learned about this in the NPM article)
- A paid Claude subscription. Sign up for Claude Pro ($20/mo) or Max ($100–$200/mo) at claude.ai. The free tier doesn't include Claude Code.

### Installtion
```bash
npm install -g @anthropic-ai/claude-code
```

### Launch
```bash
cd /path/to/your/project
claude
```

Now you can start conversing with Claude and working on files.

> On first launch you'll be prompted to authenticate in your browser. Choose the "Claude App" option and sign in with your Claude.ai account. Your credentials get stored — you only do this once.

### Help
Remember you can enter:
```bash
claude --help
```

You should see usage instructions. If you get "command not found," restart your terminal or check that npm installed it correctly.

### Your First Claude Code Command

Create a simple project:

```bash
mkdir my-claude-project
cd my-claude-project
```

Ask Claude Code to create a file:

```bash
claude "Create a file called hello.txt with the text 'Hello, Claude!'"
```

Claude will:
1. Understand your request
2. Suggest an approach
3. Execute it
4. Show you the result

Congratulations—you've just used an AI agent from the command line. From here you can use Claude to build, explain, and troubleshoot.

---

## Bringing Claude Code into VS Code

The terminal is powerful, but if you spend most of your day in a code editor, there's a more comfortable path: the **Claude Code VS Code extension**. It's the same Claude Code agent — same capabilities, same subscription — just surfaced inside your editor so you never have to leave it.

### Install

1. Open VS Code and press `Ctrl+Shift+X` (Windows/Linux) or `Cmd+Shift+X` (Mac) to open the Extensions panel.
2. Search **Claude Code** and look for the one published by **Anthropic**.
3. Click **Install**.
4. Once installed, a Claude icon appears in the Activity Bar on the left.

> On first launch you'll be prompted to sign in. Use the same Claude.ai account (or API key) you set up for the CLI — no separate subscription needed.

### What You're Working With

Click the Claude icon in the top right to open the chat panel. You'll see the same conversational interface as the CLI, but now it lives alongside your editor. A few things are immediately different:

- **File and symbol references** — Type `@` to reference any file or function in your workspace directly in the chat. Claude reads it without you having to paste code.
- **Inline diffs** — When Claude suggests a code change, it shows a diff view right in the editor. You can accept, reject, or edit the suggestion before it touches your files.
- **Slash commands** — Type `/` in the chat to see available commands: `/clear` to reset context, `/review` to kick off a code review, `/help` for a full list.

> **Tip:** If you installed Claude Code via `npm install -g` already, the extension picks up your existing authentication automatically — you won't be asked to sign in again.

---

## Cowork + Dispatch: Claude Working on Your Machine Remotely

Claude Code is for developers at their desk. *Cowork extends that to everything else on your computer — and Dispatch lets you trigger any of it from your phone.

### What Cowork Is

Cowork is Claude's agentic mode inside Claude Desktop (the Mac/Windows app). You describe a task in plain English, and Cowork works through it step by step, reading and writing files on your actual computer.

**What it can do:**
- Reorganize and rename files across folders
- Chain together multi-step tasks ("take these CSVs, merge them, summarize by category, write the results to a new file")
- Spin up Claude Code sub-agent sessions — Cowork can open Claude Code directly and run full coding tasks on your behalf, including installing packages, editing files, and running terminal commands

That last point is worth pausing on. Cowork isn't just a layer above file management — it's an abstraction over Claude Code itself. When a task involves writing or running code, Cowork delegates to a Claude Code sub-agent to handle it. You give the high-level instruction; it figures out what to invoke underneath.

**What it can't do:** browse the web or interact with other apps unless you've connected tools via MCP (more on that in a later article).

### Enabling Cowork

1. Download and install Claude Desktop from [claude.ai/download](https://claude.ai/download) if you haven't already.
2. Open Claude Desktop and look for the Cowork tab or agent mode toggle in the top bar.
3. Grant Claude access to the folders you want it to work in — it will prompt for file system permissions the first time.

> Cowork is included with Pro ($20/mo), but long autonomous tasks — especially ones that spin up Claude Code sessions underneath — burn tokens 50–100× faster than chat. Max ($100/mo+) becomes realistic for daily use.

### What Dispatch Is

Dispatch is how you send tasks to Cowork when you're not at your computer.

It works through the Claude mobile app (iOS and Android). Once your Desktop is running Cowork in the background, Dispatch lets you fire off instructions from your phone — and Claude works through them on your machine while you're away.

The practical use: you're out, you think of something, you send it. When you sit back down, it's done.

### Setting Up Dispatch

1. Make sure Claude Desktop is installed and signed in.
2. Install the Claude app on your phone from the App Store or Google Play.
3. Sign in with the same account.
4. In Claude Desktop settings, enable Dispatch (under the Cowork section).
5. Your Desktop appears as a connected device in the mobile app.

Once connected, open the mobile app, select your desktop from the Dispatch panel, and send a task. 

> *"Build out the web page we talked about. Run the dev server when you're done."*

Claude handles it. You get a notification when it's done.

### Testing Web Projects Remotely with Tunnels

Here's where it gets genuinely powerful for developers: when Cowork spins up a Claude Code session and runs your dev server, your local project is running on `localhost` — which your phone can't see. **Tunnels** solve this.

A tunnel creates a temporary public URL that forwards traffic to your local machine. Two common options:

**Cloudflare Tunnel (cloudflared)**
Cloudflare gives you a public `https://xxxxx.trycloudflare.com` URL instantly. No account required for temporary tunnels.

**ngrok**
ngrok gives you a `https://xxxx.ngrok-free.app` URL. Free tier requires signing up; paid tiers give you stable subdomains.

**The workflow:**
1. Dispatch a task — "Start the dev server for my portfolio project."
2. Cowork spins up Claude Code, navigates to your project, and runs `npm run dev`.
3. You (or Cowork) open a tunnel to expose the local port.
4. You get a public URL — open it on your phone to review your running project, share it with someone for feedback, or let Claude test it against a real URL.

This is useful when you want to check in on a project mid-day from your phone, share a work-in-progress with a collaborator without deploying, or let an external service (a webhook, an OAuth callback, an API test) hit your local server.

> **Tip:** Tunnels are temporary and public — don't leave them open longer than you need them. For serious shared testing, a staging deploy is the right answer. Tunnels are for "show someone this right now" situations.

### When This All Matters

The combination of Cowork + Dispatch + tunnels means your computer can be an active workspace even when you're not at it. You don't have to be present to run Claude Code — you send a task, Claude works through it (including writing code, running servers, and spinning up sub-agents as needed), and you review from wherever you are.

> **Tip:** Start with small, well-scoped tasks before sending anything big. Build confidence in what Cowork will and won't do before running it unsupervised on important directories or production-adjacent projects.

## Using Claude with Agents like OpenClaw

Everything so far has been Claude responding to you — you prompt, it answers, you prompt again. Agents like OpenClaw are the next step: software that runs continuously, calls an LLM when it needs to think, and keeps working without you in the loop.

The difference matters. With Claude Code or Cowork, you're still present for most steps. With an agent like OpenClaw, you configure it once — what it can do, which model to use, what tasks to run — and then it operates on its own, responding to events, chaining together long workflows, and calling Claude only when reasoning is actually needed. OpenClaw works with any API-compatible model — Claude, GPT, Gemini, local models, whatever suits the task. The model is just a tool the agent reaches for.

This is also where the idea of a controlled environment becomes important. Running an autonomous agent on your main computer means every permission it has is one it could misuse — accidentally or not. A better approach is to run the agent inside Docker: an isolated container with only the access you explicitly give it, completely separate from your main system. No permissions to micromanage across your real environment. If something goes wrong, you reset the container. Nothing bleeds out.

The next article in this series walks through exactly that setup — connecting Claude with OpenClaw in a Docker container. For now, here's what you need to know about authenticating Claude for third-party agents like OpenClaw:

> Starting June 15, 2026 Claude subscribers will get a separate monthly "Agent SDK credit" for third-party tools like OpenClaw. The official page is here: https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan
> 
> For a beginner on a Pro plan who just wants to try OpenClaw with Claude right now:
> 
> **If you're before June 15, 2026** — the Agent SDK credit hasn't kicked in yet. Your options today are to set up a pay-as-you-go API key at [console.anthropic.com](https://console.anthropic.com). You load a small amount of credit (even $5 is enough to experiment), generate an API key, and plug that into OpenClaw's settings. You only pay for what you use — no commitment, no second subscription.
> 
> **Once June 15 hits** — you can opt in to the $20/month Agent SDK credit from your Claude account, and OpenClaw will be able to authenticate through your subscription again. That $20 covers light use. If you burn through it mid-month, OpenClaw stops working until your next billing cycle (unless you enable overage billing, which charges API rates).

**Practical advice for beginners:**
If you're brand new and just want to see what you can do with Claude, the first step is to try Claude Code — it's already included with your Pro plan, no extra setup. Then Dispatch gives you a feel for remotely-connected agentic Claude. Claude Code will be great for a lot of uses cases, such as building websites -- especially with Dispatch. The diffrence with OpenClaw is that it can be customized in powerful ways to serve you and and your goals.

---

> **Sources / additional material:**
>
> https://console.anthropic.com — Claude API Console
>
> https://claude.ai — Claude web interface
>
> https://code.claude.com — Claude Code documentation
>
> https://www.anthropic.com/research — Anthropic's research on AI safety
>
> https://openai.com/index/gpt-4/ — GPT-4 information
>
> https://ai.google.dev/ — Google's AI tools

_This article was generated with AI for the purpose of providing practical information. I have reviewed it and edited it appropriately._
