source "$HOME/.local/share/../bin/env.fish"

# Environment variables
set -gx XDG_CONFIG_HOME "$HOME/.config"
set -gx EZA_CONFIG_DIR "$HOME/.config/eza"
set -gx EDITOR nvim

# .NET / Azure DevOps
set -gx ARTIFACTS_CREDENTIALPROVIDER_SESSIONTOKENCACHE_ENABLED true
set -gx ARTIFACTS_CREDENTIALPROVIDER_MSAL_FILECACHE_ENABLED true
