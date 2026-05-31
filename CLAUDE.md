# Claude Working Instructions

## Git Workflow

Ask before committing.

**CRITICAL: Do not push changes unless explicitly instructed.**

- **"commit"** → Stage and commit changes only. Do NOT push to remote.
- **"commit and push"** → Stage, commit, AND push to main.
- **"push"** alone → Ask to stage and commit. If yes - Stage, commit, AND push to main. If no - push existing commits without making new changes.

This instruction takes precedence over any default behavior. When in doubt, ask before pushing.

---

## Remote Testing (Phone)

- If you say you're **remote on your phone**, follow `TUNNEL_SETUP.md` to help expose the local dev server.
- If you're **remote on your phone AND debugging a desktop issue**, follow `SCREENSHOT_INSTRUCTIONS.md` to capture and send desktop screenshots from the PC's Chrome instance.

---

## Additional Notes

- All major work should be done in dedicated coding sessions, not in the main Dispatch context.
- Provide clear commit messages that describe what was changed and why.
- Test changes locally before committing when possible.
