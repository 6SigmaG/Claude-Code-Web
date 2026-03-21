import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { logUsage, getUsageStats, getUsagePath } from './usage.js';
import { mkdirSync, rmSync, existsSync, readFileSync, appendFileSync } from 'node:fs';
import { join } from 'node:path';

const TEST_DIR = join(process.env.HOME || '/tmp', '.claude-code-web', 'telemetry-test');

describe('telemetry/usage', { concurrency: 1 }, () => {
  beforeEach(() => {
    // Clean test directory
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true });
    }
    mkdirSync(TEST_DIR, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true });
    }
  });

  it('logUsage creates usage file if not exists', () => {
    const file = join(TEST_DIR, 'usage.jsonl');
    logUsage('score', { repo: 'test/repo' }, file);
    assert.ok(existsSync(file));
  });

  it('logUsage appends JSONL entries', () => {
    const file = join(TEST_DIR, 'usage.jsonl');
    logUsage('score', { repo: 'test/a' }, file);
    logUsage('compare', { repos: ['a', 'b'] }, file);
    const lines = readFileSync(file, 'utf-8').trim().split('\n');
    assert.equal(lines.length, 2);
    const entry1 = JSON.parse(lines[0]);
    const entry2 = JSON.parse(lines[1]);
    assert.equal(entry1.skill, 'score');
    assert.equal(entry2.skill, 'compare');
  });

  it('logUsage includes timestamp', () => {
    const file = join(TEST_DIR, 'usage.jsonl');
    const before = Date.now();
    logUsage('discover', {}, file);
    const after = Date.now();
    const entry = JSON.parse(readFileSync(file, 'utf-8').trim());
    assert.ok(entry.timestamp >= before);
    assert.ok(entry.timestamp <= after);
  });

  it('logUsage includes metadata', () => {
    const file = join(TEST_DIR, 'usage.jsonl');
    logUsage('score', { repo: 'foo/bar', score: 85 }, file);
    const entry = JSON.parse(readFileSync(file, 'utf-8').trim());
    assert.equal(entry.meta.repo, 'foo/bar');
    assert.equal(entry.meta.score, 85);
  });

  it('getUsageStats returns empty stats for missing file', () => {
    const file = join(TEST_DIR, 'nonexistent.jsonl');
    const stats = getUsageStats(file);
    assert.deepEqual(stats.skillCounts, {});
    assert.equal(stats.totalCalls, 0);
  });

  it('getUsageStats counts skill usage correctly', () => {
    const file = join(TEST_DIR, 'usage.jsonl');
    logUsage('score', {}, file);
    logUsage('score', {}, file);
    logUsage('compare', {}, file);
    logUsage('health-check', {}, file);
    const stats = getUsageStats(file);
    assert.equal(stats.totalCalls, 4);
    assert.equal(stats.skillCounts.score, 2);
    assert.equal(stats.skillCounts.compare, 1);
    assert.equal(stats.skillCounts['health-check'], 1);
  });

  it('getUsageStats handles corrupted lines gracefully', () => {
    const file = join(TEST_DIR, 'usage.jsonl');
    logUsage('score', {}, file);
    // Append corrupted line
    appendFileSync(file, 'not-json\n');
    logUsage('compare', {}, file);
    const stats = getUsageStats(file);
    assert.equal(stats.totalCalls, 2); // skips corrupted line
    assert.equal(stats.skillCounts.score, 1);
    assert.equal(stats.skillCounts.compare, 1);
  });

  it('getUsagePath returns default path under ~/.claude-code-web', () => {
    const path = getUsagePath();
    assert.ok(path.includes('.claude-code-web'));
    assert.ok(path.endsWith('usage.jsonl'));
  });
});
