---
description: Git commit and push
allowed-tools: Bash(git:*)
---

Commit and push changes.

Make sure to include the branch name as a prefix like:
`LAAIR-XXXX:`

Prefer to explain WHY something was done from an end user perspective instead of WHAT was done.

Do not use generic messages like "improved agent experience" - be very specific about what user facing changes were made.

If there are changes, do `git pull --rebase` first.
If there are conflicts, DO NOT FIX THEM. Notify me and I will fix them.
