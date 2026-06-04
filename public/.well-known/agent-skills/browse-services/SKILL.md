---
name: browse-services
description: List the six service types Phillip Wessels offers (employment, contracting, consulting, coaching, speaking, mentoring), each with status and endorsements.
---

# Browse services

## When to use

The user is evaluating Phillip Wessels for a role, engagement, talk, or coaching arrangement, and wants to know what's on offer plus the endorsements that back each service.

## URLs

- Index of services (HTML): https://pawper.dev/services/
- Service overview (HTML): https://pawper.dev/services/overview/
- Per-service page (HTML): https://pawper.dev/services/{id}/ — `id` is one of: `employment`, `contracting`, `consulting`, `coaching`, `speaking`, `mentoring`.

## How to read

Each service page contains a kicker, longer description, status (`open` | `full`), and the endorsements specifically tagged to that service. Endorsements are pulled from Airtable at build time.

## Related actions

- To leave an endorsement against a specific experience, use the `endorse-experience` skill.
- To contact Phillip directly about an engagement, use the `send-contact` skill.
