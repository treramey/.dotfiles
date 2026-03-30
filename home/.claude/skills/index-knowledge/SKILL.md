---
name: index-knowledge
description: Generate hierarchical AGENTS.md knowledge base for a codebase. Creates root + complexity-scored subdirectory documentation. Use when the user asks to "index", "document", "generate AGENTS.md", "create knowledge base", "map this codebase", or wants agent-friendly documentation for a project. Also trigger when user says "index-knowledge" or wants to understand/document project structure for AI agents.
---

# index-knowledge

Generate hierarchical AGENTS.md files. Root + complexity-scored subdirectories.

## Usage

```
--create-new   # Read existing -> remove all -> regenerate from scratch
--max-depth=2  # Limit directory depth (default: 5)
```

Default: Update mode (modify existing + create new where warranted)

---

## Workflow (High-Level)

1. **Discovery + Analysis** (concurrent) — parallel Explore agents + bash structure + existing AGENTS.md
2. **Score & Decide** — determine AGENTS.md locations from merged findings
3. **Generate** — root first, then subdirs in parallel
4. **Review** — deduplicate, trim, validate

---

## Phase 1: Discovery + Analysis (Concurrent)

### Launch Parallel Explore Agents

Use the Agent tool with `subagent_type="Explore"`. Launch ALL agents in a single message for parallel execution.

```
Agent(subagent_type="Explore", description="project structure",
  prompt="Project structure: PREDICT standard patterns for detected language -> REPORT deviations only")

Agent(subagent_type="Explore", description="entry points",
  prompt="Entry points: FIND main files -> REPORT non-standard organization")

Agent(subagent_type="Explore", description="conventions",
  prompt="Conventions: FIND config files (.eslintrc, pyproject.toml, .editorconfig) -> REPORT project-specific rules")

Agent(subagent_type="Explore", description="anti-patterns",
  prompt="Anti-patterns: FIND 'DO NOT', 'NEVER', 'ALWAYS', 'DEPRECATED' comments -> LIST forbidden patterns")

Agent(subagent_type="Explore", description="build/ci",
  prompt="Build/CI: FIND .github/workflows, Makefile -> REPORT non-standard patterns")

Agent(subagent_type="Explore", description="test patterns",
  prompt="Test patterns: FIND test configs, test structure -> REPORT unique conventions")
```

### Dynamic Agent Spawning

After bash analysis, spawn ADDITIONAL Explore agents based on project scale:

| Factor | Threshold | Additional Agents |
|--------|-----------|-------------------|
| Total files | >100 | +1 per 100 files |
| Total lines | >10k | +1 per 10k lines |
| Directory depth | >=4 | +2 for deep exploration |
| Large files (>500 lines) | >10 files | +1 for complexity hotspots |
| Monorepo | detected | +1 per package/workspace |
| Multiple languages | >1 | +1 per language |

### Main Session: Concurrent Analysis

**While Explore agents execute**, main session does:

#### 1. Bash Structural Analysis
```bash
# Directory depth + file counts
find . -type d -not -path '*/\.*' -not -path '*/node_modules/*' -not -path '*/venv/*' -not -path '*/dist/*' -not -path '*/build/*' | awk -F/ '{print NF-1}' | sort -n | uniq -c

# Files per directory (top 30)
find . -type f -not -path '*/\.*' -not -path '*/node_modules/*' | sed 's|/[^/]*$||' | sort | uniq -c | sort -rn | head -30

# Code concentration by extension
find . -type f \( -name "*.py" -o -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.go" -o -name "*.rs" \) -not -path '*/node_modules/*' | sed 's|/[^/]*$||' | sort | uniq -c | sort -rn | head -20

# Existing AGENTS.md / CLAUDE.md
find . -type f \( -name "AGENTS.md" -o -name "CLAUDE.md" \) -not -path '*/node_modules/*' 2>/dev/null
```

#### 2. Read Existing AGENTS.md

For each existing file found: Read it, extract key insights/conventions/anti-patterns, store in memory.

If `--create-new`: Read all existing first (preserve context) -> then delete all -> regenerate.

#### 3. LSP Codemap (if available)

Use the LSP tool to gather symbol information when available:
- Document symbols for entry points
- Workspace symbols for classes, interfaces, functions
- Find references for centrality analysis of top exports

**LSP Fallback**: If unavailable, rely on Explore agents + Grep.

**Merge all results: bash + LSP + existing + Explore agent results.**

---

## Phase 2: Scoring & Location Decision

### Scoring Matrix

| Factor | Weight | High Threshold | Source |
|--------|--------|----------------|--------|
| File count | 3x | >20 | bash |
| Subdir count | 2x | >5 | bash |
| Code ratio | 2x | >70% | bash |
| Unique patterns | 1x | Has own config | explore |
| Module boundary | 2x | Has index.ts/__init__.py | bash |
| Symbol density | 2x | >30 symbols | LSP |
| Export count | 2x | >10 exports | LSP |
| Reference centrality | 3x | >20 refs | LSP |

### Decision Rules

| Score | Action |
|-------|--------|
| Root (.) | ALWAYS create |
| >15 | Create AGENTS.md |
| 8-15 | Create if distinct domain |
| <8 | Skip (parent covers) |

### Output
```
AGENTS_LOCATIONS = [
  { path: ".", type: "root" },
  { path: "src/hooks", score: 18, reason: "high complexity" },
  { path: "src/api", score: 12, reason: "distinct domain" }
]
```

---

## Phase 3: Generate AGENTS.md

### Root AGENTS.md (Full Treatment)

```markdown
# PROJECT KNOWLEDGE BASE

**Generated:** {TIMESTAMP}
**Commit:** {SHORT_SHA}
**Branch:** {BRANCH}

## OVERVIEW
{1-2 sentences: what + core stack}

## STRUCTURE
\`\`\`
{root}/
├── {dir}/    # {non-obvious purpose only}
└── {entry}
\`\`\`

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|

## CODE MAP
{From LSP - skip if unavailable or project <10 files}

| Symbol | Type | Location | Refs | Role |

## CONVENTIONS
{ONLY deviations from standard}

## ANTI-PATTERNS (THIS PROJECT)
{Explicitly forbidden here}

## UNIQUE STYLES
{Project-specific}

## COMMANDS
\`\`\`bash
{dev/test/build}
\`\`\`

## NOTES
{Gotchas}
```

**Quality gates**: 50-150 lines, no generic advice, no obvious info.

### Subdirectory AGENTS.md (Parallel)

Launch general-purpose agents for each location in ONE message (parallel execution):

```
Agent(description="AGENTS.md for src/hooks",
  prompt="Generate AGENTS.md for: src/hooks
    - Reason: high complexity
    - 30-80 lines max
    - NEVER repeat parent content
    - Sections: OVERVIEW (1 line), STRUCTURE (if >5 subdirs), WHERE TO LOOK, CONVENTIONS (if different), ANTI-PATTERNS
    - Write directly to src/hooks/AGENTS.md")

Agent(description="AGENTS.md for src/api",
  prompt="Generate AGENTS.md for: src/api
    - Reason: distinct domain
    - 30-80 lines max
    - NEVER repeat parent content
    - Sections: OVERVIEW (1 line), STRUCTURE (if >5 subdirs), WHERE TO LOOK, CONVENTIONS (if different), ANTI-PATTERNS
    - Write directly to src/api/AGENTS.md")
```

---

## Phase 4: Review & Deduplicate

For each generated file:
- Remove generic advice (anything that applies to ALL projects)
- Remove parent duplicates (child never repeats parent)
- Trim to size limits (root: 50-150 lines, subdirs: 30-80 lines)
- Verify telegraphic style

---

## Final Report

```
=== index-knowledge Complete ===

Mode: {update | create-new}

Files:
  + ./AGENTS.md (root, {N} lines)
  + ./src/hooks/AGENTS.md ({N} lines)

Dirs Analyzed: {N}
AGENTS.md Created: {N}
AGENTS.md Updated: {N}

Hierarchy:
  ./AGENTS.md
  └── src/hooks/AGENTS.md
```

---

## Anti-Patterns

- **Static agent count**: Vary agents based on project size/depth
- **Sequential execution**: Parallel (multiple Agent calls in one message)
- **Ignoring existing**: Read existing first, even with --create-new
- **Over-documenting**: Not every dir needs AGENTS.md
- **Redundancy**: Child never repeats parent
- **Generic content**: Remove anything that applies to ALL projects
- **Verbose style**: Telegraphic or die
