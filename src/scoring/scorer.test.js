import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { scoreRepo, classifyCreatorTier, calculateWeightedScore, checkRedFlags, checkGreenFlags } from './scorer.js';

// ============================================================
// 1. Creator Credibility Scoring (weight: 25%)
// ============================================================
describe('classifyCreatorTier', () => {
  it('should classify S-tier: AI company founders, major OSS creators, industry leaders', () => {
    assert.equal(classifyCreatorTier({
      name: 'Garry Tan',
      role: 'CEO',
      company: 'Y Combinator',
      isFounder: true,
      majorOssProjects: [],
    }), 'S');
  });

  it('should classify S-tier: major OSS project creator', () => {
    assert.equal(classifyCreatorTier({
      name: 'Jesse Vincent',
      role: 'creator',
      company: 'Prime Radiant',
      isFounder: true,
      majorOssProjects: ['Request Tracker', 'Perl 5 pumpking'],
    }), 'S');
  });

  it('should classify S-tier: core team member of top-tier OSS', () => {
    assert.equal(classifyCreatorTier({
      name: 'Anthony Fu',
      role: 'core team',
      company: null,
      isFounder: false,
      majorOssProjects: ['Vue', 'Vite', 'Nuxt'],
    }), 'S');
  });

  it('should classify A-tier: engineers at top companies / OSS maintainers', () => {
    assert.equal(classifyCreatorTier({
      name: 'Avi Fenesh',
      role: 'maintainer',
      company: 'Valkey',
      isFounder: false,
      majorOssProjects: ['Valkey GLIDE'],
    }), 'A');
  });

  it('should classify A-tier: official org without top-tier OSS', () => {
    assert.equal(classifyCreatorTier({
      name: 'SomeCompany',
      role: 'company',
      company: 'SomeCompany',
      isFounder: false,
      majorOssProjects: [],
      isOfficialOrg: true,
    }), 'A');
  });

  it('should classify S-tier: HashiCorp (created Terraform/Vault = top-tier OSS)', () => {
    assert.equal(classifyCreatorTier({
      name: 'HashiCorp',
      role: 'company',
      company: 'HashiCorp',
      isFounder: false,
      majorOssProjects: ['Terraform', 'Vault'],
      isOfficialOrg: true,
    }), 'S');
  });

  it('should classify B-tier: contributors with proven track record', () => {
    assert.equal(classifyCreatorTier({
      name: 'Some Dev',
      role: 'contributor',
      company: null,
      isFounder: false,
      majorOssProjects: [],
      highStarRepos: 2,
    }), 'B');
  });

  it('should classify C-tier: new/unverified creators', () => {
    assert.equal(classifyCreatorTier({
      name: 'Unknown',
      role: null,
      company: null,
      isFounder: false,
      majorOssProjects: [],
    }), 'C');
  });
});

// ============================================================
// 2. Quality Signal Detection
// ============================================================
describe('checkGreenFlags', () => {
  it('should detect comprehensive tests as green flag', () => {
    const flags = checkGreenFlags({ testCount: 150, hasDocumentation: true });
    assert.ok(flags.includes('comprehensive-tests'));
  });

  it('should detect active maintenance', () => {
    const flags = checkGreenFlags({
      lastCommitDaysAgo: 5,
      testCount: 0,
    });
    assert.ok(flags.includes('active-maintenance'));
  });

  it('should detect marketplace listing', () => {
    const flags = checkGreenFlags({
      listedInMarketplace: true,
      listedInAwesomeList: true,
    });
    assert.ok(flags.includes('marketplace-listed'));
    assert.ok(flags.includes('awesome-list-listed'));
  });

  it('should detect proper SKILL.md with frontmatter', () => {
    const flags = checkGreenFlags({
      hasSkillMd: true,
      hasProperFrontmatter: true,
    });
    assert.ok(flags.includes('proper-skill-format'));
  });

  it('should detect cross-agent support', () => {
    const flags = checkGreenFlags({
      supportedAgents: ['claude-code', 'codex', 'gemini-cli'],
    });
    assert.ok(flags.includes('cross-agent-support'));
  });
});

describe('checkRedFlags', () => {
  it('should flag no tests and no documentation', () => {
    const flags = checkRedFlags({ testCount: 0, hasDocumentation: false });
    assert.ok(flags.includes('no-tests'));
    assert.ok(flags.includes('no-documentation'));
  });

  it('should flag abandoned repos', () => {
    const flags = checkRedFlags({ lastCommitDaysAgo: 180, commitCount: 1 });
    assert.ok(flags.includes('abandoned'));
    assert.ok(flags.includes('single-commit'));
  });

  it('should flag inflated claims', () => {
    const flags = checkRedFlags({
      claimedSkillCount: 1000,
      actualSkillCount: 5,
    });
    assert.ok(flags.includes('inflated-claims'));
  });

  it('should flag forks without attribution', () => {
    const flags = checkRedFlags({ isFork: true, hasAttribution: false });
    assert.ok(flags.includes('unattributed-fork'));
  });
});

// ============================================================
// 3. Weighted Score Calculation
// ============================================================
describe('calculateWeightedScore', () => {
  it('should apply correct weights: creator(25%), battle(25%), quality(20%), community(15%), relevance(15%)', () => {
    const score = calculateWeightedScore({
      creatorCredibility: 10,
      battleTested: 10,
      technicalQuality: 10,
      communitySignal: 10,
      relevanceScope: 10,
    });
    assert.equal(score, 10);
  });

  it('should calculate mixed scores correctly', () => {
    const score = calculateWeightedScore({
      creatorCredibility: 10,  // 10 * 0.25 = 2.5
      battleTested: 8,         // 8 * 0.25 = 2.0
      technicalQuality: 6,     // 6 * 0.20 = 1.2
      communitySignal: 4,      // 4 * 0.15 = 0.6
      relevanceScope: 2,       // 2 * 0.15 = 0.3
    });
    assert.equal(score, 6.6);
  });

  it('should return 0 for all zeros', () => {
    const score = calculateWeightedScore({
      creatorCredibility: 0,
      battleTested: 0,
      technicalQuality: 0,
      communitySignal: 0,
      relevanceScope: 0,
    });
    assert.equal(score, 0);
  });

  it('should clamp dimensions to 0-10 range', () => {
    const score = calculateWeightedScore({
      creatorCredibility: 15,
      battleTested: -5,
      technicalQuality: 10,
      communitySignal: 10,
      relevanceScope: 10,
    });
    // 10*0.25 + 0*0.25 + 10*0.20 + 10*0.15 + 10*0.15 = 2.5+0+2+1.5+1.5 = 7.5
    assert.equal(score, 7.5);
  });
});

// ============================================================
// 4. Full Repo Scoring (integration)
// ============================================================
describe('scoreRepo', () => {
  it('should score gstack as Tier 1 (score >= 8)', () => {
    const result = scoreRepo({
      name: 'gstack',
      url: 'https://github.com/garrytan/gstack',
      creator: {
        name: 'Garry Tan',
        role: 'CEO',
        company: 'Y Combinator',
        isFounder: true,
        majorOssProjects: [],
      },
      stars: 5000,
      forks: 200,
      contributors: 10,
      lastCommitDaysAgo: 3,
      commitCount: 500,
      testCount: 50,
      hasDocumentation: true,
      hasSkillMd: true,
      hasProperFrontmatter: true,
      listedInMarketplace: false,
      listedInAwesomeList: true,
      supportedAgents: ['claude-code', 'codex', 'gemini-cli'],
      skillCount: 21,
      claimedSkillCount: 21,
      actualSkillCount: 21,
      isFork: false,
    });

    assert.ok(result.totalScore >= 8, `gstack score ${result.totalScore} should be >= 8`);
    assert.equal(result.tier, 'S');
    assert.ok(result.greenFlags.length > 0);
    assert.equal(result.redFlags.length, 0);
  });

  it('should score superpowers as Tier 1 (score >= 8)', () => {
    const result = scoreRepo({
      name: 'superpowers',
      url: 'https://github.com/obra/superpowers',
      creator: {
        name: 'Jesse Vincent',
        role: 'creator',
        company: 'Prime Radiant',
        isFounder: true,
        majorOssProjects: ['Request Tracker', 'Perl 5 pumpking'],
      },
      stars: 93000,
      forks: 3000,
      contributors: 50,
      lastCommitDaysAgo: 2,
      commitCount: 1000,
      testCount: 200,
      hasDocumentation: true,
      hasSkillMd: true,
      hasProperFrontmatter: true,
      listedInMarketplace: true,
      listedInAwesomeList: true,
      supportedAgents: ['claude-code'],
      skillCount: 20,
      claimedSkillCount: 20,
      actualSkillCount: 20,
      isFork: false,
    });

    assert.ok(result.totalScore >= 8, `superpowers score ${result.totalScore} should be >= 8`);
    assert.equal(result.tier, 'S');
  });

  it('should score a low-quality repo as Tier C (score < 4)', () => {
    const result = scoreRepo({
      name: 'random-skills',
      url: 'https://github.com/unknown/random-skills',
      creator: {
        name: 'Unknown',
        role: null,
        company: null,
        isFounder: false,
        majorOssProjects: [],
      },
      stars: 5,
      forks: 0,
      contributors: 1,
      lastCommitDaysAgo: 200,
      commitCount: 1,
      testCount: 0,
      hasDocumentation: false,
      hasSkillMd: false,
      hasProperFrontmatter: false,
      listedInMarketplace: false,
      listedInAwesomeList: false,
      supportedAgents: [],
      skillCount: 0,
      claimedSkillCount: 100,
      actualSkillCount: 2,
      isFork: true,
      hasAttribution: false,
    });

    assert.ok(result.totalScore < 4, `low-quality score ${result.totalScore} should be < 4`);
    assert.equal(result.tier, 'C');
    assert.ok(result.redFlags.length >= 3);
  });

  it('should return complete result structure', () => {
    const result = scoreRepo({
      name: 'test-repo',
      url: 'https://github.com/test/repo',
      creator: {
        name: 'Test',
        role: null,
        company: null,
        isFounder: false,
        majorOssProjects: [],
      },
      stars: 100,
      forks: 10,
      contributors: 3,
      lastCommitDaysAgo: 15,
      commitCount: 50,
      testCount: 20,
      hasDocumentation: true,
      hasSkillMd: true,
      hasProperFrontmatter: true,
      listedInMarketplace: false,
      listedInAwesomeList: false,
      supportedAgents: ['claude-code'],
      skillCount: 5,
      claimedSkillCount: 5,
      actualSkillCount: 5,
      isFork: false,
    });

    // Check structure
    assert.ok('totalScore' in result);
    assert.ok('tier' in result);
    assert.ok('dimensions' in result);
    assert.ok('greenFlags' in result);
    assert.ok('redFlags' in result);
    assert.ok('creatorTier' in result);

    // Check dimensions
    assert.ok('creatorCredibility' in result.dimensions);
    assert.ok('battleTested' in result.dimensions);
    assert.ok('technicalQuality' in result.dimensions);
    assert.ok('communitySignal' in result.dimensions);
    assert.ok('relevanceScope' in result.dimensions);

    // Score range
    assert.ok(result.totalScore >= 0 && result.totalScore <= 10);
    assert.ok(['S', 'A', 'B', 'C'].includes(result.tier));
  });
});
