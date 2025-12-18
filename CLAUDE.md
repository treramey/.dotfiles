# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a macOS dotfiles repository managed with GNU Stow. The configuration files are organized in `.config/` and use Stow's symlink mechanism to deploy configurations to `$HOME`.

## Installation & Setup

**Initial Setup:**

```bash
./install.sh
```

This script will:

- Install Homebrew and all packages from `Brewfile`
- Start services (skhd)
- Set macOS defaults (window dragging gestures, disable animations)
- Stow dotfiles to `$HOME`
- Install required fonts (sketchybar-app-font, sketchybar-app-font-bg)

**Stow Management:**

```bash
# Deploy dotfiles (from repo root)
stow .

# Remove symlinks
stow -D .

# Re-stow (useful after changes)
stow -R .
```

Files matching patterns in `.stow-local-ignore` are excluded from stowing (readme, LICENSE, git files, Brewfile, etc.).

## Key Technologies Stack

- **Window Management**: AeroSpace (tiling WM)
- **Keybindings**: skhd
- **Status Bar**: SketchyBar (Lua-based)
- **Terminal**: Ghostty, tmux (with TPM)
- **Shell**: Zsh with zinit plugin manager
- **Editor**: Neovim (Lazy.nvim plugin manager)
- **Package Management**: Homebrew, mise (runtime manager)
- **Session Management**: sesh (tmux sessions)

## Common Commands

### Homebrew

```bash
# Install/update packages from Brewfile
brew bundle --file=./Brewfile

# Update all packages
brew update && brew upgrade
```

### Services

```bash
# Restart window manager services
brew services restart skhd
aerospace reload-config

# Reload SketchyBar
sketchybar --reload
```

### Shell

```bash
# Reload zsh config
source ~/.zshrc

# Key aliases (from .zshrc)
v        # nvim
g        # git
howdy    # custom fetch script
pray     # bun install
```

### Tmux

```bash
# Tmux is auto-started on shell launch (except in WezTerm)
# Keybindings (prefix: C-a)
C-a T    # sesh session picker (gum filter)
C-a L    # last sesh session
C-a g    # lazygit popup
C-a G    # gh dash popup
C-a r    # reload tmux.conf
```

### Neovim

```bash
# Main config entry: .config/nvim/init.lua
# Uses Lazy.nvim with plugins imported from lua/plugins/
# Custom statusline in lua/statusline.lua
```

## Architecture & Structure

### Window Management (AeroSpace + skhd)

**AeroSpace** (`.config/aerospace/aerospace.toml`):

- Tiling window manager with workspace routing rules
- Auto-assigns apps to workspaces on detection (browsers→1, terminals/editors→2)
- Triggers SketchyBar updates on workspace/focus changes
- Gap configuration: 5px inner, 40px top (for bar), 5px other sides

**skhd** (`.config/skhd/skhdrc`):

- Hotkey daemon using `lalt` (left alt) as modifier
- Workspace switching: `lalt-[1-5]`
- Window movement: `lalt-shift-[hjkl]` or `lalt-shift-[1-5]`
- Window focus: `lalt-[hjkl]` (vim-style)
- Resize: `lalt-ctrl-[np]`
- Join windows: `lalt-e/v`

### SketchyBar

**Architecture** (`.config/sketchybar/`):

- Entry point: `sketchybarrc` → loads Lua-based config
- Main init: `init.lua` loads helpers, bar, items
- **Structure:**
  - `bar.lua` - bar configuration
  - `settings.lua`, `colors.lua`, `icons.lua` - theme/styling
  - `default.lua` - default item properties
  - `items/` - modular bar items (spaces, apps, widgets)
  - `items/widgets/` - wifi, battery, volume, calendar, media, messages
  - `helpers/` - helper scripts and utilities
- Media streaming handled via `helpers/media-stream.sh` (started by AeroSpace)
- Updates triggered by AeroSpace workspace/focus events

### Neovim Configuration

**Entry Flow:**

1. `init.lua` → sets up lazy.nvim
2. Loads core configs: `autocmds.lua`, `options.lua`, `mappings.lua`
3. Custom `statusline.lua` (custom implementation)
4. Lazy loads plugins from `lua/plugins/` directory

**Key Directories:**

- `lua/plugins/` - plugin specifications (e.g., snacks.lua)
- `lua/lang/` - language-specific configs
- `lua/dap-config/` - debugger configurations
- `lua/utils/` - utility functions

**Plugin Manager:** Lazy.nvim with lazy-loading enabled by default, single border UI

### Shell Setup (Zsh)

**Plugin Manager:** zinit (auto-installed to `~/.local/share/zinit/`)

**Plugins loaded:**

- fzf-tab (fuzzy tab completion)
- fast-syntax-highlighting
- zsh-completions
- zsh-autosuggestions
- OMZ snippets: bun, gh, command-not-found

**Integrations:**

- oh-my-posh prompt (config in `~/.config/ohmyposh/theme.toml`)
- zoxide (cd command override)
- fzf (with custom rose-pine theme)
- gum filter (ctrl-t binding)
- mise (runtime version manager)

**History:** 5000 lines, deduplication enabled

### Tmux Configuration

**Plugin Manager:** TPM (Tmux Plugin Manager)

**Plugins:**

- `tmux-sensible` - sensible defaults
- `tokyo-night-tmux` - themed status bar (using rose-pine variant)

**Key Features:**

- Prefix: `C-a` (instead of `C-b`)
- Base index: 1 (windows and panes)
- Auto-starts on shell launch (except in WezTerm)
- Status bar at top with relative path display
- Vim-style pane navigation (hjkl)
- Sesh integration for session management (gum filter picker)
- Development popups: lazygit, gh dash
- Splits retain current path

## File Organization Patterns

**Stow Structure:**

- Root-level configs stowed to `$HOME` (e.g., `.zshrc`)
- `.config/` directory stowed to `$HOME/.config/`
- Files in `.stow-local-ignore` are never stowed

**Config Modularity:**

- Neovim: modular plugin system in `lua/plugins/` (each file = plugin spec)
- SketchyBar: modular items in `items/` and `items/widgets/`
- Shell: single `.zshrc` with inline plugin definitions

## Development Workflow

When modifying configurations:

1. **Edit files in this repo** (`.dotfiles/`)
2. **Re-stow if needed:** `stow -R .` (only for new files/structure changes)
3. **Reload specific service:**
   - Zsh: `source ~/.zshrc`
   - Tmux: `C-a r`
   - SketchyBar: `sketchybar --reload`
   - AeroSpace: `aerospace reload-config` (or `lalt-shift-r`)
   - Neovim: restart or `:Lazy reload <plugin>`

## Important Notes

- **Services startup:** skhd must be running for keybindings; started via `brew services start skhd`
- **Font dependencies:** sketchybar requires custom fonts installed by `install.sh`
- **Runtime managers:** mise is used for version management (activated in `.zshrc:123`)
- **Tmux auto-start:** tmux launches automatically unless in WezTerm or already in tmux/screen
