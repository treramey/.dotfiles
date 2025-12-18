# AGENTS.md

This file provides detailed guidance for AI agents working with this dotfiles repository.

## Repository Overview

macOS dotfiles managed with GNU Stow. Configuration files in `.config/` are symlinked to `$HOME/.config/`.

**Core Stack:** Zsh + Neovim + Tmux + Git + AeroSpace

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

## Window Management (AeroSpace + skhd)

**AeroSpace** (`.config/aerospace/aerospace.toml`):
- Tiling window manager with workspace routing rules
- Auto-assigns apps to workspaces on detection
- Gap configuration: 5px inner gaps

**skhd** (`.config/skhd/skhdrc`):
- Hotkey daemon using `lalt` (left alt) as modifier
- Workspace switching: `lalt-[1-5]`
- Window movement: `lalt-shift-[hjkl]` or `lalt-shift-[1-5]`
- Window focus: `lalt-[hjkl]` (vim-style)
- Resize: `lalt-ctrl-[np]`

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

**Stow Structure:**
- Root-level configs stowed to `$HOME` (e.g., `.zshrc`)
- `.config/` directory stowed to `$HOME/.config/`
- Files in `.stow-local-ignore` are never stowed

**Config Modularity:**
- Neovim: modular plugin system in `lua/plugins/` (each file = plugin spec)
- Shell: single `.zshrc` with inline plugin definitions
- Tmux: single config file with plugin declarations

## Development Workflow

When modifying configurations:

1. **Edit files in this repo** (`.dotfiles/`)
2. **Re-stow if needed:** `stow -R .` (only for new files/structure changes)
3. **Reload specific service:**
   - Zsh: `source ~/.zshrc`
   - Tmux: `C-a r`
   - AeroSpace: `aerospace reload-config`
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

- **Services startup:** skhd must be running for keybindings; started via `brew services start skhd`
- **Runtime managers:** mise is used for version management (activated in `.zshrc`)
- **Tmux auto-start:** tmux launches automatically unless in WezTerm or already in tmux/screen
- **Package management:** Brewfile at repo root, install with `brew bundle`

## Scripts

Located in `.local/scripts/`:
- `tmux-sessionizer` - Session picker
- `tmux-kill-sessions` - Bulk session cleanup
- `clone-worktree` - Git worktree helper
- `cht-sh` - Cheatsheet integration
