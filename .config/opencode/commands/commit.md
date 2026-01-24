---
description: git commit and push
subtask: true
---

commit and push

### Commit
If the remote has IDMI or silvervineinc
- git: `git add -A && git commit -m 'branch: <description>'`

- jj: `jj describe -m 'feat(<scope>): <description>' && jj bookmark create <prdName>/<task-id> && jj new`
- git: `git add -A && git commit -m 'feat(<scope>): <description>'`

Bookmark format: `<prdName>/<task-id>` (e.g., `lib-relay-implementation/types-2`)

prefer to explain WHY something was done from an end user perspective instead of
WHAT was done.

do not do generic messages like "improved agent experience" be very specific
about what user facing changes were made

if there are changes do a git pull --rebase
if there are conflicts DO NOT FIX THEM. notify me and I will fix them
