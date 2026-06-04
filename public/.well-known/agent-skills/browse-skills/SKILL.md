---
name: browse-skills
description: Query the pawper.dev skills taxonomy with distribution charts and per-skill filtering across projects and logs.
---

# Browse skills

## When to use

The user wants to know which technologies, languages, or topics Phillip Wessels works with, or wants the projects and logs that touch a specific skill (e.g. TypeScript, Astro, agents).

## URLs

- Per-skill page (HTML): https://pawper.dev/skill/{id}/ — slashes in skill names become dashes (e.g. `node/express` → `node-express`).
- About → Skills overview (HTML): https://pawper.dev/about/skills/
- RSS feed of logs by skill: https://pawper.dev/feed/skills/{skill}.xml

## How to read

A skill page renders distribution charts and the list of projects/logs that match. For raw enumeration, parse the relevant RSS feed.

## Notes

The skills taxonomy is hand-curated (see `src/data/content.ts` in the source repo). New skills are added when projects or logs introduce them.
