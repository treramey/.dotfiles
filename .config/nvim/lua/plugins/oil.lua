vim.api.nvim_create_autocmd("FileType", {
  pattern = "oil",
  callback = function()
    vim.opt_local.colorcolumn = ""
  end,
})

return {
  "stevearc/oil.nvim",
  opts = function()
    -- helper function to parse output
    local function parse_output(proc)
      local result = proc:wait()
      local ret = {}
      if result.code == 0 then
        for line in vim.gsplit(result.stdout, "\n", { plain = true, trimempty = true }) do
          -- Remove trailing slash
          line = line:gsub("/$", "")
          ret[line] = true
        end
      end
      return ret
    end
    -- build git status cache
    local function new_git_status()
      return setmetatable({}, {
        __index = function(self, key)
          local ignore_proc = vim.system(
            { "git", "ls-files", "--ignored", "--exclude-standard", "--others", "--directory" },
            {
              cwd = key,
              text = true,
            }
          )
          local tracked_proc = vim.system({ "git", "ls-tree", "HEAD", "--name-only" }, {
            cwd = key,
            text = true,
          })
          local ret = {
            ignored = parse_output(ignore_proc),
            tracked = parse_output(tracked_proc),
          }
          rawset(self, key, ret)
          return ret
        end,
      })
    end
    local git_status = new_git_status()

    -- Clear git status cache on refresh
    local refresh = require("oil.actions").refresh
    local orig_refresh = refresh.callback
    refresh.callback = function(...)
      git_status = new_git_status()
      orig_refresh(...)
    end
    return {
      float = {
        max_width = 0.55,
        max_height = 0.35,
        border = "single",
      },
      view_options = {
        is_hidden_file = function(name, bufnr)
          local dir = require("oil").get_current_dir(bufnr)
          local is_dotfile = vim.startswith(name, ".") and name ~= ".."
          -- if no local directory (e.g. for ssh connections), just hide dotfiles
          if not dir then
            return is_dotfile
          end
          -- dotfiles are considered hidden unless tracked
          if is_dotfile then
            return not git_status[dir].tracked[name]
          else
            -- Check if file is gitignored
            return git_status[dir].ignored[name]
          end
        end,
      },
      keymaps = {
        ["<tab>"] = "actions.select",
        ["<s-tab>"] = "actions.parent",
        ["q"] = { "actions.close", mode = "n" },
        -- Change Neovim's global working directory (:pwd) to current oil directory
        ["="] = { "actions.cd", mode = "n" },
        -- Change working directory for current tab only (:tcd)
        ["-"] = { "actions.cd", opts = { scope = "tab" }, mode = "n" },
        -- Toggle visibility of trashed/deleted files
        ["g'"] = { "actions.toggle_trash", mode = "n" },
      },
      ssh = {
        border = "single",
      },

      keymaps_help = {
        border = "single",
      },
    }
  end,
  dependencies = { { "echasnovski/mini.icons", opts = {} } },
  lazy = false,
  keys = {
      -- stylua: ignore start
      { "<leader>e", function() require("oil").toggle_float() end, desc = "toggle oil" },
    -- stylua: ignore end
  },
}
