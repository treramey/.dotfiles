# caveman-commit

Terse Conventional Commits by default. Repositories under `~/Code/work` use Azure DevOps ticket prefixes instead.

## Select the format

Check the Git worktree root before writing a message. Resolve symlinks in the root and `~/Code/work`. Use AD# only when the resolved root is `~/Code/work` or a descendant on a directory boundary. Use Conventional Commits everywhere else.

## Conventional Commits

Use `<type>(<scope>): <imperative summary>`, with an optional scope. Keep the subject to 50 characters when possible and no more than 72. Do not end it with a period. Use the project's capitalization convention.

Types include `feat`, `fix`, `refactor`, `perf`, `docs`, `test`, `chore`, `build`, `ci`, `style`, and `revert`.

## Repositories under `~/Code/work`

Use `AD#<ticket-number> <imperative summary>`. Use the actual Azure DevOps ticket number from the user or task context. Ask when it is missing or ambiguous. Do not invent a number or add Conventional Commit markers.

Keep the shared subject and body rules. Add a body only when the reason is not clear, or when the change is breaking, a security fix, a data migration, or a revert.

## Output

Outputs only the message. Does not stage, commit, or amend. Invoke with `/caveman-commit`. It also triggers on phrases such as "write a commit", "commit message", and "generate commit".

## Examples

Default format:

```
feat(api): add GET /users/:id/profile

Mobile client needs profile data without the full user payload
to reduce LTE bandwidth on cold-launch screens.
Closes #128
```

Inside `~/Code/work`:

```
AD#12345 add GET /users/:id/profile

Mobile client needs profile data without the full user payload
to reduce LTE bandwidth on cold-launch screens.
```

## See also

- [`SKILL.md`](./SKILL.md) — full LLM-facing instructions
- [Upstream caveman-commit skill](https://github.com/adriankarlen/dots/blob/main/home/.agents/skills/caveman-commit/SKILL.md)
