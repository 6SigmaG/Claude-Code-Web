import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { scoreContent, scoreEngineering, scoreEcosystem, autoScore } from './auto-scorer.js';

// ============================================================
// scoreContent
// ============================================================

describe('scoreContent', () => {
  it('scores empty content as low', () => {
    const { score } = scoreContent('');
    assert.ok(score <= 2, `Expected low score, got ${score}`);
  });

  it('scores rich SKILL.md content higher', () => {
    const content = `---
name: test-skill
---
## Step 1: Analyze
If the user asks for X, then do Y.
Otherwise, escalate.

## Step 2: Execute
When blocked, use BLOCKED format.
Do NOT skip tests. Never merge without review.

| Scenario | Action |
|----------|--------|
| Happy path | Proceed |
| Error | Escalate |

## Step 3: Verify
DONE when all tests pass.
NEEDS_CONTEXT if unclear.

\`\`\`bash
npm test
\`\`\`
`.repeat(2);

    const { score } = scoreContent(content);
    assert.ok(score >= 5, `Expected high score, got ${score}`);
  });

  it('returns raw indicators and normalized dims', () => {
    const { raw, dims } = scoreContent('## Step 1\nIf something then do it');
    assert.ok('step_count' in raw);
    assert.ok('workflowStructure' in dims);
  });
});

// ============================================================
// scoreEngineering
// ============================================================

describe('scoreEngineering', () => {
  it('scores zero for no metadata', () => {
    const { score } = scoreEngineering({});
    assert.equal(score, 0);
  });

  it('scores high for well-tested repos', () => {
    const { score } = scoreEngineering({
      testFileCount: 200,
      hasCI: true,
      hasLicense: true,
      skillCount: 10,
      installCountWeekly: 50000,
      crossPlatform: true,
    });
    assert.ok(score >= 8, `Expected high score, got ${score}`);
  });

  it('gives partial credit for some signals', () => {
    const { score } = scoreEngineering({
      testFileCount: 10,
      hasCI: false,
      hasLicense: true,
      skillCount: 2,
    });
    assert.ok(score >= 2 && score <= 5, `Expected mid score, got ${score}`);
  });
});

// ============================================================
// scoreEcosystem
// ============================================================

describe('scoreEcosystem', () => {
  it('scores low for unknown creator with no stars', () => {
    const { score } = scoreEcosystem({});
    assert.ok(score <= 2, `Expected low score, got ${score}`);
  });

  it('scores high for S-tier creator with many stars and marketplace', () => {
    const { score } = scoreEcosystem({
      stars: 93000,
      creatorTierScore: 10, // S-tier
      officialMarketplace: true,
      lastCommitDaysAgo: 3,
    });
    assert.ok(score >= 9, `Expected very high score, got ${score}`);
  });

  it('rewards marketplace presence', () => {
    const withMp = scoreEcosystem({ stars: 1000, officialMarketplace: true });
    const withoutMp = scoreEcosystem({ stars: 1000, officialMarketplace: false });
    assert.ok(withMp.score > withoutMp.score);
  });

  it('penalizes stale repos', () => {
    const active = scoreEcosystem({ lastCommitDaysAgo: 5 });
    const stale = scoreEcosystem({ lastCommitDaysAgo: 365 });
    assert.ok(active.score > stale.score);
  });
});

// ============================================================
// autoScore (integration)
// ============================================================

describe('autoScore', () => {
  it('combines all three scores', () => {
    const result = autoScore({
      skillMdContent: '## Step 1\nDo something\n## Step 2\nDo more',
      repoMeta: { testFileCount: 50, hasCI: true },
      ecoMeta: { stars: 5000, creatorTierScore: 7 },
    });

    assert.ok('content' in result);
    assert.ok('engineering' in result);
    assert.ok('ecosystem' in result);
    assert.ok(result.content >= 0 && result.content <= 10);
    assert.ok(result.engineering >= 0 && result.engineering <= 10);
    assert.ok(result.ecosystem >= 0 && result.ecosystem <= 10);
  });

  it('handles empty input gracefully', () => {
    const result = autoScore({});
    assert.equal(typeof result.content, 'number');
    assert.equal(typeof result.engineering, 'number');
    assert.equal(typeof result.ecosystem, 'number');
  });
});
