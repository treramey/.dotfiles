---
name: agent-browser
description: Browser automation CLI for AI agents using Playwright. Use when tasks require web browsing, scraping, form filling, or web interaction.
---

# agent-browser

Browser automation CLI for AI agents. Built on Playwright.

## Installation

```bash
npm install -g agent-browser
agent-browser install  # Download Chromium
```

## Core Workflow

1. **Open page**: `agent-browser open <url>`
2. **Get snapshot**: `agent-browser snapshot -i` (interactive elements only)
3. **Use refs**: `agent-browser click @e2` / `agent-browser fill @e3 "text"`
4. **Repeat snapshot** after page changes

## Refs (Primary Selection Method)

Snapshot generates ARIA accessibility tree with `[ref=eN]` tags.

```bash
agent-browser snapshot
# - heading "Example Domain" [ref=e1]
# - button "Submit" [ref=e2]
# - textbox "Email" [ref=e3]

agent-browser click @e2
agent-browser fill @e3 "test@example.com"
```

## Commands

### Navigation
```bash
agent-browser open <url>
agent-browser back
agent-browser forward
agent-browser reload
agent-browser close
```

### Interaction
```bash
agent-browser click <sel>
agent-browser fill <sel> <text>
agent-browser type <sel> <text>
agent-browser press <key>
agent-browser hover <sel>
agent-browser select <sel> <val>
agent-browser check <sel>
agent-browser scroll up|down|left|right [px]
```

### Get Info
```bash
agent-browser get text <sel>
agent-browser get html <sel>
agent-browser get value <sel>
agent-browser get attr <sel> <attr>
agent-browser get title
agent-browser get url
```

### Snapshot Options
```bash
agent-browser snapshot            # Full tree
agent-browser snapshot -i         # Interactive only
agent-browser snapshot -c         # Compact
agent-browser snapshot -d 3       # Limit depth
```

### Screenshots
```bash
agent-browser screenshot [path]
agent-browser screenshot --full   # Full page
agent-browser pdf <path>
```

### Wait
```bash
agent-browser wait <selector>
agent-browser wait <ms>
agent-browser wait --text "Welcome"
agent-browser wait --url "**/dashboard"
```

## Patterns

### Login Flow
```bash
agent-browser open https://example.com/login
agent-browser snapshot -i
agent-browser fill @e2 "username"
agent-browser fill @e3 "password"
agent-browser click @e4
agent-browser wait --url "**/dashboard"
```

## Anti-Patterns

- Don't use CSS selectors when refs available
- Don't skip snapshot after page changes
- Don't use `type` when `fill` works
- Don't hardcode wait times - use semantic waits
