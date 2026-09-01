local wezterm = require "wezterm"

local config = wezterm.config_builder()

local function load_omarchy_colors()
  local home = os.getenv "HOME"
  if not home then
    return nil
  end

  local theme_path = home .. "/.local/state/omarchy/current/theme/ghostty.conf"
  local theme_file = io.open(theme_path, "r")
  if not theme_file then
    return nil
  end

  local values = {}
  local palette = {}

  for line in theme_file:lines() do
    local key, value = line:match "^([%w-]+)%s*=%s*(#[%x]+)%s*$"
    local index, color = line:match "^palette%s*=%s*(%d+)=(#[%x]+)%s*$"

    if key then
      values[key] = value
    elseif index then
      palette[tonumber(index) + 1] = color
    end
  end

  theme_file:close()

  if not values.background or not values.foreground or #palette ~= 16 then
    return nil
  end

  wezterm.add_to_config_reload_watch_list(theme_path)

  return {
    foreground = values.foreground,
    background = values.background,
    cursor_bg = values["cursor-color"] or values.foreground,
    cursor_border = values["cursor-color"] or values.foreground,
    cursor_fg = values.background,
    selection_bg = values["selection-background"] or palette[9],
    selection_fg = values["selection-foreground"] or values.foreground,
    ansi = { table.unpack(palette, 1, 8) },
    brights = { table.unpack(palette, 9, 16) },
  }
end

config.font = wezterm.font("MonoLisa Variable", { weight = "Regular" })
config.font_size = 9
config.term = "xterm-256color"
config.scrollback_lines = 10000

config.window_padding = { left = 14, right = 14, top = 14, bottom = 14 }
config.window_decorations = "TITLE | RESIZE"
config.window_close_confirmation = "NeverPrompt"
config.hide_tab_bar_if_only_one_tab = true
config.use_fancy_tab_bar = false
config.tab_bar_at_bottom = true

config.default_cursor_style = "SteadyBlock"
config.audible_bell = "Disabled"

local omarchy_colors = load_omarchy_colors()
if omarchy_colors then
  config.colors = omarchy_colors
else
  config.color_scheme = "rose-pine"
end

config.keys = {
  { key = "Insert", mods = "SHIFT", action = wezterm.action.PasteFrom "Clipboard" },
  { key = "Insert", mods = "CTRL", action = wezterm.action.CopyTo "Clipboard" },
  { key = "Enter", mods = "SHIFT", action = wezterm.action.SendString "\x1b[13;2u" },
  { key = "Enter", mods = "ALT|SHIFT", action = wezterm.action.SendString "\x1b[13;4u" },
}

return config
