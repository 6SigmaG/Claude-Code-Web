import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeRepoUrl,
  extractRepoSlug,
  parseStars,
  parseCsvRow,
  mergeEntries,
  buildSkillsMaster,
  parseProductSkills,
} from './dedup.js';

// ============================================================
// URL Normalization
// ============================================================

describe('normalizeRepoUrl', () => {
  it('normalizes a standard GitHub URL', () => {
    assert.equal(
      normalizeRepoUrl('https://github.com/trailofbits/skills'),
      'trailofbits/skills'
    );
  });

  it('strips trailing slash', () => {
    assert.equal(
      normalizeRepoUrl('https://github.com/trailofbits/skills/'),
      'trailofbits/skills'
    );
  });

  it('strips tree/main/* sub-paths', () => {
    assert.equal(
      normalizeRepoUrl('https://github.com/anthropics/skills/tree/main/skills/frontend-design'),
      'anthropics/skills'
    );
  });

  it('strips blob paths', () => {
    assert.equal(
      normalizeRepoUrl('https://github.com/obra/superpowers/blob/main/SKILL.md'),
      'obra/superpowers'
    );
  });

  it('handles owner/repo format directly (no URL)', () => {
    assert.equal(
      normalizeRepoUrl('trailofbits/skills'),
      'trailofbits/skills'
    );
  });

  it('handles owner/repo with sub-skill suffix', () => {
    assert.equal(
      normalizeRepoUrl('alirezarezvani/claude-skills子技能'),
      'alirezarezvani/claude-skills'
    );
  });

  it('lowercases the result', () => {
    assert.equal(
      normalizeRepoUrl('https://github.com/Anthropics/Skills'),
      'anthropics/skills'
    );
  });

  it('returns null for non-GitHub URLs', () => {
    assert.equal(
      normalizeRepoUrl('https://mcpmarket.com/tools/skills/cold-email-writer'),
      null
    );
  });

  it('returns null for gist URLs', () => {
    assert.equal(
      normalizeRepoUrl('gist.github.com/karozi/902558b7952d9b0e14cd7d9326245624'),
      null
    );
  });

  it('handles empty/null input', () => {
    assert.equal(normalizeRepoUrl(''), null);
    assert.equal(normalizeRepoUrl(null), null);
    assert.equal(normalizeRepoUrl(undefined), null);
  });

  it('handles "无" or missing values from CSV', () => {
    assert.equal(normalizeRepoUrl('无'), null);
    assert.equal(normalizeRepoUrl('无(自建)'), null);
  });

  it('strips @ sub-skill references', () => {
    assert.equal(
      normalizeRepoUrl('superpowers@superpowers-marketplace'),
      null // not a valid GitHub slug
    );
  });

  it('handles owner/repo with parenthetical annotations', () => {
    assert.equal(
      normalizeRepoUrl('anthropics/skills(官方)'),
      'anthropics/skills'
    );
  });
});

// ============================================================
// extractRepoSlug
// ============================================================

describe('extractRepoSlug', () => {
  it('extracts slug from full URL', () => {
    assert.equal(
      extractRepoSlug('https://github.com/vercel-labs/agent-skills'),
      'vercel-labs/agent-skills'
    );
  });

  it('extracts slug from owner/repo', () => {
    assert.equal(extractRepoSlug('obra/superpowers'), 'obra/superpowers');
  });

  it('returns null for non-repo strings', () => {
    assert.equal(extractRepoSlug('mcpmarket.com/tools'), null);
  });
});

// ============================================================
// parseStars
// ============================================================

describe('parseStars', () => {
  it('parses plain number', () => {
    assert.equal(parseStars('3894'), 3894);
  });

  it('parses number with + suffix', () => {
    assert.equal(parseStars('50000+'), 50000);
  });

  it('parses number with K suffix', () => {
    assert.equal(parseStars('23.8K'), 23800);
  });

  it('parses number with ~ prefix', () => {
    assert.equal(parseStars('~16K'), 16000);
  });

  it('parses number with parenthetical suffix', () => {
    assert.equal(parseStars('87000+(仓库整体)'), 87000);
  });

  it('returns 0 for "无"', () => {
    assert.equal(parseStars('无'), 0);
  });

  it('returns 0 for empty/null', () => {
    assert.equal(parseStars(''), 0);
    assert.equal(parseStars(null), 0);
  });

  it('parses "<50" as 50', () => {
    assert.equal(parseStars('<50'), 50);
  });

  it('parses comma-formatted numbers', () => {
    assert.equal(parseStars('105,946'), 105946);
  });
});

// ============================================================
// parseCsvRow
// ============================================================

describe('parseCsvRow', () => {
  it('parses a standard CSV row', () => {
    const row = {
      '序号': '1',
      '名称': 'Superpowers',
      '仓库/链接': 'obra/superpowers-marketplace',
      'Stars': '48000+',
      '安装量(skills.sh)': '无',
      '层级/Tier': 'Tier 1',
      '来源文件': 'Claude Code Skills 发现与验证.md',
      '备注': 'TDD编排器,纯Markdown',
    };
    const result = parseCsvRow(row);
    assert.equal(result.name, 'Superpowers');
    assert.equal(result.repoSlug, 'obra/superpowers-marketplace');
    assert.equal(result.stars, 48000);
    assert.equal(result.tier, 'Tier 1');
    assert.equal(result.source, 'Claude Code Skills 发现与验证.md');
  });

  it('handles JSON data rows (from FINAL_HIGH_STARS)', () => {
    const row = {
      '序号': '239',
      '名称': 'affaan-m/everything-claude-code',
      '仓库/链接': 'https://github.com/affaan-m/everything-claude-code',
      'Stars': '105946',
      '安装量(skills.sh)': '无',
      '层级/Tier': 'JSON数据(未分tier)',
      '来源文件': 'FINAL_HIGH_STARS.json',
      '备注': 'The agent harness performance optimization system.',
    };
    const result = parseCsvRow(row);
    assert.equal(result.repoSlug, 'affaan-m/everything-claude-code');
    assert.equal(result.stars, 105946);
    assert.equal(result.tier, null); // "JSON数据(未分tier)" is not a real tier
  });
});

// ============================================================
// mergeEntries
// ============================================================

describe('mergeEntries', () => {
  it('merges two entries for the same repo, keeping max stars', () => {
    const entries = [
      { repoSlug: 'trailofbits/skills', stars: 1800, tier: 'Tier 1', source: 'kimi-1.txt', installCount: null },
      { repoSlug: 'trailofbits/skills', stars: 3894, tier: 'Tier 2', source: 'FINAL_HIGH_STARS.json', installCount: null },
    ];
    const merged = mergeEntries(entries);
    assert.equal(merged.stars, 3894);
    assert.deepEqual(merged.tiersFromSources, {
      'kimi-1.txt': 'Tier 1',
      'FINAL_HIGH_STARS.json': 'Tier 2',
    });
  });

  it('preserves install count from the entry that has it', () => {
    const entries = [
      { repoSlug: 'anthropics/skills', stars: 87000, tier: 'Tier 1', source: 'source1', installCount: null },
      { repoSlug: 'anthropics/skills', stars: 65000, tier: 'Tier 1', source: 'source2', installCount: 193400 },
    ];
    const merged = mergeEntries(entries);
    assert.equal(merged.installCountWeekly, 193400);
  });

  it('collects all names as aliases', () => {
    const entries = [
      { repoSlug: 'trailofbits/skills', name: 'Trail of Bits Security Skills', stars: 1800, tier: 'Tier 1', source: 's1', installCount: null },
      { repoSlug: 'trailofbits/skills', name: 'Trail of Bits安全套件(22个)', stars: 3894, tier: 'Tier 2', source: 's2', installCount: null },
    ];
    const merged = mergeEntries(entries);
    assert.ok(merged.aliases.length >= 2);
  });

  it('collects all notes', () => {
    const entries = [
      { repoSlug: 'x/y', stars: 100, tier: 'Tier 1', source: 's1', installCount: null, notes: 'note A' },
      { repoSlug: 'x/y', stars: 200, tier: 'Tier 2', source: 's2', installCount: null, notes: 'note B' },
    ];
    const merged = mergeEntries(entries);
    assert.ok(merged.notes.includes('note A'));
    assert.ok(merged.notes.includes('note B'));
  });
});

// ============================================================
// buildSkillsMaster (integration)
// ============================================================

describe('buildSkillsMaster', () => {
  it('deduplicates CSV entries and merges with official plugins', () => {
    const csvRows = [
      { '序号': '1', '名称': 'context7', '仓库/链接': 'https://github.com/upstash/context7', 'Stars': '50300', '安装量(skills.sh)': '无', '层级/Tier': 'Tier 1', '来源文件': 'source1', '备注': 'MCP server' },
      { '序号': '2', '名称': 'context7 dup', '仓库/链接': 'https://github.com/upstash/context7', 'Stars': '50444', '安装量(skills.sh)': '无', '层级/Tier': 'Tier 1', '来源文件': 'source2', '备注': 'a16z funded' },
    ];
    const officialPlugins = [
      { slug: 'context7', url: 'https://claude.com/plugins/context7', category: 'development' },
      { slug: 'unknown-plugin', url: 'https://claude.com/plugins/unknown-plugin', category: 'testing' },
    ];
    const discoveryAssessments = {
      'upstash/context7': { assessment: 'tier1_strongly_recommended', round: 3 },
    };

    const result = buildSkillsMaster(csvRows, officialPlugins, discoveryAssessments);

    // context7 should be merged into 1 entry
    const ctx7 = result.repos.find(r => r.repoSlug === 'upstash/context7');
    assert.ok(ctx7);
    assert.equal(ctx7.stars, 50444); // max
    assert.equal(ctx7.officialMarketplace, true);
    assert.equal(ctx7.ourAssessment, 'tier1_strongly_recommended');
    assert.equal(ctx7.ourRound, 3);

    // unknown-plugin should appear as official-only
    const unknown = result.repos.find(r => r.marketplaceSlug === 'unknown-plugin');
    assert.ok(unknown);
    assert.equal(unknown.officialMarketplace, true);

    // Summary stats
    assert.ok(result.summary.totalUniqueRepos >= 1);
    assert.ok(result.summary.officialPluginCount >= 1);
  });

  it('correctly categorizes repos', () => {
    const csvRows = [
      { '序号': '1', '名称': 'awesome list', '仓库/链接': 'hesreallyhim/awesome-claude-code', 'Stars': '32150', '安装量(skills.sh)': '无', '层级/Tier': '聚合列表', '来源文件': 'source1', '备注': '' },
      { '序号': '2', '名称': 'self-build', '仓库/链接': '无(自建)', 'Stars': '无', '安装量(skills.sh)': '无', '层级/Tier': '自建路线图', '来源文件': 'source1', '备注': 'planned' },
    ];
    const result = buildSkillsMaster(csvRows, [], {});

    const awesome = result.repos.find(r => r.repoSlug === 'hesreallyhim/awesome-claude-code');
    assert.ok(awesome);
    assert.equal(awesome.category, 'awesome_list');

    // self-build entries without valid repo should be in skipped
    assert.ok(result.summary.skippedCount >= 1);
  });

  it('handles empty inputs gracefully', () => {
    const result = buildSkillsMaster([], [], {});
    assert.equal(result.repos.length, 0);
    assert.equal(result.summary.totalUniqueRepos, 0);
  });

  it('merges product skills (4th data source)', () => {
    const csvRows = [
      { '序号': '1', '名称': 'superpowers', '仓库/链接': 'https://github.com/obra/superpowers', 'Stars': '108000', '安装量(skills.sh)': '无', '层级/Tier': 'Tier 1', '来源文件': 'csv-source', '备注': 'TDD' },
    ];
    const productSkills = [
      {
        id: 1,
        name: 'obra/superpowers brainstorming',
        source: 'https://github.com/obra/superpowers',
        one_line: 'Socratic brainstorming',
        mechanism: 'Input→Questions→Output',
        differentiator: 'Highest adoption',
        compatibility: 'Claude Code',
        category: '结构化Brainstorming',
        sources: ['deep-research', 'grok'],
      },
      {
        id: 2,
        name: 'ChatPRD',
        source: 'https://chatprd.ai',
        one_line: 'CPO-level PRD generation',
        mechanism: 'Chat→PRD',
        category: 'GPT生态',
        sources: ['compass1'],
      },
    ];

    const result = buildSkillsMaster(csvRows, [], {}, productSkills);

    // obra/superpowers should merge with CSV entry
    const obra = result.repos.find(r => r.repoSlug === 'obra/superpowers');
    assert.ok(obra);
    assert.equal(obra.stars, 108000); // from CSV
    assert.ok(obra.sources.some(s => s.startsWith('product-skills:')));

    // ChatPRD (non-GitHub) should appear as product_skill
    const chatprd = result.repos.find(r => r.aliases?.includes('ChatPRD'));
    assert.ok(chatprd);
    assert.equal(chatprd.category, 'product_skill');
    assert.equal(chatprd.repoSlug, null);

    // Summary should track product skill stats
    assert.equal(result.summary.productSkillCount, 2);
    assert.equal(result.summary.nonGithubProductCount, 1);
  });
});

// ============================================================
// parseProductSkills
// ============================================================

describe('parseProductSkills', () => {
  it('parses GitHub-based product skills', () => {
    const items = [
      { name: 'gstack/office-hours', source: 'https://github.com/gstack/office-hours', one_line: 'YC pressure test', category: '需求发现', sources: ['docx'] },
    ];
    const entries = parseProductSkills(items);
    assert.equal(entries.length, 1);
    assert.equal(entries[0].repoSlug, 'gstack/office-hours');
    assert.equal(entries[0].productCategory, '需求发现');
  });

  it('returns null repoSlug for non-GitHub sources', () => {
    const items = [
      { name: 'ChatPRD', source: 'https://chatprd.ai', one_line: 'PRD tool', category: 'GPT生态' },
    ];
    const entries = parseProductSkills(items);
    assert.equal(entries[0].repoSlug, null);
  });

  it('handles LobeHub and SkillsMP sources', () => {
    const items = [
      { name: 'Agentic Discovery', source: 'https://lobehub.com/skills/test', category: '需求发现' },
      { name: 'requirements-analysis', source: 'https://skillsmp.com (GitHub: jwynia/teach)', category: '需求发现' },
    ];
    const entries = parseProductSkills(items);
    assert.equal(entries[0].repoSlug, null); // lobehub → null
    assert.equal(entries[1].repoSlug, null); // skillsmp compound URL → null
  });
});
