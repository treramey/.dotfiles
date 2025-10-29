local filtered_message = { "No information available" }

return {
  {
    "folke/snacks.nvim",
    priority = 1000,
    lazy = false,
    dependencies = {
      {
        "lewis6991/gitsigns.nvim",
        init = function()
          require("gitsigns").setup()
        end,
      },
    },
    ---@type snacks.Config
    opts = {
      bigfile = { enabled = true },
      bufdelete = { enabled = true },
      dim = { enabled = true },
      gitbrowse = { enabled = false },
      image = {
        doc = {
          inline = false,
          max_height = 12,
          max_width = 24,
        },
      },
      indent = {
        enabled = true,
        only_scope = true,
        filter = function(buf)
          local b = vim.b[buf]
          local bo = vim.bo[buf]
          local excluded_filetypes = {
            markdown = true,
            text = true,
          }
          return vim.g.snacks_indent ~= false
            and b.snacks_indent ~= false
            and bo.buftype == ""
            and not excluded_filetypes[bo.filetype]
        end,
      },
      input = {
        enabled = true,
        win = {
          style = "input",
          relative = "editor",
          height = 1,
          width = 60,
          row = math.floor(((vim.o.lines - 1) * 0.33)), -- 1/3 down
          col = math.floor((vim.o.columns - 60) * 0.5), -- center
        },
      },
      lazygit = {
        configure = false,
      },
      notifier = {
        enabled = true,
        timeout = 3000,
        style = "fancy",
      },
      picker = {
        layout = {
          preset = "minimal",
        },
        layouts = {
          minimal = {
            preview = false,
            layout = {
              backdrop = false,
              height = 0.35,
              width = 0.55,
              box = "horizontal",
              {
                border = "single",
                box = "vertical",
                title = "{title}",
                title_pos = "left",
                { win = "input", height = 1, border = "bottom" },
                { win = "list", border = "none" },
              },
              { win = "preview", title = "{preview}", title_pos = "left", border = "single" },
            },
          },
        },
        previewers = {
          diff = {
            builtin = false,
            cmd = { "delta" },
          },
        },
        sources = {
          grep = {
            layout = {
              preview = true,
            },
          },
          icons = {
            layout = {
              preset = "minimal",
            },
          },
          select = {
            layout = {
              preset = "minimal",
            },
          },
        },
      },
      statuscolumn = {},
      terminal = {},
      toggle = { enabled = true },
      words = { enabled = true },
    },
    init = function()
      vim.api.nvim_create_autocmd("User", {
        pattern = "VeryLazy",
        callback = function()
          local Snacks = require("snacks")
          local notify = Snacks.notifier.notify
          ---@diagnostic disable-next-line: duplicate-set-field
          Snacks.notifier.notify = function(message, level, opts)
            for _, msg in ipairs(filtered_message) do
              if message == msg then
                return nil
              end
            end
            return notify(message, level, opts)
          end
        end,
      })
      vim.api.nvim_create_autocmd("User", {
        pattern = "OilActionsPost",
        callback = function(event)
          if event.data.actions.type == "move" then
            require("snacks").rename.on_rename_file(event.data.actions.src_url, event.data.actions.dest_url)
          end
        end,
      })
    end,
    -- stylua: ignore start
		keys = {
			{ "<leader>.",  function() Snacks.scratch() end, desc = "Toggle Scratch Buffer" },
			{ "<leader>B",  function() Snacks.scratch.select() end, desc = "Select Scratch [B]uffer" },
			{ "<leader>bd", function() Snacks.bufdelete() end, desc = "[B]uffer [D]elete" },
			{ "<leader>gg", function() Snacks.lazygit() end, desc = "Lazygit" },
			{ "<leader>gb", function() Snacks.git.blame_line() end, desc = "[G]it [B]lame Line" },
      { "<leader>gf", function() Snacks.picker.git_log_file() end, desc = "Git Log File" },
      { "<leader>gl", function() Snacks.picker.git_log_line() end, desc = "Git Log Line" },
			{ "<leader>og", function() Snacks.gitbrowse() end, desc = "[O]pen [G]it", mode = { "n", "v" } },
			{ "<leader>dn", function() Snacks.notifier.hide() end, desc = "[D]ismiss All [N]otifications" },
			{ "<leader>nh", function() Snacks.notifier.show_history() end, desc = "[N]otification [H]istory" },
			{ "<leader>zz", function() Snacks.toggle.dim():toggle() end, desc = "Toggle [Z]en Mode" },
			{ "<leader>cl", function() Snacks.toggle.option("cursorline", { name = "Cursor Line" }):toggle() end, desc = "Toggle [C]ursor [L]ine" },
			{ "<leader>td", function() Snacks.toggle.diagnostics():toggle() end, desc = "[T]oggle [D]iagnostics" },
      { "<leader>dm", function() Snacks.toggle.dim():toggle() end, desc = "Toggle [D]im [M]ode" }, -- Same as <leader>zz but with different key
			{ "<leader>zm", function() Snacks.toggle.zen():toggle() end, desc = "Toggle [Z]en [M]ode" },
      { "<leader>_",  function() Snacks.terminal() end, desc = "terminal" },
      { "<leader>ln", function() Snacks.toggle.option("relativenumber", { name = "Relative Number" }):toggle() end, desc = "Toggle Relative [L]ine [N]umbers" },
      { "<leader>tw", function() Snacks.toggle.option("wrap"):toggle() end, desc = "[T]oggle line [W]rap" },
      -- stylua: ignore end

			{
				"<leader>tt",
				function()
					local tsc = require("treesitter-context")
					Snacks.toggle({
						name = "Treesitter Context",
						get = function() return tsc.enabled() end,
						set = function(state)
							if state then
								tsc.enable()
							else
								tsc.disable()
							end
						end,
					}):toggle()
				end,
				desc = "[T]oggle [T]reesitter Context",
			},
			{
				"<leader>hl",
				function()
					local hc = require("nvim-highlight-colors")
					Snacks.toggle({
						name = "Highlight Colors",
						get = function()
							return hc.is_active()
						end,
						set = function(state)
							if state then
								hc.turnOn()
							else
								hc.turnOff()
							end
						end,
					}):toggle()
				end,
				desc = "Toggle [H]igh[L]ight Colors",
			},
      {
      "<leader>ih",
      function()
        Snacks.toggle({
          name = "Inlay Hints",
          get = function()
            return vim.lsp.inlay_hint.is_enabled()
          end,
          set = function(state)
            if state then
              vim.lsp.inlay_hint.enable(true)
            else
              vim.lsp.inlay_hint.enable(false)
            end
          end,
        }):toggle()
      end,
      desc = "Toggle [I]nlay [H]ints",
      },
		},
  },
}
