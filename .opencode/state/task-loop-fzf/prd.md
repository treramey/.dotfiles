# PRD: Task Loop FZF Integration

**Date:** 2026-01-15

---

## Problem Statement

### What problem are we solving?
Running `task-loop` requires knowing and typing the exact PRD feature name. User must remember or look up PRD names manually.

### Why now?
Quality of life improvement for PRD-driven workflow.

### Who is affected?
- **Primary users:** Developer using task-loop for autonomous task execution

---

## Proposed Solution

### Overview
Add fzf-based PRD selection to `task-loop`. When invoked without a feature argument, fzf displays available PRDs with completion status. User selects one to continue.

### User Experience

#### User Flow: Select PRD via fzf
1. User runs `task-loop` (no args)
2. fzf opens showing PRDs: `auth [3/7]`, `api-refactor [0/4]`
3. User fuzzy-searches and selects
4. Loop begins for selected PRD

#### User Flow: No PRDs exist
1. User runs `task-loop` (no args)
2. fzf opens with empty list
3. User sees nothing, exits with ctrl-c or esc
4. Script exits gracefully

---

## End State

When this PRD is complete, the following will be true:

- [ ] `task-loop` without args launches fzf picker
- [ ] fzf displays PRD names with completion status `name [done/total]`
- [ ] Searches both `.opencode/state/` and `.claude/state/` dirs
- [ ] Empty state (no PRDs) shows empty fzf, user exits manually
- [ ] Explicit `<feature>` arg bypasses fzf (current behavior preserved)
- [ ] Default tool remains `opencode`

---

## Acceptance Criteria

### FZF Integration
- [ ] fzf launches when `<feature>` arg omitted
- [ ] Display format: `<prd-name> [<passed>/<total>]`
- [ ] Completion calculated from `tasks[].passes` in `prd.json`
- [ ] Exits cleanly on fzf cancel (ctrl-c/esc)

### State Discovery
- [ ] Searches current directory for `.opencode/state/*/prd.json`
- [ ] Searches current directory for `.claude/state/*/prd.json`
- [ ] Handles missing state dirs gracefully

### Backward Compatibility
- [ ] `task-loop <feature>` works as before (no fzf)
- [ ] `--tool` and `--max-iterations` flags unchanged

---

## Technical Context

### Existing Patterns
- fzf usage: `sesh` integration in tmux.conf uses fzf/gum for selection
- jq for JSON parsing: already used in complete-next-task workflow

### Key Files
- `.local/scripts/task-loop` - Script to modify

### System Dependencies
- `fzf` - fuzzy finder (already installed)
- `jq` - JSON processor (already installed)

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| No jq installed | Low | High | Check for jq, error with install hint |
| No fzf installed | Low | High | Check for fzf, error with install hint |
| Malformed prd.json | Low | Med | Default to `[?/?]` on parse error |

---

## Non-Goals (v1)

- Creating PRDs from fzf interface - separate workflow
- Filtering by completion status - unnecessary complexity
- Multi-select PRDs - one at a time is fine

---

## Open Questions

None.
