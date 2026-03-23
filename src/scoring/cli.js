#!/usr/bin/env node

/**
 * CLI tool to score installed skill repos using the 3-tier pipeline:
 *   Tier 1: Content Quality (static analyzer + fuseScores)
 *   Tier 2: Engineering Quality (metadata)
 *   Tier 3: Ecosystem Signals (metadata + creator-tier)
 *
 * Usage: node src/scoring/cli.js
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { analyzeContent, normalizeIndicators } from './static-analyzer.js';
import { calcContentScore, calcEngineeringScore, calcEcosystemScore, calcTotalScore, assignTier, fuseScores } from './calc.js';
import { classifyCreatorTier, getCreatorScore } from './creator-tier.js';
import { checkGreenFlags, checkRedFlags } from './flags.js';
import { judgeAll } from './llm-judge.js';

// Known repos with metadata
export const KNOWN_REPOS = [
  {
    name: 'gstack', dir: 'gstack',
    creator: { name: 'Garry Tan', role: 'CEO', company: 'Y Combinator', isFounder: true, majorOssProjects: [], isIndustryLeader: true },
    stars: 5000, forks: 200, contributors: 10,
    lastCommitDaysAgo: 3, commitCount: 500, testCount: 50,
    hasDocumentation: true, hasSkillMd: true, hasProperFrontmatter: true,
    listedInMarketplace: false, listedInAwesomeList: true,
    supportedAgents: ['claude-code', 'codex', 'gemini-cli'],
    skillCount: 21, claimedSkillCount: 21, actualSkillCount: 21, isFork: false,
  },
  {
    name: 'superpowers', dir: 'superpowers',
    creator: { name: 'Jesse Vincent', role: 'creator', company: 'Prime Radiant', isFounder: true, majorOssProjects: ['Request Tracker', 'Perl 5 pumpking'] },
    stars: 93000, forks: 3000, contributors: 50,
    lastCommitDaysAgo: 2, commitCount: 1000, testCount: 200,
    hasDocumentation: true, hasSkillMd: true, hasProperFrontmatter: true,
    listedInMarketplace: true, listedInAwesomeList: true,
    supportedAgents: ['claude-code'],
    skillCount: 20, claimedSkillCount: 20, actualSkillCount: 20, isFork: false,
  },
  {
    name: 'antfu-skills', dir: 'antfu-skills',
    creator: { name: 'Anthony Fu', role: 'core team', company: null, isFounder: false, majorOssProjects: ['Vue', 'Vite', 'Nuxt'] },
    stars: 3500, forks: 150, contributors: 5,
    lastCommitDaysAgo: 7, commitCount: 200, testCount: 10,
    hasDocumentation: true, hasSkillMd: true, hasProperFrontmatter: true,
    listedInMarketplace: false, listedInAwesomeList: true,
    supportedAgents: ['claude-code', 'codex', 'cursor'],
    skillCount: 15, claimedSkillCount: 15, actualSkillCount: 15, isFork: false,
  },
  {
    name: 'hashicorp', dir: 'hashicorp',
    creator: { name: 'HashiCorp', role: 'company', company: 'HashiCorp', isFounder: false, majorOssProjects: ['Terraform', 'Vault'], isOfficialOrg: true },
    stars: 1000, forks: 100, contributors: 15,
    lastCommitDaysAgo: 5, commitCount: 150, testCount: 30,
    hasDocumentation: true, hasSkillMd: true, hasProperFrontmatter: true,
    listedInMarketplace: true, listedInAwesomeList: true,
    supportedAgents: ['claude-code', 'codex', 'cursor'],
    skillCount: 12, claimedSkillCount: 12, actualSkillCount: 12, isFork: false,
  },
  {
    name: 'compound-engineering', dir: 'compound-engineering',
    creator: { name: 'Every Inc', role: 'company', company: 'Every Inc', isFounder: false, majorOssProjects: [], isOfficialOrg: true },
    stars: 800, forks: 50, contributors: 8,
    lastCommitDaysAgo: 10, commitCount: 200, testCount: 40,
    hasDocumentation: true, hasSkillMd: true, hasProperFrontmatter: true,
    listedInMarketplace: true, listedInAwesomeList: true,
    supportedAgents: ['claude-code', 'codex', 'opencode'],
    skillCount: 15, claimedSkillCount: 15, actualSkillCount: 15, isFork: false,
  },
  {
    name: 'agentsys', dir: 'agentsys',
    creator: { name: 'Avi Fenesh', role: 'maintainer', company: 'Valkey', isFounder: false, majorOssProjects: ['Valkey GLIDE'] },
    stars: 2000, forks: 100, contributors: 5,
    lastCommitDaysAgo: 5, commitCount: 300, testCount: 100,
    hasDocumentation: true, hasSkillMd: true, hasProperFrontmatter: true,
    listedInMarketplace: true, listedInAwesomeList: true,
    supportedAgents: ['claude-code', 'codex', 'opencode'],
    skillCount: 28, claimedSkillCount: 28, actualSkillCount: 28, isFork: false,
  },
  {
    name: 'everything-claude-code', dir: 'everything-claude-code',
    creator: { name: 'Affaan Mustafa', role: 'contributor', company: null, isFounder: false, majorOssProjects: [], highStarRepos: 2 },
    stars: 1500, forks: 80, contributors: 5,
    lastCommitDaysAgo: 7, commitCount: 250, testCount: 997,
    hasDocumentation: true, hasSkillMd: true, hasProperFrontmatter: true,
    listedInMarketplace: true, listedInAwesomeList: true,
    supportedAgents: ['claude-code', 'codex', 'cursor'],
    skillCount: 11, claimedSkillCount: 11, actualSkillCount: 11, isFork: false,
  },
  {
    name: 'anthropic', dir: 'anthropic',
    creator: { name: 'Anthropic', role: 'company', company: 'Anthropic', isFounder: true, majorOssProjects: [], isOfficialOrg: true },
    stars: 2800, forks: 300, contributors: 30,
    lastCommitDaysAgo: 1, commitCount: 500, testCount: 50,
    hasDocumentation: true, hasSkillMd: true, hasProperFrontmatter: true,
    listedInMarketplace: true, listedInAwesomeList: true,
    supportedAgents: ['claude-code'],
    skillCount: 46, claimedSkillCount: 46, actualSkillCount: 46, isFork: false,
  },
];

// Find and read the largest SKILL.md from a skill directory
export function findLargestSkillMd(skillDir) {
  const skillsBase = resolve('.claude/skills', skillDir);
  const files = [];

  function walk(dir) {
    try {
      for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        try {
          const st = statSync(full);
          if (st.isDirectory()) walk(full);
          else if (entry === 'SKILL.md') files.push({ path: full, size: st.size });
        } catch { /* skip unreadable */ }
      }
    } catch { /* skip unreadable dirs */ }
  }

  walk(skillsBase);
  if (files.length === 0) return { content: '', refCount: 0 };

  files.sort((a, b) => b.size - a.size);
  const content = readFileSync(files[0].path, 'utf8');
  return { content, refCount: files.length };
}

// Score engineering dimensions from metadata
export function scoreEngineering(repo) {
  const testCov = repo.testCount >= 100 ? 9 : repo.testCount >= 50 ? 7 : repo.testCount >= 10 ? 5 : repo.testCount >= 1 ? 3 : 0;
  const infra = (repo.hasDocumentation ? 3 : 0) + (repo.commitCount >= 200 ? 3 : repo.commitCount >= 50 ? 2 : 0) + (repo.contributors >= 5 ? 2 : 0);
  const crossSkill = (repo.skillCount || 0) >= 10 ? 8 : (repo.skillCount || 0) >= 5 ? 6 : (repo.skillCount || 0) >= 1 ? 3 : 0;
  const crossPlatform = (repo.supportedAgents || []).length >= 3 ? 9 : (repo.supportedAgents || []).length >= 2 ? 6 : 3;
  return { testCoverage: Math.min(10, testCov), infrastructure: Math.min(10, infra), crossSkillComposition: Math.min(10, crossSkill), crossPlatformSupport: Math.min(10, crossPlatform) };
}

// Score ecosystem dimensions from metadata
export function scoreEcosystem(repo) {
  const creatorTier = classifyCreatorTier(repo.creator);
  const creatorScore = getCreatorScore(creatorTier);
  const community = (repo.stars >= 10000 ? 4 : repo.stars >= 1000 ? 3 : repo.stars >= 100 ? 2 : 1) +
    (repo.forks >= 100 ? 2 : repo.forks >= 10 ? 1 : 0) + (repo.listedInMarketplace ? 2 : 0) + (repo.listedInAwesomeList ? 2 : 0);
  const maintenance = repo.lastCommitDaysAgo <= 7 ? 9 : repo.lastCommitDaysAgo <= 30 ? 7 : repo.lastCommitDaysAgo <= 90 ? 4 : 1;
  const usage = (repo.listedInMarketplace ? 5 : 0) + (repo.listedInAwesomeList ? 3 : 0) + (repo.stars >= 1000 ? 2 : 0);
  return {
    creatorCredibility: creatorScore,
    communityValidation: Math.min(10, community),
    maintenanceActivity: Math.min(10, maintenance),
    usageEvidence: Math.min(10, usage),
    creatorTier,
  };
}

export async function main() {
  // Detect LLM mode at runtime (not module-level) so tests can control it
  const useLlm = process.env.OPENROUTER_API_KEY || process.argv.includes('--llm');
  // Phase 1: Static analysis for all repos
  const repoData = KNOWN_REPOS.map(repo => {
    const { content, refCount } = findLargestSkillMd(repo.dir);
    const raw = analyzeContent(content, { referenceFileCount: refCount });
    const staticScores = normalizeIndicators(raw);
    return { repo, content, raw, staticScores };
  });

  // Phase 2: LLM-as-Judge (if enabled)
  let llmMap = new Map();
  if (useLlm) {
    console.log('  LLM Judge: calling OpenRouter (minimax/minimax-m2.7)...\n');
    const skills = repoData
      .filter(d => d.content.length > 0)
      .map(d => ({ name: d.repo.name, content: d.content }));
    llmMap = await judgeAll(skills);
  }

  // Phase 3: Fuse scores and compute totals
  const results = repoData.map(({ repo, raw, staticScores }) => {
    const llmScores = llmMap.get(repo.name) || null;
    const fused = fuseScores(staticScores, llmScores);
    const contentScore = calcContentScore(fused);

    const engDims = scoreEngineering(repo);
    const engineeringScore = calcEngineeringScore(engDims);

    const { creatorTier, ...ecoDims } = scoreEcosystem(repo);
    const ecosystemScore = calcEcosystemScore(ecoDims);

    const total = calcTotalScore(contentScore, engineeringScore, ecosystemScore);
    const tier = assignTier(total);
    const greenFlags = checkGreenFlags({ ...repo, hasIronLaws: raw.error_token_count >= 5, hasCompletionProtocol: raw.has_completion_protocol, hasEscalation: raw.has_escalation, hasAntiPatterns: raw.anti_pattern_count >= 2, stepCount: raw.step_count, crossSkillRefs: raw.cross_skill_refs });
    const redFlags = checkRedFlags(repo);

    return { name: repo.name, total, tier, creatorTier, contentScore, engineeringScore, ecosystemScore, fused, greenFlags, redFlags, wordCount: raw.total_word_count, hasLlm: !!llmScores };
  }).sort((a, b) => b.total - a.total);

  // Output
  const mode = useLlm ? 'Content-First + LLM Judge' : 'Content-First (static-only)';
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log(`║     Skill Scout — 3-Tier ${mode.padEnd(35)}║`);
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  for (const r of results) {
    const pct = Math.round(r.total);
    const bar = '█'.repeat(Math.round(pct / 5)) + '░'.repeat(20 - Math.round(pct / 5));
    const llmTag = r.hasLlm ? ' [LLM]' : '';
    console.log(`${r.tier} │ ${bar} ${r.total.toFixed(1)} │ ${r.name}${llmTag}`);
    console.log(`  │ Content: ${r.contentScore.toFixed(1)}/50 │ Engineering: ${r.engineeringScore.toFixed(1)}/20 │ Ecosystem: ${r.ecosystemScore.toFixed(1)}/30 │ Creator: ${r.creatorTier}`);
    console.log(`  │ WF:${r.fused.workflowStructure.toFixed(1)} BC:${r.fused.behavioralConstraints.toFixed(1)} ER:${r.fused.errorResilience.toFixed(1)} ToM:${r.fused.theoryOfMind.toFixed(1)} IC:${r.fused.instructionClarity.toFixed(1)} DD:${r.fused.domainDepth.toFixed(1)} │ ${r.wordCount} words`);
    if (r.greenFlags.length) console.log(`  │ ✓ ${r.greenFlags.join(', ')}`);
    if (r.redFlags.length) console.log(`  │ ✗ ${r.redFlags.join(', ')}`);
    console.log('');
  }

  const spread = results[0].total - results[results.length - 1].total;
  console.log(`Total: ${results.length} repos scored │ Spread: ${spread.toFixed(1)} points │ Mode: ${useLlm ? 'LLM+Static' : 'Static-only'}`);
  console.log(`Tier S (≥80): ${results.filter(r => r.tier === 'S').length} │ A (≥60): ${results.filter(r => r.tier === 'A').length} │ B (≥40): ${results.filter(r => r.tier === 'B').length} │ C (<40): ${results.filter(r => r.tier === 'C').length}`);
}

// Only auto-run when executed directly (not when imported for testing)
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] && resolve(process.argv[1]) === __filename) {
  main().catch(err => { console.error(err); process.exit(1); });
}
