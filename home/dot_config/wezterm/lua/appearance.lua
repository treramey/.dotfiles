local wez = require "wezterm"

local M = {}

local function load_omarchy_scheme()
  local home = os.getenv "HOME"
  if not home then
    return nil
  end

  local path = home .. "/.local/state/omarchy/current/theme/ghostty.conf"
  local file = io.open(path, "r")
  if not file then
    return nil
  end

  local values = {}
  local palette = {}
  for line in file:lines() do
    local key, value = line:match "^([%w-]+)%s*=%s*(#[%x]+)%s*$"
    if key then
      values[key] = value
    else
      local index, color = line:match "^palette%s*=%s*(%d+)=(#[%x]+)%s*$"
      if index then
        palette[tonumber(index) + 1] = color
      end
    end
  end
  file:close()

  if not values.background or not values.foreground or #palette ~= 16 then
    return nil
  end

  wez.add_to_config_reload_watch_list(path)
  return {
    foreground = values.foreground,
    background = values.background,
    cursor_bg = values["cursor-color"] or values.foreground,
    cursor_fg = values.background,
    selection_bg = values["selection-background"] or palette[9],
    selection_fg = values["selection-foreground"] or values.foreground,
    ansi = { table.unpack(palette, 1, 8) },
    brights = { table.unpack(palette, 9, 16) },
  }
end

local function rose_pine_scheme()
  local scheme = wez.color.get_builtin_schemes()["rose-pine"]

  -- Correct Rose Pine's ANSI green and blue roles in WezTerm's built-in scheme.
  scheme.ansi[3] = "#31748f"
  scheme.ansi[5] = "#9ccfd8"
  scheme.brights[3] = "#31748f"
  scheme.brights[5] = "#9ccfd8"

  scheme.cursor_bg = "#524f67"
  scheme.cursor_fg = scheme.foreground
  scheme.selection_bg = "#403d52"
  scheme.selection_fg = scheme.foreground
  return scheme
end

M.apply_to_config = function(c)
  local scheme = load_omarchy_scheme()
  if not scheme then
    c.color_scheme = "rose-pine"
    scheme = rose_pine_scheme()
  end

  c.colors = {
    foreground = scheme.foreground,
    background = scheme.background,
    tab_bar = {
      background = scheme.background,
      active_tab = {
        fg_color = scheme.ansi[4],
        bg_color = scheme.background,
      },
      inactive_tab = {
        fg_color = scheme.ansi[6],
        bg_color = scheme.background,
      },
    },
    cursor_bg = scheme.cursor_bg,
    cursor_border = scheme.cursor_bg,
    cursor_fg = scheme.cursor_fg,
    selection_bg = scheme.selection_bg,
    selection_fg = scheme.selection_fg,
    split = scheme.ansi[7],
    ansi = scheme.ansi,
    brights = scheme.brights,
    compose_cursor = scheme.ansi[2],
  }
  c.command_palette_bg_color = scheme.background
  c.command_palette_fg_color = scheme.foreground
  c.inactive_pane_hsb = { brightness = 0.9 }
  c.window_padding = { left = "1cell", right = "1cell", top = 0, bottom = "1cell" }
  c.window_decorations = "RESIZE"
  c.window_background_opacity = 0.95
  c.show_new_tab_button_in_tab_bar = false
end

return M
