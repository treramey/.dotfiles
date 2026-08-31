# Windows setup

The Windows profile intentionally installs only Windows-native configuration.
The existing `.config/` and `.local/` trees are POSIX, macOS, or Linux desktop
configuration and are ignored when chezmoi runs on Windows.

## Bootstrap

Open Windows PowerShell and install Scoop. Then use Scoop for command-line
applications, while Mise manages language runtimes such as Node.js and Python:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Invoke-RestMethod get.scoop.sh | Invoke-Expression

scoop install git chezmoi pwsh starship mise neovim
chezmoi init --apply https://github.com/treramey/.dotfiles.git
```

Start PowerShell 7 with `pwsh` after applying so it loads the managed profile
at `~/Documents/PowerShell/Microsoft.PowerShell_profile.ps1`, then provision
the declared runtimes:

```powershell
mise install
```

## Installed targets

- `~/Documents/PowerShell/Microsoft.PowerShell_profile.ps1` configures
  `XDG_CONFIG_HOME`, and enables `nvim` and Starship only when installed.
- `~/AppData/Local/starship.toml` provides a compact, two-line Rose Pine
  prompt inspired by Omarchy.
- `~/AppData/Local/mise/config.toml` declares the Windows-managed Node.js LTS
  and Python runtimes. The PowerShell profile activates Mise automatically.
- `~/AppData/Roaming/NuGet/NuGet.Config` configures the NuGet package sources.

Use Scoop for standalone command-line applications, and use Mise for runtime
versions. For example:

```powershell
scoop install lazygit ripgrep fd fzf
mise use --global node@22
```

Use `chezmoi diff` before applying later changes and `chezmoi apply` to update
the managed Windows targets.
