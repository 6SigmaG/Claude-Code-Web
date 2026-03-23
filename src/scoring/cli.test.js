import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { KNOWN_REPOS, scoreEngineering, scoreEcosystem, findLargestSkillMd } from './cli.js';

// ─── KNOWN_REPOS validation ───

describe('KNOWN_REPOS', () => {
  it('contains 8 repos', () => {
    assert.equal(KNOWN_REPOS.length, 8);
  });

  it('every repo has required metadata fields', () => {
    const requiredKeys = ['name', 'dir', 'creator', 'stars', 'forks', 'contributors',
      'lastCommitDaysAgo', 'commitCount', 'testCount', 'hasDocumentation',
      'hasSkillMd', 'hasProperFrontmatter', 'skillCount', 'isFork'];
    for (const repo of KNOWN_REPOS) {
      for (const key of requiredKeys) {
        assert.ok(key in repo, `${repo.name} missing field: ${key}`);
      }
    }
  });

  it('every repo name matches its dir', () => {
    for (const repo of KNOWN_REPOS) {
      assert.equal(repo.name, repo.dir, `name/dir mismatch: ${repo.name} vs ${repo.dir}`);
    }
  });

  it('no duplicate names', () => {
    const names = KNOWN_REPOS.map(r => r.name);
    assert.equal(new Set(names).size, names.length);
  });

  it('all stars/forks/contributors are non-negative integers', () => {
    for (const repo of KNOWN_REPOS) {
      assert.ok(Number.isInteger(repo.stars) && repo.stars >= 0, `${repo.name} bad stars`);
      assert.ok(Number.isInteger(repo.forks) && repo.forks >= 0, `${repo.name} bad forks`);
      assert.ok(Number.isInteger(repo.contributors) && repo.contributors >= 0, `${repo.name} bad contributors`);
    }
  });
});

// ─── scoreEngineering ───

describe('scoreEngineering', () => {
  it('returns all 4 dimensions', () => {
    const result = scoreEngineering(KNOWN_REPOS[0]);
    assert.deepStrictEqual(Object.keys(result).sort(),
      ['crossPlatformSupport', 'crossSkillComposition', 'infrastructure', 'testCoverage']);
  });

  it('all scores are 0-10', () => {
    for (const repo of KNOWN_REPOS) {
      const result = scoreEngineering(repo);
      for (const [key, val] of Object.entries(result)) {
        assert.ok(val >= 0 && val <= 10, `${repo.name}.${key} = ${val} out of range`);
      }
    }
  });

  it('high test count gets high testCoverage', () => {
    const result = scoreEngineering({ testCount: 200, commitCount: 500, contributors: 10, hasDocumentation: true, skillCount: 20, supportedAgents: ['a', 'b', 'c'] });
    assert.ok(result.testCoverage >= 7, `expected >=7, got ${result.testCoverage}`);
  });

  it('zero test count gets zero testCoverage', () => {
    const result = scoreEngineering({ testCount: 0, commitCount: 0, contributors: 0, hasDocumentation: false, skillCount: 0, supportedAgents: [] });
    assert.equal(result.testCoverage, 0);
  });

  it('multi-agent support yields high crossPlatformSupport', () => {
    const result = scoreEngineering({ testCount: 0, commitCount: 0, contributors: 0, hasDocumentation: false, skillCount: 0, supportedAgents: ['claude-code', 'codex', 'cursor'] });
    assert.ok(result.crossPlatformSupport >= 8);
  });

  it('single agent yields low crossPlatformSupport', () => {
    const result = scoreEngineering({ testCount: 0, commitCount: 0, contributors: 0, hasDocumentation: false, skillCount: 0, supportedAgents: ['claude-code'] });
    assert.ok(result.crossPlatformSupport <= 4);
  });
});

// ─── scoreEcosystem ───

describe('scoreEcosystem', () => {
  it('returns creatorTier + 4 numeric dimensions', () => {
    const result = scoreEcosystem(KNOWN_REPOS[0]);
    assert.ok('creatorTier' in result);
    assert.ok('creatorCredibility' in result);
    assert.ok('communityValidation' in result);
    assert.ok('maintenanceActivity' in result);
    assert.ok('usageEvidence' in result);
  });

  it('all numeric scores are 0-10', () => {
    for (const repo of KNOWN_REPOS) {
      const result = scoreEcosystem(repo);
      for (const [key, val] of Object.entries(result)) {
        if (key === 'creatorTier') continue;
        assert.ok(val >= 0 && val <= 10, `${repo.name}.${key} = ${val} out of range`);
      }
    }
  });

  it('superpowers (93K stars) gets high communityValidation', () => {
    const sp = KNOWN_REPOS.find(r => r.name === 'superpowers');
    const result = scoreEcosystem(sp);
    assert.ok(result.communityValidation >= 8, `expected >=8, got ${result.communityValidation}`);
  });

  it('anthropic creator gets S tier', () => {
    const anthropic = KNOWN_REPOS.find(r => r.name === 'anthropic');
    const result = scoreEcosystem(anthropic);
    assert.equal(result.creatorTier, 'S');
  });

  it('recent commit (<=7 days) gets high maintenance', () => {
    const result = scoreEcosystem({ ...KNOWN_REPOS[0], lastCommitDaysAgo: 3 });
    assert.ok(result.maintenanceActivity >= 8);
  });

  it('stale repo (>90 days) gets low maintenance', () => {
    const result = scoreEcosystem({ ...KNOWN_REPOS[0], lastCommitDaysAgo: 180 });
    assert.ok(result.maintenanceActivity <= 2);
  });
});

// ─── findLargestSkillMd ───

describe('findLargestSkillMd', () => {
  it('returns content and refCount for existing skill dir', () => {
    const result = findLargestSkillMd('gstack');
    assert.ok(typeof result.content === 'string');
    assert.ok(typeof result.refCount === 'number');
    assert.ok(result.refCount >= 1, 'gstack should have at least 1 SKILL.md');
  });

  it('returns empty content for non-existent dir', () => {
    const result = findLargestSkillMd('this-dir-does-not-exist-12345');
    assert.equal(result.content, '');
    assert.equal(result.refCount, 0);
  });

  it('content is non-empty for known repos with SKILL.md', () => {
    const result = findLargestSkillMd('superpowers');
    assert.ok(result.content.length > 0, 'superpowers SKILL.md should have content');
  });
});

// ─── CLI subprocess integration test ───

describe('CLI subprocess (static-only mode)', () => {
  it('runs successfully and outputs expected format', () => {
    const cliPath = resolve('src/scoring/cli.js');
    const output = execFileSync('node', [cliPath], {
      encoding: 'utf8',
      timeout: 30000,
      env: { ...process.env, OPENROUTER_API_KEY: '' }, // force static-only
    });

    // Check header
    assert.ok(output.includes('Skill Scout'), 'should contain header');
    assert.ok(output.includes('Content-First'), 'should mention Content-First mode');

    // Check all 8 repos appear
    for (const repo of KNOWN_REPOS) {
      assert.ok(output.includes(repo.name), `output should contain ${repo.name}`);
    }

    // Check tier labels appear
    assert.ok(/[SABC] │/.test(output), 'should contain tier labels');

    // Check summary line
    assert.ok(output.includes('Total: 8 repos scored'), 'should show total count');
    assert.ok(output.includes('Static-only'), 'should indicate static-only mode');
  });

  it('sorts repos by score descending', () => {
    const cliPath = resolve('src/scoring/cli.js');
    const output = execFileSync('node', [cliPath], {
      encoding: 'utf8',
      timeout: 30000,
      env: { ...process.env, OPENROUTER_API_KEY: '' },
    });

    // Extract scores from output lines like "S │ ████████████████░░░░ 82.3 │ superpowers"
    const scorePattern = /[SABC] │ [█░]+ (\d+\.\d+) │/g;
    const scores = [];
    let m;
    while ((m = scorePattern.exec(output)) !== null) {
      scores.push(parseFloat(m[1]));
    }

    assert.ok(scores.length === 8, `expected 8 scores, got ${scores.length}`);
    for (let i = 1; i < scores.length; i++) {
      assert.ok(scores[i - 1] >= scores[i], `scores not sorted: ${scores[i - 1]} < ${scores[i]}`);
    }
  });
});
