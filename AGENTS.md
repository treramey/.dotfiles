# AGENTS.md

This file provides detailed guidance for AI agents working with this dotfiles repository.

## Repository Overview

Arch Linux dotfiles managed with chezmoi. Configuration files in `dot_config/` are templated/copied to `$HOME/.config/`.

**Core Stack:** Zsh + Neovim + Tmux + Git + Hyprland

## Shell Setup (Zsh)

**Plugin Manager:** zinit (auto-installed to `~/.local/share/zinit/`)

**Plugins loaded:**
- fzf-tab (fuzzy tab completion)
- fast-syntax-highlighting
- zsh-completions
- zsh-autosuggestions
- OMZ snippets: bun, gh, command-not-found

**Integrations:**
- oh-my-posh prompt (config in `.config/ohmyposh/theme.toml`)
- zoxide (cd command override)
- fzf (with custom rose-pine theme)
- gum filter (ctrl-t binding)
- mise (runtime version manager)

**Key Aliases:**
```bash
v/vim     # nvim
lg        # lazygit
l/ls      # eza with colors/icons
g         # git
howdy     # custom fetch script
pray      # bun install
```

**History:** 5000 lines, deduplication enabled

## Neovim Configuration

**Entry Flow:**
1. `init.lua` → `require("treramey.init")`
2. Loads core configs: `options.lua`, `commands.lua`, `keymaps.lua`, `lazy.lua`
3. Custom `statusline.lua` implementation
4. Lazy loads plugins from `lua/plugins/` directory

**Key Directories:**
- `lua/treramey/` - Core user configuration
- `lua/plugins/` - Plugin specifications (one file per plugin)

**Plugin Manager:** Lazy.nvim with lazy-loading enabled by default

**Notable Plugins:**
- **LSP:** lsp.lua, typescript_tools.lua, lazydev.lua
- **Completion:** blink.lua, luasnip.lua
- **Git:** git.lua, git_conflict.lua, git_worktree.lua
- **UI:** snacks.lua, dressing.lua, render_markdown.lua
- **Development:** dap.lua, dotnet.lua, tsc.lua, conform.lua
- **Navigation:** oil.lua, harpoon.lua, smart_splits.lua

**Language Support:** C#, Go, TypeScript, Python, Lua, ColdFusion

## Tmux Configuration

**Plugin Manager:** TPM (Tmux Plugin Manager)

**Plugins:**
- `tmux-sensible` - sensible defaults
- `smart-splits.nvim` - vim-aware pane navigation
- `tokyo-night-tmux` - themed status bar (rose-pine variant)

**Key Features:**
- Prefix: `C-a` (instead of `C-b`)
- Base index: 1 (windows and panes)
- Status bar at top with relative path display
- Vim-style pane navigation (hjkl)
- Sesh integration for session management
- Extended keys enabled for modifier support
- Auto-starts on shell launch (except in WezTerm)

**Keybindings:**
```
C-a f    # Sesh session picker (gum filter)
C-a L    # Last session (via sesh)
C-a g    # Lazygit in new window
C-a G    # gh dash popup
C-a r    # Reload tmux.conf
C-a |    # Split horizontal (retains path)
C-a -    # Split vertical (retains path)
C-a hjkl # Vim-style pane navigation
```

## Window Management (Hyprland)

**Hyprland** (`.config/hypr/`):
- Tiling Wayland compositor with workspace routing rules
- Auto-assigns apps to workspaces via window rules
- Configurable gaps, borders, and animations

## Terminal (Ghostty)

**Theme:** Rose Pine (system light/dark switching)

**Settings:**
- Font: MonoLisa Variable, 14pt
- Background opacity: 90% with blur
- No titlebar, block cursor

## Runtime Management (mise)

**Managed tools** (`.config/mise/config.toml`):
- bun, node, python, rust, dotnet, powershell
- Shims available at `~/.local/share/mise/shims/`
- Neovim PATH includes mise shims for LSP server access

## File Organization Patterns

**Chezmoi Structure:**
- `.chezmoiroot` points to `home/` as the source directory
- `dot_` prefix maps to `.` in target (e.g., `dot_config/` → `$HOME/.config/`)
- Templates use `.tmpl` suffix for machine-specific config
- `.chezmoiignore` controls which files are skipped during apply

**Config Modularity:**
- Neovim: modular plugin system in `lua/plugins/` (each file = plugin spec)
- Shell: single `.zshrc` with inline plugin definitions
- Tmux: single config file with plugin declarations

## Development Workflow

When modifying configurations:

1. **Edit files in this repo** (`.dotfiles/`)
2. **Apply changes:** `chezmoi apply` (or `chezmoi apply ~/.config/specific/path`)
3. **Reload specific service:**
   - Zsh: `source ~/.zshrc`
   - Tmux: `C-a r`
   - Hyprland: config auto-reloads on save
   - Neovim: restart or `:Lazy reload <plugin>`

## Theme Consistency

Rose Pine theme applied throughout:
- Ghostty terminal
- FZF search
- Bat syntax highlighting
- Eza file listing
- Delta git diffs
- Oh-my-posh prompt
- Tmux status bar

## Important Notes

- **Runtime managers:** mise is used for version management (activated in `.zshrc`)
- **Tmux auto-start:** tmux launches automatically unless in WezTerm or already in tmux/screen
- **Package management:** pacman / yay (Arch Linux)

## Scripts

Located in `.local/scripts/`:
- `tmux-sessionizer` - Session picker
- `tmux-kill-sessions` - Bulk session cleanup
- `clone-worktree` - Git worktree helper
- `cht-sh` - Cheatsheet integration

<!-- opensrc:start -->

## Source Code Reference

Source code for dependencies is available in `opensrc/` for deeper understanding of implementation details.

See `opensrc/sources.json` for the list of available packages and their versions.

Use this source code when you need to understand how a package works internally, not just its types/interface.

### Fetching Additional Source Code

To fetch source code for a package or repository you need to understand, run:

```bash
npx opensrc <package>           # npm package (e.g., npx opensrc zod)
npx opensrc pypi:<package>      # Python package (e.g., npx opensrc pypi:requests)
npx opensrc crates:<package>    # Rust crate (e.g., npx opensrc crates:serde)
npx opensrc <owner>/<repo>      # GitHub repo (e.g., npx opensrc vercel/ai)
```

<!-- opensrc:end -->