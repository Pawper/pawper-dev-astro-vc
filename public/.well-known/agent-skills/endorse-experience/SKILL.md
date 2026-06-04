---
name: endorse-experience
description: Build a prefilled Airtable URL to leave an endorsement on a specific past or ongoing experience on pawper.dev.
---

# Endorse experience

## When to use

The user is a colleague, client, or collaborator who wants to leave a public endorsement on one of Phillip Wessels' experiences — a past job, contract, talk, mentorship, etc.

## URL pattern

```
https://airtable.com/app5WObcR6LNZ9bQv/pagfzcuqMVAgL0FKk/form
  ?prefill_Service={experience.category}
  &prefill_Skills%20List={comma-joined experience.skills}
  &prefill_Experience={experience.id}
  &hide_Experience=true
```

## Parameters

| Field | Source | Notes |
|---|---|---|
| `prefill_Service` | `experience.category` | One of `employment`, `contracting`, `consulting`, `coaching`, `speaking`, `mentoring`, `education`, `attending`, `volunteering`. |
| `prefill_Skills List` | `experience.skills.join(", ")` | Use `%20` for the literal space in the field name. URL-encode the value. |
| `prefill_Experience` | `experience.id` | Hidden field; populated so the submission threads back to the right experience. |
| `hide_Experience` | constant `true` | Hides the Experience input so the user cannot accidentally change it. |

## How to discover experience IDs

Enumerate experience IDs from the sitemap (`/sitemap.xml`) — every `/xp/{id}/` URL is one. Each `/xp/{id}/` page exposes its category via the `og:type` and the metadata visible to the rendered SPA.

## Notes

- The Airtable base + form IDs above are stable public identifiers (the same URL is embedded in the deployed JS bundle).
- Submission lands in Phillip's endorsements table; once approved, the endorsement appears on the relevant service page.
- To send a direct message instead of leaving an endorsement, use the `send-contact` skill.
