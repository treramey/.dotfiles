# CLAUDE.md

- Be extremely concise. Sacrifice grammar for concision.

## Code Quality Standards

- Make minimal, surgical changes
- **Never compromise type safety**: No `any`, no non-null assertion (`!`), no type assertions (`as Type`)
- **Make illegal states unrepresentable**: Model domain with ADTs/discriminated unions; parse inputs at boundaries into typed structures
- **Abstractions**: Consciously constrained, pragmatically parameterised, doggedly documented

### ENTROPY REMINDER

This codebase will outlive you. Every shortcut becomes someone else's burden. Every hack compounds into technical debt.

You are shaping the future of this project. The patterns you establish will be copied. The corners you cut will be cut again.

**Fight entropy. Leave the codebase better than you found it.**

## Testing

- Write tests that verify semantically correct behavior
- **Failing tests are acceptable** when they expose genuine bugs and test correct behavior

## SCM, Git, Pull Requests, Commits

- **ALWAYS check for `.jj/` dir before ANY VCS command** - if present, use jj not git
- **Never** add Claude to attribution or as a contributor in PRs, commits, or messages
- **gh CLI available** for GitHub operations (PRs, issues, etc.)
- **glab CLI available** for GitLab operations
- **az repos CLI available** for Azure DevOps operations

## Plans

- At the end of each plan, give a list of unresolved questions if any. Make questions extremely concise.
