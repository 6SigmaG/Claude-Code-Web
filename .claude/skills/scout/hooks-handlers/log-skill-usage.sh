#!/usr/bin/env bash

# PostToolUse hook: logs Scout skill invocations to telemetry.
# Reads tool_name and tool_input from stdin (Claude Code hook protocol).
# Only logs when a Scout skill (score, compare, discover, health-check, skill-conflicts) is detected.

SCOUT_SKILLS="score|compare|discover|health-check|skill-conflicts"
TELEMETRY_DIR="${HOME}/.claude-code-web/telemetry"
USAGE_FILE="${TELEMETRY_DIR}/usage.jsonl"

# Read hook input from stdin
INPUT=$(cat)

# Extract tool name from the hook input
TOOL_NAME=$(echo "$INPUT" | grep -oP '"tool_name"\s*:\s*"[^"]*"' | head -1 | sed 's/.*"tool_name"\s*:\s*"\([^"]*\)".*/\1/')

# Check if this is a Skill tool invocation with a scout skill
SKILL_NAME=$(echo "$INPUT" | grep -oP '"skill"\s*:\s*"('"$SCOUT_SKILLS"')"' | head -1 | sed 's/.*"skill"\s*:\s*"\([^"]*\)".*/\1/')

if [ -n "$SKILL_NAME" ]; then
  mkdir -p "$TELEMETRY_DIR"
  TIMESTAMP=$(date +%s%3N)
  echo "{\"skill\":\"${SKILL_NAME}\",\"timestamp\":${TIMESTAMP},\"meta\":{}}" >> "$USAGE_FILE"
fi

exit 0
