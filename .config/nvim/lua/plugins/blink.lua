local function is_dap_buffer()
  return require("cmp_dap").is_dap_buffer()
end
return {
  {
    "saghen/blink.compat",
    version = "*",
    lazy = true,
    opts = { impersonate_nvim_cmp = true },
  },
  {
    "saghen/blink.cmp",
    dependencies = {
      "rafamadriz/friendly-snippets",
      "rcarriga/cmp-dap",
      "xzbdmw/colorful-menu.nvim",
      "echasnovski/mini.icons",
    },
    version = "*",
    event = { "InsertEnter" },
    opts = {
      keymap = {
        preset = "none",
        ["<C-k>"] = { "select_prev", "fallback" },
        ["<C-j>"] = { "select_next", "fallback" },
        ["<C-s>"] = { "show" },
        ["<Up>"] = { "select_prev", "fallback" },
        ["<Down>"] = { "select_next", "fallback" },
        ["<CR>"] = { "select_and_accept", "fallback" },
        ["<Tab>"] = {
          "snippet_forward",
          function()
            return require("sidekick").nes_jump_or_apply()
          end,
          function()
            return vim.lsp.inline_completion.get()
          end,
          "fallback",
        },
      },
      enabled = function()
        return vim.bo.buftype ~= "prompt" or is_dap_buffer()
      end,
      appearance = {
        use_nvim_cmp_as_default = true,
        nerd_font_variant = "mono",
      },

      completion = {
        menu = {
          border = "rounded",
          draw = {
            columns = { { "kind_icon" }, { "label", gap = 1 }, { "kind" } },
            components = {
              label = {
                text = function(ctx)
                  return require("colorful-menu").blink_components_text(ctx)
                end,
                highlight = function(ctx)
                  return require("colorful-menu").blink_components_highlight(ctx)
                end,
              },
              kind_icon = {
                text = function(ctx)
                  local kind_icon, _, _ = require("mini.icons").get("lsp", ctx.kind)
                  return kind_icon
                end,
                -- (optional) use highlights from mini.icons
                highlight = function(ctx)
                  local _, hl, _ = require("mini.icons").get("lsp", ctx.kind)
                  return hl
                end,
              },
              kind = {
                -- (optional) use highlights from mini.icons
                highlight = function(ctx)
                  local _, hl, _ = require("mini.icons").get("lsp", ctx.kind)
                  return hl
                end,
              },
            },
          },
        },
        documentation = {
          auto_show = true,
          auto_show_delay_ms = 250,
          window = {
            border = "rounded",
          },
        },
      },

      sources = {
        default = function()
          if is_dap_buffer() then
            return { "lsp", "path", "snippets", "buffer", "easy-dotnet", "dadbod", "dap" }
          end
          return { "lsp", "path", "snippets", "buffer", "easy-dotnet", "dadbod", "cfcomplete" }
        end,
        providers = {
          dadbod = { name = "Dadbod", module = "vim_dadbod_completion.blink" },
          snippets = { min_keyword_length = 2 },
          dap = { name = "dap", module = "blink.compat.source" },
          cfcomplete = { name = "cfcomplete", module = "blink.compat.source" },
          ["easy-dotnet"] = {
            name = "easy-dotnet",
            enabled = true,
            module = "easy-dotnet.completion.blink",
            score_offset = 10000,
            async = true,
          },
        },
      },
    },
    opts_extend = { "sources.default" },
  },
}
