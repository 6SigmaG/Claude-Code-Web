/**
 * Creator Tier Classification — S/S-/A/B/C
 *
 * Scores:  S=10, S-=8.5, A=7, B=5, C=2
 *
 * Tiers:
 *   S  — AI company founders, paradigm-shifting OSS creators
 *   S- — Industry leaders (no personal major OSS), official orgs of major tools
 *   A  — Top company engineers, OSS maintainers, hackathon winners, official orgs
 *   B  — Active contributors with proven track record
 *   C  — New/unverified
 */

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

const TIER_SCORES = { S: 10, 'S-': 8.5, A: 7, B: 5, C: 2 };

export function classifyCreatorTier(creator) {
  const companyLower = (creator.company || '').toLowerCase();
  const hasTopOss = (creator.majorOssProjects || []).some(
    p => TOP_TIER_OSS.includes(p.toLowerCase())
  );

  // S-tier: paradigm-shifting OSS creators, AI platform founders
  if (hasTopOss) return 'S';
  if ((creator.majorOssProjects || []).length >= 2 && creator.isFounder) return 'S';
  // AI company founders (Anthropic, OpenAI, DeepMind) — but not YC (industry leader, not AI creator)
  const isAiCompanyFounder = creator.isFounder && S_TIER_COMPANIES
    .filter(c => c !== 'y combinator')
    .some(c => companyLower.includes(c));
  if (isAiCompanyFounder) return 'S';

  // S- tier: industry leaders (YC CEO, etc.), official orgs of major tools
  if (companyLower.includes('y combinator') && (creator.role === 'CEO' || creator.role === 'President')) return 'S-';
  if (creator.isOfficialOrg && creator.isIndustryLeader) return 'S-';

  // A-tier: official orgs, top company engineers, OSS maintainers
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

export function getCreatorScore(tier) {
  return TIER_SCORES[tier] ?? 0;
}
