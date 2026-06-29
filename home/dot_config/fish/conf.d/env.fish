source "$HOME/.local/share/../bin/env.fish"

# Environment variables
set -gx XDG_CONFIG_HOME "$HOME/.config"

# Pi image previews can use Kitty graphics passthrough inside tmux when the
# outer terminal supports it. Other terminals fall back to ANSI block previews.
if test "$TERM_PROGRAM" = ghostty; or test "$TERM_PROGRAM" = kitty; or test "$TERM_PROGRAM" = WezTerm; or set -q KITTY_WINDOW_ID; or set -q WEZTERM_PANE
    set -gx PI_TMUX_IMAGE_PROTOCOL kitty
end

# Use the user-systemd ssh-agent socket. It persists for the whole login
# session so unlocked key passphrases stay cached across all terminals/tmux
# panes. (The previous gcr-ssh-agent re-prompted on every use.)
if set -q XDG_RUNTIME_DIR; and test -S "$XDG_RUNTIME_DIR/ssh-agent.socket"
    set -gx SSH_AUTH_SOCK "$XDG_RUNTIME_DIR/ssh-agent.socket"
end

# Keep already-running tmux servers pointed at the current SSH agent.
# This prevents `tv ssh` sessions from asking for an SSH key passphrase again.
if status is-interactive; and command -q tmux
    if set -q SSH_AUTH_SOCK
        tmux set-environment -g SSH_AUTH_SOCK "$SSH_AUTH_SOCK" >/dev/null 2>&1
        tmux set-environment -gu SSH_AGENT_PID >/dev/null 2>&1
    end
    if set -q PI_TMUX_IMAGE_PROTOCOL
        tmux set-environment -g PI_TMUX_IMAGE_PROTOCOL "$PI_TMUX_IMAGE_PROTOCOL" >/dev/null 2>&1
    end
end

set -gx EZA_CONFIG_DIR "$HOME/.config/eza"
set -gx EDITOR nvim

# .NET / Azure DevOps
set -gx ARTIFACTS_CREDENTIALPROVIDER_SESSIONTOKENCACHE_ENABLED true
set -gx ARTIFACTS_CREDENTIALPROVIDER_MSAL_FILECACHE_ENABLED true
