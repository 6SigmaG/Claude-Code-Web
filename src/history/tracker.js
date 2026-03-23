/**
 * Score History Tracker
 *
 * Persists scores to ~/.claude-code-web/scores/{repo-slug}.json
 * Provides diff/trend calculation between runs.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const DEFAULT_SCORES_DIR = join(homedir(), '.claude-code-web', 'scores');

function ensureDir(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function scorePath(name, scoresDir) {
  return join(scoresDir, `${slugify(name)}.json`);
}

export function loadHistory(name, scoresDir) {
  const dir = scoresDir || DEFAULT_SCORES_DIR;
  const path = scorePath(name, dir);
  if (!existsSync(path)) return [];
  try {
    const data = JSON.parse(readFileSync(path, 'utf8'));
    return Array.isArray(data) ? data : [];
  } catch {
    // Corrupted JSON — reset
    return [];
  }
}

export function saveScore(name, scoreEntry, scoresDir) {
  const dir = scoresDir || DEFAULT_SCORES_DIR;
  ensureDir(dir);
  const history = loadHistory(name, dir);
  history.push({
    ...scoreEntry,
    timestamp: new Date().toISOString(),
  });
  try {
    writeFileSync(scorePath(name, dir), JSON.stringify(history, null, 2));
  } catch (e) {
    console.error(`[WARN] Failed to save score history for ${name}: ${e.message}`);
  }
}

export function diffScores(name, scoresDir) {
  const dir = scoresDir || DEFAULT_SCORES_DIR;
  const history = loadHistory(name, dir);
  if (history.length < 2) return null;

  const prev = history[history.length - 2];
  const curr = history[history.length - 1];

  const delta = Math.round((curr.total - prev.total) * 10) / 10;
  const arrow = delta > 0 ? '↑' : delta < 0 ? '↓' : '→';

  return {
    previous: prev.total,
    current: curr.total,
    delta,
    arrow,
    previousDate: prev.timestamp,
    currentDate: curr.timestamp,
  };
}
