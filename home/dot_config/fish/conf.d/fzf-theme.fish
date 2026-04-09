# FZF rose-pine theme
set -gx FZF_DEFAULT_OPTS "\
--color=fg:#908caa,bg:-1,hl:#ebbcba \
--color=fg+:#e0def4,bg+:#26233a,hl+:#ebbcba \
--color=border:#403d52,header:#31748f,gutter:#191724 \
--color=spinner:#f6c177,info:#9ccfd8 \
--color=pointer:#c4a7e7,marker:#eb6f92,prompt:#908caa"

# fzf.fish: directory preview with eza
set fzf_preview_dir_cmd eza --all --icons --group-directories-first --git --color=always

# fzf.fish: show hidden files, limit depth
set fzf_fd_opts --hidden --max-depth 5

# fzf.fish: pipe git diffs through delta
set fzf_diff_highlighter delta --paging=never --width=20
