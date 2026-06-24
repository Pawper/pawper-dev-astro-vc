---
title: "Memory for Your Agent: Cognee, Obsidian, and the A2H Edge"
devto: ""
date: "2026.06.24"
kicker: "Tutorial"
tags: ["Agent Memory", "Cognee", "Obsidian", "OpenClaw", "Hermes", "Agentic Systems", "Personal OS", "Second Brain"]
hook: "Memory is not just vector search. It's the surface where an agent helps you hold continuity across time, projects, and relationships. Obsidian as the human-readable edge, Cognee as the graph layer, and a capture policy that strengthens your agency."
series:
  name: "ClawCamp Campout @ Dual Tech Summit 2026"
  part: 5
  total: 5
mentor: true
---

This is Part 4 — the last part of **[ClawCamp Campout @ Dual Tech Summit 2026](https://pawper.dev/l/clawcamp-campout-overview/)**. You have an agent running ([Part 1](https://pawper.dev/l/getting-started-openclaw/)), the frame for why ([Part 2](https://pawper.dev/l/beyond-assistants-agentic-personal-os/)), and tools connected with boundaries ([Part 3](https://pawper.dev/l/getting-going-with-your-agent/)). The thing still missing is the one that makes an agent feel like a partner instead of a stranger every morning: **memory.**

> **This is a long one — by design.** If you're here live, take the *fast path* right below: skim the deck, run the prompt, start building. Everything under "The deeper guide" is reference for when you come back. Nobody reads 2,000 words standing in a workshop, and you shouldn't have to.

---

## The fast path (do this live)

**1. Watch the deck** (5 minutes — the whole model in pictures):

<figure class="pw-slides-embed" style="margin: 1.25rem 0 0;">
<div style="position: relative; width: 100%; aspect-ratio: 1280 / 749; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.14); background: #000;">
<iframe src="https://docs.google.com/presentation/d/e/2PACX-1vSnWPub2whmBrnULDTsmuBhD3NrrSAFLwibW1Be0W4NA8Qrn0zvJfHWLctM9oSArA/pubembed?start=false&loop=false&delayms=3000" title="Memory for Your Agent — slide deck" loading="lazy" allowfullscreen="true" style="position: absolute; inset: 0; width: 100%; height: 100%; border: 0;"></iframe>
</div>
<figcaption style="font-size: 12px; color: var(--ink-mute); margin-top: 8px; text-align: center;"><em>Memory for Your Agent</em> — <a href="https://docs.google.com/presentation/d/e/2PACX-1vSnWPub2whmBrnULDTsmuBhD3NrrSAFLwibW1Be0W4NA8Qrn0zvJfHWLctM9oSArA/pub?start=false&loop=false&delayms=3000" target="_blank" rel="noopener noreferrer">open in full screen ↗</a></figcaption>
</figure>

**2. The model in three lines:**

- Your agent forgets you between chats. **Memory is the notebook it keeps.**
- **Obsidian** is the part you can read and edit. **Cognee** turns those notes into a searchable graph.
- The skill isn't storing everything — it's **deciding what's worth keeping.**

**3. Run the prompt** (it builds the whole thing):

```text
Help me design and stand up an agent memory system. Obsidian is the
human-readable edge; Cognee is the graph/memory layer. Do the work yourself —
don't make me run terminal commands. Ask only for what you need.

Create:
1. An Obsidian vault folder structure for memory (scaffold it in my workspace
   and tell me the path to "Open folder as vault").
2. A capture policy: what becomes durable memory vs. what stays transient.
3. The pipeline: daily note → reference note → Cognee ingestion → recall.
4. A demo: ingest a few of my notes with Cognee, then have my agent recall a
   prior decision and surface it back to me with its source.
5. A privacy/safety checklist: what NOT to ingest, when to ask before storing,
   and how I review and prune memory.

Principle: memory should strengthen my agency, not create invisible
surveillance or opaque automation. If the agent remembers it, I can read it.
```

That's the live workshop. Build first; read the rest when you want the *why*.

---

## The deeper guide (come back to this)

Everything below explains the model the fast path just had you build. Read it when you have time, not when you're standing in a room.

### Why agents need memory

Out of the box, an agent has the memory of a goldfish. Every conversation starts from zero. It doesn't remember the decision you made last week, the project you're three months into, or that you already told it twice you don't use Slack.

That's **context-window amnesia**. The model can only hold so much at once, and when the window scrolls, it's gone. Memory is what lets an agent participate in *continuity* — across days, projects, and relationships. It's the difference between a tool you re-explain yourself to and one that knows where you left off.

### Memory, explained like you're five

> Memory is the stuff your agent writes down so it doesn't forget you between chats.

A model by itself is brilliant but amnesiac. Memory is the notebook it keeps — and the whole craft is deciding what's worth writing in it.

### …and explained like you're an intern

"Memory" gets used for at least five different things, and it helps to keep them straight:

1. **Context engineering** — fitting more into the working set (the prompt window). This is RAM: fast, temporary, lost on restart.
2. **Retrieval (RAG)** — looking facts up at answer time (more on this next).
3. **Persistent state** — facts that survive restarts and carry across sessions.
4. **The three classic types** — *semantic* (what's true), *episodic* (what happened, and when), *procedural* (how to do something — your rules and workflows).
5. **Memory-as-tool** — the agent itself deciding when to read from and write to storage.

Most "agent memory" products are really about #2 and #3: a durable place to put facts, plus a way to pull the relevant ones back when they matter. Cognee is one of those, built around a knowledge graph.

### What OpenClaw memory gives you (out of the box)

OpenClaw ships with native memory that handles the core problem: **continuity across sessions without surveillance.** You get:

**Two-layer architecture:**
- **Layer 1: Daily logs** (`memory/YYYY-MM-DD.md`) — raw, transient notes you write. Allowed to be messy.
- **Layer 2: Durable memory** (`MEMORY.md`) — facts, decisions, preferences you've deliberately promoted. This is what survives and gets retrieved.

**Active Memory plugin** (2026.4.10+) — Before answering, the agent runs a sub-routine that queries relevant preferences, historical decisions, and prior session context. It's built-in pre-population: the agent automatically reaches for what matters without you having to paste it every time.

**People-aware features** (2026.4.29+) — Person cards, aliases, relationship graphs. So when you ask "what do I know about X?", the agent can surface not just snippets but *connections* — who introduced you, what they work on, what you decided together.

**Hybrid search** — Vector similarity + temporal decay, so newer memories rank higher and you get both "what's similar?" and "what was true on this date?"

**The capture policy is yours.** Memory doesn't auto-ingest everything. You write the daily log, promote the note to durable memory when it matters, and the agent retrieves from there. Surveillance is opt-in, never automatic.

> **OpenClaw's native memory is a solid foundation.** It solves continuity and respects the A2H edge. Many workflows stop here and never need more.

### What Cognee adds on top

When OpenClaw's memory starts to strain — when you have hundreds of notes and need to ask "how are these three decisions connected?" or "what was the context six months ago when we chose this approach?" — Cognee layers on the next level:

**Knowledge graph extraction** — Cognee reads your notes and *automatically* extracts entities, relationships, and timestamps. You don't write the graph; Cognee infers it from the natural language you already wrote.

**Relationship traversal** — Instead of just "find similar notes," you can ask questions like "what decisions led to this one?" or "who else was involved in this project?" and Cognee traverses the graph to answer.

**Provenance tracking** — Every fact in Cognee's graph points back to its source note. When the agent surfaces a memory, you see where it came from, so you can verify or correct it.

**Time-aware queries** — Graph + timestamps let you ask "what was true on this date?" or "how did this relationship evolve?" — things vector search alone can't reliably answer.

**The trade-off in one line:** OpenClaw's native memory is simpler and faster; Cognee's graph is more powerful at understanding *how things are connected* — but it adds complexity and a new tool to maintain.

### What's RAG?

**RAG = Retrieval-Augmented Generation.** Before the model answers, you *search a store* for the most relevant chunks of text and paste them into the prompt. It's how an agent "looks things up" instead of relying only on what it memorized during training.

Plain **vector RAG** stores your text as embeddings and retrieves by *similarity* — "find me notes like this one." That's powerful and simple, and it's where most people start. Its blind spots are **time** and **relationships**: a pile of similar snippets can't reliably tell you *what was true last Tuesday* or *how these two things are connected*.

A **knowledge graph** fixes those blind spots by storing explicit *entities*, the *links* between them, and *timestamps*. So you can ask "how are these connected?" and "what was true on this date?" — not just "what's similar?"

> **The trade-off in one line:** vectors win on simplicity, graphs win on time. Good systems use both — vector recall to find candidates, graph expansion to follow relationships.

### How Cognee covers each kind of memory

Cognee reads your documents, extracts the entities and the relationships between them, and builds a **knowledge graph plus vector embeddings** you can query in natural language. Its pipeline is three verbs: **add** (point it at your notes) → **cognify** (build the graph) → **search** (ask, and it traverses graph + vectors with provenance).

Mapping that onto the memory types above:

| Memory type | ELI5 | Where it lives |
| --- | --- | --- |
| **Semantic** (what's true) | Facts about you and your world | Entities + edges in the Cognee graph |
| **Episodic** (what happened) | Timestamped events and decisions | Timestamped nodes → "what was true when" queries |
| **Persistent state** | Survives restarts | Cognee's stores (graph + vector + relational) |
| **Working / context** | The prompt window, right now | Context window — Cognee *feeds* it via retrieval |
| **Procedural** (how-to) | Your rules and workflows | **Not** Cognee — your `AGENTS.md` and skills |

That last row matters: procedural memory — your guardrails and routines — is the *highest-leverage* layer you can ship today, and it's just words you and the model both read. Don't push it into a graph; keep it in `AGENTS.md`.

### Obsidian is the A2H edge

The **A2H edge** (from Part 2) is the surface where the agent's work returns to you. For memory, Obsidian *is* that edge:

- **Local** — your memory lives on your machine, not someone's cloud.
- **Markdown** — plain text you and the agent both read and write.
- **Reviewable** — open any note, see exactly what's stored, edit it, delete it. The graph view makes relationships visible.

Memory without a human-readable surface becomes an invisible profile of you that you can't inspect or correct. The rule: **if the agent remembers it, you should be able to read it.**

### The capture policy — the real work

The goal is **not** to remember everything. A system that ingests every message becomes noise — and noise about *you* is surveillance you built yourself. The discipline is deciding what becomes *durable*. A three-question test:

1. **Will this matter in a month?** Transient chatter shouldn't be durable.
2. **Is it a decision, fact, commitment, or relationship?** Those are worth keeping. Vibes aren't.
3. **Would I be comfortable reading it back in the graph?** If not, it doesn't belong there.

The flow that respects this:

```
daily note  →  reference note  →  Cognee ingestion  →  agent recall
(transient)    (you decide it's    (graph + vectors,      (surfaced back at
                worth keeping)      with provenance)        the A2H edge)
```

Things move *up* the chain only when you decide they're durable. The daily note is allowed to be messy and forgettable. The reference note is the deliberate act of saying "this should last."

### A concrete example

1. **Daily note (Mon):** "Decided on Postgres over Mongo — relational queries matter more than flexible schema here."
2. **Reference note:** you promote that into `04 Reference/Decisions — Project Stack.md`, because it'll matter later.
3. **Cognee ingestion:** it extracts entities (*Postgres*, *the project*) and the relationship (*chosen over Mongo, reason: relational queries*), with a timestamp.
4. **Recall (six weeks later):** someone asks why not Mongo. You ask your agent; it surfaces the decision *and the reason*, back to you, with its source.

The agent didn't make the decision and didn't act on it. It held the continuity so *you* didn't have to, and handed it back when you needed it.

### Boundaries: privacy, approval, hygiene

Because memory is durable and about *you*, it needs the firmest boundaries in the series.

- **Privacy** — name the categories that never get ingested (health details, others' confidences, anything you wouldn't want in a graph). Write them down.
- **Approval** — promotion to durable memory is opt-in, per item (the reference-note step), never automatic.
- **Hygiene** — schedule a review. Open the graph, prune stale or untrue facts, remove anything that drifted in.
- **Memory poisoning is real** — false facts can be implanted into a store from untrusted sources, and the agent will then "remember" them. Treat memory as a security surface: keep it provably *yours*, sourced, and reviewable.

The principle, plainly: **memory should strengthen human agency, not create invisible surveillance or opaque automation.**

---

## Where this leaves you

Work through all four parts and you have the full shape:

1. **An agent in a box** — running safely in a container ([Part 1](https://pawper.dev/l/getting-started-openclaw/)).
2. **A frame** — agency over productivity, and the A2H edge ([Part 2](https://pawper.dev/l/beyond-assistants-agentic-personal-os/)).
3. **Integrations with boundaries** — Telegram, email, calendar, vault, governed by an explicit policy ([Part 3](https://pawper.dev/l/getting-going-with-your-agent/)).
4. **Memory that respects the edge** — durable, readable, pruned, and pointed back at you.

That's the campout, end to end: not assistants everywhere, but agency everywhere — built deliberately, bounded honestly, and handed back to you at every edge.

Go build something you understand. That's the whole point.

---

> **Sources / additional material:**
>
> https://www.cognee.ai — Cognee memory/graph layer
>
> https://github.com/topoteretes/cognee — Cognee repository
>
> https://vcn-33-total-recall.vercel.app/ — VCN #33: Total Recall — Memory for Agentic Systems (the memory landscape)
>
> https://obsidian.md — Obsidian
>
> https://pawper.dev/l/becoming-agentic-sovereign/ — Becoming Agentic & Sovereign with Obsidian
>
> https://pawper.dev/l/clawcamp-campout-overview/ — Series overview

_This article was generated with AI for the purpose of providing practical information. I have reviewed it and edited it appropriately._
