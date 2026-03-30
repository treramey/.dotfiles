# Auto-start tmux in Ghostty
if command -q tmux; and status is-interactive; and not set -q TMUX; and test "$TERM_PROGRAM" = ghostty
    exec tmux new-session -A -s main
end
