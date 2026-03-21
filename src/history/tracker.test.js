import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { loadHistory, saveScore, diffScores } from './tracker.js';
import { rmSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const SCORES_DIR = join(homedir(), '.claude-code-web', 'scores');
// Use a slug that won't be changed by slugify
const TEST_SLUG = 'test-tracker-temp';
const TEST_FILE = join(SCORES_DIR, `${TEST_SLUG}.json`);

describe('tracker', { concurrency: 1 }, () => {
  beforeEach(() => {
    mkdirSync(SCORES_DIR, { recursive: true });
    if (existsSync(TEST_FILE)) rmSync(TEST_FILE);
  });

  afterEach(() => {
    if (existsSync(TEST_FILE)) rmSync(TEST_FILE);
  });

  it('loadHistory returns empty array for new repo', () => {
    assert.deepEqual(loadHistory(TEST_SLUG), []);
  });

  it('saveScore persists and loadHistory retrieves', () => {
    saveScore(TEST_SLUG, { total: 75, tier: 'A' });
    const history = loadHistory(TEST_SLUG);
    assert.equal(history.length, 1);
    assert.equal(history[0].total, 75);
    assert.equal(history[0].tier, 'A');
    assert.ok(history[0].timestamp);
  });

  it('saveScore appends to existing history', () => {
    saveScore(TEST_SLUG, { total: 70 });
    saveScore(TEST_SLUG, { total: 75 });
    const history = loadHistory(TEST_SLUG);
    assert.equal(history.length, 2);
  });

  it('loadHistory recovers from corrupted JSON', () => {
    writeFileSync(TEST_FILE, '{invalid json!!!');
    const history = loadHistory(TEST_SLUG);
    assert.deepEqual(history, []);
  });

  it('diffScores returns null with < 2 entries', () => {
    assert.equal(diffScores(TEST_SLUG), null);
    saveScore(TEST_SLUG, { total: 70 });
    assert.equal(diffScores(TEST_SLUG), null);
  });

  it('diffScores shows increase with ↑', () => {
    saveScore(TEST_SLUG, { total: 70 });
    saveScore(TEST_SLUG, { total: 75 });
    const diff = diffScores(TEST_SLUG);
    assert.equal(diff.delta, 5);
    assert.equal(diff.arrow, '↑');
  });

  it('diffScores shows decrease with ↓', () => {
    saveScore(TEST_SLUG, { total: 80 });
    saveScore(TEST_SLUG, { total: 72 });
    const diff = diffScores(TEST_SLUG);
    assert.equal(diff.delta, -8);
    assert.equal(diff.arrow, '↓');
  });

  it('diffScores shows no change with →', () => {
    saveScore(TEST_SLUG, { total: 75 });
    saveScore(TEST_SLUG, { total: 75 });
    const diff = diffScores(TEST_SLUG);
    assert.equal(diff.delta, 0);
    assert.equal(diff.arrow, '→');
  });
});
