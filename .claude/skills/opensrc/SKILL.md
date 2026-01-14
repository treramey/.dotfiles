---
name: opensrc
description: Fetch source code for npm, PyPI, or crates.io packages and GitHub/GitLab repos to provide AI agents with implementation context beyond types and docs.
---

# opensrc

CLI tool to fetch source code for packages/repos, giving AI coding agents deeper implementation context.

## When to Use

- Need to understand how a library/package works internally
- Debugging issues where types alone are insufficient
- Exploring implementation patterns in dependencies

## Quick Start

```bash
npm install -g opensrc

# Fetch npm package (auto-detects installed version)
npx opensrc zod

# Fetch from other registries
npx opensrc pypi:requests       # Python/PyPI
npx opensrc crates:serde        # Rust/crates.io

# Fetch GitHub repo
npx opensrc vercel/ai           # owner/repo shorthand
npx opensrc github:owner/repo   # explicit prefix

# Fetch specific version
npx opensrc zod@3.22.0
```

## Commands

| Command | Description |
|---------|-------------|
| `opensrc <packages...>` | Fetch source for packages/repos |
| `opensrc list` | List all fetched sources |
| `opensrc remove <name>` | Remove specific source |
| `opensrc clean` | Remove all sources |

## Output Structure

```
opensrc/
├── settings.json
├── sources.json
└── repos/
    └── github.com/
        └── owner/
            └── repo/
```

## Key Behaviors

1. **Version Detection** - Auto-detects installed version from lockfiles
2. **Repository Resolution** - Resolves package to git repo via registry API
3. **Monorepo Support** - Handles packages via `repository.directory` field
4. **Shallow Clone** - Uses `--depth 1` for efficient cloning
