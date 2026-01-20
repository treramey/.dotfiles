local function has_git_conflict_markers()
  local lines = vim.api.nvim_buf_get_lines(0, 0, -1, false)
  for _, line in ipairs(lines) do
    if line:match("^<<<<<<<") or line:match("^=======") or line:match("^>>>>>>>") then
      return true
    end
  end
  return false
end

return {
  {
    "seblyng/roslyn.nvim",
    dependencies = {
      "williamboman/mason.nvim",
      "j-hui/fidget.nvim",
    },
    enabled = function()
      return vim.fn.executable("dotnet") == 1 and not has_git_conflict_markers()
    end,
    ft = { "cs", "razor" },
    config = function()
      require("roslyn").setup({
        broad_search = true,
        silent = true,
        config = {
          settings = {
            ["csharp|inlay_hints"] = {
              csharp_enable_inlay_hints_for_implicit_object_creation = true,
              csharp_enable_inlay_hints_for_implicit_variable_types = true,
              csharp_enable_inlay_hints_for_lambda_parameter_types = true,
              csharp_enable_inlay_hints_for_types = true,
              dotnet_enable_inlay_hints_for_indexer_parameters = true,
              dotnet_enable_inlay_hints_for_literal_parameters = true,
              dotnet_enable_inlay_hints_for_object_creation_parameters = true,
              dotnet_enable_inlay_hints_for_other_parameters = true,
              dotnet_enable_inlay_hints_for_parameters = true,
              dotnet_suppress_inlay_hints_for_parameters_that_differ_only_by_suffix = true,
              dotnet_suppress_inlay_hints_for_parameters_that_match_argument_name = true,
              dotnet_suppress_inlay_hints_for_parameters_that_match_method_intent = true,
            },
            ["csharp|code_lens"] = {
              dotnet_enable_references_code_lens = true,
            },
          },
          on_attach = function(_, bufnr)
            require("treramey.keymaps").map_lsp_keybinds(bufnr)
          end,
        },
      })
    end,
    init = function()
      -- TODO: Remove when projects are updated to .NET 10, use mise latest instead
      -- local mise_dotnet_root = vim.fn.expand("~/.local/share/mise/installs/dotnet/latest")
      local mise_dotnet_root = vim.fn.expand("~/.local/share/mise/installs/dotnet/10")
      vim.lsp.config("roslyn", {
        cmd_env = {
          Configuration = vim.env.Configuration or "Debug",
          DOTNET_ROOT = mise_dotnet_root,
          PATH = mise_dotnet_root .. ":" .. vim.env.PATH,
        },
      })

      local restore_handles = {}
      vim.api.nvim_create_autocmd("User", {
        pattern = "RoslynRestoreProgress",
        callback = function(ev)
          local token = ev.data.params[1]
          if not restore_handles[token] then
            restore_handles[token] = require("fidget.progress").handle.create({
              title = ev.data.params[2].state,
              message = ev.data.params[2].message,
              lsp_client = { name = "roslyn" },
            })
          else
            restore_handles[token]:report({
              title = ev.data.params[2].state,
              message = ev.data.params[2].message,
            })
          end
        end,
      })

      vim.api.nvim_create_autocmd("User", {
        pattern = "RoslynRestoreResult",
        callback = function(ev)
          local handle = restore_handles[ev.data.token]
          if handle then
            handle.message = ev.data.err and ev.data.err.message or "Restore completed"
            handle:finish()
            restore_handles[ev.data.token] = nil
          end
        end,
      })

      local init_handles = {}
      vim.api.nvim_create_autocmd("User", {
        pattern = "RoslynOnInit",
        callback = function(ev)
          init_handles[ev.data.client_id] = require("fidget.progress").handle.create({
            title = "Initializing Roslyn",
            message = ev.data.type == "solution" and string.format("Initializing Roslyn for %s", ev.data.target)
              or "Initializing Roslyn for project",
            lsp_client = { name = "roslyn" },
          })
        end,
      })

      vim.api.nvim_create_autocmd("LspAttach", {
        callback = function(args)
          local handle = init_handles[args.data.client_id]
          if handle then
            handle:finish()
            init_handles[args.data.client_id] = nil
          end
        end,
      })
    end,
    keys = {
      { "<leader>nl", "<cmd>Roslyn restart<cr>", desc = "restart roslyn lsp" },
    },
  },
  {
    "GustavEikaas/easy-dotnet.nvim",
    enabled = function()
      return vim.fn.executable("dotnet") == 1 and not has_git_conflict_markers()
    end,
    dependencies = { "nvim-lua/plenary.nvim", "folke/snacks.nvim", "j-hui/fidget.nvim" },
    cmd = "Dotnet",
    event = "VeryLazy",
    config = function()
      local dotnet = require("easy-dotnet")

      local bin_path = vim.fn.stdpath("data") .. "/lazy/netcoredbg-macOS-arm64.nvim/netcoredbg/netcoredbg"

      if vim.fn.has("win32") == 1 then
        bin_path = vim.fn.stdpath("data") .. "/mason/packages/netcoredbg/netcoredbg.exe"
      elseif not (vim.fn.has("macunix") == 1 and vim.fn.has("arm64") == 1) then
        bin_path = vim.fn.stdpath("data") .. "/mason/packages/netcoredbg/netcoredbg"
      end

      if vim.fn.executable(bin_path) ~= 1 then
        vim.notify("[easy-dotnet] Debugger binary not found: " .. bin_path, vim.log.levels.WARN)
      end

      local parsers = require("easy-dotnet.parsers")

      local function find_project_path()
        return parsers.sln_parser.find_solution_file() or parsers.csproj_parser.find_project_file()
      end

      dotnet.setup({
        picker = "snacks",
        debugger = {
          bin_path = bin_path,
          mappings = { open_variable_viewer = { lhs = "T", desc = "open variable viewer" } },
          apply_value_converters = true,
        },
        lsp = {
          enabled = false,
          roslynator_enabled = false,
        },
        notifications = {
          handler = function(start_event)
            local handle = require("fidget.progress").handle.create({
              title = start_event.job.name,
              message = "Running...",
              lsp_client = { name = "easy-dotnet" },
            })
            return function(finished_event)
              if handle then
                handle.message = finished_event.result.msg
                handle:finish()
              end
            end
          end,
        },
        terminal = function(path, action, args)
          args = args or ""
          -- stylua: ignore
          local commands = {
            run = function() return string.format("dotnet run --project %s %s", path, args) end,
            test = function() return string.format("dotnet test %s %s", path, args) end,
            restore = function() return string.format("dotnet restore %s %s", path, args) end,
            build = function() return string.format("dotnet build %s %s", path, args) end,
            watch = function() return string.format("dotnet watch --project %s %s", path, args) end,
          }
          Snacks.terminal.toggle(commands[action](), { win = { position = "bottom", height = 0.35 } })
        end,
        auto_bootstrap_namespace = { type = "file_scoped", enabled = true },
        test_runner = { viewmode = "vsplit", vsplit_width = 70, icons = { project = "󰗀" } },
      })

      vim.api.nvim_create_user_command("DotnetListPackages", function()
        local path = find_project_path() or "."
        Snacks.terminal.toggle("dotnet list " .. path .. " package --include-transitive; read", {
          win = { style = "float", width = 0.8, height = 0.8, border = "rounded" },
        })
      end, { desc = "List packages with transitive deps" })

      vim.api.nvim_create_user_command("DotnetLaunchSettings", function()
        local files = vim.fs.find("launchSettings.json", { type = "file", limit = math.huge })
        if #files == 0 then
          vim.notify("No launchSettings.json found", vim.log.levels.WARN)
        elseif #files == 1 then
          vim.cmd("edit " .. vim.fn.fnameescape(files[1]))
        else
          vim.ui.select(files, { prompt = "Select launchSettings.json" }, function(choice)
            if choice then
              vim.cmd("edit " .. vim.fn.fnameescape(choice))
            end
          end)
        end
      end, { desc = "Open launchSettings.json" })
    end,
    keys = {
      -- stylua: ignore start
      { "<leader>nw", function() require("easy-dotnet").watch_default() end, desc = "watch solution" },
      { "<leader>nb", function() require("easy-dotnet").build_default_quickfix() end, desc = "build default quickfix" },
      { "<leader>nB", function() require("easy-dotnet").build_default() end, desc = "build default" },
      { "<leader>nr", function() require("easy-dotnet").restore() end, desc = "restore packages" },
      { "<leader>nQ", function() require("easy-dotnet").build_quickfix() end, desc = "build quickfix" },
      { "<leader>nR", function() require("easy-dotnet").run_solution() end, desc = "run solution" },
      { "<leader>nx", function() require("easy-dotnet").clean() end, desc = "clean solution" },
      { "<leader>nn", "<cmd>Dotnet<cr>", desc = "open dotnet menu" },
      { "<leader>na", "<cmd>Dotnet new<cr>", desc = "new item" },
      { "<leader>nt", "<cmd>Dotnet testrunner<cr>", desc = "open test runner" },
      { "<leader>np", "<cmd>DotnetListPackages<cr>", desc = "list packages" },
      { "<leader>ns", "<cmd>DotnetLaunchSettings<cr>", desc = "open launchSettings.json" },
      -- stylua: ignore end
    },
  },
}
