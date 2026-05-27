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

Machine Learning (ML) is the field where computers learn patterns from data instead of being explicitly programmed.

Traditional programming: You write rules. The computer follows them.
```
if temperature > 80:
    turn on AC
```

Machine Learning: You show the computer examples. It learns the pattern.
**Input:** temperature readings + AC on/off history
**Output:** Model learns to predict when AC should be on

The computer doesn't have explicit rules; it's learned patterns from data. This is powerful because patterns are everywhere, and humans can't always articulate them. Machine Learning finds them automatically.

## What are Large Language Models?
A **Large Language Model (LLM)** is a type of AI trained on vast amounts of text data to predict and generate language.

Here's the core idea: LLMs learned by reading billions of examples of human language. They've internalized patterns about how language works—not consciously, but as mathematical patterns. When you ask them a question, they predict what text should come next, word by word, based on those patterns.

**Key insight:** LLMs don't "understand" in the way humans do. They're incredibly good at pattern recognition and prediction. But that pattern recognition is so sophisticated that it produces surprisingly intelligent output.

Think of it like this: If you've read thousands of novels, you can predict what comes next in a story. You've internalized patterns. LLMs have done this with vastly more data and mathematical precision.

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
"Closed" models (like GPT-5.5) live on the company's servers — you rent access. "Open-weight" models can be downloaded and run on your own computer or servers, which appeals to businesses and tinkerers.

## Business Models & Pricing
These companies mostly earn money two ways: **monthly subscriptions** for everyday people, and **pay-as-you-go API access** for businesses building their own apps. As a beginner, you only care about the first one.

The good news: nearly everyone has settled on the same simple ladder.

| Tier | Price | What you get |
|---|---|---|
| **Free** | $0 | Real access to a capable model, with daily/weekly limits. Fine for trying things out. |
| **Standard (Plus/Pro)** | ~$20/month | The sweet spot. ChatGPT Plus, Claude Pro, and Google AI Pro all land at roughly $20 and unlock the flagship models plus higher limits. |
| **Premium / Max** | $100–$250/month | For heavy daily users and professionals — much higher usage and extra perks like video generation. Most people don't need this. |

A few helpful notes:
- **The big three all cost about the same** at the $20 tier, so price isn't really the deciding factor — pick based on which one you like using.
- **Free tiers are genuinely good now.** Start there before paying for anything.
- **Subscriptions stack up fast.** Paying for ChatGPT *and* Claude *and* Gemini runs ~$60/month. Most beginners are happiest picking just one.
- **"API pricing"** (those "$15 per million tokens" numbers) is for developers building software.

> **Tip:** Try the free tiers of two or three for a week, then pay for the single one that earned its place. If you find yourself needing extra usage, consider upgrading your plan.

## Cheaper/Free Alternatives

The $20/month flagship plans aren't your only option. If cost matters, here are three ways to spend less — roughly from easiest to most technical.
1. **Smaller models from the same companies.** Every big provider makes "mini" versions of their flagship — faster, cheaper, and still very capable for everyday tasks. Think Claude Haiku, GPT mini-tier, and Gemini Flash. They handle routine writing, summarizing, and Q&A at a tiny fraction of the flagship cost, and you'll often find them in the free tiers of the chat apps. For most casual use, these are plenty.
2. **Third-party "model hosting" providers.** Companies like Nebius, Together.ai, Groq, DeepInfra, and OpenRouter don't build their own models — they run open-source ones (Llama, Qwen, DeepSeek, and others) for you, usually much cheaper per use than the big labs. Note: these are mainly aimed at developers building apps, not casual chatbot users.
  
  | Provider | Specialty | Best for |
  |---|---|---|
  | **Groq** | Speed | Ultra-fast inference |
  | **DeepInfra** | Cost | Cheapest rates |
  | **OpenRouter** | Flexibility | Switching between many models through one account |
  | **Nebius** | Privacy | Running inside Europe (data-privacy compliant) |
  | **Together.ai** | Open-source models | Building with Llama, Qwen, DeepSeek, and others |
  
3. **Local models — run AI on your own computer.** Free tools like Ollama and LM Studio let you download an open model (Llama, Gemma, Qwen, and similar) and run it entirely on your own machine. The upsides: it's free after setup, works offline, and nothing you type leaves your computer — great for privacy. The catches: you need a reasonably powerful computer, and these smaller local models aren't as sharp as the cloud-based frontier ones.

> **Rule of thumb:** Use a cheap "mini" model for everyday stuff, and only reach for an expensive flagship when a task is genuinely hard (tricky coding, deep reasoning, long documents). This "use the cheap one by default" approach is exactly how cost-conscious businesses keep their bills down.

## What Are AI Agents?

An **AI Agent** is an AI system that can autonomously perform tasks by:
1. Understanding a goal
2. Breaking it into steps
3. Taking actions (reading files, running code, making API calls)
4. Observing results
5. Adjusting and trying again

| Agent | Creator | Description |
|-------|---------|-------------|
| **OpenClaw** | Open-source | "Operator" agent for personal productivity and automation. Grew from a weekend prototype to GitHub's most-starred repository, with a big marketplace of community-made skills. |
| **Hermes Agent** | Nous Research | Learns your workflows over time. Markets itself as "the agent that grows with you" and recently surpassed OpenClaw as the most-used open-source agent by daily usage. |
| **Claude Code** | Anthropic | Coding agent; a developer favorite for real software work. |
| **Codex CLI** | OpenAI | OpenAI's command-line coding agent, in the same category as Claude Code. |
| **GitHub Copilot** | GitHub/OpenAI | AI pair programmer integrated into VS Code and other editors for coding assistance. |
| **Cursor** | Anysphere | An AI-powered code editor (built on VS Code) with AI woven into every keystroke. |

*Snapshot as of May 2026.*

> This field moves *fast* — new agents launch almost every week, and today's leader can be overtaken in a month. Don't stress about always having the "best" one. Pick something that works for you, and know that they're all improving constantly.

---

## Basic Prompt Engineering

You don't need to be an expert, but understanding a few patterns helps you get better results from models.

### Pattern 1: Be Clear About Your Goal

**Bad:**
```
Write something about Python
```

**Good:**
```
Write a beginner-friendly explanation of what Python lists are, with 2 code examples.
```

Specificity matters. The model can't read your mind.

### Pattern 2: Provide Context

**Bad:**
```
Fix this code
```

**Good:**
```
I'm trying to read a CSV file and count rows. Here's my code:
[code]
It's giving an error: [error message]
What's wrong?
```

Context helps the model understand your actual problem.

### Pattern 3: Ask for Structure

**Bad:**
```
Tell me about Docker
```

**Good:**
```
Explain Docker in these sections:
1. What problem does it solve?
2. How does it work conceptually?
3. What are the main concepts (images, containers, registries)?
4. Why is it useful for development?
```

Structure forces clarity on both sides.

### Pattern 4: Use Examples

**Bad:**
```
Make this function better
```

**Good:**
```
I want this function to be more readable. Here's an example of the style I like:
[example of clean code in your preferred style]
Now improve this function using that style:
[your function]
```

Examples communicate your preferences better than words.

## Risks and Guardrails

LLMs are powerful, but they have limitations and risks:

### Hallucinations

Models sometimes generates plausible-sounding but incorrect information. It might cite sources that don't exist or state facts that are wrong. **Always verify important information.**

### Outdated Information

A model's training data has a cutoff date. It doesn't know current events or recent changes. For up-to-date info, you need to provide context or use tools that can browse the web.

### Biases

LLMs learn from human-generated text, which contains biases. Models are generally trained to be helpful and harmless, but biases can still appear. **Be aware of this, especially for sensitive decisions.**

### Security & Privacy

- Don't share passwords, API keys, or sensitive credentials in prompts
- Don't assume your prompts are private (especially with free tiers)
- Treat conversations with LLMs as you would emails to a colleague

### Overreliance

An LLM is a tool, not a replacement for human judgment. For important decisions, use models to help think, not to make the decision.

---

## The Claude Ecosystem

**Claude** (the model) is made by **Anthropic**, a company focused on building safe, reliable AI. When you use Claude, you're accessing their LLMs through various interfaces. I choose to start folks off with Claude because it's great for development -- and agency is about building your own tools.

### Claude's Interfaces

Claude is available through different tools, and you'll choose based on your use case:

| Tool | What It Is | Best For | Cost |
|---|---|---|---|
| **Claude.ai** (Web) | Chat interface in the browser — the classic way to use Claude | Writing, research, analysis, brainstorming, everyday Q&A | Free (with limits) / $20/mo Pro / $100–$200/mo Max |
| **Claude Desktop** (Mac/Windows) | Standalone app — same chat as web, plus houses Cowork mode | Same as web chat, but stays in your dock. Required for Cowork. Supports Dispatch (control from phone). | Same subscription — Free, Pro, or Max |
| **Claude Cowork** | Agentic mode inside Desktop — reads, writes, and organizes files on your computer | Non-technical "get stuff done" work: organizing folders, building spreadsheets/decks/reports, multi-step file tasks. No terminal needed. | Included with Pro ($20/mo), but heavy use burns tokens ~50–100× faster than chat — Max ($100/mo+) realistic for daily use |
| **Claude Code** (Terminal CLI) | Command-line coding agent in your terminal | Software engineering: writing, refactoring, debugging across multi-file codebases | Pro ($20/mo) minimum. Max ($100–$200/mo) for heavy use. Or pay-per-token via API. |
| **Claude Code VS Code / JetBrains Extension** | Native IDE extension — Claude Code inside your editor | Same coding tasks as CLI, but in a visual editor instead of raw terminal | Bundled with your Claude subscription or API key |
| **Claude Design** | AI-powered visual canvas inside claude.ai — describe what you want, get interactive prototypes | Prototypes, pitch decks, slides, one-pagers, UI mockups. Codebase-aware design systems. Hands off directly to Claude Code. | No separate cost — shares existing Pro/Max/Team/Enterprise usage (research preview) |
| **Claude in Chrome** (Beta) | Browser extension — Claude can see, click, navigate, and fill forms in Chrome | Automating repetitive browser tasks: data extraction, form filling, multi-site research. Pairs with Cowork. | Included with paid plans. Pro gets Haiku only; Max/Team/Enterprise can pick Sonnet or Opus. |
| **Anthropic API** | Pay-per-token developer API — build Claude into your own apps | Developers embedding Claude in products, automating pipelines, running batch jobs. Full control, no UI. | Haiku ~$0.80/$4 per 1M tokens, Sonnet $3/$15, Opus $15/$75. No monthly minimum. |

## Using Claude with Agents like OpenClaw

Starting June 15, 2026 Claude subscribers will get a separate monthly "Agent SDK credit" for third-party tools like OpenClaw. The official page is here: https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan

For a beginner on a Pro plan who just wants to try OpenClaw with Claude right now:

**If you're before June 15, 2026** — the Agent SDK credit hasn't kicked in yet. Your options today are to set up a pay-as-you-go API key at [console.anthropic.com](https://console.anthropic.com). You load a small amount of credit (even $5–$10 is enough to experiment), generate an API key, and plug that into OpenClaw's settings. You only pay for what you use — no commitment, no second subscription.

**Once June 15 hits** — you can opt in to the $20/month Agent SDK credit from your Claude account, and OpenClaw will be able to authenticate through your subscription again. That $20 covers light use. If you burn through it mid-month, OpenClaw stops working until your next billing cycle (unless you enable overage billing, which charges API rates).

**Practical advice for beginners:**
Start with the API key approach even after June 15 — it's simpler to understand ("I put in $10, I use $10") and avoids surprises. Use **Sonnet 4.6** as your model in OpenClaw, not Opus. It's 5× cheaper and handles most tasks just as well. Save Opus for things that genuinely need it.

And honestly, if you're brand new to OpenClaw and just want to see what agents can do with Claude, the cheapest first step is to try **Claude Code** in your terminal — it's already included with your Pro plan, no extra setup, and gives you a feel for agentic Claude before adding OpenClaw into the mix.

---

## Understanding Claude Code (CLI)

**Claude Code** is a command-line interface that lets you use Claude directly from your terminal. It's designed for developers—Claude can read your code, suggest improvements, and even write and run code for you.

Why is this relevant?
- You'll use Claude Code in your workflow
- It's a practical example of how Claude integrates into development
- It shows how agents work (Claude understands your goal, suggests code, runs it)
- It bridges the gap between "Claude the AI" and "Claude the development tool"

### Why Claude Code Matters for What's Next

When you learn **Docker** (next), you'll use it to containerize applications. When you learn **OpenClaw**, you'll use it to build autonomous agents. Both of these will interact with LLMs—potentially Claude.

Claude Code is your first hands-on experience with that integration: an AI that can read code, understand your intent, and take action.

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

Congratulations—you've just used an AI agent from the command line.

### More Examples

Generate a simple Node.js script:
```bash
claude "Write a Node.js script that reads a file and prints its contents"
```

Get help with your code:
```bash
claude "I have this function [paste code]. Why is it slow?"
```

Build something:
```bash
claude "Create a simple web server that responds with 'Hello World' on port 3000"
```

Claude Code is a tool that gets better with practice. The more specific your requests, the better the results.

---

## You're Now at the Frontier

You've completed the Foundations of Digital Agency and stepped into the frontier of modern development. You understand:

- Operating systems and terminals
- Code editors and development environments
- The command line and scripting
- Package management and registries
- Now: Large Language Models and AI tools

What's coming:
- **Docker** — Containerization and reproducibility
- **OpenClaw & Agents** — Building autonomous systems
- **Web Applications** — Real-world development
- Beyond: Building your own solutions with AI as a partner

You now have the knowledge and the tools to claim agency. Not because you understand everything—nobody does. But because you understand enough to navigate, experiment, learn, and build.

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
