return {
  "https://codeberg.org/oricat/cfcomplete.nvim",
  dependencies = { "saghen/blink.compat" },
  ft = { "cfm", "cfc" },
  config = function()
    require("cfcomplete").setup({
      json_path = vim.fn.stdpath("data") .. "/lucee-docs-json",
      file_patterns = { "*.cfm", "*.cfc" },
      enable_documentation = true,
    })
  end,
}
