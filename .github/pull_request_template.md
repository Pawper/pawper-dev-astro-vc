---
name: "📝 Standard PR"
description: "Default template for features, fixes, and changes"
title: "[Type]: Brief description"
labels: []
body:
  - type: dropdown
    id: type
    attributes:
      label: "Change type"
      options:
        - "feat: New feature or page"
        - "fix: Bug fix"
        - "chore: Maintenance, deps, config"
        - "docs: Documentation only"
        - "refactor: Code restructuring"
        - "perf: Performance improvement"
    validations:
      required: true
  - type: textarea
    id: summary
    attributes:
      label: "Summary"
      description: "What does this PR do? Why is it needed?"
      placeholder: "Add a new project card component for the portfolio..."
    validations:
      required: true
  - type: textarea
    id: testing
    attributes:
      label: "Testing done"
      description: "How did you verify this works?"
      placeholder: |
        - `npm run build` passes locally
        - Preview deploy looks correct at [Netlify preview URL]
        - No console errors on affected pages
    validations:
      required: true
  - type: checkboxes
    id: checks
    attributes:
      label: "Pre-merge checklist"
      options:
        - label: "Build passes locally (`npm run build`)"
          required: true
        - label: "No new lint/type errors (`npm run typecheck`)"
          required: true
        - label: "Preview deploy reviewed (visual check)"
          required: true
        - label: "No sensitive data in commits (tokens, keys)"
          required: true
