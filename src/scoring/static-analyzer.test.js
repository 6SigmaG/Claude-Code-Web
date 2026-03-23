import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { analyzeContent, normalizeIndicators } from './static-analyzer.js';

// --- analyzeContent tests ---

describe('analyzeContent', () => {
  it('extracts step_count from ## Step headings', () => {
    const content = '## Step 1\ndo stuff\n## Step 2\nmore stuff\n## Step 3\nfinal';
    const result = analyzeContent(content);
    assert.equal(result.step_count, 3);
  });

  it('extracts step_count from ## Phase headings', () => {
    const content = '## Phase 1: Setup\nstuff\n## Phase 2: Build\nmore';
    const result = analyzeContent(content);
    assert.equal(result.step_count, 2);
  });

  it('counts mixed Step and Phase headings', () => {
    const content = '## Step 0\n## Phase 1\n## Step 2\n## Section 3';
    const result = analyzeContent(content);
    assert.equal(result.step_count, 3); // Section doesn't count
  });

  it('extracts command_count from bash code blocks', () => {
    const content = '```bash\necho hi\n```\ntext\n```shell\nls\n```\ntext\n```js\ncode\n```';
    const result = analyzeContent(content);
    assert.equal(result.command_count, 2); // only bash and shell
  });

  it('extracts conditional_count', () => {
    const content = 'If the user says yes\nelse do nothing\nwhen the flag is set\notherwise skip';
    const result = analyzeContent(content);
    assert.ok(result.conditional_count >= 3); // if, else, when
  });

  it('extracts error_token_count', () => {
    const content = 'STOP. Do not proceed.\nBLOCKED by missing data.\nescalate to user.\nnever skip tests.\ndo NOT delete files.';
    const result = analyzeContent(content);
    assert.ok(result.error_token_count >= 5);
  });

  it('extracts anti_pattern_count', () => {
    const content = 'BAD: skipping tests\nBAD: ignoring errors\nAnti-pattern: catch-all\nrationalization trap';
    const result = analyzeContent(content);
    assert.ok(result.anti_pattern_count >= 3);
  });

  it('extracts table_count', () => {
    const content = '| A | B |\n|---|---|\n| 1 | 2 |\n\ntext\n\n| X | Y |\n|---|---|\n| 3 | 4 |';
    const result = analyzeContent(content);
    assert.equal(result.table_count, 2);
  });

  it('extracts cross_skill_refs', () => {
    const content = 'Run /ship first.\nThen use /review.\nAlso see /browse for QA.';
    const result = analyzeContent(content);
    assert.ok(result.cross_skill_refs >= 3);
  });

  it('detects has_frontmatter with valid YAML', () => {
    const content = '---\nname: test-skill\ndescription: A test\nallowed-tools:\n  - Bash\n---\n# Content';
    const result = analyzeContent(content);
    assert.equal(result.has_frontmatter, true);
  });

  it('detects missing frontmatter', () => {
    const content = '# Just a heading\nSome content without frontmatter.';
    const result = analyzeContent(content);
    assert.equal(result.has_frontmatter, false);
  });

  it('detects has_completion_protocol', () => {
    const content = 'Report status using:\n- **DONE** — completed\n- **BLOCKED** — cannot proceed\n- **NEEDS_CONTEXT** — missing info';
    const result = analyzeContent(content);
    assert.equal(result.has_completion_protocol, true);
  });

  it('detects missing completion protocol', () => {
    const content = '# Simple skill\nJust do the thing.';
    const result = analyzeContent(content);
    assert.equal(result.has_completion_protocol, false);
  });

  it('detects has_escalation', () => {
    const content = 'Escalation format:\n```\nSTATUS: BLOCKED\nREASON: something\n```';
    const result = analyzeContent(content);
    assert.equal(result.has_escalation, true);
  });

  it('detects missing escalation', () => {
    const content = '# Skill\nDo stuff.\nNo error handling.';
    const result = analyzeContent(content);
    assert.equal(result.has_escalation, false);
  });

  it('counts total_word_count', () => {
    const content = 'one two three four five six seven eight nine ten';
    const result = analyzeContent(content);
    assert.equal(result.total_word_count, 10);
  });

  it('returns all zeros for empty content', () => {
    const result = analyzeContent('');
    assert.equal(result.step_count, 0);
    assert.equal(result.command_count, 0);
    assert.equal(result.conditional_count, 0);
    assert.equal(result.error_token_count, 0);
    assert.equal(result.anti_pattern_count, 0);
    assert.equal(result.table_count, 0);
    assert.equal(result.cross_skill_refs, 0);
    assert.equal(result.has_frontmatter, false);
    assert.equal(result.has_completion_protocol, false);
    assert.equal(result.has_escalation, false);
    assert.equal(result.total_word_count, 0);
    assert.equal(result.reference_file_count, 0);
  });

  it('handles reference_file_count parameter', () => {
    const result = analyzeContent('content', { referenceFileCount: 3 });
    assert.equal(result.reference_file_count, 3);
  });
});

// --- normalizeIndicators tests ---

describe('normalizeIndicators', () => {
  it('returns 6 dimension scores all in 0-10 range', () => {
    const raw = {
      step_count: 5, command_count: 10, conditional_count: 3,
      error_token_count: 8, anti_pattern_count: 2, table_count: 5,
      cross_skill_refs: 2, has_frontmatter: true,
      has_completion_protocol: true, has_escalation: true,
      total_word_count: 2000, reference_file_count: 1,
    };
    const scores = normalizeIndicators(raw);
    for (const [key, val] of Object.entries(scores)) {
      assert.ok(val >= 0 && val <= 10, `${key}=${val} out of range`);
    }
  });

  it('returns correct dimension keys matching calc.js', () => {
    const raw = {
      step_count: 0, command_count: 0, conditional_count: 0,
      error_token_count: 0, anti_pattern_count: 0, table_count: 0,
      cross_skill_refs: 0, has_frontmatter: false,
      has_completion_protocol: false, has_escalation: false,
      total_word_count: 0, reference_file_count: 0,
    };
    const scores = normalizeIndicators(raw);
    const expectedKeys = [
      'workflowStructure', 'behavioralConstraints', 'errorResilience',
      'theoryOfMind', 'instructionClarity', 'domainDepth',
    ];
    assert.deepEqual(Object.keys(scores).sort(), expectedKeys.sort());
  });

  it('gives low scores for empty/zero indicators', () => {
    const raw = {
      step_count: 0, command_count: 0, conditional_count: 0,
      error_token_count: 0, anti_pattern_count: 0, table_count: 0,
      cross_skill_refs: 0, has_frontmatter: false,
      has_completion_protocol: false, has_escalation: false,
      total_word_count: 0, reference_file_count: 0,
    };
    const scores = normalizeIndicators(raw);
    assert.ok(scores.workflowStructure <= 2);
    assert.ok(scores.behavioralConstraints <= 2);
    assert.ok(scores.errorResilience <= 2);
  });

  it('gives high scores for rich workflow-type indicators', () => {
    const raw = {
      step_count: 10, command_count: 20, conditional_count: 8,
      error_token_count: 15, anti_pattern_count: 5, table_count: 10,
      cross_skill_refs: 5, has_frontmatter: true,
      has_completion_protocol: true, has_escalation: true,
      total_word_count: 5000, reference_file_count: 3,
    };
    const scores = normalizeIndicators(raw);
    assert.ok(scores.workflowStructure >= 7, `workflowStructure=${scores.workflowStructure}`);
    assert.ok(scores.behavioralConstraints >= 7, `behavioralConstraints=${scores.behavioralConstraints}`);
    assert.ok(scores.errorResilience >= 7, `errorResilience=${scores.errorResilience}`);
  });

  it('applies frontmatter penalty when missing', () => {
    const withFm = normalizeIndicators({
      step_count: 5, command_count: 10, conditional_count: 3,
      error_token_count: 5, anti_pattern_count: 1, table_count: 3,
      cross_skill_refs: 1, has_frontmatter: true,
      has_completion_protocol: true, has_escalation: true,
      total_word_count: 2000, reference_file_count: 0,
    });
    const withoutFm = normalizeIndicators({
      step_count: 5, command_count: 10, conditional_count: 3,
      error_token_count: 5, anti_pattern_count: 1, table_count: 3,
      cross_skill_refs: 1, has_frontmatter: false,
      has_completion_protocol: true, has_escalation: true,
      total_word_count: 2000, reference_file_count: 0,
    });
    // Without frontmatter should score lower on at least some dimensions
    const totalWith = Object.values(withFm).reduce((a, b) => a + b, 0);
    const totalWithout = Object.values(withoutFm).reduce((a, b) => a + b, 0);
    assert.ok(totalWithout < totalWith, 'Missing frontmatter should reduce total scores');
  });

  it('theoryOfMind and instructionClarity return null (LLM-only)', () => {
    const raw = {
      step_count: 5, command_count: 10, conditional_count: 3,
      error_token_count: 5, anti_pattern_count: 1, table_count: 3,
      cross_skill_refs: 1, has_frontmatter: true,
      has_completion_protocol: true, has_escalation: true,
      total_word_count: 2000, reference_file_count: 0,
    };
    const scores = normalizeIndicators(raw);
    assert.equal(scores.theoryOfMind, null);
    assert.equal(scores.instructionClarity, null);
  });
});
