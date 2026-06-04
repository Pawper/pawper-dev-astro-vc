---
name: browse-experiences
description: Read past and ongoing experiences on pawper.dev — jobs, contracts, talks, mentorships, agenda events. Each /xp/{id} page is one experience record.
---

# Browse experiences

## When to use

The user wants the list of Phillip Wessels' past or ongoing experiences (employment, contracting, consulting, coaching, speaking, mentoring, education, volunteering), or to read a specific one in detail.

## URLs

- Per-experience page (HTML): https://pawper.dev/xp/{id}/

Experience IDs are listed in the full sitemap at https://pawper.dev/sitemap.xml.

## How to read

Each experience page redirects to the SPA modal `/?modal=experience&id={id}` for full interactive details (skills, endorsements, related projects). For machine-readable metadata, scrape the OpenGraph tags on the static `/xp/{id}/` HTML — they expose `og:title`, `og:description`, and the category (`employment`, `contracting`, `consulting`, `coaching`, `speaking`, `mentoring`, `education`, `attending`, `volunteering`).

## Related actions

- To leave an endorsement on a specific experience, use the `endorse-experience` skill.
