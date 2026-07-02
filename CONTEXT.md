# Context

## Domain Terms

### Theme Mode

The seam every themed config branches on, computed at apply time by
`home/.chezmoitemplates/theme-mode` (probes `~/.local/share/omarchy`).
`dynamic` — Omarchy owns the palette: configs use ANSI colors and the
Theme Hot-Reload Hook recolors the rest. `static` — no Omarchy: configs
pin Rose Pine dark. Templates must branch on this, never on ad-hoc
`is_omarchy`/`is_arch` probes (those are for platform concerns only).

### Rose Pine Palette

The single palette source, `home/.chezmoidata/rose-pine.toml`
(`.rose_pine.*`). Any templated config that needs a Rose Pine color
interpolates it; hex literals for palette colors in templates are drift.
Native-format theme files (bat `.tmTheme`, fish `.theme`, Ghostty's
built-in theme) stay as checked-in adapters.

### Theme Hot-Reload Hook

`~/.config/omarchy/hooks/theme-set` — Omarchy calls it with the new theme
name on every switch. One inline adapter per tool; all runtime state goes
to `~/.cache` (nvim trigger file, `delta-features.gitconfig`), never into
chezmoi-managed files.

### Theme Catalog (Neovim)

`theme_switcher.lua`'s registry, keyed by nvim-native slugs
(`rose-pine-main`, `rose-pine-dawn`, …). Omarchy theme names enter only
through `omarchy_aliases` at the trigger/state input edge.

### Formatter Registry (Neovim)

The filetype→formatter table in `plugin/23_format.lua` (conform's
`formatters_by_ft`) — the single place that answers "what formats
filetype X". Project-dependent formatters gate themselves with
conditions. Formatter wiring belongs here, never in per-filetype
`after/ftplugin` files (those are for genuinely filetype-local editor
settings).

### .NET Toolchain

The Neovim configuration slice that makes C#/.NET development work end to end:
SDK discovery, Roslyn language server setup, easy-dotnet commands, build/test/run
terminals, launch settings lookup, and debugger integration.

