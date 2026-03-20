/**
 * Claude Code Skills Repo Scoring Engine
 *
 * Evaluates GitHub repositories based on 5 weighted dimensions:
 * - Creator Credibility (25%)
 * - Battle-tested (25%)
 * - Technical Quality (20%)
 * - Community Signal (15%)
 * - Relevance & Scope (15%)
 */

// Notable companies/orgs that grant automatic S or A tier
const S_TIER_COMPANIES = [
  'y combinator', 'anthropic', 'openai', 'google deepmind', 'meta ai',
];
const A_TIER_COMPANIES = [
  'hashicorp', 'vercel', 'cloudflare', 'stripe', 'github', 'microsoft',
  'google', 'meta', 'apple', 'amazon', 'valkey',
];
const TOP_TIER_OSS = [
  'vue', 'vite', 'nuxt', 'react', 'next.js', 'svelte', 'angular',
  'tensorflow', 'pytorch', 'kubernetes', 'docker', 'linux', 'node',
  'perl', 'python', 'rust', 'go', 'typescript', 'deno', 'bun',
  'request tracker', 'terraform', 'vault', 'consul',
];

/**
 * Classify creator into S/A/B/C tiers
 */
export function classifyCreatorTier(creator) {
  const companyLower = (creator.company || '').toLowerCase();
  const hasTopOss = (creator.majorOssProjects || []).some(
    p => TOP_TIER_OSS.includes(p.toLowerCase())
  );

  // S-tier: AI company founders/leadership, major OSS creators, industry leaders
  if (creator.isFounder && S_TIER_COMPANIES.some(c => companyLower.includes(c))) return 'S';
  if (companyLower.includes('y combinator') && (creator.role === 'CEO' || creator.role === 'President')) return 'S';
  if (hasTopOss) return 'S';
  if ((creator.majorOssProjects || []).length >= 2 && creator.isFounder) return 'S';

  // A-tier: engineers at top companies, OSS maintainers, hackathon winners, official orgs
  if (creator.isOfficialOrg) return 'A';
  if (A_TIER_COMPANIES.some(c => companyLower.includes(c))) return 'A';
  if ((creator.majorOssProjects || []).length >= 1) return 'A';
  if (creator.role === 'maintainer') return 'A';

  // B-tier: contributors with proven track record
  if ((creator.highStarRepos || 0) >= 2) return 'B';
  if (creator.role === 'contributor') return 'B';

  // C-tier: new/unverified
  return 'C';
}

/**
 * Check for green flags (quality indicators)
 */
export function checkGreenFlags(repo) {
  const flags = [];

  if ((repo.testCount || 0) >= 100) flags.push('comprehensive-tests');
  if ((repo.lastCommitDaysAgo || Infinity) <= 30) flags.push('active-maintenance');
  if (repo.listedInMarketplace) flags.push('marketplace-listed');
  if (repo.listedInAwesomeList) flags.push('awesome-list-listed');
  if (repo.hasSkillMd && repo.hasProperFrontmatter) flags.push('proper-skill-format');
  if ((repo.supportedAgents || []).length >= 2) flags.push('cross-agent-support');
  if (repo.hasDocumentation) flags.push('has-documentation');

  return flags;
}

/**
 * Check for red flags (warning indicators)
 */
export function checkRedFlags(repo) {
  const flags = [];

  if ((repo.testCount || 0) === 0) flags.push('no-tests');
  if (repo.hasDocumentation === false) flags.push('no-documentation');
  if ((repo.lastCommitDaysAgo || 0) >= 120) flags.push('abandoned');
  if ((repo.commitCount || 0) <= 1) flags.push('single-commit');
  if (repo.isFork && !repo.hasAttribution) flags.push('unattributed-fork');

  const claimed = repo.claimedSkillCount || 0;
  const actual = repo.actualSkillCount || 0;
  if (claimed > 0 && actual > 0 && claimed / actual >= 5) flags.push('inflated-claims');

  return flags;
}

/**
 * Calculate weighted score from 5 dimensions (each 0-10)
 */
export function calculateWeightedScore(dims) {
  const clamp = v => Math.max(0, Math.min(10, v));
  const score =
    clamp(dims.creatorCredibility) * 0.25 +
    clamp(dims.battleTested) * 0.25 +
    clamp(dims.technicalQuality) * 0.20 +
    clamp(dims.communitySignal) * 0.15 +
    clamp(dims.relevanceScope) * 0.15;
  return Math.round(score * 10) / 10;
}

/**
 * Score creator credibility dimension (0-10)
 */
function scoreCreatorCredibility(creator) {
  const tier = classifyCreatorTier(creator);
  const tierScores = { S: 10, A: 7.5, B: 5, C: 2 };
  return tierScores[tier];
}

/**
 * Score battle-tested dimension (0-10)
 */
function scoreBattleTested(repo) {
  let score = 0;
  // Commit activity
  if (repo.commitCount >= 500) score += 3;
  else if (repo.commitCount >= 100) score += 2;
  else if (repo.commitCount >= 20) score += 1;

  // Recency
  if (repo.lastCommitDaysAgo <= 7) score += 2;
  else if (repo.lastCommitDaysAgo <= 30) score += 1.5;
  else if (repo.lastCommitDaysAgo <= 90) score += 0.5;

  // Tests
  if (repo.testCount >= 100) score += 3;
  else if (repo.testCount >= 20) score += 2;
  else if (repo.testCount >= 1) score += 1;

  // Contributors
  if (repo.contributors >= 10) score += 2;
  else if (repo.contributors >= 3) score += 1;

  return Math.min(10, score);
}

/**
 * Score technical quality dimension (0-10)
 */
function scoreTechnicalQuality(repo) {
  let score = 0;
  if (repo.hasDocumentation) score += 2;
  if (repo.hasSkillMd) score += 2;
  if (repo.hasProperFrontmatter) score += 1;
  if ((repo.testCount || 0) >= 50) score += 2;
  else if ((repo.testCount || 0) >= 10) score += 1;
  if ((repo.skillCount || 0) >= 5) score += 1.5;
  else if ((repo.skillCount || 0) >= 1) score += 0.5;
  if ((repo.supportedAgents || []).length >= 2) score += 1.5;

  return Math.min(10, score);
}

/**
 * Score community signal dimension (0-10)
 */
function scoreCommunitySignal(repo) {
  let score = 0;
  // Stars (log scale)
  if (repo.stars >= 10000) score += 4;
  else if (repo.stars >= 1000) score += 3;
  else if (repo.stars >= 100) score += 2;
  else if (repo.stars >= 10) score += 1;

  // Forks
  if (repo.forks >= 100) score += 2;
  else if (repo.forks >= 10) score += 1;

  // Listings
  if (repo.listedInMarketplace) score += 2;
  if (repo.listedInAwesomeList) score += 2;

  return Math.min(10, score);
}

/**
 * Score relevance & scope dimension (0-10)
 */
function scoreRelevanceScope(repo) {
  let score = 0;
  if (repo.hasSkillMd) score += 3;
  if ((repo.supportedAgents || []).includes('claude-code')) score += 2;
  if ((repo.supportedAgents || []).length >= 2) score += 1;
  if ((repo.skillCount || 0) >= 10) score += 2;
  else if ((repo.skillCount || 0) >= 3) score += 1;
  if (repo.listedInMarketplace || repo.listedInAwesomeList) score += 2;

  return Math.min(10, score);
}

/**
 * Main scoring function: evaluates a complete repo
 */
export function scoreRepo(repo) {
  const creatorTier = classifyCreatorTier(repo.creator);
  const greenFlags = checkGreenFlags(repo);
  const redFlags = checkRedFlags(repo);

  const dimensions = {
    creatorCredibility: scoreCreatorCredibility(repo.creator),
    battleTested: scoreBattleTested(repo),
    technicalQuality: scoreTechnicalQuality(repo),
    communitySignal: scoreCommunitySignal(repo),
    relevanceScope: scoreRelevanceScope(repo),
  };

  const totalScore = calculateWeightedScore(dimensions);

  // Determine tier from score
  let tier;
  if (totalScore >= 8) tier = 'S';
  else if (totalScore >= 6) tier = 'A';
  else if (totalScore >= 4) tier = 'B';
  else tier = 'C';

  return {
    name: repo.name,
    url: repo.url,
    totalScore,
    tier,
    creatorTier,
    dimensions,
    greenFlags,
    redFlags,
  };
}
