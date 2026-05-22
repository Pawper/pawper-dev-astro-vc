---
categories: [featured, vibe-coded]
stack: Astro
---

# pawper.dev

My personal portfolio site — the one you're reading this on. Built from scratch as a learning project and employer-facing showcase, with a sci-fi LCARS UI inspired by Star Trek's computer interfaces.

## What it is

A full-featured portfolio platform built with **Astro 6**, **React 18**, and **TypeScript**. Projects are pulled live from GitHub at build time. Writing lives in Markdown content collections. Everything is statically generated and deployed to Netlify.

The UI system ("Codex") is built around LCARS design language: angular bars, monospace readouts, section color theming, and a modal-stack navigation model that keeps the page URL in sync with whatever you're viewing.

## Features

- **Projects** — fetched from GitHub at build time via Octokit. Repos tagged `portfolio-project` are included automatically. Each project gets a Puppeteer screenshot, full commit history (for the activity heatmap), and language color theming derived from the codebase itself.
- **Logs** — a blog-style writing section backed by Astro Content Collections. Supports series, kicker categories, tags, and inline cross-references that embed live project/log cards directly in prose.
- **Skills** — a custom taxonomy with distribution charts, coverage stats, and per-skill filtering across projects and logs. Skills link to endorsements.
- **Services** — six service types (employment, contracting, consulting, coaching, speaking, mentoring) with status indicators and endorsements pulled from Airtable at build time.
- **Search** — client-side full-text search across projects and logs, with debounce and query persistence.
- **Activity** — an all-portfolio commit heatmap with year filtering, showing real activity density per day across every project.
- **RSS** — five feed types: all projects, all logs, featured projects, plus per-category feeds auto-generated at build.
- **Dev.to** — logs are cross-posted to Dev.to via their API. Canonical URL points back to pawper.dev, so search engines attribute the content here.
- **Resume** — a `/resume` page with Puppeteer-generated PDF export baked into the build pipeline.

## How it was built

This site was built collaboratively with AI — specifically Claude — over an extended session (about a week full-time) that produced the full UI system, data pipelines, and component library. The design direction, content, and product decisions are mine; the implementation was a genuine back-and-forth between what I wanted and what the AI helped me build. There were some challenging moments with context and memory, as well as Claude just being completely off base so I had to get into things myself, but we got through it!

## What's next
Since this was more or less vibe-coded and extremely iterative, my next goal is to orchestrate agents to create a multi-factored procedural memory system built from the current code base / memory, identify flaws, then generate a full hierarchical spec including the tricky design elements based on best practices, and see if Claude Code can plan and reproduce the website from spec without code blocks (a.k.a. SDD - spec-driven development) and also have tests against the spec.

## Stack

| Layer | Choice |
|---|---|
| Framework | Astro 6 |
| Components | React 18 (islands) |
| Language | TypeScript (strict) |
| Styling | CSS custom properties + LCARS design system |
| Data | GitHub API (Octokit), Airtable, Astro Content Collections |
| Screenshots | Puppeteer → Cloudinary |
| Deployment | Netlify |

