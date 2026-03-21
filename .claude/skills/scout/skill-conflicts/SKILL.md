---
name: skill-conflicts
description: |
  Detect slash command conflicts across installed skill collections.
  Scans all SKILL.md files for registered command names and reports
  duplicates. Use when you have multiple skill sets that might register
  the same slash commands.
allowed-tools:
  - Glob
  - Grep
  - Read
---

# /skill-conflicts — Slash Command Conflict Detector

## Workflow

### Step 1: Scan All Skills

Use Glob to find all `.claude/skills/**/SKILL.md` files.
Use Grep to search for `name:` fields in frontmatter across all SKILL.md files.

### Step 2: Extract Command Names

For each SKILL.md:
1. Read the frontmatter `name:` field — this is the slash command name
2. Note which skill collection it belongs to (parent directory)

### Step 3: Detect Conflicts

Group commands by name. Any command name registered by 2+ skill collections is a conflict.

### Step 4: Output Report

```
╔══════════════════════════════════════════════════╗
║  Skill Conflict Report                            ║
╚══════════════════════════════════════════════════╝

Scanned: XX commands across XX skill collections

⚠️  Conflicts Found (XX):

  /review
    • gstack/review/SKILL.md — "Code review before merge..."
    • anthropic/code-review/SKILL.md — "Review code changes..."
    → RECOMMENDATION: gstack version has completion protocol + escalation. Prefer it.

  /debug
    • superpowers/systematic-debugging/SKILL.md — "Systematic debugging..."
    • agentsys/.../SKILL.md — "Debug issues..."
    → RECOMMENDATION: superpowers version uses Iron Laws methodology. Prefer it.

✅ No Conflicts (XX commands):
  /score, /discover, /health-check, /ship, /tdd, ...

Resolution options:
  A) Rename conflicting skills (rename SKILL.md name: field)
  B) Remove the weaker duplicate
  C) Keep both (Claude will pick based on context)
```

## Completion Protocol
- **DONE** — Conflict report generated. Conflicts listed with recommendations.
- **DONE** (no conflicts) — "No conflicts found across XX commands."
