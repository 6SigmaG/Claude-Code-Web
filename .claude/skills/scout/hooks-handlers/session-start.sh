#!/usr/bin/env bash

# Scout session-start hook
# Injects skill health awareness into the session context

cat << 'EOF'
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "Scout Skill Health Monitor is active.\n\nYou have the following Scout skills available:\n- /score <url> — Evaluate a skill repo (3-tier 12-dimension scoring)\n- /compare <url1> <url2> — AEE head-to-head comparison\n- /discover — Search for new skill repos\n- /health-check — Audit installed skills quality\n- /skill-conflicts — Detect slash command conflicts\n\nOn session start, briefly check if there are any obvious skill issues by scanning .claude/skills/**/SKILL.md for missing frontmatter. If issues found, mention them once (e.g. 'Scout detected X skills with missing frontmatter — run /health-check for details'). Do NOT run a full health check automatically — just a quick scan."
  }
}
EOF

exit 0
