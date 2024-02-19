#!/usr/bin/env zsh

# vim:ft=zsh
#-------------------------------------------------------------------------------
#       ENV VARIABLES
#-------------------------------------------------------------------------------
# PATH.
# (N-/): do not register if the directory does not exists
# (Nn[-1]-/)
#
#  N   : NULL_GLOB option (ignore path if the path does not match the glob)
#  n   : Sort the output
#  [-1]: Select the last item in the array
#  -   : follow the symbol links
#  /   : ignore files
#  t   : tail of the path
# CREDIT: @ahmedelgabri
#--------------------------------------------------------------------------------
export XDG_CONFIG_HOME="$HOME/.config"
export XDG_DATA_HOME="$HOME/.local/share"
export XDG_CACHE_HOME="$HOME/.cache"

export DOTFILES="$HOME/.dotfiles"

#
# Zsh
#
export ZDOTDIR="$XDG_CONFIG_HOME/zsh"
export ZSH_CACHE_DIR="$XDG_CACHE_HOME/zsh"

#
# Editor
#
export EDITOR="nvim"

#
# Go
#
export GOPATH="$HOME/go"
export GOROOT="/usr/local/go"
export GOBIN="$GOPATH/bin"
export PATH="$PATH:$GOBIN"

#
#python
#
export PYENV_ROOT="$HOME/.pyenv"
export PATH="$PYENV_ROOT/bin:$PATH"

#
# MacOS brew
#
# export HOMEBREW_BOTTLE_DOMAIN="https://mirrors.ustc.edu.cn/homebrew-bottles"
export PATH=/opt/homebrew/bin:$PATH

#
# Workspace
#
export WORKSPACE="$HOME/workspace"
export PYPROJECT="$WORKSPACE/pyproject"
export GOPROJECT="$WORKSPACE/goproject"
export FRONTENDPROJECT="$WORKSPACE/frontend"

#
# MISC
#
export DEBUGPY_LOG_DIR="$HOME/.cache/debugpy"
