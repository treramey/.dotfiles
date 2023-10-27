#!/usr/bin/env zsh

# +-------+
# | pyenv |
# +-------+
# export PYENV_ROOT="$HOME/.pyenv"
# command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$PATH"
# eval "$(pyenv init -)"

# +-------------------+
# | virtualenvwrapper |
# +-------------------+
export WORKON_HOME="$HOME/.virtualenvs"
export PROJECT_HOME="$PYPROJECT"
export VIRTUALENVWRAPPER_PYTHON="/usr/local/bin/python3"
source /usr/local/bin/virtualenvwrapper.sh