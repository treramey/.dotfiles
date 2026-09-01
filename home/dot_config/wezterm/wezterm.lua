local wez = require "wezterm"
local appearance = require "lua.appearance"
local mappings = require "lua.mappings"
local bar = wez.plugin.require "https://github.com/adriankarlen/bar.wezterm"

local c = {}

if wez.config_builder then
  c = wez.config_builder()
end

-- General configurations
c.font = wez.font("MonoLisa Variable", { weight = "Regular" })
c.font_rules = {
  {
    italic = true,
    font = wez.font("MonoLisa Variable", { weight = "Regular", italic = true }),
  },
}
c.font_size = 15
c.command_palette_font_size = 15
c.command_palette_rows = 15
c.adjust_window_size_when_changing_font_size = false
c.audible_bell = "Disabled"
c.scrollback_lines = 3000
c.default_workspace = "main"
c.max_fps = 240

if wez.target_triple:find "windows" then
  c.wsl_domains = {
    {
      name = "WSL:Ubuntu",
      distribution = "Ubuntu",
      default_cwd = "~",
    },
  }
  c.default_domain = "WSL:Ubuntu"
end

-- appearance
appearance.apply_to_config(c)
c.window_decorations = "NONE"

-- keys
mappings.apply_to_config(c)

-- bar
local tab_bar_background = c.colors.background
bar.apply_to_config(c, {
  position = "top",
  modules = {
    clock = {
      enabled = false,
    },
  },
})
-- bar.wezterm defaults to a transparent retro tab bar. Keep the active theme
-- behind tabs and status modules so bright desktop wallpapers stay readable.
c.colors.tab_bar.background = tab_bar_background

return c
