import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { loadHistory, saveScore, diffScores } from './tracker.js';
import { rmSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { writeFileSync } from 'node:fs';

// Use a temp directory instead of real home dir
const TEST_DIR = join(tmpdir(), `tracker-test-${process.pid}`);
const TEST_SLUG = 'test-tracker-temp';
const TEST_FILE = join(TEST_DIR, `${TEST_SLUG}.json`);

describe('tracker', { concurrency: 1 }, () => {
  beforeEach(() => {
    mkdirSync(TEST_DIR, { recursive: true });
    if (existsSync(TEST_FILE)) rmSync(TEST_FILE);
  });

  afterEach(() => {
    if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true });
  });

  it('loadHistory returns empty array for new repo', () => {
    assert.deepEqual(loadHistory(TEST_SLUG, TEST_DIR), []);
  });

  it('saveScore persists and loadHistory retrieves', () => {
    saveScore(TEST_SLUG, { total: 75, tier: 'A' }, TEST_DIR);
    const history = loadHistory(TEST_SLUG, TEST_DIR);
    assert.equal(history.length, 1);
    assert.equal(history[0].total, 75);
    assert.equal(history[0].tier, 'A');
    assert.ok(history[0].timestamp);
  });

  it('saveScore appends to existing history', () => {
    saveScore(TEST_SLUG, { total: 70 }, TEST_DIR);
    saveScore(TEST_SLUG, { total: 75 }, TEST_DIR);
    const history = loadHistory(TEST_SLUG, TEST_DIR);
    assert.equal(history.length, 2);
  });

  it('loadHistory recovers from corrupted JSON', () => {
    writeFileSync(TEST_FILE, '{invalid json!!!');
    const history = loadHistory(TEST_SLUG, TEST_DIR);
    assert.deepEqual(history, []);
  });

  it('diffScores returns null with < 2 entries', () => {
    assert.equal(diffScores(TEST_SLUG, TEST_DIR), null);
    saveScore(TEST_SLUG, { total: 70 }, TEST_DIR);
    assert.equal(diffScores(TEST_SLUG, TEST_DIR), null);
  });

  it('diffScores shows increase with ↑', () => {
    saveScore(TEST_SLUG, { total: 70 }, TEST_DIR);
    saveScore(TEST_SLUG, { total: 75 }, TEST_DIR);
    const diff = diffScores(TEST_SLUG, TEST_DIR);
    assert.equal(diff.delta, 5);
    assert.equal(diff.arrow, '↑');
  });

  it('diffScores shows decrease with ↓', () => {
    saveScore(TEST_SLUG, { total: 80 }, TEST_DIR);
    saveScore(TEST_SLUG, { total: 72 }, TEST_DIR);
    const diff = diffScores(TEST_SLUG, TEST_DIR);
    assert.equal(diff.delta, -8);
    assert.equal(diff.arrow, '↓');
  });

  it('diffScores shows no change with →', () => {
    saveScore(TEST_SLUG, { total: 75 }, TEST_DIR);
    saveScore(TEST_SLUG, { total: 75 }, TEST_DIR);
    const diff = diffScores(TEST_SLUG, TEST_DIR);
    assert.equal(diff.delta, 0);
    assert.equal(diff.arrow, '→');
  });
});
