# Claude Code Web - Skills & Plugins Collection

This repository is a personal collection for cloud-based Claude Code Web sessions,
including skills, plugins, projects, and configurations.

## Repository Structure

```
.claude/
  skills/
    gstack/        # Garry Tan's gstack - virtual engineering team skills
    anthropic/     # Official Anthropic Claude Code plugins collection
```

## Installed Skills

### gstack (by Garry Tan)
A "software factory" that transforms Claude Code into a virtual engineering team.
Sprint workflow: Think -> Plan -> Build -> Review -> Test -> Ship -> Reflect

Key commands:
- `/office-hours` - Product strategy brainstorming
- `/plan-ceo-review` - Scope review (expand/narrow/pivot/approve)
- `/plan-eng-review` - Architecture review with ASCII diagrams
- `/plan-design-review` - Design critique with scoring
- `/design-consultation` - Research-backed design system
- `/design-review` - Design audit and fixes
- `/review` - Staff engineer code review
- `/investigate` - Systematic root-cause debugging
- `/qa` - Browser-based QA testing
- `/ship` - Release engineering (sync, test, PR)
- `/browse` - Headless Chromium navigation
- `/careful` - Safety guardrail for destructive commands
- `/freeze` / `/unfreeze` - Edit lock/unlock
- `/guard` - Combined safety (careful + freeze)
- `/retro` - Weekly retrospectives
- `/document-release` - Auto-update documentation

### Anthropic Official Plugins (46 plugins)
Located in `.claude/skills/anthropic/`, including:

**Development:** agent-sdk-dev, feature-dev, frontend-design, playground, plugin-dev, skill-creator, code-simplifier, typescript-lsp, pyright-lsp, rust-analyzer-lsp, gopls-lsp, and more LSP plugins

**Productivity:** code-review, pr-review-toolkit, commit-commands, claude-code-setup, claude-md-management, hookify

**Integrations:** github, gitlab, slack, discord, telegram, linear, asana, notion

**Database:** firebase, supabase, stripe

**Testing:** playwright

**Security:** security-guidance

**Learning:** explanatory-output-style, learning-output-style

## Notes

- gstack's `/browse` and `/qa` features require Playwright Chromium (may not work in cloud environments)
- LSP plugins require their respective language servers to be installed
- External integration plugins (Slack, GitHub, etc.) require API tokens/configuration
