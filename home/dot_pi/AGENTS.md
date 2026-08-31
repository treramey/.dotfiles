# Pi harness workspace

TypeScript, ESM-only Pi configuration and local extensions. The directory is
stowed to `~/.pi`; edit the dotfiles source, not the generated symlink target.

## Change map

| Change | Source of truth |
| --- | --- |
| Default provider, model, package pins, subagent routing | `agent/settings.json` |
| Codex execution behavior | `agent/pi-codex-conversion.json` |
| Background model choices | `agent/pi-auto-trees.json`, `agent/pi-smart-btw.json`, `agent/pi-subagent-review.json` |
| Local tool-event normalization | `agent/extensions/policy/pi-tool-events.ts` |
| Git, Cloudflare, Worker, Python, or secret policy | matching extension under `agent/extensions/` plus `agent/extensions/tests/` |
| Package-style local extension | `agent/extensions/<name>/` with its own `package.json` |
| Standalone extension | `agent/extensions/<name>.ts` |
| Retired extension reference | `archive/extensions/` |

## Required verification

Run `npm run check` after extension changes. It typechecks retained extension
workspaces and runs the Pi/Codex safety adapter suite. After package or settings
changes, also start `PI_STARTUP_BENCHMARK=1 pi` and inspect the loaded-extension
list for errors and collisions.

## Harness invariants

- Keep third-party packages pinned with exact `npm:<name>@<version>` entries.
- Route shell and file-mutation policy through
  `agent/extensions/policy/pi-tool-events.ts` so Pi and Codex event dialects
  receive the same guardrails.
- Keep `whimsical.ts` active unless a task explicitly replaces its diagram
  integration.
- Use `pi-web-access` as the active web layer. The old custom OpenCode provider
  and web tools live in `archive/extensions/` for rollback only.
- Treat archived code as inactive reference. Restore it to `agent/extensions/`
  and update workspace scripts before expecting Pi to load or test it.
- Keep runtime state out of Git; `.gitignore` explicitly permits only tracked
  configuration files beneath `agent/`.
- Preserve ESM and the strict TypeScript options already used by each workspace.
