return {
  {
    "nvim-treesitter/nvim-treesitter",
    lazy = false,
    build = ":TSUpdate",
    cmd = { "TSUpdate", "TSInstall" },
    config = function()
      vim.api.nvim_create_autocmd("User", {
        pattern = "TSUpdate",
        callback = function()
          require("nvim-treesitter.parsers").cfml = {
            install_info = {
              url = "https://github.com/cfmleditor/tree-sitter-cfml",
              files = { "src/parser.c", "src/scanner.c" },
              location = "cfml",
            },
          }
        end,
      })

      vim.filetype.add({
        extension = {
          cfm = "cfml",
          cfc = "cfml",
          cfs = "cfml",
          bxm = "boxlang",
          bx = "boxlang",
          bxs = "boxlang",
        },
      })

      vim.api.nvim_create_autocmd("FileType", {
        callback = function(args)
          local skip = {
            ["snacks_layout_box"] = true,
            ["snacks_picker_input"] = true,
            ["snacks_picker_list"] = true,
            ["snacks_picker_preview"] = true,
            ["TelescopePrompt"] = true,
            ["TelescopeResults"] = true,
            ["TelescopePreview"] = true,
            ["fzf"] = true,
            ["dirvish"] = true,
            ["netrw"] = true,
            ["help"] = true,
            ["qf"] = true,
            ["gitcommit"] = true,
            ["gitrebase"] = true,
            ["diff"] = true,
          }
          if skip[args.match] then
            return
          end
          vim.treesitter.start()
          vim.bo.indentexpr = "v:lua.require'nvim-treesitter'.indentexpr()"
        end,
      })

      vim.api.nvim_create_autocmd("User", {
        pattern = "VeryLazy",
        once = true,
        callback = function()
          vim.defer_fn(function()
            require("nvim-treesitter").install({
              "bash",
              "c",
              "css",
              "cfml",
              "go",
              "python",
              "c_sharp",
              "html",
              "javascript",
              "json",
              "latex",
              "lua",
              "markdown",
              "markdown_inline",
              "regex",
              "rust",
              "scss",
              "tsx",
              "typescript",
              "typst",
              "vue",
              "yaml",
            })
          end, 100)
        end,
      })
    end,
  },
  {
    "nvim-treesitter/nvim-treesitter-textobjects",
    branch = "main",
    dependencies = { "nvim-treesitter/nvim-treesitter" },
    config = function()
      require("nvim-treesitter-textobjects").setup({
        select = { lookahead = true },
        move = { set_jumps = true },
      })

      local sel = require("nvim-treesitter-textobjects.select").select_textobject
      local mov = require("nvim-treesitter-textobjects.move")

      for _, m in ipairs({
        { "aa", "@parameter.outer" },
        { "ia", "@parameter.inner" },
        { "af", "@function.outer" },
        { "if", "@function.inner" },
        { "ac", "@class.outer" },
        { "ic", "@class.inner" },
      }) do
        vim.keymap.set({ "o", "x" }, m[1], function()
          sel(m[2])
        end)
      end

      for _, m in ipairs({
        { "]m", "goto_next_start", "@function.outer" },
        { "]M", "goto_next_end", "@function.outer" },
        { "]]", "goto_next_start", "@class.outer" },
        { "][", "goto_next_end", "@class.outer" },
        { "[m", "goto_previous_start", "@function.outer" },
        { "[M", "goto_previous_end", "@function.outer" },
        { "[[", "goto_previous_start", "@class.outer" },
        { "[]", "goto_previous_end", "@class.outer" },
      }) do
        vim.keymap.set({ "n", "x", "o" }, m[1], function()
          mov[m[2]](m[3])
        end)
      end
    end,
  },
  {
    "nvim-treesitter/nvim-treesitter-context",
    dependencies = { "nvim-treesitter/nvim-treesitter" },
    opts = { enable = false, max_lines = 1, trim_scope = "inner" },
  },
}
