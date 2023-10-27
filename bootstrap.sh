#!/bin/sh

set -e

# nodejs macos/linxu 名称不一样
declare -A _pkgs=(
  ["gcc"]="gcc"
  ["make"]="make"
  ["git"]="git"
  ["fzf"]="fzf"
  ["zsh"]="zsh"
  ["curl"]="curl"
  ["ripgrep"]="rg"
  ["lazygit"]="lazygit"
  ["tmux"]="tmux"
  ["neovim"]="nvim"
  ["kitty"]="kitty"
  ["npm"]="npm"
  ["node"]="node"
  ["python"]="python"
)

function macos_setup() {
  # setup config
  brew="/usr/local/bin/brew"
  if [ ! -f "${brew}" ]; then
    echo "Homebrew is not installed, installing now"
    echo "This may take a while"
    echo "Homebrew requires osx command lines tools, please download xcode first"
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  fi

  echo "Install brew bundle"
  brew tap Homebrew bundle
  brew bundle --global
  echo "Installing Homebrew apps from Brewfile"
}

function linux_setup() {
  for key in "${!_pkgs[@]}"; do
    if hash "${_pkgs[${key}]}" &> /dev/null; then
      echo "${key} is installed"
    else
      echo "installing ${key}..."
      $(${INSTALLER} ${key}) || echo "${key} failed to install"
    fi
  done
}

function detect_platform() {
  OS="$(uname -s)"
  case "$OS" in
    Linux)
      if [ -f "/etc/arch-release" ] || [ -f "/etc/artix-release" ]; then
        INSTALLER="pacman -Sy --noconfirm"
      elif [ -f "/etc/fedora-release" ] || [ -f "/etc/redhat-release" ]; then
        INSTALLER="dnf install -y"
      elif [ -f "/etc/gentoo-release" ]; then
        INSTALLER="emerge -tv"
      else
        INSTALLER="apt install -y"
      fi
      linux_setup
    ;;
    Darwin)
      macos_setup
    ;;
    *)
      echo "OS $OS is not currently supported."
      exit 1
    ;;
  esac
}

function setup() {

  chsh -s "$(which zsh)"

  export DOTFILES="$HOME/.dotfiles"
  ${DOTFILES}/install

  nvim --headless -c "autocmd User PackerComplete quitall" -c "PackerSync"
  echo "Setup neovim complete."
}

function main() {
  echo  "Detecting platform for managing any additional dotfiles dependencies"
  detect_platform

  setup
}

main