---
title: "All About AI & Using LLM Tools"
devto: "https://dev.to/pawper/all-about-ai-using-claude-385e"
date: "2026.05.26"
kicker: "Tutorial"
tags: ["Claude", "ChatGPT", "Gemini", "Terminal", "ngrok", "OpenClaw", "Hermes", "Ollama"]
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

The arc: models got bigger (more parameters, more training data) and better at following instructions.

## Frontier Models
"Frontier models" just means the newest, most capable ones — the cutting edge.

| Model | Who Makes It | Best For |
|---|---|---|
| **Claude Opus 4.8** | Anthropic | The writer and coder. Produces the most natural-sounding writing and is a favorite among software developers. |
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

## Choose an Ecosystem

I focus on Claude in this series because it's excellent for development — and agency is about building your own tools. That said, Claude, ChatGPT, and Gemini all have comparable ecosystems. Here's how they map to each other:

:::tabs
::tab[Claude]
Claude is made by **Anthropic**, a company focused on building safe, reliable AI. When you use Claude, you're accessing their LLMs through various interfaces.

| Tool | What It Is | Best For | Plan |
|---|---|---|---|
| **Claude.ai** (Web) | Chat interface in the browser | Writing, research, analysis, brainstorming, everyday Q&A | Free (with limits) |
| **Claude Desktop** (Mac/Windows) | Standalone app — same chat as web, plus houses Cowork mode | Same as web chat, but on your computer. Required for Cowork. | Free (with limits) |
| **Claude Cowork** | Agentic mode inside Desktop — reads, writes, and organizes files on your computer | Mixed work and coding sessions. Supports Dispatch (trigger from phone). | Pro (with limits), Max recommended for daily use |
| **Claude Code** (Terminal CLI) | Command-line coding agent in your terminal | Software engineering: writing, refactoring, debugging across multi-file codebases | Pro (with limits), Max recommended for daily use |
| **Claude Code VS Code** | Native IDE extension — Claude Code inside your editor | Same coding tasks as CLI, but in a visual editor instead of raw terminal | Pro (with limits), Max recommended for daily use |
| **Claude Design** | AI-powered visual canvas — describe what you want, get interactive prototypes | Prototypes, pitch decks, slides, one-pagers, UI mockups. Hands off directly to Claude Code. | Pro (with limits) |
| **Claude in Chrome** (Beta) | Browser extension — Claude can see, click, navigate, and fill forms in Chrome | Browser automation: data extraction, form filling, multi-site research. Pairs with Cowork. | Pro (Haiku only); Max (all models) |
| **Anthropic API** | Pay-per-token developer API — build Claude into your own apps | Embedding Claude in products, automating pipelines, batch jobs. Full control, no UI. | Haiku ~$0.80/$4 per 1M tokens, Sonnet $3/$15, Opus $15/$75. No monthly minimum. |

::tab[ChatGPT]
ChatGPT is made by **OpenAI**, the company that brought AI to mainstream attention in 2022. Their ecosystem has the widest user base and the most third-party integrations.

| Tool | What It Is | Best For | Plan |
|---|---|---|---|
| **ChatGPT** (Web) | Chat interface in the browser | Writing, research, analysis, everyday Q&A | Free (with limits) |
| **ChatGPT Desktop** (Mac/Windows) | Standalone app with screenshot and desktop context awareness | Same as web, plus screenshot context and desktop integration | Plus/Pro |
| **ChatGPT Agent Mode** | Agentic mode integrated into ChatGPT — browses the web and operates your computer | Multi-step research, browser tasks, file operations | Plus/Pro (Enterprise for full access) |
| **ChatGPT Atlas** | Dedicated browser with Agent Mode built in | Fully autonomous browser-based tasks without switching apps | Pro/Enterprise |
| **Codex CLI** | Terminal coding agent | Software engineering: multi-file edits, running commands, debugging | Plus/Pro |
| **Codex VS Code Extension** | IDE extension — Codex inside your editor | In-editor coding tasks, same as CLI but with a visual interface | Plus/Pro |
| **ChatGPT Canvas** | Interactive code and document editor with live preview | Writing, coding with instant previews, lightweight prototyping | Plus/Pro |
| **ChatGPT Operator** | Computer-Using Agent — browses the web autonomously on your behalf | Browser automation: booking, form filling, web-based workflows | Pro/Enterprise |
| **OpenAI API** | Pay-per-token developer API — build GPT into your own apps | Embedding GPT in products, pipelines, and batch jobs. Full control, no UI. | GPT-5.5: $5/$30 per 1M tokens. Batch API: 50% cheaper. No monthly minimum. |

::tab[Gemini]
Gemini is made by **Google**. The ecosystem is maturing rapidly — the CLI and API are solid, while the desktop/IDE story is in active transition as of mid-2026.

| Tool | What It Is | Best For | Plan |
|---|---|---|---|
| **Gemini** (Web) | Chat interface at gemini.google.com | Writing, research, analysis, everyday Q&A | Free (with limits) |
| **Gemini Advanced** | Premium chat via Google One AI Premium | More capable models, extended context | ~$20/mo (Google One AI Premium) |
| **Gemini in Workspace** | Integrated into Google Docs, Gmail, Drive, Meet | Drafting, summarizing, editing within Google apps | Workspace Business/Enterprise |
| **Antigravity CLI** *(replaces Gemini CLI — June 18, 2026)* | Terminal coding agent built on the Antigravity platform | Software engineering: multi-file edits, running commands, debugging | Free tier available; API key for higher usage |
| **Antigravity** *(new — May 2026)* | Multi-agent desktop platform replacing Gemini Code Assist | Complex multi-agent workflows, agent orchestration | Varies — very new, expect rough edges |
| **Google AI Studio** | Free API playground and prototyping tool | Experimenting with Gemini models, quick prototypes | Free |
| **Gemini API** | Pay-per-token developer API — build Gemini into your own apps | Embedding Gemini in products, pipelines. Full control, no UI. | Flash: ~$0.15/$0.60; Pro: $1.25/$10 per 1M tokens |

> **Note on Gemini Code Assist:** Google's VS Code extension (Gemini Code Assist) is being phased out as of June 18, 2026, replaced by Antigravity. If you installed it before that date, expect a migration prompt.

::tab[Open]
No single company. **OpenRouter** is a unified API that routes to 300+ models from every major lab — Anthropic, OpenAI, Google, Meta, Mistral, and more — through one key and one billing account. You choose the model; OpenRouter handles the rest.

| Tool | What It Is | Best For | Cost |
|---|---|---|---|
| **OpenRouter** | Unified API gateway — one key for 300+ models | Switching providers freely, accessing open-weight models at low cost | Pay-per-token. Some models free. DeepSeek-V4: ~$1.74/$3.48 per 1M. |
| **Aider** | Open-source terminal coding agent, Git-native | Multi-file edits, automated commits, debugging — works with any OpenRouter model | Free (open-source). Pay only for model tokens. |
| **Continue** | Open-source VS Code extension | In-editor coding tasks with any model via OpenRouter backend | Free (open-source). Pay only for model tokens. |
| **DeepSeek-V4-Pro** | Top open coding model (MIT license, 80.6% SWE-Bench) | Coding at a fraction of frontier cost | ~$1.74/$3.48 per 1M tokens via OpenRouter |
| **Llama 4 / Qwen3 / Mistral** | Other strong open-weight models | Various tasks, lighter variants available | Free to ~$2/1M tokens via OpenRouter |

The open path won't match frontier model performance in every case, but it's close — and you own the whole stack.

::tab[Local]
Run models entirely on your own hardware. No internet required for inference, no per-token cost, completely private. The main tool is **Ollama**.

> **Hardware requirement:** 16GB RAM minimum for lighter models, 24GB+ for models that perform well on real coding tasks. If your machine doesn't have that, the Open (OpenRouter) path is the better choice.

| Tool | What It Is | Best For | Cost |
|---|---|---|---|
| **Ollama** | Local model runner — download and run open models on your machine | Running AI completely offline and privately | Free. Hardware is the only cost. |
| **Aider** | Open-source terminal coding agent | Multi-file edits and debugging — pointed at local Ollama endpoint | Free (open-source). |
| **Continue** | Open-source VS Code extension | In-editor coding tasks with local Ollama backend | Free (open-source). |
| **Qwen3 14B** | Solid coding model, runs on 16GB RAM | Good everyday performance without a high-end GPU | Free |
| **DeepSeek Coder 33B** | Stronger coding model, needs 24GB RAM | Higher-quality output for complex tasks | Free |
:::

---

## The Terminal Coding Agent

A terminal coding agent is a CLI tool that brings AI directly into your workflow — it reads your codebase, understands context across files, and can write, edit, and run code on your behalf. You work with it conversationally from your terminal.

:::tabs
::tab[Claude]
**Claude Code** is Anthropic's terminal coding agent. It's deeply integrated with Claude's models and is a developer favorite for real software work — especially multi-file refactoring, debugging, and building from scratch.

It runs as an interactive session or accepts single commands inline, and has strong support for large codebases through its context compression.

::tab[ChatGPT]
**Codex CLI** is OpenAI's terminal coding agent. It supports multiple models (including GPT-5.4 and the Codex-specialized variants) and reasoning levels you can dial up for harder problems.

Like Claude Code, it runs interactively or inline, reads your codebase, and can propose multi-file changes, run commands, and debug errors.

::tab[Gemini]
**Antigravity CLI** is Google's terminal coding agent, replacing Gemini CLI as of June 18, 2026. It's built on the same Antigravity platform as the desktop app and brings multi-agent capabilities to the terminal.

Like Claude Code and Codex, it runs interactively in your terminal, reads your codebase, and can write, edit, and run code across multiple files.

::tab[Open]
**Aider** is the leading open-source terminal coding agent. It's Git-native (automatically commits changes as it works), supports multi-file edits, and points directly at OpenRouter with a single flag — no lock-in to any one model or provider.

```bash
aider --model openrouter/deepseek/deepseek-v4-0324
```

Switch models by changing the flag. No migration, no new account.

::tab[Local]
**Aider** also works with a local Ollama endpoint — same tool, same commands, no internet required for inference.

```bash
aider --model ollama/qwen3:14b
```

Pull a model first with `ollama pull qwen3:14b`. Performance depends on your hardware and the model you can fit in RAM.
:::

---

## Setting Up Your Coding Agent

:::tabs
::tab[Claude]
### Prerequisites

- Node.js 18+ installed (covered in the NPM article)
- A paid Claude subscription — Pro ($20/mo) or Max ($100–$200/mo) at claude.ai. The free tier doesn't include Claude Code.

### Install
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
```bash
claude --help
```

If you get "command not found," restart your terminal or check that npm installed it correctly.

### Your First Command

```bash
mkdir my-project && cd my-project
claude "Create a file called hello.txt with the text 'Hello, Claude!'"
```

Claude suggests an approach, executes it, and shows you the result. From here you can use it to build, explain, and troubleshoot.

::tab[ChatGPT]
### Prerequisites

- Node.js 18+ installed (covered in the NPM article)
- A ChatGPT Plus or Pro subscription, or an OpenAI API key with credits loaded at [platform.openai.com](https://platform.openai.com).

### Install
```bash
npm install -g @openai/codex
```

### Set Your API Key
```bash
export OPENAI_API_KEY=your-key-here
```

Add this to your `~/.bashrc` or `~/.zshrc` to persist it across sessions.

### Launch
```bash
cd /path/to/your/project
codex
```

Or send a single command inline:
```bash
codex "Create a file called hello.txt with the text 'Hello, Codex!'"
```

### Help
```bash
codex --help
```

You can also pass `--model` to switch between GPT-5.4, GPT-5.4-codex, or other available models, and `--reasoning` to increase effort on harder problems.

::tab[Gemini]
> **Note:** Gemini CLI was discontinued June 18, 2026 and replaced by **Antigravity CLI**. If you installed Gemini CLI before that date, migrate by following Google's guide at [antigravity.google.com](https://antigravity.google.com).

### Prerequisites

- A Google account. Sign in to authenticate — for higher usage, get a free API key at [aistudio.google.com](https://aistudio.google.com).

### Install

Follow the current install instructions at [antigravity.google.com](https://antigravity.google.com) — the CLI is distributed as a Go binary and the install method may vary by platform.

### Set Your API Key (if not using free tier)
```bash
export ANTIGRAVITY_API_KEY=your-key-here
```

Add this to your `~/.bashrc` or `~/.zshrc` to persist it. The free tier prompts you to sign in with Google instead.

### Launch
```bash
cd /path/to/your/project
antigravity
```

### Help
```bash
antigravity --help
```

::tab[Open]
### Prerequisites

- Python 3.8+ installed
- An OpenRouter account and API key — sign up free at [openrouter.ai](https://openrouter.ai). Add $5–10 credit to start.

### Install Aider
```bash
pip install aider-chat
```

### Set Your API Key
```bash
export OPENROUTER_API_KEY=your-key-here
```

Add this to your `~/.bashrc` or `~/.zshrc` to persist it.

### Launch
```bash
cd /path/to/your/project
aider --model openrouter/deepseek/deepseek-v4-0324
```

### Your First Command

Aider opens an interactive session. Type your request:
```
> Create a file called hello.txt with the text 'Hello, open stack!'
```

Aider proposes the change, you confirm, and it commits it to Git automatically.

### Switch Models Anytime
```bash
aider --model openrouter/meta-llama/llama-4-maverick
aider --model openrouter/mistralai/mistral-large-2
```

Full model list at [openrouter.ai/models](https://openrouter.ai/models).

::tab[Local]
### Prerequisites

- Python 3.8+ installed
- Ollama installed: [ollama.com/download](https://ollama.com/download)
- **At least 16GB RAM** (24GB+ recommended for stronger models)

### Pull a Model
```bash
ollama pull qwen3:14b
```

Or for stronger output if you have 24GB+ RAM:
```bash
ollama pull deepseek-coder:33b
```

Ollama downloads and runs the model locally. No API key, no account.

### Install Aider
```bash
pip install aider-chat
```

### Launch
```bash
cd /path/to/your/project
aider --model ollama/qwen3:14b
```

### Your First Command

```
> Create a file called hello.txt with the text 'Hello, local stack!'
```

Everything runs on your machine. No data leaves your computer.

### Help
```bash
aider --help
```
:::

---

## Coding Agents in VS Code

The terminal is powerful, but if you spend most of your day in an editor, there's a more comfortable path: a native VS Code extension that surfaces the same coding agent inside your editor with extra affordances.

::::tabs
::tab[Claude]
### Install

:::tabs
::tab[macOS]
Press <kbd>⌘</kbd>+<kbd>Shift</kbd>+<kbd>X</kbd> to open the Extensions panel.

::tab[Windows]
Press <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>X</kbd> to open the Extensions panel.

::tab[Linux]
Press <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>X</kbd> to open the Extensions panel.
:::

Search **Claude Code** — look for the one published by **Anthropic**. Click **Install**. A Claude icon appears in the top right of the editor.

> On first launch you'll be prompted to sign in.

### What You're Working With

- **File and symbol references** — Type `@` to reference any file or function in your workspace. Claude reads it without you pasting code.
- **Inline diffs** — Code suggestions appear as diffs you can accept, reject, or edit before they touch your files.
- **Slash commands** — Type `/` to see available commands: `/clear`, `/review`, `/help`, and more.
- **Usage monitoring** — Track context compression and token usage in the panel.
- **Drag and drop files** into the chat.

::tab[ChatGPT]
### Install

:::tabs
::tab[macOS]
Press <kbd>⌘</kbd>+<kbd>Shift</kbd>+<kbd>X</kbd> to open the Extensions panel.

::tab[Windows]
Press <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>X</kbd> to open the Extensions panel.

::tab[Linux]
Press <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>X</kbd> to open the Extensions panel.
:::

Search **Codex** — look for the extension published by **OpenAI**. Click **Install**. A Codex icon appears in the sidebar.

> On first launch you'll be prompted to sign in with your OpenAI account.

### What You're Working With

- **File and symbol references** — Type `@` to pull in files or functions from your workspace directly in the chat.
- **Inline diffs** — Codex shows proposed changes as diffs with accept/reject controls.
- **Model selector** — Switch between GPT-5.4, Codex-specialized variants, and reasoning levels from within the panel.
- **Slash commands** — `/clear`, `/explain`, `/fix`, and others available via `/`.

::tab[Gemini]
> **Note:** Google's VS Code extension story is in transition as of mid-2026. **Gemini Code Assist** is being phased out (June 18, 2026) and replaced by **Antigravity**. Install Antigravity — it's what Google is actively developing.

### Install

:::tabs
::tab[macOS]
Press <kbd>⌘</kbd>+<kbd>Shift</kbd>+<kbd>X</kbd> to open the Extensions panel.

::tab[Windows]
Press <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>X</kbd> to open the Extensions panel.

::tab[Linux]
Press <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>X</kbd> to open the Extensions panel.
:::

Search **Antigravity** — look for the extension published by **Google**. Click **Install**.

> On first launch you'll be prompted to sign in with your Google account. Antigravity launched in May 2026 — expect the experience to improve as it matures.

### What You're Working With

- **File and symbol references** — Type `@` to reference files or functions from your workspace.
- **Inline diffs** — Suggestions appear as diffs with accept/reject controls.
- **Multi-agent mode** — Antigravity can spin up specialized sub-agents for different parts of a task.
- **Model selector** — Switch between Gemini models within the panel.

::tab[Open]
**Continue** is an open-source VS Code extension that works with any OpenRouter model.

### Install

:::tabs
::tab[macOS]
Press <kbd>⌘</kbd>+<kbd>Shift</kbd>+<kbd>X</kbd> to open the Extensions panel.

::tab[Windows]
Press <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>X</kbd> to open the Extensions panel.

::tab[Linux]
Press <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>X</kbd> to open the Extensions panel.
:::

Search **Continue** and install it. Then open the config file and add OpenRouter as your provider:

:::tabs
::tab[macOS]
```bash
code ~/.continue/config.json
```

::tab[Windows]
In your WSL terminal:
```bash
code ~/.continue/config.json
```

::tab[Linux]
```bash
code ~/.continue/config.json
```
:::

```json
{
  "models": [{
    "title": "DeepSeek V4",
    "provider": "openrouter",
    "model": "deepseek/deepseek-v4-0324",
    "apiKey": "your-openrouter-key"
  }]
}
```

Swap the model name for any model on OpenRouter. The rest of the experience — inline diffs, `@` file references, slash commands — works the same as the closed extensions.

::tab[Local]
**Continue** also works with a local Ollama backend — fully offline, no API key.

### Install

:::tabs
::tab[macOS]
Press <kbd>⌘</kbd>+<kbd>Shift</kbd>+<kbd>X</kbd> to open the Extensions panel.

::tab[Windows]
Press <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>X</kbd> to open the Extensions panel.

::tab[Linux]
Press <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>X</kbd> to open the Extensions panel.
:::

Search **Continue** and install it. Then open the config file and point it at Ollama:

:::tabs
::tab[macOS]
```bash
code ~/.continue/config.json
```

::tab[Windows]
In your WSL terminal:
```bash
code ~/.continue/config.json
```

::tab[Linux]
```bash
code ~/.continue/config.json
```
:::

```json
{
  "models": [{
    "title": "Qwen3 14B (Local)",
    "provider": "ollama",
    "model": "qwen3:14b"
  }]
}
```

Make sure Ollama is running (`ollama serve`) before opening VS Code. Continue will connect to the local endpoint automatically.
::::

---

## Agentic Desktop Mode: Working on Your Machine Autonomously

Beyond the coding agent, all three ecosystems offer a higher-level agentic mode: you describe a task in plain English, and the agent works through it step by step — reading and writing files, running terminal commands, and spinning up sub-agents as needed.

:::tabs
::tab[Claude]
### What Cowork Is

**Cowork** is Claude's agentic mode inside Claude Desktop. When a task involves writing or running code, Cowork delegates to a Claude Code sub-agent underneath — you give the high-level instruction, it figures out what to invoke.

**What it can't do:** browse the web or interact with other apps unless you've connected tools via MCP (covered in a later article).

### Enabling Cowork

1. Download Claude Desktop from [claude.ai/download](https://claude.ai/download)
2. Open it and look for the Cowork tab or agent mode toggle in the top bar
3. Grant Claude access to the folders you want it to work in — it prompts for permissions the first time

> Cowork is included with Pro ($20/mo), but long autonomous tasks burn tokens 50–100× faster than chat. Max ($100/mo+) becomes realistic for daily use.

### Triggering Remotely with Dispatch

**Dispatch** lets you send tasks to Cowork from your phone.

1. Install the Claude app on your phone (iOS / Android)
2. Sign in with the same account as Desktop
3. In Claude Desktop settings, enable Dispatch under the Cowork section
4. Your Desktop appears as a connected device in the mobile app

Send a task from anywhere:

> *"Build out the web page we talked about. Run the dev server when you're done."*

Claude works through it and notifies you when it's done.

::tab[ChatGPT]
### What Agent Mode Is

**Agent Mode** is ChatGPT's built-in agentic mode — available in the ChatGPT web app and Desktop. Unlike Cowork, Agent Mode can browse the web natively without any additional setup.

For fully autonomous browser-based tasks, **ChatGPT Atlas** is a dedicated browser app with Agent Mode built in — you give it a goal and it executes without you switching context.

**What it can do:** browse the web, interact with your computer (Computer-Using Agent), run code, and handle multi-step workflows.

### Enabling Agent Mode

1. Open ChatGPT (web or Desktop app)
2. Look for the "Agent" toggle or the agent mode selector in the chat interface
3. Grant computer access permissions when prompted for desktop interaction tasks

> Agent Mode is available on Plus ($20/mo) with some limits. Full Computer-Using Agent access requires Pro ($200/mo) or an Enterprise plan.

### Triggering Remotely

Use the **ChatGPT mobile app** (iOS / Android) to send tasks to an active Agent Mode or Atlas session on your desktop. Sign in with the same account — your Desktop session appears as a connected target in the app.

::tab[Gemini]
### What Antigravity Is

> **Antigravity launched in May 2026 and is very new.** Expect rough edges compared to the more mature Cowork and Agent Mode experiences.

**Antigravity** is Google's new multi-agent desktop platform. Where Cowork and Agent Mode give you one agent doing one task, Antigravity is designed to orchestrate multiple specialized agents working in parallel — each handling a different part of a larger goal.

**What it can do:** read and write files, run terminal commands, spin up sub-agents, and interact with Google Workspace apps. Web browsing is available via Gemini's native web grounding.

### Enabling Antigravity

1. Download Antigravity from [antigravity.google.com](https://antigravity.google.com)
2. Sign in with your Google account
3. Grant access to the folders and tools you want it to work with

> Available on Google One AI Premium (~$20/mo). Managed serverless execution for longer tasks requires additional API credits.

### Triggering Remotely

As of mid-2026, **Antigravity does not have a dedicated phone dispatch feature** comparable to Claude's Dispatch or the ChatGPT mobile connection. You can initiate tasks from the Gemini mobile app in some configurations, but it's not a seamless one-tap dispatch yet.

::tab[Open]
There's no polished open-source equivalent to Cowork or Agent Mode yet. The closest path is **OpenClaw or Hermes configured with an OpenRouter key** — those are always-running operator agents (covered in the next section) that use your choice of model via OpenRouter.

For agentic desktop tasks specifically, the frontier tools (Claude Cowork, ChatGPT Agent Mode) are ahead. The open path shines more for coding sessions and continuous agent workflows than for natural-language "do this on my computer" interactions.

::tab[Local]
No local equivalent to agentic desktop mode exists at this stage. The models capable of autonomous multi-step reasoning on a local machine require significant hardware, and the tooling for local desktop agents is still early.

The **OpenClaw and Hermes operator agents** can be configured to use local Ollama models — that's the closest analogue, and it's covered in the next section.
:::

### Testing Web Projects Remotely with Tunnels

Here's where it gets genuinely powerful: when Cowork, Agent Mode, or Antigravity runs your dev server, your local project is on `localhost` — which your phone can't reach. A tunnel creates a temporary public URL that forwards traffic to your local machine. Two common options:

1. **Cloudflare Tunnel (cloudflared)** — No account needed for temporary tunnels. Instantly gives you a `https://xxxxx.trycloudflare.com` URL. Tell your agent:
  ```wrap
  Start the dev server, then run cloudflared to create an ad-hoc tunnel. If this is a Vite-based project, add the tunnel URL to the allowedHosts array in your Vite config and restart the dev server. Give me the final URL.
  ```

2. **ngrok** — Free tier requires an account; paid tiers give stable subdomains. You get a `https://xxxx.ngrok-free.app` URL. Tell your agent:
  ```wrap
  Start the dev server, then run ngrok pointed at the same port. If this is a Vite-based project, add the tunnel URL to the allowedHosts array in your Vite config and restart the dev server. Give me the final URL.
  ```

This is useful when you want to check in on a project mid-day from your phone, share a work-in-progress with a collaborator without deploying, or let an external service (a webhook, an OAuth callback, an API test) hit your local server.

> **Tip:** Tunnels are temporary and public — don't leave them open longer than you need them. For serious shared testing, a staging deploy is the right answer. Tunnels are for "show someone this right now" situations.

### When This All Matters

:::tabs
::tab[Claude]
The combination of Cowork + Dispatch + tunnels means your computer can be an active workspace even when you're not at it. You don't have to be present to run Claude Code — you send a task, Claude works through it (writing code, running servers, spinning up sub-agents), and you review from wherever you are.

> **Tip:** Start with small, well-scoped tasks before sending anything big. Build confidence in what Cowork will and won't do before running it unsupervised on important directories or production-adjacent projects.

::tab[ChatGPT]
The combination of Agent Mode + the ChatGPT mobile app + tunnels means your computer can be an active workspace even when you're not at it. You don't have to be present — you send a task, Agent Mode works through it (writing code, running servers, browsing the web if needed), and you review from wherever you are.

> **Tip:** Start with small, well-scoped tasks before sending anything big. Build confidence in what Agent Mode will and won't do before running it unsupervised on important directories or production-adjacent projects.

::tab[Gemini]
Antigravity + tunnels means your machine can run multi-agent workflows while you're away — though without a phone dispatch feature yet, you'll initiate tasks from your desktop before stepping away.

> **Note:** Antigravity (May 2026) is still early. The remote workflow story will improve as the platform matures. Tunnels work the same way regardless — your agent runs the dev server, you point cloudflared or ngrok at the port.

> **Tip:** Start with small, well-scoped tasks. Antigravity's multi-agent orchestration is powerful but less predictable at this stage than the more mature single-agent tools.

::tab[Open]
The open path gives you flexibility the closed ecosystems don't: if a better or cheaper model drops tomorrow, you change one flag and you're on it. Tunnels work exactly the same — your agent runs the dev server, you point cloudflared or ngrok at the port.

The main gap is no phone dispatch. You initiate sessions at your desk and leave them running. Operator agents like OpenClaw or Hermes with an OpenRouter key are the closest thing to always-on agentic work on the open path — covered in the next section.

::tab[Local]
Local models keep everything on your machine. Tunnels still work the same way for sharing your localhost externally. The tradeoff is your machine needs to be on and powerful enough to run inference.

No phone dispatch, no remote triggering. The local path is strongest for privacy-first coding sessions where you're present — not for fire-and-forget autonomous tasks.
:::

## Using Operator Agents like OpenClaw or Hermes

Operator agents are the next step beyond a coding agent: they run continuously, can be deeply customized, and aren't locked to one AI provider — swap in Claude, GPT, Gemini, or an open model. Two worth knowing:

- **OpenClaw** — A polished, full-featured operator agent with a web UI, 50+ model providers, and device pairing out of the box.
- **Hermes** (Nous Research) — An open-source, extensibility-focused agent with 300+ model integrations and flexible auth options including a single Nous Portal OAuth that covers most major providers at once.

Both run in **Docker**: an isolated container with only the access you explicitly give it, separate from your main system. No permissions to micromanage, and if something goes wrong you just reset the container. The next article walks through that setup.

:::tabs
::tab[Claude]
> Starting June 15, 2026 Claude subscribers will get a separate monthly "Agent SDK credit" for third-party tools like OpenClaw and Hermes. The official page is here: https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan
>
> **If you're before June 15, 2026** — the Agent SDK credit hasn't kicked in yet. Set up a pay-as-you-go API key at [console.anthropic.com](https://console.anthropic.com). Load a small amount of credit (even $5 is enough to experiment), generate an API key, and plug it into your agent's settings. You only pay for what you use — no commitment, no second subscription.
>
> **Once June 15 hits** — opt in to the $20/month Agent SDK credit from your Claude account, and your operator agent authenticates through your subscription. That $20 covers light use. If you burn through it mid-month, the agent stops until your next billing cycle (unless you enable overage billing, which charges API rates).

If you're brand new, start with Claude Code first. Dispatch gives you a feel for remotely-connected agentic Claude. Claude Code handles a lot — especially building websites with Dispatch. Operator agents are for when you want something more persistent and customizable than a one-off coding session.

::tab[ChatGPT]
Both OpenClaw and Hermes support GPT models alongside Claude — the Docker setup is identical. If you have a ChatGPT Plus or Pro subscription, you can authenticate via OAuth directly through your account — no separate API key needed. Just connect the agent to your ChatGPT account and select your preferred GPT model.

Hermes also offers a **Nous Portal** OAuth that covers 300+ models through a single login — useful if you want to experiment across providers without managing multiple keys.

If you'd rather use a pay-as-you-go API key (e.g. to use a specific model version or control costs separately), get one at [platform.openai.com](https://platform.openai.com) and paste it into the agent's model settings.

If you're brand new, start with Codex CLI or VS Code Codex first. Get comfortable with agent-driven coding before scaling up to persistent, customizable operator workflows.

::tab[Gemini]
OpenClaw supports Gemini models natively alongside Claude and GPT — the Docker setup is identical, just select a Gemini model in OpenClaw's model settings. Hermes supports Gemini via OpenRouter or the Nous Portal OAuth.

Get a free API key at [aistudio.google.com](https://aistudio.google.com): create a project, generate a key, and paste it into the agent's model settings. Gemini Flash is the cost-effective always-on choice; Pro for heavier reasoning tasks.

If you're brand new, start with Antigravity CLI first. Get comfortable with agent-driven coding before scaling up to persistent operator workflows.

::tab[Open]
This is where the open path really delivers. Both OpenClaw and Hermes support OpenRouter natively — paste your OpenRouter key into the model settings and select from 300+ models. You can run DeepSeek for cost-effective everyday tasks, switch to a stronger model for complex reasoning, all without changing your agent setup.

Get a key at [openrouter.ai](https://openrouter.ai). Start with DeepSeek-V4-Pro or Llama 4 Maverick — both are strong open coding models at a fraction of frontier cost.

If you're brand new to this, start with Aider + OpenRouter before moving to operator agents. Build a feel for how open models handle your actual work first.

::tab[Local]
OpenClaw and Hermes both support local Ollama endpoints — configure the model URL to point at `http://localhost:11434` and select your local model. This gives you a fully offline, fully private operator agent.

The tradeoff is real: autonomous multi-step tasks push models harder than conversational coding sessions. You'll want a capable model (Qwen3 14B minimum; DeepSeek Coder 33B for serious work) and the hardware to run it.

If you're brand new, start with Aider + Ollama for coding sessions first. Operator agents with local models is a next-level setup — get comfortable with the basics before going fully offline.
:::

**Practical advice for beginners:**
Pick one ecosystem and learn it well before adding more tools. The real power comes from understanding what your agent can and can't do — and that takes actual use, not just reading about it.

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
>
> https://aistudio.google.com — Google AI Studio (free API keys)
>
> https://antigravity.google.com — Antigravity (Google's agentic platform)
>
> https://openrouter.ai — OpenRouter (unified API for 300+ models)
>
> https://aider.chat — Aider (open-source terminal coding agent)
>
> https://ollama.com — Ollama (run open models locally)
>
> https://continue.dev — Continue (open-source VS Code extension)

_This article was generated with AI for the purpose of providing practical information. I have reviewed it and edited it appropriately._
