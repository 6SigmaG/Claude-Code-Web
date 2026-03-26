/**
 * Skill data deduplication and merge pipeline.
 *
 * Three-way merge:
 *   1. ALL_SKILLS_V2.csv  (community research, 523 rows, 7+ sources)
 *   2. official-plugins.json  (~140 Claude marketplace plugins)
 *   3. discovery-report assessments  (21 admitted + 7 excluded + 2 watching)
 *
 * Design principle (borrowed from Karpathy autoresearch):
 *   Fixed evaluator  = this dedup pipeline (deterministic, no LLM)
 *   Single output     = data/skills-master.json
 *   Measurable metric = unique repo count, merge accuracy
 */

// ============================================================
// URL Normalization
// ============================================================

/**
 * Normalize a repo reference to a canonical "owner/repo" slug.
 * Returns null for non-GitHub, invalid, or non-repo references.
 */
export function normalizeRepoUrl(input) {
  if (!input || typeof input !== 'string') return null;

  let s = input.trim();

  // Skip known non-repo patterns
  if (s === '无' || s.startsWith('无(') || s.startsWith('无（')) return null;
  if (s.includes('mcpmarket.com')) return null;
  if (s.includes('gist.github.com')) return null;
  if (s.includes('skills.sh') || s.includes('agentskill.sh') || s.includes('skillsllm.com')) return null;
  if (s.includes('ui.shadcn.com') || s.includes('emailmarketingskill.com')) return null;
  if (s.includes('scriptbyai.com') || s.includes('productside.com')) return null;
  if (s.includes('@') && !s.includes('github.com')) return null; // e.g. "superpowers@superpowers-marketplace"

  // Strip GitHub URL prefix
  s = s.replace(/^https?:\/\/(www\.)?github\.com\//, '');

  // Strip parenthetical annotations e.g. "(官方)" or "(补漏)"
  s = s.replace(/[（(][^)）]*[)）]/g, '');

  // Strip Chinese suffixes attached to slug e.g. "子技能"
  s = s.replace(/[\u4e00-\u9fff]+$/, '');

  // Strip tree/main/*, blob/*, etc.
  s = s.replace(/\/(tree|blob|raw|releases|issues|pull|wiki)\/.*/i, '');

  // Strip trailing slashes
  s = s.replace(/\/+$/, '');

  // Must look like owner/repo (exactly 2 parts)
  const parts = s.split('/').filter(Boolean);
  if (parts.length < 2) return null;

  const slug = `${parts[0]}/${parts[1]}`.toLowerCase();

  // Sanity: slug parts should be alphanumeric + dash/underscore/dot
  if (!/^[a-z0-9._-]+\/[a-z0-9._-]+$/.test(slug)) return null;

  return slug;
}

/**
 * Alias for normalizeRepoUrl — extracts slug from any input format.
 */
export function extractRepoSlug(input) {
  return normalizeRepoUrl(input);
}

// ============================================================
// Star count parsing
// ============================================================

/**
 * Parse star counts from various formats: "50000+", "23.8K", "~16K", "<50", "87000+(仓库整体)"
 */
export function parseStars(input) {
  if (!input || typeof input !== 'string') return 0;

  let s = input.trim();
  if (s === '无' || s === '') return 0;

  // Strip parenthetical suffixes
  s = s.replace(/[（(][^)）]*[)）]/g, '');

  // Strip prefix characters
  s = s.replace(/^[~<>≈]/, '');

  // Strip trailing + and spaces
  s = s.replace(/\+\s*$/, '');

  // Remove commas
  s = s.replace(/,/g, '');

  // Handle K suffix
  if (/k$/i.test(s)) {
    const num = parseFloat(s.replace(/k$/i, ''));
    return isNaN(num) ? 0 : Math.round(num * 1000);
  }

  const num = parseFloat(s);
  return isNaN(num) ? 0 : Math.round(num);
}

// ============================================================
// CSV Row Parsing
// ============================================================

// Tier values that represent actual quality assessments
const VALID_TIERS = new Set([
  'Tier 1', 'Tier 2', 'Tier 3', 'Tier 4',
  'Tier 2/4', 'Tier 1(与gstack重叠)',
  'Tier 2(子技能)', 'Tier 3(方案C)', 'Tier 3(B2B组件)',
]);

/**
 * Parse a single CSV row object into a normalized entry.
 */
export function parseCsvRow(row) {
  const rawUrl = row['仓库/链接'] || '';
  const repoSlug = normalizeRepoUrl(rawUrl);
  const rawTier = (row['层级/Tier'] || '').trim();

  // Normalize tier — only keep actual tier assignments
  let tier = null;
  if (rawTier.startsWith('Tier ')) {
    tier = rawTier.match(/Tier \d/)?.[0] || rawTier;
  }

  // Parse install count
  const rawInstall = (row['安装量(skills.sh)'] || '').trim();
  let installCount = null;
  if (rawInstall && rawInstall !== '无') {
    // Handle formats like "周均244.6K", "193400", "52800"
    const match = rawInstall.match(/([\d,.]+)([Kk])?/);
    if (match) {
      let val = parseFloat(match[1].replace(/,/g, ''));
      if (match[2]) val *= 1000;
      installCount = Math.round(val);
    }
  }

  // Determine category from tier text
  let category = 'skill'; // default
  if (rawTier.includes('聚合列表')) category = 'awesome_list';
  else if (rawTier.includes('自建路线图') || rawTier.includes('自建')) category = 'self_build';
  else if (rawTier.includes('工具') || rawTier.includes('框架')) category = 'tool';
  else if (rawTier.includes('官方渠道') || rawTier.includes('官方')) category = 'official';
  else if (rawTier.includes('附录提及')) category = 'appendix';
  else if (rawTier.includes('参考') || rawTier.includes('基线参考')) category = 'reference';

  return {
    name: (row['名称'] || '').trim(),
    rawUrl,
    repoSlug,
    stars: parseStars(row['Stars']),
    installCount,
    tier,
    source: (row['来源文件'] || '').trim(),
    notes: (row['备注'] || '').trim(),
    category,
  };
}

// ============================================================
// Entry Merging
// ============================================================

/**
 * Merge multiple parsed entries for the same repo into one canonical record.
 */
export function mergeEntries(entries) {
  if (!entries || entries.length === 0) return null;

  const first = entries[0];
  const merged = {
    repoSlug: first.repoSlug,
    stars: 0,
    installCountWeekly: null,
    tiersFromSources: {},
    aliases: [],
    notes: '',
    sources: [],
    category: 'skill',
  };

  const noteSet = new Set();
  const aliasSet = new Set();

  for (const entry of entries) {
    // Max stars
    if (entry.stars > merged.stars) merged.stars = entry.stars;

    // Install count — keep the first non-null
    if (entry.installCount && !merged.installCountWeekly) {
      merged.installCountWeekly = entry.installCount;
    }

    // Tier from each source
    if (entry.tier && entry.source) {
      merged.tiersFromSources[entry.source] = entry.tier;
    }

    // Collect names as aliases
    if (entry.name) aliasSet.add(entry.name);

    // Collect notes
    if (entry.notes) noteSet.add(entry.notes);

    // Collect sources
    if (entry.source) merged.sources.push(entry.source);

    // Category priority: awesome_list > tool > skill
    if (entry.category === 'awesome_list') merged.category = 'awesome_list';
    else if (entry.category === 'tool' && merged.category === 'skill') merged.category = 'tool';
    else if (entry.category === 'official') merged.category = 'official';
  }

  merged.aliases = [...aliasSet];
  merged.notes = [...noteSet].join(' | ');
  merged.sources = [...new Set(merged.sources)];

  return merged;
}

// ============================================================
// Master Builder (three-way merge)
// ============================================================

/**
 * Build the unified skills-master.json from three data sources.
 *
 * @param {Array} csvRows - Parsed CSV row objects
 * @param {Array} officialPlugins - Official marketplace plugin objects
 * @param {Object} discoveryAssessments - Map of repoSlug → { assessment, round }
 * @returns {{ repos: Array, summary: Object }}
 */
export function buildSkillsMaster(csvRows, officialPlugins, discoveryAssessments) {
  // Phase 1: Parse and group CSV entries by normalized slug
  const groups = new Map(); // slug → [entries]
  let skippedCount = 0;

  for (const row of csvRows) {
    const entry = parseCsvRow(row);
    if (!entry.repoSlug) {
      skippedCount++;
      continue;
    }
    if (!groups.has(entry.repoSlug)) {
      groups.set(entry.repoSlug, []);
    }
    groups.get(entry.repoSlug).push(entry);
  }

  // Phase 2: Merge grouped entries
  const repos = [];
  for (const [slug, entries] of groups) {
    const merged = mergeEntries(entries);
    if (!merged) continue;

    // Enrich with discovery assessment
    const assessment = discoveryAssessments[slug];
    merged.ourAssessment = assessment?.assessment || null;
    merged.ourRound = assessment?.round || null;

    // Check official marketplace
    merged.officialMarketplace = false;
    merged.marketplaceSlug = null;

    repos.push(merged);
  }

  // Phase 3: Mark official marketplace plugins
  const repoSlugsInMaster = new Set(repos.map(r => r.repoSlug));

  // Build a mapping of marketplace slug → known repo slug
  // Some plugins have predictable repo slugs, others need manual mapping
  const MARKETPLACE_TO_REPO = {
    'context7': 'upstash/context7',
    'superpowers': 'obra/superpowers',
    'serena': 'oraios/serena',
    'terraform': 'hashicorp/agent-skills',
    'frontend-design': 'anthropics/skills',
    'code-review': 'anthropics/skills',
    'code-simplifier': 'anthropics/skills',
    'feature-dev': 'anthropics/skills',
    'playwright': 'anthropics/skills',
    'claude-md-management': 'anthropics/skills',
    'security-guidance': 'anthropics/skills',
    'commit-commands': 'anthropics/skills',
    'skill-creator': 'anthropics/skills',
    'pr-review-toolkit': 'anthropics/skills',
    'claude-code-setup': 'anthropics/skills',
    'agent-sdk-dev': 'anthropics/skills',
    'explanatory-output-style': 'anthropics/skills',
    'plugin-dev': 'anthropics/skills',
    'hookify': 'anthropics/skills',
    'playground': 'anthropics/skills',
    'learning-output-style': 'anthropics/skills',
    'github': 'anthropics/skills',
    'slack': 'anthropics/skills',
    'discord': 'anthropics/skills',
    'telegram': 'anthropics/skills',
    'linear': 'anthropics/skills',
    'asana': 'anthropics/skills',
    'gitlab': 'anthropics/skills',
    'firebase': 'anthropics/skills',
    'supabase': 'anthropics/skills',
    'stripe': 'anthropics/skills',
    'typescript-lsp': 'anthropics/skills',
    'pyright-lsp': 'anthropics/skills',
    'gopls-lsp': 'anthropics/skills',
    'rust-analyzer-lsp': 'anthropics/skills',
    'csharp-lsp': 'anthropics/skills',
    'php-lsp': 'anthropics/skills',
    'jdtls-lsp': 'anthropics/skills',
    'clangd-lsp': 'anthropics/skills',
    'swift-lsp': 'anthropics/skills',
    'kotlin-lsp': 'anthropics/skills',
    'lua-lsp': 'anthropics/skills',
    'ruby-lsp': 'anthropics/skills',
    'elixir-ls-lsp': 'anthropics/skills',
    'vercel': 'vercel-labs/agent-skills',
  };

  for (const plugin of officialPlugins) {
    const knownSlug = MARKETPLACE_TO_REPO[plugin.slug];

    if (knownSlug) {
      // Mark existing repo as official
      const repo = repos.find(r => r.repoSlug === knownSlug);
      if (repo) {
        repo.officialMarketplace = true;
        if (!repo.marketplaceSlug) repo.marketplaceSlug = plugin.slug;
      }
    } else {
      // Add as official-only entry (no GitHub repo known)
      repos.push({
        repoSlug: null,
        stars: 0,
        installCountWeekly: null,
        tiersFromSources: {},
        aliases: [plugin.slug],
        notes: `Official marketplace plugin: ${plugin.category}`,
        sources: ['official_marketplace'],
        category: 'official_plugin',
        officialMarketplace: true,
        marketplaceSlug: plugin.slug,
        marketplaceCategory: plugin.category,
        ourAssessment: null,
        ourRound: null,
      });
    }
  }

  // Phase 4: Build summary
  const reposWithSlug = repos.filter(r => r.repoSlug);
  const officialOnlyPlugins = repos.filter(r => !r.repoSlug && r.officialMarketplace);

  const summary = {
    totalUniqueRepos: reposWithSlug.length,
    officialPluginCount: repos.filter(r => r.officialMarketplace).length,
    officialOnlyPluginCount: officialOnlyPlugins.length,
    skippedCount,
    withAssessment: reposWithSlug.filter(r => r.ourAssessment).length,
    withoutAssessment: reposWithSlug.filter(r => !r.ourAssessment).length,
    categoryBreakdown: {},
    tierBreakdown: {},
    starsDistribution: {
      over50k: reposWithSlug.filter(r => r.stars >= 50000).length,
      '10k_50k': reposWithSlug.filter(r => r.stars >= 10000 && r.stars < 50000).length,
      '5k_10k': reposWithSlug.filter(r => r.stars >= 5000 && r.stars < 10000).length,
      '1k_5k': reposWithSlug.filter(r => r.stars >= 1000 && r.stars < 5000).length,
      under1k: reposWithSlug.filter(r => r.stars < 1000).length,
    },
  };

  // Category breakdown
  for (const r of repos) {
    const cat = r.category || 'unknown';
    summary.categoryBreakdown[cat] = (summary.categoryBreakdown[cat] || 0) + 1;
  }

  // Consensus tier (most common tier across sources)
  for (const r of reposWithSlug) {
    const tiers = Object.values(r.tiersFromSources);
    if (tiers.length > 0) {
      // Count occurrences of each tier
      const tierCounts = {};
      for (const t of tiers) {
        const normalized = t.match(/Tier \d/)?.[0] || t;
        tierCounts[normalized] = (tierCounts[normalized] || 0) + 1;
      }
      // Pick the most common
      const consensusTier = Object.entries(tierCounts).sort((a, b) => b[1] - a[1])[0][0];
      r.consensusTier = consensusTier;
      summary.tierBreakdown[consensusTier] = (summary.tierBreakdown[consensusTier] || 0) + 1;
    }
  }

  // Sort repos: by stars descending
  repos.sort((a, b) => (b.stars || 0) - (a.stars || 0));

  return { repos, summary };
}

// ============================================================
// CSV file parser (simple, handles quoted fields)
// ============================================================

/**
 * Parse CSV text into array of row objects.
 */
export function parseCsv(text) {
  const lines = text.split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]);
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const row = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j] || '';
    }
    rows.push(row);
  }

  return rows;
}

function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}
