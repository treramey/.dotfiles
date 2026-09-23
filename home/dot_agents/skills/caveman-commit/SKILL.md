---
name: caveman-commit
description: >
  Use for commit messages, staging, /commit, or /caveman-commit. Use Conventional Commits
  except in repositories under ~/Code/work/, which require AD# tickets.
---

Determine the Git worktree root with `git rev-parse --show-toplevel` before writing a message. Resolve symlinks in both the root path and `~/Code/work`. Use the AD# format only when the root is `~/Code/work` or a descendant on a directory boundary. Use Conventional Commits for every other repository. If there is no Git worktree root, use Conventional Commits.

Write messages terse and exact. Preserve intent and reasoning. Why over what.

## Rules

### Conventional Commits

**Subject line:**
- `<type>(<scope>): <imperative summary>`; scope is optional
- Types: `feat`, `fix`, `refactor`, `perf`, `docs`, `test`, `chore`, `build`, `ci`, `style`, `revert`
- Imperative mood: "add", "fix", "remove" — not "added", "adds", "adding"
- ≤50 chars when possible, hard cap 72
- No trailing period
- Match project convention for capitalization after the colon

**Body (only if needed):**
- Skip entirely when subject is self-explanatory
- Add body only for: non-obvious *why*, breaking changes, migration notes, linked issues
- Wrap at 72 chars
- Bullets `-` not `*`
- Reference issues or PRs at the end, for example `Closes #42` or `Refs #17`

**What NEVER goes in:**
- "This commit does X", "I", "we", "now", "currently" — the diff says what
- "As requested by..." — use Co-authored-by trailer
- "Generated with Claude Code" or any AI attribution — unless the user's own rule requires an `Assisted-by`/AI-attribution trailer, then add it as a trailer
- Emoji (unless project convention requires)
- Restating the file name when the scope already says it

## Examples

Diff: new endpoint for user profile with body explaining the why
- ❌ "feat: add a new endpoint to get user profile information from the database"
- ✅
  ```
  feat(api): add GET /users/:id/profile

  Mobile client needs profile data without the full user payload
  to reduce LTE bandwidth on cold-launch screens.

  Closes #128
  ```

Diff: breaking API change
- ✅
  ```
  feat(api)!: rename /v1/orders to /v1/checkout
  BREAKING CHANGE: clients on /v1/orders must migrate to /v1/checkout
  before 2026-06-01. Old route returns 410 after that date.
  ```

## `~/Code/work` exception

For repositories whose worktree root is inside `~/Code/work`, use this subject instead of Conventional Commits:

- `AD#<ticket-number> <imperative summary>`
- Use the actual Azure DevOps ticket number supplied by the user or established in task context. Ask if it is missing or ambiguous. Never invent one.
- Do not add a Conventional Commit type, scope, colon, or `!` marker.
- Keep the same imperative mood, subject length, and no-trailing-period rule. Match the project's summary capitalization.
- Apply the shared body and Auto-Clarity rules. The AD# prefix identifies the Azure DevOps work item; add other references only when needed.

Example:

```
AD#12345 add GET /users/:id/profile

Mobile client needs profile data without the full user payload
to reduce LTE bandwidth on cold-launch screens.
```

## Auto-Clarity

Always include body for: breaking changes, security fixes, data migrations, anything reverting a prior commit. Never compress these into subject-only — future debuggers need the context.

## Boundaries

Only generates the commit message. Does not run `git commit`, does not stage files, does not amend. Output the message as a code block ready to paste. "stop caveman-commit" or "normal mode": revert to verbose commit style.
