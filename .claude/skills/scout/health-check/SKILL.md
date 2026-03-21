---
name: health-check
description: |
  Scan all locally installed Claude Code skills and produce a health report.
  Checks SKILL.md quality, frontmatter validity, completion protocols, escalation
  paths, and overall prompt engineering quality. Use to audit your skill collection.
allowed-tools:
  - Glob
  - Read
  - Grep
  - Bash
---

# /health-check — Installed Skills Health Report

## Workflow

### Step 1: Discover All Installed Skills

```bash
# Find all SKILL.md files
find .claude/skills -name "SKILL.md" -o -name "SKILL.md.tmpl" | head -100
```

Use Glob to find `.claude/skills/**/SKILL.md` and `.claude/skills/**/SKILL.md.tmpl`.

### Step 2: Analyze Each Skill

For each SKILL.md, check:

**Frontmatter Health:**
- [ ] Has valid YAML frontmatter (--- delimited)
- [ ] Has `name:` field
- [ ] Has `description:` field
- [ ] Has `allowed-tools:` field
- [ ] Description is actionable (not just a title)

**Content Quality Signals:**
- [ ] Has multi-step workflow (Phase/Step structure)
- [ ] Has completion protocol (DONE/BLOCKED/NEEDS_CONTEXT)
- [ ] Has escalation path ("stop and ask" instructions)
- [ ] Has behavioral constraints (Iron Laws, "never"/"do NOT")
- [ ] Has error handling (what to do when things fail)
- [ ] Has AskUserQuestion format guidelines

**Anti-Pattern Detection:**
- [ ] Vague instructions ("handle appropriately", "use best judgment")
- [ ] Missing failure paths (only happy path described)
- [ ] No completion protocol (skill never says "done")
- [ ] Overly long without structure (wall of text)

### Step 3: Output Health Report

```
╔══════════════════════════════════════════════════╗
║  Skill Health Report                              ║
╚══════════════════════════════════════════════════╝

Scanned: XX skills across XX collections

✅ Healthy (XX):
  gstack/review — frontmatter ✓, workflow ✓, constraints ✓, escalation ✓
  superpowers/tdd — frontmatter ✓, workflow ✓, constraints ✓, escalation ✓

⚠️  Needs Attention (XX):
  antfu-skills/pnpm — missing completion protocol, no escalation path
  anthropic/code-review — no behavioral constraints

❌ Unhealthy (XX):
  compound-engineering/... — no frontmatter, no structure

Summary:
  Frontmatter: XX/XX valid
  Completion Protocol: XX/XX present
  Behavioral Constraints: XX/XX present
  Escalation Path: XX/XX present
```

## Completion Protocol
- **DONE** — Health report generated for all installed skills.
- **BLOCKED** — No .claude/skills/ directory found.
