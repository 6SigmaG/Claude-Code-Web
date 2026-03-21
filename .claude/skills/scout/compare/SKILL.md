---
name: compare
description: |
  Head-to-head comparison of two Claude Code skill repos using the AEE
  (Adversarial Epistemic Engine) framework. Analyzes both skills from
  multiple perspectives to give a thorough, balanced comparison.
  Use when deciding between two similar skills.
allowed-tools:
  - Read
  - WebFetch
  - Bash
  - Glob
  - Agent
---

# /compare — AEE Skill Comparison

## Usage
`/compare <url-or-path-1> <url-or-path-2>`

## Workflow

### Step 1: Load Both Skills

For each skill (URL or local path):
- If GitHub URL: use WebFetch to download SKILL.md, use `gh api` for metadata
- If local path: Read the SKILL.md directly

### Step 2: AEE Dual-Perspective Analysis

Analyze both skills from two opposing perspectives:

**Perspective A — Advocate for Skill 1:**
- What does Skill 1 do better?
- Where is its prompt engineering stronger?
- What use cases does it serve better?

**Perspective B — Advocate for Skill 2:**
- What does Skill 2 do better?
- Where is its prompt engineering stronger?
- What use cases does it serve better?

### Step 3: Dimension-by-Dimension Comparison

Compare on each of the 12 scoring dimensions:

```
DIMENSION                  | SKILL 1    | SKILL 2    | WINNER
---------------------------|------------|------------|--------
Workflow Structure         | X/10       | X/10       | →
Behavioral Constraints     | X/10       | X/10       | →
Error Resilience           | X/10       | X/10       | →
Theory of Mind             | X/10       | X/10       | →
Instruction Clarity        | X/10       | X/10       | →
Domain Depth               | X/10       | X/10       | →
Test Coverage              | X/10       | X/10       | →
Infrastructure             | X/10       | X/10       | →
Cross-Skill Composition    | X/10       | X/10       | →
Cross-Platform Support     | X/10       | X/10       | →
Creator Credibility        | X/10       | X/10       | →
Community Validation       | X/10       | X/10       | →
```

### Step 4: Synthesis

```
╔══════════════════════════════════════════════════╗
║  AEE Comparison: skill-1 vs skill-2              ║
╚══════════════════════════════════════════════════╝

Overall: Skill 1 (XX/100) vs Skill 2 (XX/100)

Skill 1 wins on: [list dimensions]
Skill 2 wins on: [list dimensions]

RECOMMENDATION: [Choose X because...]

Key insight: [The most important difference that matters for your use case]
```

### Step 5: Conflict Check

If both skills register similar slash commands, note the conflict and recommend which to keep.

## Completion Protocol
- **DONE** — Comparison complete with recommendation.
- **BLOCKED** — Cannot access one or both skills.
- **NEEDS_CONTEXT** — Skills serve completely different purposes. Comparison not meaningful.
