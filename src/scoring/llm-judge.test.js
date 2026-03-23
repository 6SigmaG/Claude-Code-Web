import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { parseScores, judgeSkillMd, judgeAll } from './llm-judge.js';

describe('parseScores', () => {
  it('parses valid JSON with all 6 keys', () => {
    const raw = '{"workflowStructure":8,"behavioralConstraints":7,"errorResilience":6,"theoryOfMind":5,"instructionClarity":9,"domainDepth":7}';
    const result = parseScores(raw);
    assert.deepStrictEqual(result, {
      workflowStructure: 8,
      behavioralConstraints: 7,
      errorResilience: 6,
      theoryOfMind: 5,
      instructionClarity: 9,
      domainDepth: 7,
    });
  });

  it('strips markdown code fences', () => {
    const raw = '```json\n{"workflowStructure":8,"behavioralConstraints":7,"errorResilience":6,"theoryOfMind":5,"instructionClarity":9,"domainDepth":7}\n```';
    const result = parseScores(raw);
    assert.equal(result.workflowStructure, 8);
  });

  it('strips bare code fences (no language tag)', () => {
    const raw = '```\n{"workflowStructure":8,"behavioralConstraints":7,"errorResilience":6,"theoryOfMind":5,"instructionClarity":9,"domainDepth":7}\n```';
    const result = parseScores(raw);
    assert.equal(result.instructionClarity, 9);
  });

  it('rounds to 1 decimal place', () => {
    const raw = '{"workflowStructure":8.15,"behavioralConstraints":7.24,"errorResilience":6.56,"theoryOfMind":5.99,"instructionClarity":9.01,"domainDepth":7.5}';
    const result = parseScores(raw);
    assert.equal(result.workflowStructure, 8.2);
    assert.equal(result.errorResilience, 6.6);
    assert.equal(result.theoryOfMind, 6);
    assert.equal(result.instructionClarity, 9);
    assert.equal(result.domainDepth, 7.5);
  });

  it('throws on invalid JSON', () => {
    assert.throws(() => parseScores('not json'), /Failed to parse/);
  });

  it('throws on missing key', () => {
    const raw = '{"workflowStructure":8,"behavioralConstraints":7}';
    assert.throws(() => parseScores(raw), /Invalid score for errorResilience/);
  });

  it('throws on out-of-range score (>10)', () => {
    const raw = '{"workflowStructure":11,"behavioralConstraints":7,"errorResilience":6,"theoryOfMind":5,"instructionClarity":9,"domainDepth":7}';
    assert.throws(() => parseScores(raw), /Invalid score for workflowStructure/);
  });

  it('throws on negative score', () => {
    const raw = '{"workflowStructure":-1,"behavioralConstraints":7,"errorResilience":6,"theoryOfMind":5,"instructionClarity":9,"domainDepth":7}';
    assert.throws(() => parseScores(raw), /Invalid score for workflowStructure/);
  });

  it('throws on non-number score', () => {
    const raw = '{"workflowStructure":"high","behavioralConstraints":7,"errorResilience":6,"theoryOfMind":5,"instructionClarity":9,"domainDepth":7}';
    assert.throws(() => parseScores(raw), /Invalid score for workflowStructure/);
  });

  it('accepts boundary values 0 and 10', () => {
    const raw = '{"workflowStructure":0,"behavioralConstraints":10,"errorResilience":0,"theoryOfMind":10,"instructionClarity":0,"domainDepth":10}';
    const result = parseScores(raw);
    assert.equal(result.workflowStructure, 0);
    assert.equal(result.behavioralConstraints, 10);
  });
});

describe('judgeSkillMd', () => {
  const origEnv = process.env.OPENROUTER_API_KEY;

  afterEach(() => {
    if (origEnv) process.env.OPENROUTER_API_KEY = origEnv;
    else delete process.env.OPENROUTER_API_KEY;
  });

  it('throws when no API key is set', async () => {
    delete process.env.OPENROUTER_API_KEY;
    await assert.rejects(
      () => judgeSkillMd('# My Skill', {}),
      /OPENROUTER_API_KEY not set/
    );
  });

  it('accepts apiKey via opts', async () => {
    delete process.env.OPENROUTER_API_KEY;
    // Will fail on network, but should NOT throw "API key not set"
    await assert.rejects(
      () => judgeSkillMd('# My Skill', { apiKey: 'test-key-123' }),
      (err) => !err.message.includes('API_KEY not set')
    );
  });
});

describe('judgeAll', () => {
  const origEnv = process.env.OPENROUTER_API_KEY;

  afterEach(() => {
    if (origEnv) process.env.OPENROUTER_API_KEY = origEnv;
    else delete process.env.OPENROUTER_API_KEY;
  });

  it('returns Map with null for failed calls (graceful degradation)', async () => {
    // No API key → all calls fail, but judgeAll should NOT throw
    delete process.env.OPENROUTER_API_KEY;
    const skills = [
      { name: 'skill-a', content: '# Skill A' },
      { name: 'skill-b', content: '# Skill B' },
    ];
    const results = await judgeAll(skills, { apiKey: 'bad-key' });
    assert.equal(results instanceof Map, true);
    assert.equal(results.size, 2);
    // Both should be null (network fails in sandbox)
    assert.equal(results.has('skill-a'), true);
    assert.equal(results.has('skill-b'), true);
  });

  it('returns empty Map for empty input', async () => {
    const results = await judgeAll([], { apiKey: 'any-key' });
    assert.equal(results instanceof Map, true);
    assert.equal(results.size, 0);
  });

  it('preserves skill names as map keys', async () => {
    delete process.env.OPENROUTER_API_KEY;
    const skills = [{ name: 'my-special-skill', content: '# Hello' }];
    const results = await judgeAll(skills, { apiKey: 'test' });
    assert.equal(results.has('my-special-skill'), true);
  });
});
