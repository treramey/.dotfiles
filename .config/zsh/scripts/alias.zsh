#!/usr/bin/env zsh

# custom
alias ws="cd $WORKSPACE"

# ls
alias ls='ls --color=auto'
alias l='ls -lAFh'
alias la='ls -lAFh'
alias lr='ls -tRFh'
alias lt='ls -ltFh'
alias ll='ls -l'
# alias open="explorer.exe"

# grep
alias grep='grep --color=auto'
alias egrep='egrep --color=auto'
alias fgrep='fgrep --color=auto'


# nvim
alias v='nvim'
alias vi='nvim'
alias vim='nvim'

alias mo="~/.local/share/nvim-macos/bin/nvim"

# tmux
alias t='tmux'
alias tm='tmux'
alias tx='tmux'
alias fun="tmux attach-session -t node || tmux new-session -s node"
alias sad="tmux attach-session -t pts || tmux new-session -s pts"
alias kill-tmux="tmux kill-session -t"

# directory
alias -g ...='../..'
alias -g ....='../../..'

alias -- -='cd -'
alias 1='cd -1'
alias 2='cd -2'
alias 3='cd -3'
alias 4='cd -4'
alias 5='cd -5'

# git
alias main='git checkout main'
alias gco='git checkout'
alias gcob='git checkout -b'

alias gcl='git clone'

alias ga='git add'

alias gc='git commit'
alias gcm='git commit -m'
alias gca='git commit -a'

alias gs='git stash'
alias gsl='git stash list'
alias gsp='git stash pop'
alias gsa='git stash apply'

alias gl='git log'
alias glo='git log --oneline --graph'

# docker
alias dk='docker'
alias dkp='docker ps'
alias dki='docker images'
alias dkc='docker container'

# npm

# pyenv
alias py='pyenv'
alias pyv='pyenv version'
alias pyvs='pyenv versions'

alias pyi='pyenv install'
alias pyu='pyenv uninstall'

alias pyl='pyenv local'
alias pyg='pyenv global'

alias pyw='pyenv which'

