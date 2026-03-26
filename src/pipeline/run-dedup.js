#!/usr/bin/env node

/**
 * Run the dedup pipeline: CSV + official plugins + discovery report → skills-master.json
 *
 * Usage: node src/pipeline/run-dedup.js
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCsv, buildSkillsMaster } from './dedup.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');

// ============================================================
// Load data sources
// ============================================================

// 1. CSV
const csvText = readFileSync(join(ROOT, 'ALL_SKILLS_V2.csv'), 'utf-8');
const csvRows = parseCsv(csvText);
console.log(`📄 CSV: ${csvRows.length} rows loaded`);

// 2. Official plugins
const officialPlugins = JSON.parse(
  readFileSync(join(ROOT, 'data', 'official-plugins.json'), 'utf-8')
);
console.log(`🏛️  Official plugins: ${officialPlugins.length} loaded`);

// 3. Discovery assessments (manually extracted from discovery report)
const discoveryAssessments = {
  // Round 1 — Tier 1 (already installed)
  'garrytan/gstack': { assessment: 'tier1_installed', round: 1 },
  'obra/superpowers': { assessment: 'tier1_installed', round: 1 },
  'antfu/skills': { assessment: 'tier1_installed', round: 1 },
  'hashicorp/agent-skills': { assessment: 'tier1_installed', round: 1 },
  'everyinc/compound-engineering': { assessment: 'tier1_installed', round: 1 },
  // Round 1 — Tier 2 (installed)
  'agent-sh/agentsys': { assessment: 'tier2_installed', round: 1 },
  'affaan-m/everything-claude-code': { assessment: 'tier2_installed', round: 1 },
  // Round 1 — Red flags
  'arrowai/cline-chinese': { assessment: 'red_flag', round: 1 },

  // Round 3 — Tier 1 (strongly recommended)
  'upstash/context7': { assessment: 'tier1_strongly_recommended', round: 3 },
  'vercel-labs/agent-skills': { assessment: 'tier1_strongly_recommended', round: 3 },
  'trailofbits/skills': { assessment: 'tier1_strongly_recommended', round: 3 },
  // Round 3 — Tier 2 (recommended)
  'oraios/serena': { assessment: 'tier2_recommended', round: 3 },
  'kepano/obsidian-skills': { assessment: 'tier2_recommended', round: 3 },
  'k-dense-ai/claude-scientific-skills': { assessment: 'tier2_recommended', round: 3 },
  'mvanhorn/last30days-skill': { assessment: 'tier2_recommended', round: 3 },
  'orchestra-research/ai-research-skills': { assessment: 'tier2_recommended', round: 3 },
  'deanpeters/product-manager-skills': { assessment: 'tier2_recommended', round: 3 },
  // Round 3 — Watching
  'wshobson/agents': { assessment: 'watching', round: 3 },
  'voltagent/awesome-claude-code-subagents': { assessment: 'watching', round: 3 },
  // Round 3 — Red flags
  'nextlevelbuilder/ui-ux-pro-max-skill': { assessment: 'red_flag_star_inflation', round: 3 },
  'ruvnet/ruflo': { assessment: 'red_flag_star_inflation', round: 3 },
  'contains-studio/agents': { assessment: 'red_flag_abandoned', round: 3 },
};

console.log(`📋 Discovery assessments: ${Object.keys(discoveryAssessments).length} repos`);

// 4. Product skills (user's curated product ideation skills)
let productSkills = [];
try {
  productSkills = JSON.parse(
    readFileSync(join(ROOT, 'data', 'product-skills.json'), 'utf-8')
  );
  console.log(`🎯 Product skills: ${productSkills.length} loaded`);
} catch {
  console.log(`🎯 Product skills: not found (skipping)`);
}

// ============================================================
// Run pipeline
// ============================================================

const result = buildSkillsMaster(csvRows, officialPlugins, discoveryAssessments, productSkills);

// Write output
mkdirSync(join(ROOT, 'data'), { recursive: true });
writeFileSync(
  join(ROOT, 'data', 'skills-master.json'),
  JSON.stringify(result, null, 2),
  'utf-8'
);

// ============================================================
// Print summary
// ============================================================

console.log('\n' + '='.repeat(60));
console.log('📊 Skills Master — Dedup Summary');
console.log('='.repeat(60));

const s = result.summary;
console.log(`\n总 unique repos:     ${s.totalUniqueRepos}`);
console.log(`官方 marketplace:    ${s.officialPluginCount} (含 ${s.officialOnlyPluginCount} 仅 marketplace)`);
console.log(`产品 skills:         ${s.productSkillCount} 输入 → ${s.productSkillNewRepos} 新 repos + ${s.nonGithubProductCount} 非 GitHub`);
console.log(`已评估:              ${s.withAssessment}`);
console.log(`待评估:              ${s.withoutAssessment}`);
console.log(`跳过(无效/自建):     ${s.skippedCount}`);

console.log('\n📈 Stars 分布:');
for (const [range, count] of Object.entries(s.starsDistribution)) {
  console.log(`  ${range.padEnd(10)} ${count}`);
}

console.log('\n📂 类别分布:');
for (const [cat, count] of Object.entries(s.categoryBreakdown).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${cat.padEnd(20)} ${count}`);
}

if (Object.keys(s.tierBreakdown).length > 0) {
  console.log('\n🏷️  Tier 共识分布:');
  for (const [tier, count] of Object.entries(s.tierBreakdown).sort()) {
    console.log(`  ${tier.padEnd(10)} ${count}`);
  }
}

console.log(`\n✅ 输出: data/skills-master.json`);
