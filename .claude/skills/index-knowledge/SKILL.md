---
name: index-knowledge
description: Generate hierarchical AGENTS.md knowledge base for a codebase. Creates root + complexity-scored subdirectory documentation.
---

# index-knowledge

Generate hierarchical AGENTS.md files. Root + complexity-scored subdirectories.

## Usage

```
--create-new   # Remove all → regenerate from scratch
--max-depth=2  # Limit directory depth (default: 5)
```

Default: Update mode (modify existing + create new where warranted)

## Workflow

1. **Discovery + Analysis** (concurrent)
   - Launch parallel explore agents
   - Bash structure + read existing AGENTS.md

2. **Score & Decide** - Determine AGENTS.md locations

3. **Generate** - Root first, then subdirs in parallel

4. **Review** - Deduplicate, trim, validate

## Scoring Matrix

| Factor | Weight | High Threshold |
|--------|--------|----------------|
| File count | 3x | >20 |
| Subdir count | 2x | >5 |
| Code ratio | 2x | >70% |
| Module boundary | 2x | Has index.ts/__init__.py |

## Decision Rules

| Score | Action |
|-------|--------|
| **Root (.)** | ALWAYS create |
| **>15** | Create AGENTS.md |
| **8-15** | Create if distinct domain |
| **<8** | Skip (parent covers) |

## Root AGENTS.md Template

```markdown
# PROJECT KNOWLEDGE BASE

## OVERVIEW
{1-2 sentences: what + core stack}

## STRUCTURE
{root}/
├── {dir}/    # {non-obvious purpose only}

## WHERE TO LOOK
| Task | Location | Notes |

## CONVENTIONS
{ONLY deviations from standard}

## ANTI-PATTERNS
{Explicitly forbidden here}

## COMMANDS
{dev/test/build}
```

## Anti-Patterns

- **Over-documenting**: Not every dir needs AGENTS.md
- **Redundancy**: Child never repeats parent
- **Generic content**: Remove anything that applies to ALL projects
- **Verbose style**: Telegraphic or die
