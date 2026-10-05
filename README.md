# Omarchy dotfiles

Configuration under `home/` is symlinked into `$HOME` with GNU Stow.
Edit the source files directly. Changes are live without applying or watching.

```sh
sudo pacman -S stow
git clone https://github.com/treramey/.dotfiles.git ~/.dotfiles
cd ~/.dotfiles
./dot init
```

`dot stow` is the default command. It refreshes file symlinks without folding
shared directories, so application state stays outside this repository.
Pi, shared skills, and the Neovim submodule use whole-directory live links.
Missing submodules are initialized. Existing checkouts are not reset.

```sh
dot status             # preview links and conflicts without writing
dot stow               # refresh symlinks
dot doctor             # check links and submodule state
dot unstow             # remove owned links, preserve unrelated files
dot edit               # open this repository in $EDITOR
```

## Moving from copied files

Existing files cause a conflict instead of being overwritten.
Run `./dot stow --backup` to move conflicting files into
`~/.dotfiles-backup-*` and link the repository versions.
Compare those backups before deleting them. Do not use Stow's `--adopt`,
which replaces repository files with deployed copies.

The CLI no longer uses chezmoi or Watchman. Remove any old auto-apply watcher
before migration. Installed tools and their state are not deleted automatically.

Credentials, generated palettes, dependency trees, and plugin output are
excluded by `home/.stow-local-ignore` and Git ignore rules.
Tmux installs TPM through its existing startup configuration.
