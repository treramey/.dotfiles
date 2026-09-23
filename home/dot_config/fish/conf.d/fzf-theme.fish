# fzf.fish uses Omarchy's generated terminal palette.
# ANSI slots follow terminal theme changes without caching theme hex values.
set -l fzf_system_colors \
    --color=16,fg:-1,bg:-1,preview-fg:-1,preview-bg:-1 \
    --color=selected-fg:-1:reverse,selected-bg:-1,selected-hl:4:reverse:underline \
    --color=current-fg:-1:reverse,current-bg:-1,current-hl:4:reverse:underline \
    --color=hl:4:underline,query:-1,prompt:4,pointer:4,marker:2 \
    --color=info:6,spinner:4,header:5,gutter:-1 \
    --color=border:8,preview-border:8,separator:8,scrollbar:8

set -gx FZF_DEFAULT_OPTS \
    --cycle \
    --layout=default \
    --height=90% \
    --preview-window=wrap \
    --marker='*' \
    --no-bold \
    $fzf_system_colors

# fzf.fish appends these per-widget opts after FZF_DEFAULT_OPTS, so this forces
# Ctrl-r history to match the same Omarchy terminal palette.
set -g fzf_history_opts $fzf_system_colors

# fzf.fish: directory preview with eza
set fzf_preview_dir_cmd eza --all --icons --group-directories-first --git --color=never
# `cd` accepts one directory, so keep the directory picker single-select.
set -g fzf_directory_opts --no-multi $fzf_system_colors

# fzf.fish: show hidden files, limit depth
# Override the widget's --color=always so LS_COLORS cannot replace the palette.
set -g fzf_fd_opts --hidden --max-depth 5 --color=never

# fzf.fish: pipe git diffs through delta
set fzf_diff_highlighter delta --paging=never --width=20
