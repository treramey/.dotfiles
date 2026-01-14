---
description: Review changes with parallel review subagents
context: fork
agent: Plan
---

Review code changes using THREE (3) review subagents and correlate results into a summary ranked by severity. Use provided user guidance to steer the review.

Guidance: $ARGUMENTS

First, detect whether repo uses git or jj:
```bash
if jj root &>/dev/null; then echo "jj"
elif git rev-parse --show-toplevel &>/dev/null; then echo "git"
else echo "none"
fi
```

Then use the appropriate VCS commands throughout.

Review uncommitted changes by default. If no uncommitted changes, review the last commit. If user provides a PR/MR number or link, use CLI tools (gh/glab) to fetch and review.
