---
name: score
description: |
  Score any Claude Code skill repo by GitHub URL or local path.
  Evaluates content quality (50%), engineering quality (20%), and ecosystem signals (30%)
  using a 3-tier 12-dimension framework. Claude reads and understands SKILL.md files
  directly, then calls the JS calculator for deterministic scoring.
  Use when evaluating whether a skill repo is worth installing.
allowed-tools:
  - Bash
  - Read
  - Glob
  - Grep
  - WebFetch
  - Agent
---

# /score — Skill Repo Scorer

## Usage
`/score <github-url>` or `/score <local-path>` or `/score` (score all installed)

## Workflow

### Step 1: Collect Data

**If GitHub URL provided:**
```bash
# Extract owner/repo from URL (validate format)
URL="$1"
OWNER_REPO=$(echo "$URL" | grep -oP 'github\.com/\K[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+' | head -1)
if [ -z "$OWNER_REPO" ]; then
  echo "ERROR: Invalid GitHub URL. Expected format: https://github.com/owner/repo"
  exit 1
fi

# Fetch repo metadata via gh API
gh api "repos/$OWNER_REPO" --jq '{stars: .stargazers_count, forks: .forks_count, description: .description}' 2>/dev/null || echo '{"error": "gh api failed"}'

# Fetch recent commits
gh api "repos/$OWNER_REPO/commits?per_page=100" --jq 'length' 2>/dev/null || echo "0"

# Fetch contributors count
gh api "repos/$OWNER_REPO/contributors?per_page=1&anon=true" -i 2>/dev/null | grep -i 'link:' | grep -oP 'page=\K[0-9]+(?=>; rel="last")' || echo "1"
```

Then use WebFetch to download SKILL.md files from the repo's raw content.

**If local path or no arg (score installed skills):**
Use Glob to find all SKILL.md files under `.claude/skills/` and Read each one.

### Step 2: Analyze Content (Claude does this directly)

For each SKILL.md file, evaluate on a 0-10 scale:

**Tier 1: Content Quality (50%)**
1. **Workflow Structure** (12%) — Count phases/steps, decision branches, completion protocols. Multi-step pipelines with gates score high. Single-page references score low.
2. **Behavioral Constraints** (12%) — Look for Iron Laws, Red Flags sections, "never"/"do NOT" directives, anti-rationalization defenses. More explicit constraints = higher score.
3. **Error Resilience** (8%) — BLOCKED/NEEDS_CONTEXT protocols, escalation paths, retry limits. Does it handle failure gracefully?
4. **Theory of Mind** (8%) — Does it anticipate agent shortcuts? User confusion? Edge cases? The best skills predict how Claude will try to cheat.
5. **Instruction Clarity** (5%) — Unambiguous, executable, correctly ordered instructions. No vague "handle appropriately."
6. **Domain Depth** (5%) — Technical accuracy, reference quality, practical examples.

**Tier 2: Engineering Quality (20%)**
7. **Test Coverage** (8%) — Count test files, test types (unit/integration/e2e).
8. **Infrastructure** (5%) — Build system, template generation, CI/CD.
9. **Cross-Skill Composition** (4%) — References to sibling skills, declared dependencies.
10. **Cross-Platform Support** (3%) — Supports Claude Code + other agents (Codex, Cursor, etc.).

**Tier 3: Ecosystem Signals (30%)**
11. **Creator Credibility** (15%) — Use creator-tier.js classification.
12. **Community Validation** (8%) — Stars, marketplace listing, awesome-list.
13. **Maintenance Activity** (5%) — Recent commits, contributor count.
14. **Usage Evidence** (2%) — Telemetry, user testimonials, downstream adoption.

### Step 3: Calculate Score

Pass the 12 dimension scores (0-10 each) to the JS calculator:

```bash
echo '{"content":{"workflowStructure":X,"behavioralConstraints":X,"errorResilience":X,"theoryOfMind":X,"instructionClarity":X,"domainDepth":X},"engineering":{"testCoverage":X,"infrastructure":X,"crossSkillComposition":X,"crossPlatformSupport":X},"ecosystem":{"creatorCredibility":X,"communityValidation":X,"maintenanceActivity":X,"usageEvidence":X}}' | node src/scoring/calc.js
```

### Step 4: Output Scorecard

Present results in this format:

```
╔══════════════════════════════════════════════════╗
║  Skill Scout — Scorecard                         ║
╚══════════════════════════════════════════════════╝

[TIER] │ █████████░ XX/100 │ repo-name
  │ Content: XX/50 │ Engineering: XX/20 │ Ecosystem: XX/30
  │ Creator: X-tier │ ✓ green-flags │ ✗ red-flags
  │
  │ Top strengths:
  │   • ...
  │ Key weaknesses:
  │   • ...
```

### Step 5: Save History

After scoring, save the result for trend tracking.

## Calibration Reference

When scoring, use these as anchors:
- gstack ≈ 80/100 (strong workflow + constraints, S- creator)
- superpowers ≈ 75/100 (best behavioral constraints, S creator)
- antfu-skills ≈ 50/100 (knowledge-base style, not workflow)
- compound-engineering ≈ 35/100 (tool, not skill collection)

## Completion Protocol

- **DONE** — Score calculated and displayed with full breakdown.
- **BLOCKED** — Cannot access repo (404, private, no gh CLI). Show what data was available.
- **NEEDS_CONTEXT** — Multiple SKILL.md found, need user to specify which to score.
