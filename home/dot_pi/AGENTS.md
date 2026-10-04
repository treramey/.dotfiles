# Pi harness workspace

Minimal Pi setup based on `@howaboua/pi-stuff`, with local Herdr integration
and local skills preserved from the previous configuration.

## Change map

| Change | Source of truth |
| --- | --- |
| Default provider, model, package sources | `agent/settings.json` |
| Reliable print-mode `/review` fallback | `agent/extensions/review-print-subagent.ts` |
| Codex execution behavior | `agent/pi-codex-conversion.json` |
| Mise-managed Pi launcher | `../dot_local/bin/executable_pi` |
| Herdr integration state | `agent/extensions/herdr-agent-state.ts` |
| Personal skills | global `~/.agents/skills/` live workspace |

## Notes

- Keep third-party Pi package sources unversioned (`npm:<name>`) so
  `pi update --extensions` can update them. Update Pi itself through Omarchy/Mise.
- Use Omarchy's Mise launcher pattern with `npm:@earendil-works/pi-coding-agent`.
  The standalone Pi 0.87.0 build fails to resolve semantic grep's SQLite dependency;
  the npm build works with the configured Node runtime.
- Use `openai-codex/gpt-6-luna` as the everyday default; `/sol` remains the
  explicit quality-first switch for heavier work.
- The packages from `@howaboua/pi-stuff` are listed individually because the
  published `0.0.74` aggregate cannot resolve `@howaboua/pi-pet`. The package
  set includes `pi-shepherdr` for Herdr orchestration. The deprecated
  `pi-dynamic-tools` package is omitted because Codex conversion provides its
  implementation and loading both creates `exec` and `wait` tool conflicts.
- Pi discovers personal skills from the live `~/.agents/skills/` workspace.
- Keep Pi's native skill discovery enabled so personal skills remain available
  alongside the bundle's packaged skills.
- Keep `omarchy-system` as the saved theme. Omarchy's stock theme hook copies
  the generated palette to `agent/themes/omarchy-system.json`; the Pi launcher
  uses the saved theme without extra flags.
- Keep `agent/themes/omarchy-system.json` ignored; it is generated runtime state.
- Prefer the Howaboua versions of overlapping skills. The `skills` exclusions
  in `agent/settings.json` disable the personal code review, research,
  agent-writing, and skill-writing variants without deleting their sources.
- Pi 0.84.4's RPC child can exit without emitting `agent_settled`, while the
  packaged review extension waits for that event for up to 30 minutes. Keep the
  local `/review` extension on print mode until the upstream RPC lifecycle is
  fixed, then remove it and restore the packaged extension together.
- Keep runtime state and credentials out of Git.
