---
name: skill-creator
description: Guide for creating effective skills. Use when users want to create or update a skill that extends agent capabilities with specialized knowledge, workflows, or tool integrations.
---

# Skill Creator

Guide for creating effective skills.

## About Skills

Skills are modular, self-contained packages that extend an agent's capabilities by providing specialized knowledge, workflows, and tools.

### Anatomy of a Skill

```
skill-name/
├── SKILL.md (required)
│   ├── YAML frontmatter (name, description)
│   └── Markdown instructions
└── Bundled Resources (optional)
    ├── scripts/      - Executable code
    ├── references/   - Documentation
    └── assets/       - Templates, icons, fonts
```

### Requirements

- `SKILL.md` should be **less than 200 lines**
- Each script/reference should also be **less than 200 lines**
- Descriptions must contain enough usecases for automatic activation

## SKILL.md Format

**YAML Frontmatter (REQUIRED on line 1):**

```yaml
---
name: skill-name
description: What this skill does and when to use it.
---
```

**Required fields:**
- `name` — hyphen-case identifier matching directory name
- `description` — activation trigger; be specific about WHEN to use

## Skill Creation Process

### Step 1: Understanding with Concrete Examples

Ask questions like:
- "What functionality should this skill support?"
- "Can you give examples of how this skill would be used?"
- "What would a user say that should trigger this skill?"

### Step 2: Planning the Reusable Contents

For each example, identify:
1. What scripts would be helpful?
2. What references/documentation needed?
3. What assets (templates, etc.) needed?

### Step 3: Create the Skill

Structure:
- Keep SKILL.md lean (under 200 lines)
- Use `references/` for detailed documentation
- Use `scripts/` for deterministic reliability
- Use `assets/` for templates and output resources

### Step 4: Write SKILL.md

Answer:
1. What is the purpose of the skill?
2. When should the skill be used?
3. How should the agent use the skill?

**Writing Style:** Use imperative/infinitive form (verb-first instructions).

## Pre-Submission Checklist

- [ ] SKILL.md starts with `---` (YAML frontmatter, line 1)
- [ ] `name:` field present and matches directory name
- [ ] `description:` field present with specific activation triggers
- [ ] SKILL.md under 200 lines
- [ ] All referenced files exist
