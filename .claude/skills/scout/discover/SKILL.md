---
name: discover
description: |
  Discover new Claude Code skill repos using web search.
  Searches GitHub for skill repos, evaluates each one, and recommends
  the best candidates for installation. Use when looking for new skills
  to add to your collection.
allowed-tools:
  - WebSearch
  - WebFetch
  - Bash
  - Read
  - Glob
  - Agent
---

# /discover — Skill Repo Discovery

## Workflow

### Step 1: Search for Skill Repos

Use WebSearch with these queries (run 2-3 in parallel):
- `"claude code" skills github 2026`
- `claude-code-skills agent-skills github`
- `awesome-claude-code skill repo`

### Step 2: Filter Results

For each result:
1. Must be a GitHub repository
2. Must contain SKILL.md or .claude/skills/ directory
3. Skip repos already installed (check against `.claude/skills/*/`)
4. Skip forks without attribution

### Step 3: Quick Evaluate

For each candidate (max 10), do a quick evaluation:
1. Fetch repo metadata via `gh api repos/{owner}/{repo}`
2. Use WebFetch to download the main SKILL.md or README
3. Quick-score: creator tier + stars + has SKILL.md + active maintenance

### Step 4: Present Candidates

```
╔══════════════════════════════════════════════════╗
║  Skill Discovery — New Repos Found               ║
╚══════════════════════════════════════════════════╝

Found XX new skill repos. Top candidates:

1. repo-name (★ 1234) — S-tier creator
   "Brief description from README"
   Quick score: ~XX/100
   → Run /score <url> for full evaluation

2. ...
```

### Step 5: Deep Score (on request)

If the user wants to score a specific candidate, run the full /score workflow on it.

## Completion Protocol
- **DONE** — Discovery complete. XX new repos found, XX candidates presented.
- **DONE** (none found) — "No new skill repos found matching search criteria."
- **BLOCKED** — WebSearch unavailable. Try again later.
