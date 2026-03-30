---
name: jira-tool
description: Create, update, transition, and manage Jira tickets via MCP. Use when working with Jira issues, tracking work, automating ticket workflows, or when the user mentions Jira, tickets, sprints, backlogs, or issue keys like PROJ-123.
---

# Jira Tool

Manage Jira issues using the Atlassian MCP tools.

## Quick Reference

| Task | MCP Tool |
|------|----------|
| Create ticket | `mcp__claude_ai_Atlassian__createJiraIssue` |
| Get ticket | `mcp__claude_ai_Atlassian__getJiraIssue` |
| Edit ticket | `mcp__claude_ai_Atlassian__editJiraIssue` |
| Add comment | `mcp__claude_ai_Atlassian__addCommentToJiraIssue` |
| Transition | `mcp__claude_ai_Atlassian__transitionJiraIssue` |
| List transitions | `mcp__claude_ai_Atlassian__getTransitionsForJiraIssue` |
| Search (JQL) | `mcp__claude_ai_Atlassian__searchJiraIssuesUsingJql` |
| Assign | `mcp__claude_ai_Atlassian__editJiraIssue` (set assignee) |
| Link issues | `mcp__claude_ai_Atlassian__createIssueLink` |
| Log work | `mcp__claude_ai_Atlassian__addWorklogToJiraIssue` |
| Lookup user | `mcp__claude_ai_Atlassian__lookupJiraAccountId` |
| List projects | `mcp__claude_ai_Atlassian__getVisibleJiraProjects` |
| Issue types | `mcp__claude_ai_Atlassian__getJiraProjectIssueTypesMetadata` |

## Common JQL Queries

| Query | JQL |
|-------|-----|
| My open tickets | `assignee = currentUser() AND status != Done` |
| Project backlog | `project = PROJ AND status = "To Do"` |
| Recently updated | `project = PROJ AND updated >= -7d` |
| High priority | `priority in (High, Highest) AND status != Done` |
| Sprint active | `project = PROJ AND sprint in openSprints()` |

## Workflows

### Create and start work

1. `createJiraIssue` — create the ticket
2. `getTransitionsForJiraIssue` — list available transitions
3. `transitionJiraIssue` — move to "In Progress"

### Update progress

1. `addCommentToJiraIssue` — add status update
2. `addWorklogToJiraIssue` — log time if needed

### Close ticket

1. `getTransitionsForJiraIssue` — find the close/done transition
2. `transitionJiraIssue` — transition to Done/Closed/Resolved

### Assign to someone

1. `lookupJiraAccountId` — find the user's account ID by name/email
2. `editJiraIssue` — set assignee field

### Link to epic or parent

1. `getIssueLinkTypes` — find available link types
2. `createIssueLink` — link the issues

## Tips

- Use `lookupJiraAccountId` before assigning — Jira needs account IDs, not usernames
- Use `getTransitionsForJiraIssue` before transitioning — available transitions depend on current status and workflow
- Use `getJiraProjectIssueTypesMetadata` to discover valid issue types and required fields before creating
- JQL is powerful — prefer it over multiple get calls when searching
