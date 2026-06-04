---
name: browse-logs
description: List and read long-form logs on pawper.dev — organized by kicker categories, series, tags, and skills. Sourced from Astro content collections.
---

# Browse logs

## When to use

The user wants to read Phillip Wessels' writing, find a post on a specific topic (e.g. React, operating systems, agents), follow a multi-part series, or list everything by a particular kicker category.

## URLs

- Index of all logs (HTML): https://pawper.dev/logs/
- Logs by category (HTML): https://pawper.dev/logs/{cat}/
- Individual log (HTML): https://pawper.dev/l/{slug}/
- Series view (HTML): https://pawper.dev/ls/{series-slug}/
- RSS feed of all logs: https://pawper.dev/feed.xml
- RSS feed by kicker: https://pawper.dev/feed/logs/{kicker}.xml
- RSS feed by series: https://pawper.dev/feed/series/{series}.xml
- RSS feed by skill: https://pawper.dev/feed/skills/{skill}.xml

## How to read

Pull `https://pawper.dev/feed.xml` first to enumerate available logs with titles, dates, and hooks. Then fetch `/l/{slug}/` for the full HTML body, or request the same URL with `Accept: text/markdown` once per-page markdown negotiation is enabled.

## Schema (front-matter)

Each log carries: `title`, `date` (YYYY.MM.DD), `kicker`, optional `tags[]`, optional `image`, optional `hook`, optional `series: { name, part, total? }`, optional `devto` cross-post URL.
