return {
  "rose-pine/neovim",
  lazy = false,
  name = "rose-pine",
  config = function()
    require("rose-pine").setup({
      styles = {
        transparency = true,
      },
      highlight_groups = {
        IndentLineCurrent = { fg = "muted" },
        MatchParen = { fg = "love", bg = "love", blend = 25 },
        QuickFixFilename = { fg = "text" },

        DartCurrentLabel = { fg = "gold", bg = "overlay", bold = true },
        DartCurrentLabelModified = { fg = "gold", bg = "overlay", bold = true },
        DartCurrentModified = { fg = "text", bg = "overlay", bold = true },
        DartMarkedCurrentLabel = { fg = "gold", bg = "overlay", bold = true },
        DartMarkedCurrentLabelModified = { fg = "gold", bg = "overlay", bold = true },
        DartMarkedCurrentModified = { fg = "text", bg = "overlay", bold = true },
        DartMarkedLabel = { fg = "gold", bg = "surface", bold = true },
        DartMarkedLabelModified = { fg = "gold", bg = "text", bold = true },
        DartPickLabel = { fg = "gold", bg = "none", bold = true },
        DartVisibleLabel = { fg = "gold", bg = "surface", bold = true },
        DartVisibleLabelModified = { fg = "gold", bg = "text", bold = true },

        EasyDotnetDebuggerFloatVariable = { fg = "text", bg = "overlay" },
        EasyDotnetDebuggerVirtualException = { fg = "love", italic = true },
        EasyDotnetDebuggerVirtualVariable = { fg = "iris", italic = true },
        EasyDotnetTestRunnerProject = { fg = "rose" },
        EasyDotnetTestRunnerSolution = { fg = "pine" },
        EasyDotnetTestRunnerTest = { fg = "iris" },

        OilGitAdded = { fg = "foam" },
        OilGitModified = { fg = "rose" },
        OilGitRenamed = { fg = "pine" },
        OilGitUntracked = { fg = "subtle" },
        OilGitIgnored = { fg = "muted" },

        RenderMarkdownCode = { bg = "overlay" },
        RenderMarkdownCodeInline = { fg = "text", bg = "surface" },

        SidekickDiffAdd = { fg = "foam", bg = "foam", blend = 25 },
        SidekickDiffContext = { fg = "muted", bg = "none" },
        SidekickDiffDelete = { fg = "love", bg = "love", blend = 25 },

        SnacksDashboardDesc = { fg = "muted" },
        SnacksDashboardDir = { fg = "muted", italic = true },
        SnacksDashboardFile = { fg = "text" },
        SnacksDashboardFooter = { fg = "text" },
        SnacksDashboardSpecial = { fg = "muted", italic = true },
        SnacksDashboardTitle = { fg = "text" },
        SnacksIndentScope = { fg = "muted" },

        StatusLineTerm = { link = "StatuslineTextMain" },
        StatuslineFilepath = { fg = "muted", bg = "none", italic = true },
        StatuslineModeCommand = { fg = "love", bg = "none", bold = true },
        StatuslineModeInsert = { fg = "foam", bg = "none", bold = true },
        StatuslineModeNormal = { fg = "pine", bg = "none", bold = true },
        StatuslineModeOther = { fg = "pine", bg = "none", bold = true },
        StatuslineModeReplace = { fg = "rose", bg = "none", bold = true },
        StatuslineModeVisual = { fg = "iris", bg = "none", bold = true },
        StatuslineTextAccent = { fg = "muted", bg = "none" },
        StatuslineTextMain = { fg = "text", bg = "none" },

        -- Base diff (matches delta rose-pine: plus=#323b47, minus=#412839)
        DiffAdd = { bg = "#323b47" },
        DiffChange = { bg = "#2a2837" },
        DiffDelete = { bg = "#412839" },
        DiffText = { bg = "#71929c" },

        MergeDiffOurs = { fg = "base", bg = "pine", bold = true },
        MergeDiffTheirs = { fg = "base", bg = "foam", bold = true },
        MergeDiffLocal = { fg = "base", bg = "gold", bold = true },

        -- Per-pane diff highlights (hex bg, matching delta aesthetic)
        -- OURS: pine-tinted (#31748f)
        MergeOursDiffAdd = { bg = "#273647" },
        MergeOursDiffChange = { bg = "#1f2d3a" },
        MergeOursDiffText = { bg = "#2e5468" },
        MergeOursDiffDelete = { bg = "#412839" },

        -- THEIRS: foam-tinted (#9ccfd8)
        MergeTheirsDiffAdd = { bg = "#253b40" },
        MergeTheirsDiffChange = { bg = "#1f2f33" },
        MergeTheirsDiffText = { bg = "#3a6b73" },
        MergeTheirsDiffDelete = { bg = "#412839" },

        -- LOCAL: gold-tinted (#f6c177)
        MergeLocalDiffAdd = { bg = "#3a3328" },
        MergeLocalDiffChange = { bg = "#2e2a22" },
        MergeLocalDiffText = { bg = "#5c4d2e" },
        MergeLocalDiffDelete = { bg = "#412839" },

        -- git-conflict inline markers (hex from delta minus/plus palette)
        GitConflictCurrent = { bg = "#323b47" },
        GitConflictCurrentLabel = { bg = "#3d4a59", bold = true },
        GitConflictIncoming = { bg = "#253b40" },
        GitConflictIncomingLabel = { bg = "#2f4b52", bold = true },
        GitConflictAncestor = { bg = "#412839" },
        GitConflictAncestorLabel = { bg = "#69394e", bold = true },

        WilderAccent = { fg = "gold", bg = "none" },
        WilderMauve = { fg = "foam", bg = "none" },
        WilderText = { fg = "text", bg = "none" },
      },
    })
    vim.cmd("colorscheme rose-pine")
  end,
}
