return {
  {
    "neovim/nvim-lspconfig",
    event = { "BufReadPre", "BufNewFile" },
    cmd = { "LspInfo", "LspInstall", "LspUninstall", "Mason" },
    dependencies = {
      -- LSP installer plugins
      "williamboman/mason.nvim",
      "williamboman/mason-lspconfig.nvim",
      "WhoIsSethDaniel/mason-tool-installer.nvim",
      "saghen/blink.cmp",
    },
    config = function()
      local mason = require("mason")
      local mason_tool_installer = require("mason-tool-installer")
      local mason_lspconfig = require("mason-lspconfig")
      local map_lsp_keybinds = require("treramey.keymaps").map_lsp_keybinds -- Has to load keymaps before plugins lsp

      local servers = {
        -- LSP Servers
        bashls = {},
        biome = {},
        cssls = {},
        copilot = {},
        eslint = {
          autostart = false,
          cmd = { "vscode-eslint-language-server", "--stdio", "--max-old-space-size=12288" },
          settings = { format = false },
        },
        ["harper-ls"] = {
          cmd = { "harper-ls", "--stdio" },
          filetypes = { "markdown", "text" },
          root_markers = { ".git" },
        },
        ["copilot-language-server"] = {
          cmd = { "copilot-language-server", "--stdio" },
          root_markers = { ".git" },
        },
        html = {},
        jsonls = {},
        gopls = {
          cmd = { "gopls" },
          filetypes = { "go", "gomod", "gowork", "gotmpl" },
          root_markers = { "go.work", "go.mod", ".git" },
          settings = {
            completeUnimported = true,
            usePlaceholders = true,
            analyses = {
              unusedparams = true,
            },
          },
        },
        lua_ls = {
          settings = {
            Lua = {
              runtime = { version = "LuaJIT" },
              workspace = {
                checkThirdParty = false,
                library = {
                  "${3rd}/luv/library",
                  unpack(vim.api.nvim_get_runtime_file("", true)),
                },
              },
              telemetry = { enabled = false },
            },
          },
        },
        marksman = {},
        pyright = {},
        rust_analyzer = {
          check = { command = "clippy", features = "all" },
        },
        sqls = {},
        svelte = {},
        tailwindcss = {
          filetypes = { "typescriptreact", "javascriptreact", "html", "svelte" },
        },
        yamlls = {},
      }

      local formatters = {
        biome = {},
        prettierd = {},
        prettier = {},
        stylua = {},
        goimports = {},
        csharpier = {},
      }

      local other_tools = {
        netcoredbg = {},
        rustywind = {},
        roslyn = {},
        rzls = {},
      }

      local manually_installed_servers = {}

      local mason_tools_to_install = vim.tbl_keys(vim.tbl_deep_extend("force", {}, servers, formatters, other_tools))

      local ensure_installed = vim.tbl_filter(function(name)
        return not vim.tbl_contains(manually_installed_servers, name)
      end, mason_tools_to_install)

      mason_tool_installer.setup({
        auto_update = true,
        run_on_start = true,
        start_delay = 3000,
        debounce_hours = 12,
        ensure_installed = ensure_installed,
      })

      local capabilities = vim.lsp.protocol.make_client_capabilities()
      capabilities = vim.tbl_deep_extend("force", capabilities, require("blink.cmp").get_lsp_capabilities())

      vim.api.nvim_create_autocmd("LspAttach", {
        group = vim.api.nvim_create_augroup("lsp-attach", { clear = true }),
        callback = function(event)
          map_lsp_keybinds(event.buf)
        end,
      })

      -- Setup each LSP server using vim.lsp.config and vim.lsp.enable
      for name, config in pairs(servers) do
        vim.lsp.config(name, {
          cmd = config.cmd,
          capabilities = capabilities,
          filetypes = config.filetypes,
          settings = config.settings,
          root_dir = config.root_dir,
        })

        -- Enable the server (with autostart setting if specified)
        if config.autostart == false then
          -- Don't auto-enable servers with autostart = false
          -- Users can manually enable with :lua vim.lsp.enable(name)
        else
          vim.lsp.enable(name)
        end
      end

      -- Setup mason so it can manage 3rd party LSP servers
      mason.setup({
        max_concurrent_installers = 10,
        ui = {
          icons = {
            package_installed = "✓",
            package_pending = "➜",
            package_uninstalled = "",
          },
          border = "single",
        },
        registries = {
          "github:mason-org/mason-registry",
          "github:Crashdummyy/mason-registry",
        },
      })

      mason_lspconfig.setup({})

      vim.lsp.inline_completion.enable()
    end,
  },
  -- { --ohhh the pain
  -- 	"hannaeckert/cfmlsp.nvim",
  -- 	event = { "BufReadPre", "BufNewFile" },
  -- 	dependencies = {
  -- 		"neovim/nvim-lspconfig",
  -- 	},
  -- 	opts = function()
  -- 		local map_lsp_keybinds = require("treramey.keymaps").map_lsp_keybinds
  -- 		return {
  -- 			on_attach = function(_, bufnr)
  -- 				map_lsp_keybinds(bufnr)
  -- 			end,
  -- 		}
  -- 	end,
  -- },
}
