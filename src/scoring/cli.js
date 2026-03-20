#!/usr/bin/env node

/**
 * CLI tool to score installed skill repos
 * Usage: node src/scoring/cli.js
 */

import { scoreRepo } from './scorer.js';

// Known repos with metadata (will be auto-populated by Discovery module later)
const KNOWN_REPOS = [
  {
    name: 'gstack',
    url: 'https://github.com/garrytan/gstack',
    creator: { name: 'Garry Tan', role: 'CEO', company: 'Y Combinator', isFounder: true, majorOssProjects: [] },
    stars: 5000, forks: 200, contributors: 10,
    lastCommitDaysAgo: 3, commitCount: 500, testCount: 50,
    hasDocumentation: true, hasSkillMd: true, hasProperFrontmatter: true,
    listedInMarketplace: false, listedInAwesomeList: true,
    supportedAgents: ['claude-code', 'codex', 'gemini-cli'],
    skillCount: 21, claimedSkillCount: 21, actualSkillCount: 21, isFork: false,
  },
  {
    name: 'superpowers',
    url: 'https://github.com/obra/superpowers',
    creator: { name: 'Jesse Vincent', role: 'creator', company: 'Prime Radiant', isFounder: true, majorOssProjects: ['Request Tracker', 'Perl 5 pumpking'] },
    stars: 93000, forks: 3000, contributors: 50,
    lastCommitDaysAgo: 2, commitCount: 1000, testCount: 200,
    hasDocumentation: true, hasSkillMd: true, hasProperFrontmatter: true,
    listedInMarketplace: true, listedInAwesomeList: true,
    supportedAgents: ['claude-code'],
    skillCount: 20, claimedSkillCount: 20, actualSkillCount: 20, isFork: false,
  },
  {
    name: 'antfu-skills',
    url: 'https://github.com/antfu/skills',
    creator: { name: 'Anthony Fu', role: 'core team', company: null, isFounder: false, majorOssProjects: ['Vue', 'Vite', 'Nuxt'] },
    stars: 3500, forks: 150, contributors: 5,
    lastCommitDaysAgo: 7, commitCount: 200, testCount: 10,
    hasDocumentation: true, hasSkillMd: true, hasProperFrontmatter: true,
    listedInMarketplace: false, listedInAwesomeList: true,
    supportedAgents: ['claude-code', 'codex', 'cursor'],
    skillCount: 15, claimedSkillCount: 15, actualSkillCount: 15, isFork: false,
  },
  {
    name: 'hashicorp',
    url: 'https://github.com/hashicorp/agent-skills',
    creator: { name: 'HashiCorp', role: 'company', company: 'HashiCorp', isFounder: false, majorOssProjects: ['Terraform', 'Vault'], isOfficialOrg: true },
    stars: 1000, forks: 100, contributors: 15,
    lastCommitDaysAgo: 5, commitCount: 150, testCount: 30,
    hasDocumentation: true, hasSkillMd: true, hasProperFrontmatter: true,
    listedInMarketplace: true, listedInAwesomeList: true,
    supportedAgents: ['claude-code', 'codex', 'cursor'],
    skillCount: 12, claimedSkillCount: 12, actualSkillCount: 12, isFork: false,
  },
  {
    name: 'compound-engineering',
    url: 'https://github.com/EveryInc/compound-engineering-plugin',
    creator: { name: 'Every Inc', role: 'company', company: 'Every Inc', isFounder: false, majorOssProjects: [], isOfficialOrg: true },
    stars: 800, forks: 50, contributors: 8,
    lastCommitDaysAgo: 10, commitCount: 200, testCount: 40,
    hasDocumentation: true, hasSkillMd: true, hasProperFrontmatter: true,
    listedInMarketplace: true, listedInAwesomeList: true,
    supportedAgents: ['claude-code', 'codex', 'opencode'],
    skillCount: 15, claimedSkillCount: 15, actualSkillCount: 15, isFork: false,
  },
  {
    name: 'agentsys',
    url: 'https://github.com/avifenesh/agentsys',
    creator: { name: 'Avi Fenesh', role: 'maintainer', company: 'Valkey', isFounder: false, majorOssProjects: ['Valkey GLIDE'] },
    stars: 2000, forks: 100, contributors: 5,
    lastCommitDaysAgo: 5, commitCount: 300, testCount: 100,
    hasDocumentation: true, hasSkillMd: true, hasProperFrontmatter: true,
    listedInMarketplace: true, listedInAwesomeList: true,
    supportedAgents: ['claude-code', 'codex', 'opencode'],
    skillCount: 28, claimedSkillCount: 28, actualSkillCount: 28, isFork: false,
  },
  {
    name: 'everything-claude-code',
    url: 'https://github.com/affaan-m/everything-claude-code',
    creator: { name: 'Affaan Mustafa', role: 'contributor', company: null, isFounder: false, majorOssProjects: [], highStarRepos: 2 },
    stars: 1500, forks: 80, contributors: 5,
    lastCommitDaysAgo: 7, commitCount: 250, testCount: 997,
    hasDocumentation: true, hasSkillMd: true, hasProperFrontmatter: true,
    listedInMarketplace: true, listedInAwesomeList: true,
    supportedAgents: ['claude-code', 'codex', 'cursor'],
    skillCount: 11, claimedSkillCount: 11, actualSkillCount: 11, isFork: false,
  },
  {
    name: 'anthropic (official plugins)',
    url: 'https://github.com/anthropics/claude-plugins-official',
    creator: { name: 'Anthropic', role: 'company', company: 'Anthropic', isFounder: true, majorOssProjects: [], isOfficialOrg: true },
    stars: 2800, forks: 300, contributors: 30,
    lastCommitDaysAgo: 1, commitCount: 500, testCount: 50,
    hasDocumentation: true, hasSkillMd: true, hasProperFrontmatter: true,
    listedInMarketplace: true, listedInAwesomeList: true,
    supportedAgents: ['claude-code'],
    skillCount: 46, claimedSkillCount: 46, actualSkillCount: 46, isFork: false,
  },
];

// Score all repos
const results = KNOWN_REPOS
  .map(repo => scoreRepo(repo))
  .sort((a, b) => b.totalScore - a.totalScore);

// Output
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║         Claude Code Skills — Repo Scorecard                 ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

for (const r of results) {
  const bar = '█'.repeat(Math.round(r.totalScore)) + '░'.repeat(10 - Math.round(r.totalScore));
  console.log(`${r.tier} │ ${bar} ${r.totalScore.toFixed(1)} │ ${r.name}`);
  console.log(`  │ Creator: ${r.creatorTier}-tier │ Battle: ${r.dimensions.battleTested} │ Quality: ${r.dimensions.technicalQuality} │ Community: ${r.dimensions.communitySignal} │ Relevance: ${r.dimensions.relevanceScope}`);
  if (r.greenFlags.length) console.log(`  │ ✓ ${r.greenFlags.join(', ')}`);
  if (r.redFlags.length) console.log(`  │ ✗ ${r.redFlags.join(', ')}`);
  console.log('');
}

console.log(`Total: ${results.length} repos scored`);
console.log(`Tier S (≥8): ${results.filter(r => r.tier === 'S').length}`);
console.log(`Tier A (≥6): ${results.filter(r => r.tier === 'A').length}`);
console.log(`Tier B (≥4): ${results.filter(r => r.tier === 'B').length}`);
console.log(`Tier C (<4): ${results.filter(r => r.tier === 'C').length}`);
