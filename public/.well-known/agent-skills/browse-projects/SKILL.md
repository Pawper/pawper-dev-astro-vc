---
name: browse-projects
description: List and read portfolio projects on pawper.dev, pulled live from GitHub at build time, with language stats and commit-history activity.
---

# Browse projects

## When to use

The user is asking about Phillip Wessels' portfolio projects, what he's built, which languages he uses across his work, or wants to read about a specific project on `pawper.dev`.

## URLs

- Index of all projects (HTML): https://pawper.dev/projects/
- Index, featured only (HTML): https://pawper.dev/projects/featured/
- Individual project (HTML): https://pawper.dev/p/{id}/
- RSS feed of featured projects: https://pawper.dev/feed/projects/featured.xml
- RSS feed by category: https://pawper.dev/feed/projects/{category}.xml
- Full sitemap (XML): https://pawper.dev/sitemap.xml — every `/p/{id}/` URL is listed.

## How to read

For machine-readable browsing, prefer the RSS feeds. For full content of a single project, request `https://pawper.dev/p/{id}/` with `Accept: text/markdown` (markdown content negotiation is enabled on the homepage; per-page negotiation is on the roadmap).

Each project includes a title, description, languages object, GitHub URL, optional web URL, and the rendered README.

## Notes

Projects are tagged `portfolio-project` on GitHub and pulled at build time via Octokit. The list refreshes on every Netlify deploy.
