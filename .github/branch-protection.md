# Branch Protection Setup for pawper.dev

Since `gh` CLI isn't available in this environment, configure branch protection via GitHub Web UI:
**Settings → Branches → Add rule** for `main`

## Required Settings

| Setting | Value | Why |
|---------|-------|-----|
| **Branch name pattern** | `main` | Protect production branch |
| **Require a pull request before merging** | ✅ Enforced | All changes via PR |
| **Require approvals** | 1 (or 0 if solo) | Code review gate |
| **Dismiss stale approvals on new commits** | ✅ | Force re-review after changes |
| **Require status checks to pass before merging** | ✅ | Block merge on failed builds |
| **Status checks required** | `build` (Netlify deploy) | Netlify posts deploy status as check |
| **Require branches to be up to date before merging** | ✅ | Prevent stale merges |
| **Require linear history** | ✅ | Clean history, no merge commits |
| **Include administrators** | ✅ | No bypassing rules |
| **Allow force pushes** | ❌ | Never rewrite main history |
| **Allow deletions** | ❌ | Never delete main |

## Netlify Preview Deploys for PRs

1. In Netlify dashboard: **Site settings → Build & deploy → Deploy contexts**
2. Enable **"Deploy previews for pull requests"**
3. This creates a unique preview URL per PR (e.g., `deploy-preview-123--pawper-dev.netlify.app`)
4. Netlify posts a `deploy/netlify` status check on the PR — add this to "Status checks required" above

## Workflow

```bash
# Start a change
git checkout main && git pull
git checkout -b feature/your-change-name

# Work, commit, push
git add -A && git commit -m "feat: description"
git push -u origin feature/your-change-name

# Open PR on GitHub → Netlify builds preview → review → squash merge
# After merge: Netlify auto-deploys main → production
```

## Branch Naming Convention

| Prefix | Use for |
|--------|---------|
| `feature/` | New functionality, pages, components |
| `fix/` | Bug fixes |
| `chore/` | Maintenance, deps, config, CI |
| `docs/` | Documentation only |
| `refactor/` | Code restructuring without behavior change |
| `perf/` | Performance improvements |

## Local `.env` for Development

Copy `.env.example` to `.env` and fill in values for local builds:

```bash
cp .env.example .env
# Edit .env with your tokens (never commit this!)
```

The build scripts gracefully skip steps when optional vars are missing (Cloudinary, Airtable, Dev.to, reCAPTCHA), but **`GITHUB` is required** for the project fetch to work.
