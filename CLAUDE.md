# Claude Code Web - Skills & Plugins Collection

This repository is a personal collection for cloud-based Claude Code Web sessions,
including skills, plugins, projects, and configurations.

## Repository Structure

```
.claude/
  skills/
    gstack/                  # Garry Tan's gstack - virtual engineering team skills
    superpowers/             # Jesse Vincent's superpowers - TDD/subagent methodology
    antfu-skills/            # Anthony Fu's curated agent skills
    hashicorp/               # HashiCorp official Terraform/Packer skills
    compound-engineering/    # Every Inc's compound engineering plugin
    agentsys/                # Avi Fenesh's agent automation system
    everything-claude-code/  # Affaan Mustafa's harness optimization system
    anthropic/               # Official Anthropic Claude Code plugins (46)
```

## Installed Skills

### Tier 1 — Creator Background + Quality + Battle-tested

#### gstack (by Garry Tan)
**Creator:** YC President & CEO, serial founder
A "software factory" that transforms Claude Code into a virtual engineering team.
Sprint workflow: Think -> Plan -> Build -> Review -> Test -> Ship -> Reflect

Key commands: `/office-hours`, `/plan-ceo-review`, `/plan-eng-review`, `/plan-design-review`,
`/design-consultation`, `/design-review`, `/review`, `/investigate`, `/qa`, `/ship`,
`/browse`, `/careful`, `/freeze`, `/unfreeze`, `/guard`, `/retro`, `/document-release`

#### superpowers (by Jesse Vincent / obra)
**Creator:** Perl 5 pumpking, Request Tracker creator, Keyboardio co-founder. Simon Willison says he's "one of the most creative users of coding agents"
93K+ stars. The #1 Claude Code plugin. Enforces TDD, subagent-driven development,
systematic debugging, and Socratic brainstorming.

Key commands: `/brainstorming`, `/execute-plan`, `/tdd`, `/debug`

#### antfu-skills (by Anthony Fu)
**Creator:** Vue/Vite/Nuxt core team member, open source legend
3.5K stars. Curated collection of agent skills reflecting his best practices.
Also created `skills-cli` (`npx skills`) for cross-agent skill management.

Focus: TypeScript, ESM, Vue, Vite, ESLint, pnpm, Vitest

#### hashicorp/agent-skills (by HashiCorp)
**Creator:** HashiCorp (creators of Terraform, Vault, Consul, Packer)
Official Terraform + Packer skills: code generation, module generation, provider development.

#### compound-engineering (by Every Inc)
**Creator:** Every Inc — media tech company, internally validated
"Compound Engineering" methodology — each engineering cycle compounds:
plans inform future plans, reviews catch more, patterns get documented.
100+ framework support, MCP servers, cross-tool config sync.

### Tier 2 — Battle-tested + Community Validated

#### agentsys (by Avi Fenesh)
**Creator:** Valkey GLIDE maintainer, agent-sh org founder
13 plugins, 42 agents, 28 skills. Tested on 1000+ repositories.
Regex/AST/static analysis for detection, LLM for synthesis/planning/review.

#### everything-claude-code (by Affaan Mustafa)
**Creator:** Anthropic hackathon winner, 10+ months daily intensive use
9 agents, 11 skills, 11 commands, 10 hooks, 997 internal tests passing.
AgentShield integration with 102 security rules.

### Anthropic Official Plugins (46 plugins)
Located in `.claude/skills/anthropic/`, including:

**Development:** agent-sdk-dev, feature-dev, frontend-design, playground, plugin-dev, skill-creator,
code-simplifier, typescript-lsp, pyright-lsp, rust-analyzer-lsp, gopls-lsp, + more LSP plugins

**Productivity:** code-review, pr-review-toolkit, commit-commands, claude-code-setup,
claude-md-management, hookify

**Integrations:** github, gitlab, slack, discord, telegram, linear, asana, notion

**Database:** firebase, supabase, stripe

**Testing:** playwright | **Security:** security-guidance

**Learning:** explanatory-output-style, learning-output-style

---

## Repo Evaluation Framework (筛选标准体系)

### Scoring Dimensions (each 0-10, weighted)

| Dimension | Weight | Criteria |
|-----------|--------|----------|
| **Creator Credibility** | 25% | Founder/CxO of notable company, core maintainer of major OSS, published thought leader, Anthropic affiliation |
| **Battle-tested** | 25% | Used in production, internal dogfooding evidence, test count, months of active use, real-world validation |
| **Technical Quality** | 20% | Code structure, documentation, tests, error handling, modularity, follows Claude skill standards |
| **Community Signal** | 15% | GitHub stars, forks, contributors, featured in curated lists, Anthropic marketplace listing |
| **Relevance & Scope** | 15% | Addresses real workflow pain points, composable with other skills, cloud-compatible |

### Creator Tier Classification

| Tier | Definition | Examples |
|------|-----------|----------|
| **S** | AI company founders/leadership, major OSS creators, industry leaders | Garry Tan (YC), Jesse Vincent (Perl/Superpowers), Anthony Fu (Vue) |
| **A** | Engineers at top companies, OSS maintainers, hackathon winners | Avi Fenesh (Valkey), Affaan Mustafa (Anthropic hackathon), HashiCorp |
| **B** | Active contributors with proven track record, respected bloggers | Community developers with 1K+ star repos |
| **C** | New/unverified creators | First repos, no track record |

### Quality Signals (Red Flags vs Green Flags)

**Green Flags:**
- Has comprehensive tests (>100)
- Active maintenance (commits within 30 days)
- Listed in anthropic marketplace or awesome-claude-code
- Cross-agent support (Claude Code + Codex + others)
- Clear SKILL.md with proper frontmatter
- "Boil the lake" completeness over shortcuts

**Red Flags:**
- No tests, no documentation
- Single commit / abandoned
- Claims without evidence ("1000+ skills" but empty folders)
- Copies/forks of other repos without attribution
- No real-world usage evidence

### Automated Screening Pipeline (Future)

```
Phase 1: Discovery
  - Scrape GitHub topics: claude-code, claude-skills, agent-skills
  - Monitor awesome-claude-code list changes
  - Track anthropic marketplace additions

Phase 2: Scoring
  - API: stars, forks, contributors, commit frequency
  - Scan: test count, SKILL.md presence, file structure
  - NLP: README quality, creator bio analysis

Phase 3: Classification
  - Auto-tier by score threshold (S: 8+, A: 6+, B: 4+, C: <4)
  - Flag for manual review if borderline

Phase 4: Integration
  - Auto-clone qualified repos
  - Generate standardized index
  - Diff-update on schedule
```

## Notes

- gstack's `/browse` and `/qa` require Playwright Chromium (may not work in cloud)
- LSP plugins require their respective language servers
- External integrations (Slack, GitHub, etc.) require API tokens
- superpowers requires Claude Code 2.0.13+
