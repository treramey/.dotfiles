---
name: prd
description: Create Product Requirements Documents (PRDs) that define the end state of a feature. Use when planning new features, migrations, or refactors. Generates structured PRDs with acceptance criteria.
---

# PRD Creation Skill

Create Product Requirements Documents suitable for RFC review by Principal Engineers, Designers, and Product Owners.

The PRD describes WHAT to build and WHY, not HOW or in WHAT ORDER.

## Workflow

1. User requests: "Load the prd skill and create a PRD for [feature]"
2. **Ask clarifying questions** to build full understanding
3. **Explore codebase** to understand patterns, constraints, and dependencies
4. Generate markdown PRD to `prd-<feature-name>.md` in project root

## Clarifying Questions

Ask questions across these domains (5-7 at most):

### Problem & Motivation
- What problem does this solve? Who experiences it?
- What's the cost of NOT solving this?
- Why now? What triggered this work?

### Users & Stakeholders
- Who are the primary users? Secondary users?

### End State & Success
- What does "done" look like? How will users interact with it?

### Scope & Boundaries
- What's explicitly OUT of scope?
- What's deferred to future iterations?

### Constraints & Requirements
- Performance requirements?
- Security requirements?
- Compatibility requirements?
- Accessibility requirements?

### Risks & Dependencies
- What could go wrong? Technical risks?
- External service dependencies?

## Output Format

Save to `prd-<feature-name>.md` (project root):

```markdown
# PRD: <Feature Name>

**Date:** <YYYY-MM-DD>

---

## Problem Statement

### What problem are we solving?
Clear description including user and business impact.

### Why now?
What triggered this work? Cost of inaction?

### Who is affected?
- **Primary users:** Description
- **Secondary users:** Description

---

## Proposed Solution

### Overview
One paragraph describing what this feature does when complete.

### User Experience (if applicable)
How will users interact with this feature?

---

## End State

When this PRD is complete, the following will be true:

- [ ] Capability 1 exists and works
- [ ] All acceptance criteria pass
- [ ] Tests cover the new functionality

---

## Acceptance Criteria

### Feature: <Name>
- [ ] Criterion 1
- [ ] Criterion 2

---

## Technical Context

### Existing Patterns
- Pattern 1: `src/path/to/example.ts` - Why relevant

### Key Files
- `src/relevant/file.ts` - Description

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Risk 1 | High/Med/Low | High/Med/Low | Mitigation |

---

## Non-Goals (v1)

- Thing we're not building - why deferred

---

## Open Questions

| Question | Owner | Status |
|----------|-------|--------|
| Question 1 | Name | Open/Resolved |
```

## Key Principles

- **Problem Before Solution**: Lead with the problem, not the solution
- **Define End State, Not Process**: Describe WHAT exists when done, not implementation order
- **Technical Context Enables Autonomy**: Show existing patterns to follow
- **Non-Goals Prevent Scope Creep**: Explicit boundaries help stay focused
