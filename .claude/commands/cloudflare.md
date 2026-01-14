---
description: Load Cloudflare skill and get contextual guidance for your task
---

Load the Cloudflare platform skill and help with any Cloudflare development task.

## Workflow

### Step 1: Load cloudflare skill

Read `~/.claude/skills/cloudflare/SKILL.md` and the relevant reference files at `~/.config/opencode/skill/cloudflare/references/`.

### Step 2: Identify task type from user request

Analyze $ARGUMENTS to determine:
- **Product(s) needed** (Workers, D1, R2, Durable Objects, etc.)
- **Task type** (new project setup, feature implementation, debugging, config)

Use decision trees in SKILL.md to select correct product.

### Step 3: Read relevant reference files

Based on task type, read from `~/.config/opencode/skill/cloudflare/references/<product>/`:

| Task | Files to Read |
|------|---------------|
| New project | `README.md` + `configuration.md` |
| Implement feature | `README.md` + `api.md` + `patterns.md` |
| Debug/troubleshoot | `gotchas.md` |

### Step 4: Execute task

Apply Cloudflare-specific patterns and APIs from references to complete the user's request.

### Step 5: Summarize

```
=== Cloudflare Task Complete ===

Product(s): <products used>
Files referenced: <reference files consulted>

<brief summary of what was done>
```

<user-request>
$ARGUMENTS
</user-request>
