/**
 * Auto-Scorer — bridges static-analyzer + skills-master metadata → 3-tier scores (0-10).
 *
 * Maps automated signals to the same content/engineering/ecosystem structure
 * that ground-truth.json uses, enabling fully automated calibration.
 *
 * Content score:  from static-analyzer normalized dimensions (4 of 6 computable)
 * Engineering:    from repo metadata (tests, CI, install count proxy)
 * Ecosystem:      from stars, marketplace presence, creator tier, maintenance
 */

import { analyzeContent, normalizeIndicators } from './static-analyzer.js';

// ============================================================
// Content score (0-10) — from static-analyzer
// ============================================================

/**
 * Compute content score from SKILL.md text.
 * Uses 4 static dimensions (workflowStructure, behavioralConstraints, errorResilience, domainDepth).
 * theoryOfMind + instructionClarity require LLM → approximated via word count heuristic.
 */
export function scoreContent(skillMdContent, options = {}) {
  const raw = analyzeContent(skillMdContent, options);
  const dims = normalizeIndicators(raw);

  // Weights for available dimensions (out of 6 total)
  // Static: workflow(12) + behavioral(12) + errorResilience(8) + domainDepth(5) = 37
  // LLM-only: theoryOfMind(8) + instructionClarity(5) = 13
  // We score static dims and estimate LLM-only ones conservatively
  const staticScore =
    (dims.workflowStructure * 12 +
     dims.behavioralConstraints * 12 +
     dims.errorResilience * 8 +
     dims.domainDepth * 5) / 37;

  // Estimate LLM-only dims via proxy: word count + conditional density
  const wordProxy = raw.total_word_count > 500 ? Math.min(raw.total_word_count / 3000, 1) * 10 : 3;
  const condDensity = raw.total_word_count > 0
    ? (raw.conditional_count / raw.total_word_count) * 1000
    : 0;
  const clarityProxy = Math.min(condDensity * 2 + (raw.has_frontmatter ? 3 : 0), 10);

  // Blend: 75% static, 25% proxy
  const blended = staticScore * 0.75 + ((wordProxy + clarityProxy) / 2) * 0.25;

  return {
    score: Math.round(Math.min(10, Math.max(0, blended)) * 10) / 10,
    dims,
    raw,
  };
}

// ============================================================
// Engineering score (0-10) — from repo metadata
// ============================================================

/**
 * Compute engineering score from repo metadata signals.
 * @param {Object} meta - { testFileCount, hasCI, hasLicense, skillCount, installCountWeekly }
 */
export function scoreEngineering(meta = {}) {
  let score = 0;

  // Test coverage (0-4 points): 0 tests = 0, 1-5 = 1, 5-20 = 2, 20-100 = 3, 100+ = 4
  const tests = meta.testFileCount ?? 0;
  if (tests >= 100) score += 4;
  else if (tests >= 20) score += 3;
  else if (tests >= 5) score += 2;
  else if (tests >= 1) score += 1;

  // Infrastructure (0-3 points): CI + license + proper package config
  if (meta.hasCI) score += 1.5;
  if (meta.hasLicense) score += 0.5;
  if (meta.skillCount > 5) score += 1;

  // Install/usage signal (0-2 points)
  const installs = meta.installCountWeekly ?? 0;
  if (installs >= 10000) score += 2;
  else if (installs >= 1000) score += 1.5;
  else if (installs >= 100) score += 1;
  else if (installs > 0) score += 0.5;

  // Cross-platform (0-1 point)
  if (meta.crossPlatform) score += 1;

  return { score: Math.round(Math.min(10, Math.max(0, score)) * 10) / 10 };
}

// ============================================================
// Ecosystem score (0-10) — from stars, marketplace, creator, maintenance
// ============================================================

/**
 * Compute ecosystem score from community signals.
 * @param {Object} eco - { stars, creatorTierScore, officialMarketplace, lastCommitDaysAgo, contributorCount }
 */
export function scoreEcosystem(eco = {}) {
  let score = 0;

  // Creator credibility (0-4 points, from tier score 0-10)
  const creatorScore = eco.creatorTierScore ?? 2; // default C-tier
  score += (creatorScore / 10) * 4;

  // Community validation via stars (0-3 points)
  const stars = eco.stars ?? 0;
  if (stars >= 50000) score += 3;
  else if (stars >= 10000) score += 2.5;
  else if (stars >= 5000) score += 2;
  else if (stars >= 2000) score += 1.5;
  else if (stars >= 500) score += 1;
  else if (stars >= 100) score += 0.5;

  // Marketplace presence (0-1.5 points)
  if (eco.officialMarketplace) score += 1.5;

  // Maintenance activity (0-1.5 points)
  const daysAgo = eco.lastCommitDaysAgo ?? 999;
  if (daysAgo <= 7) score += 1.5;
  else if (daysAgo <= 30) score += 1;
  else if (daysAgo <= 90) score += 0.5;

  return { score: Math.round(Math.min(10, Math.max(0, score)) * 10) / 10 };
}

// ============================================================
// Combined auto-score
// ============================================================

/**
 * Full auto-score: content + engineering + ecosystem → { content, engineering, ecosystem } each 0-10
 * @param {Object} input - { skillMdContent, repoMeta, ecoMeta }
 */
export function autoScore(input) {
  const content = scoreContent(input.skillMdContent || '', input.contentOptions || {});
  const engineering = scoreEngineering(input.repoMeta || {});
  const ecosystem = scoreEcosystem(input.ecoMeta || {});

  return {
    content: content.score,
    engineering: engineering.score,
    ecosystem: ecosystem.score,
    details: { content, engineering, ecosystem },
  };
}
