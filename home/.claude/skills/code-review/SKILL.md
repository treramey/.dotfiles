---
name: code-review
description: Multi-agent code review with parallel reviewers and deep oracle validation. Spawns 3 independent reviewer agents to find bugs, then an oracle agent verifies accuracy against full codebase context. Use when user says "review", "code review", "review my changes", "review this PR", provides a PR/MR URL, asks to "check my code", or wants feedback on uncommitted changes. Also trigger for "what did I break", "any bugs in this", or "sanity check these changes".
---

# Code Review

Multi-pass code review: 3 parallel reviewer agents find issues, then an oracle agent validates findings for accuracy and correctness.

The reason for 3 independent reviewers is that each one explores different angles — like having three senior engineers review a PR independently before comparing notes. This catches issues that any single pass would miss, and the correlation step filters out false positives.

## Input

The user may provide:
- Nothing (review uncommitted changes)
- A PR/MR number or URL
- Specific guidance ("focus on the auth changes", "worried about the migration")

## Workflow

### 1. Detect VCS

Check for `.jj/` directory first — if present, use jj. Otherwise use git.

```bash
if jj root &>/dev/null; then echo "jj"
elif git rev-parse --show-toplevel &>/dev/null; then echo "git"
else echo "none"
fi
```

### 2. Gather the Diff

**Uncommitted changes (default):**
- jj: `jj diff`
- git: `git diff` (unstaged) + `git diff --cached` (staged)

**If no uncommitted changes**, fall back to last commit:
- jj: `jj diff -r @-`
- git: `git diff HEAD~1`

**PR/MR URL or number:**
- GitHub: `gh pr view <number> --comments` + `gh pr diff <number>`
- GitLab: `glab mr view <number> --comments` + `glab mr diff <number>`
- Azure DevOps: `az repos pr show --id <number>` + diff via API

If a full URL is provided, parse out the number and repo. Use `--repo owner/repo` if needed.

### 3. Spawn 3 Reviewer Agents (Parallel)

Launch all 3 in a single message using the Agent tool. Each reviewer gets the same diff but operates independently. Read `references/reviewer-agent.md` for the full reviewer prompt.

Pass each reviewer:
- The full diff
- User guidance (if any)
- Instruction to read full files for context (diffs alone aren't enough)

```
Agent(description="code review 1/3",
  prompt="<reviewer-agent instructions>\n\nDiff:\n<diff>\n\nGuidance: <user guidance>")

Agent(description="code review 2/3",
  prompt="<reviewer-agent instructions>\n\nDiff:\n<diff>\n\nGuidance: <user guidance>")

Agent(description="code review 3/3",
  prompt="<reviewer-agent instructions>\n\nDiff:\n<diff>\n\nGuidance: <user guidance>")
```

### 4. Correlate Findings

Once all 3 reviewers return, merge their findings:

1. **Deduplicate** — group issues pointing at the same code location
2. **Rank by severity** — bugs > security > structure > performance > style
3. **Note consensus** — issues found by 2+ reviewers are higher confidence
4. **Discard noise** — single-reviewer style nits with no real impact

Produce a consolidated findings list with:
- Severity (critical / high / medium / low)
- File path + line number
- Description
- How many reviewers flagged it
- Suggested fix (if provided)

### 5. Oracle Review (Do Not Skip)

The oracle validates every finding against the broader codebase. A reviewer might flag something as a bug that's actually correct given surrounding context. The oracle catches these false positives.

Read `references/oracle-agent.md` for the full oracle prompt.

Pass the oracle:
- The consolidated findings list
- The diff
- Instruction to read surrounding code, check abstractions, verify each finding

```
Agent(description="oracle deep review",
  prompt="<oracle-agent instructions>\n\nConsolidated findings:\n<findings>\n\nDiff:\n<diff>")
```

Apply oracle recommendations: remove false positives, adjust severity, add missed issues.

### 6. Final Report

```markdown
# Code Review Summary

**Scope:** {uncommitted changes | PR #N | last commit}
**Reviewers:** 3 independent + oracle validation

## Critical / High

{Each finding: file:line, description, consensus count, fix suggestion}

## Medium

{...}

## Low

{...}

## Oracle Notes

{Any architectural concerns or cross-cutting observations}
```

If no issues found, say so directly — don't manufacture feedback.

## Anti-Patterns

- **Reviewing pre-existing code** — only review the changes, not code that wasn't modified
- **Style zealotry** — some "violations" are fine when they're the simplest option
- **Hypothetical bugs** — don't invent problems; if an edge case matters, explain the realistic scenario
- **Skipping oracle** — the oracle catches false positives that waste the developer's time
- **Overstating severity** — be honest about impact; a minor style issue isn't "critical"
