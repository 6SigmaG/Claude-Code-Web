/**
 * Runtime telemetry — tracks Scout skill usage frequency.
 * Stores data as JSONL in ~/.claude-code-web/telemetry/usage.jsonl
 */

import { appendFileSync, readFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { homedir } from 'node:os';

/**
 * Default path for usage telemetry file.
 */
export function getUsagePath() {
  return join(homedir(), '.claude-code-web', 'telemetry', 'usage.jsonl');
}

/**
 * Log a skill usage event.
 * @param {string} skill - Skill name (e.g. 'score', 'compare')
 * @param {object} meta - Additional metadata
 * @param {string} [filePath] - Override file path (for testing)
 */
export function logUsage(skill, meta = {}, filePath) {
  const path = filePath || getUsagePath();
  const dir = dirname(path);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  const entry = {
    skill,
    timestamp: Date.now(),
    meta
  };
  appendFileSync(path, JSON.stringify(entry) + '\n');
}

/**
 * Get aggregated usage statistics.
 * @param {string} [filePath] - Override file path (for testing)
 * @returns {{ totalCalls: number, skillCounts: Record<string, number> }}
 */
export function getUsageStats(filePath) {
  const path = filePath || getUsagePath();
  if (!existsSync(path)) {
    return { totalCalls: 0, skillCounts: {} };
  }

  const lines = readFileSync(path, 'utf-8').trim().split('\n').filter(Boolean);
  const skillCounts = {};
  let totalCalls = 0;

  for (const line of lines) {
    try {
      const entry = JSON.parse(line);
      skillCounts[entry.skill] = (skillCounts[entry.skill] || 0) + 1;
      totalCalls++;
    } catch {
      // Skip corrupted lines
    }
  }

  return { totalCalls, skillCounts };
}
