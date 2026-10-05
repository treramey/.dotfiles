This repository owns Omarchy-only dotfiles. Do not add macOS configuration,
Homebrew setup, or Windows provisioning. Windows and Ubuntu WSL belong in
`https://github.com/treramey/dots-windows`.

- Keep application configs plain. Do not add template or override layers.
- Edit source under `home/`. GNU Stow links it into `$HOME` without copying.
- Neovim, Pi, and shared agent skills are whole-directory live links.
  Edits there can affect running tools. `dot stow` preserves dirty submodules.
- Preserve `home/.config/nvim` as the HTTPS submodule from
  `https://github.com/treramey/nvim.git`. Its shared configuration has separate
  ownership. Do not remove its platform support during dotfiles cleanup.
- Use Fish for shell configuration and `wl-copy` and `wl-paste` for clipboard
  integration. Keep tool pins in `home/.config/mise/config.toml`.
- Let Omarchy own the palette at `~/.local/state/omarchy/current/theme/`.
  Keep generated palettes, credentials, and runtime state out of Git, including
  `home/.pi/agent/themes/omarchy-system.json`.
- Keep Herdr settings and keybindings in `home/.config/herdr/config.toml`.
  Use its terminal theme directly, without merging packaged defaults or
  generating custom Sesh colors.
- Treat `/usr/share/omarchy/` as read-only. Put durable customizations in owned
  configs and hooks, not generated active theme files.
- If dependency internals are needed and dependency inspection is in scope,
  consult `opensrc/sources.json` when available. Use `npx opensrc <package>`
  or `npx opensrc <owner>/<repo>` to fetch missing references.

<!-- agent-repos:start -->
## Vendored Repositories

This project vendors external repositories under @repos/ for coding-agent reference.

- Use vendored repositories as read-only reference material when working with related libraries.
- Prefer examples and patterns from vendored source code over generated guesses or web search results.
- Do not edit files under @repos/ unless explicitly asked.
- Do not import from @repos/; application code should continue importing from normal package dependencies.

Vendored repositories currently available:

When working with a related library, inspect its vendored repository for idiomatic usage, tests, module structure, API design, examples, and docs. If the vendored repository contains agent-oriented guidance such as LLMS.md, AGENTS.md, or AGENT.md, read that guidance before making changes.

When repeatedly working with a vendored library, consider creating a project-local pattern file under agent-patterns/ (for example, agent-patterns/<library>-<topic>.md) that summarizes the implementation, tests, docs, common constructors/combinators, examples, error-handling patterns, and what to avoid.
<!-- agent-repos:end -->
