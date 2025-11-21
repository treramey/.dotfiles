-- Create a user command to toggle diagnostics
-- This ensures consistent toggling between command and key binding
vim.api.nvim_create_user_command("ToggleDiagnostics", function()
  -- require("snacks").toggle.diagnostics():toggle()
end, {})
