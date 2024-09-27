#!/usr/bin/env zsh

fpath=($ZDOTDIR/plugins $fpath)

# +------------+
# | NAVIGATION |
# +------------+
setopt auto_pushd           # Push the old directory onto the stack on cd.
setopt pushd_ignore_dups    # Do not store duplicates in the stack.
setopt pushd_silent         # Do not print the directory stack after pushd or popd.
setopt auto_cd

# setopt correct              # Spelling correction
setopt cdable_vars          # Change directory to a path stored in a variable.
setopt extended_glob        # Use extended globbing syntax.

# +---------+
# | HISTORY |
# +---------+
setopt extended_history          # Write the history file in the ':start:elapsed;command' format.
setopt share_history             # Share history between all sessions.
setopt hist_expire_dups_first    # Expire a duplicate event first when trimming history.
setopt hist_ignore_dups          # Do not record an event that was just recorded again.
setopt hist_ignore_all_dups      # Delete an old recorded event if a new event is a duplicate.
setopt hist_find_no_dups         # Do not display a previously found event.
setopt hist_ignore_space         # Do not record an event starting with a space.
setopt hist_save_no_dups         # Do not write a duplicate event to the history file.
setopt hist_verify               # Do not execute immediately upon history expansion.

# Overrider colors
# fix: linxu: dircolors, macos: gdircolors
# eval "$(gdircolors -b $ZDOTDIR/dircolors)"

# +-------+
# | alias |
# +-------+
source $ZDOTDIR/scripts/alias.zsh

# +------------+
# | cpmpletion |
# +------------+
source $ZDOTDIR/scripts/completion.zsh


# +---------------------+
# | SYNTAX HIGHLIGHTING |
# +---------------------+
# TO set activate highlighter
ZSH_HIGHLIGHT_HIGHLIGHTERS=(main brackets pattern cursor)

# Declare the variable
typeset -A ZSH_HIGHLIGHT_STYLES

# To differentiate aliases from other command types
ZSH_HIGHLIGHT_STYLES[alias]='fg=#94e2d5,bold'

# To have paths colored instead of underlined
ZSH_HIGHLIGHT_STYLES[path]='fg=#cba6f7'

source $ZDOTDIR/plugins/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh

# +-----------------+
# | autosuggestions |
# +-----------------+
source $ZDOTDIR/plugins/zsh-autosuggestions/zsh-autosuggestions.zsh

# +----------+
# | worktree |
# +----------+
source $ZDOTDIR/plugins/zsh-git-worktrees/zsh-git-worktrees.zsh


# +----------+
# | starship |
# +----------+
eval "$(starship init zsh)"

# +--------+
# | zoxide |
# +--------+
eval "$(zoxide init zsh)"

# +-----+
# | fnm |
# +-----+
eval "$(fnm env --use-on-cd)"

# +--------+
# | python |
# +--------+
eval "$(pyenv init -)"


# pnpm
export PNPM_HOME="/Users/TRamey/.local/share/pnpm"
case ":$PATH:" in
  *":$PNPM_HOME:"*) ;;
  *) export PATH="$PNPM_HOME:$PATH" ;;
esac
# pnpm end

+vi-worktree-fix() {
    hook_com[base-name]=${$(git worktree list --porcelain)[2]:t}
}

zstyle ':vcs_info:git+set-message:*' hooks worktree-fix

# Add .NET Core SDK tools
export PATH="$PATH:$HOME/.dotnet/tools"

export PATH="/usr/local/opt/krb5/bin:$PATH"
export PATH="/usr/local/opt/krb5/sbin:$PATH"
export LDFLAGS="-L/usr/local/opt/krb5/lib"
export CPPFLAGS="-I/usr/local/opt/krb5/include"

