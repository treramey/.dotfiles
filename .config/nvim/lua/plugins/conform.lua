return {
  "stevearc/conform.nvim",
  event = { "BufWritePre" },
  cmd = { "ConformInfo" },
  opts = {
    notify_on_error = false,
    format_after_save = function(buffer_number)
      local filetype = vim.bo[buffer_number].filetype
      if
        vim.g.disable_autoformat
        or vim.b[buffer_number].disable_autoformat
        or vim.tbl_contains(vim.g.disable_autoformat_filetypes or {}, filetype)
      then
        return
      end
      return {
        async = true,
        timeout_ms = 500,
        lsp_format = "fallback",
      }
    end,
    formatters_by_ft = {
      cs = { "csharpier" },
      json = { "prettierd" },
      lua = { "stylua" },
      python = { "isort", "black" },
      astro = { "oxfmt", "biome", "prettierd", stop_after_first = true },
      javascript = { "oxfmt", "biome", "prettierd", stop_after_first = true },
      typescript = { "oxfmt", "biome", "prettierd", stop_after_first = true },
      typescriptreact = { "oxfmt", "biome", "prettierd", stop_after_first = true },
      svelte = { "oxfmt", "prettierd", stop_after_first = true },
      xml = { "csharpier" },
      yaml = { "prettierd" },
    },
    formatters = {
      csharpier = {
        command = "csharpier",
        args = { "format", "--write-stdout", "--stdin-path", "$FILENAME" },
      },
      oxfmt = {
        condition = function(_, ctx)
          return vim.fs.find({ ".oxfmtrc.json", ".oxfmtrc.jsonc" }, {
            path = ctx.filename,
            upward = true,
            stop = vim.uv.os_homedir(),
          })[1] ~= nil
        end,
      },
      biome = {
        condition = function(_, ctx)
          return vim.fs.find({ "biome.json", "biome.jsonc" }, {
            path = ctx.filename,
            upward = true,
            stop = vim.uv.os_homedir(),
          })[1] ~= nil
        end,
      },
      prettierd = {
        condition = function(_, ctx)
          return vim.fs.find({
            ".prettierrc",
            ".prettierrc.json",
            ".prettierrc.js",
            ".prettierrc.cjs",
            ".prettierrc.mjs",
            "prettier.config.js",
            "prettier.config.cjs",
            "prettier.config.mjs",
          }, {
            path = ctx.filename,
            upward = true,
            stop = vim.uv.os_homedir(),
          })[1] ~= nil
        end,
      },
    },
  },
}
