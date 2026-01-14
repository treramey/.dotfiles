---
name: prd-task
description: Convert markdown PRDs to executable JSON format. Use after creating a PRD with the prd skill to generate the prd.json for autonomous task completion.
---

# PRD Task Skill

Convert markdown PRDs to executable JSON format for autonomous task completion.

## Workflow

1. Read the markdown PRD
2. Extract tasks with verification steps
3. Create `.claude/state/<prd-name>/` directory
4. Output JSON to `.claude/state/<prd-name>/prd.json`

## Output Format

```json
{
  "prdName": "<prd-name>",
  "tasks": [
    {
      "id": "functional-1",
      "category": "functional",
      "description": "User can register with email and password",
      "steps": ["POST /api/auth/register", "Verify 201 response"],
      "passes": false
    }
  ],
  "context": {
    "patterns": ["API routes: src/routes/items.ts"],
    "keyFiles": ["src/db/schema.ts"],
    "nonGoals": ["OAuth/social login"]
  }
}
```

## Conversion Rules

- Each `### Title [category]` becomes a task
- Items under `**Verification:**` become `steps`
- `passes` always starts as `false`
- Keep tasks small - one logical change per task
