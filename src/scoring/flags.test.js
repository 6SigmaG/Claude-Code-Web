import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { checkGreenFlags, checkRedFlags } from './flags.js';

describe('checkGreenFlags', () => {
  it('detects content quality signals', () => {
    const flags = checkGreenFlags({
      hasIronLaws: true,
      hasCompletionProtocol: true,
      hasEscalation: true,
      hasAntiPatterns: true,
      stepCount: 10,
      crossSkillRefs: 3,
    });
    assert.ok(flags.includes('has-iron-laws'));
    assert.ok(flags.includes('has-completion-protocol'));
    assert.ok(flags.includes('has-escalation'));
    assert.ok(flags.includes('has-anti-rationalization'));
    assert.ok(flags.includes('multi-step-workflow'));
    assert.ok(flags.includes('cross-skill-refs'));
  });

  it('detects engineering signals', () => {
    const flags = checkGreenFlags({
      testCount: 200,
      lastCommitDaysAgo: 5,
      hasSkillMd: true,
      hasProperFrontmatter: true,
      supportedAgents: ['claude-code', 'codex'],
    });
    assert.ok(flags.includes('comprehensive-tests'));
    assert.ok(flags.includes('active-maintenance'));
    assert.ok(flags.includes('proper-skill-format'));
    assert.ok(flags.includes('cross-agent-support'));
  });

  it('detects ecosystem signals', () => {
    const flags = checkGreenFlags({
      listedInMarketplace: true,
      listedInAwesomeList: true,
      hasDocumentation: true,
    });
    assert.ok(flags.includes('marketplace-listed'));
    assert.ok(flags.includes('awesome-list-listed'));
    assert.ok(flags.includes('has-documentation'));
  });

  it('returns empty for minimal repo', () => {
    const flags = checkGreenFlags({});
    assert.equal(flags.length, 0);
  });
});

describe('checkRedFlags', () => {
  it('detects content red flags', () => {
    const flags = checkRedFlags({ hasSkillMd: false });
    assert.ok(flags.includes('no-skill-md'));
  });

  it('detects missing frontmatter', () => {
    const flags = checkRedFlags({ hasSkillMd: true, hasProperFrontmatter: false });
    assert.ok(flags.includes('missing-frontmatter'));
  });

  it('detects engineering red flags', () => {
    const flags = checkRedFlags({
      testCount: 0,
      hasDocumentation: false,
      lastCommitDaysAgo: 200,
      commitCount: 1,
    });
    assert.ok(flags.includes('no-tests'));
    assert.ok(flags.includes('no-documentation'));
    assert.ok(flags.includes('abandoned'));
    assert.ok(flags.includes('single-commit'));
  });

  it('detects inflated claims', () => {
    const flags = checkRedFlags({ claimedSkillCount: 100, actualSkillCount: 5 });
    assert.ok(flags.includes('inflated-claims'));
  });

  it('detects unattributed fork', () => {
    const flags = checkRedFlags({ isFork: true, hasAttribution: false });
    assert.ok(flags.includes('unattributed-fork'));
  });

  it('returns empty for quality repo', () => {
    const flags = checkRedFlags({
      hasSkillMd: true,
      hasProperFrontmatter: true,
      testCount: 100,
      hasDocumentation: true,
      lastCommitDaysAgo: 5,
      commitCount: 500,
    });
    assert.equal(flags.length, 0);
  });
});
