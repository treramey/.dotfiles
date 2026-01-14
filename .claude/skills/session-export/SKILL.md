---
name: session-export
description: Update GitHub PR or GitLab MR descriptions with AI session export summaries. Use when user asks to add session summary to PR/MR or document AI assistance.
---

# Session Export

Update PR/MR descriptions with a structured summary of the AI-assisted conversation.

## Output Format

```markdown
> [!NOTE]
> This PR was written with AI assistance.

<details><summary>AI Session Export</summary>
<p>

\`\`\`json
{
  "info": {
    "title": "<brief task description>",
    "agent": "claude-code",
    "models": ["<model(s) used>"]
  },
  "summary": [
    "<action 1>",
    "<action 2>"
  ]
}
\`\`\`

</p>
</details>
```

## Workflow

### 1. Generate Summary JSON

From conversation context, create summary:

- **title**: 2-5 word task description (lowercase)
- **agent**: "claude-code"
- **models**: array of models used
- **summary**: array of terse action statements
  - Use past tense ("added", "fixed", "created")
  - Start with "user requested..." or "user asked..."
  - Chronological order
  - Max 25 turns
  - **NEVER include sensitive data**

### 2. Update PR/MR Description

**GitHub:**
```bash
gh pr edit <PR_NUMBER> --body "$(cat <<'EOF'
<existing description>

> [!NOTE]
> This PR was written with AI assistance.

<details><summary>AI Session Export</summary>
...
</details>
EOF
)"
```

**GitLab:**
```bash
glab mr update <MR_NUMBER> --description "..."
```

### 3. Preserve Existing Content

Always fetch and preserve existing PR/MR description:

```bash
# GitHub
gh pr view <PR_NUMBER> --json body -q '.body'

# GitLab
glab mr view <MR_NUMBER> --output json | jq -r '.description'
```

## Security

**NEVER include in summary:**
- API keys, tokens, secrets
- Passwords, credentials
- Environment variable values
- Private URLs with auth tokens
- Personal identifiable information
