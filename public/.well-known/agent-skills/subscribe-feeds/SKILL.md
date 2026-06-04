---
name: subscribe-feeds
description: Subscribe to one of five RSS feed shapes on pawper.dev — all logs, all activity, featured projects, per-category projects, or per-skill/series/kicker logs.
---

# Subscribe to feeds

## When to use

The user wants ongoing notifications when Phillip Wessels publishes a log, ships a project commit, or updates a specific service / skill / series.

## URLs

| Feed | URL |
|---|---|
| All logs | https://pawper.dev/feed.xml |
| Cross-portfolio commit activity | https://pawper.dev/feed/activity.xml |
| Featured projects | https://pawper.dev/feed/projects/featured.xml |
| Projects by category | https://pawper.dev/feed/projects/{category}.xml |
| Logs by kicker | https://pawper.dev/feed/logs/{kicker}.xml |
| Logs by series | https://pawper.dev/feed/series/{series}.xml |
| Logs by skill | https://pawper.dev/feed/skills/{skill}.xml |

## Content-Type

All feeds return `application/rss+xml`. Title, link, pubDate, and a description/content field are present on every item; logs additionally include `media:content` for hero images.
