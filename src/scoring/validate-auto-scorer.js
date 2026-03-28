#!/usr/bin/env node

/**
 * Validate auto-scorer against ground truth.
 * Reads installed skills' SKILL.md, computes auto-scores,
 * compares with human labels, and runs through calibrate to check F1.
 */

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scoreContent, scoreEngineering, scoreEcosystem } from './auto-scorer.js';
import { scoreRepo, classify, computeMetrics } from './calibrate.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');
const SKILLS_DIR = join(ROOT, '.claude', 'skills');

// Map ground-truth slugs → installed skill directories + metadata
const SKILL_MAP = {
  'obra/superpowers': {
    dir: 'superpowers',
    skillMdGlob: 'skills/*/SKILL.md', // multiple sub-skills
    stars: 108000, creatorTierScore: 10, officialMarketplace: true,
    testFileCount: 100, hasCI: true, hasLicense: true, skillCount: 14,
    installCountWeekly: 32400, lastCommitDaysAgo: 3,
  },
  'garrytan/gstack': {
    dir: 'gstack',
    skillMdGlob: '*/SKILL.md',
    stars: 3200, creatorTierScore: 8.5, officialMarketplace: false,
    testFileCount: 0, hasCI: false, hasLicense: true, skillCount: 25,
    installCountWeekly: 0, lastCommitDaysAgo: 7,
  },
  'antfu/skills': {
    dir: 'antfu-skills',
    skillMdGlob: '*.md',
    stars: 3500, creatorTierScore: 10, officialMarketplace: false,
    testFileCount: 0, hasCI: false, hasLicense: true, skillCount: 5,
    installCountWeekly: 0, lastCommitDaysAgo: 14,
  },
  'hashicorp/agent-skills': {
    dir: 'hashicorp',
    skillMdGlob: '*/SKILL.md',
    stars: 1200, creatorTierScore: 7, officialMarketplace: true,
    testFileCount: 10, hasCI: true, hasLicense: true, skillCount: 6,
    installCountWeekly: 500, lastCommitDaysAgo: 10,
  },
  'everyinc/compound-engineering': {
    dir: 'compound-engineering',
    skillMdGlob: '*.md',
    stars: 800, creatorTierScore: 5, officialMarketplace: false,
    testFileCount: 0, hasCI: false, hasLicense: true, skillCount: 3,
    installCountWeekly: 0, lastCommitDaysAgo: 30,
  },
  'agent-sh/agentsys': {
    dir: 'agentsys',
    skillMdGlob: '**/*.md',
    stars: 500, creatorTierScore: 7, officialMarketplace: false,
    testFileCount: 5, hasCI: false, hasLicense: true, skillCount: 42,
    installCountWeekly: 0, lastCommitDaysAgo: 14,
  },
  'affaan-m/everything-claude-code': {
    dir: 'everything-claude-code',
    skillMdGlob: '**/*.md',
    stars: 700, creatorTierScore: 5, officialMarketplace: false,
    testFileCount: 997, hasCI: true, hasLicense: true, skillCount: 11,
    installCountWeekly: 0, lastCommitDaysAgo: 7,
  },
};

function findSkillMds(skillDir) {
  const mds = [];
  function walk(dir) {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const st = statSync(full);
      if (st.isDirectory()) walk(full);
      else if (entry === 'SKILL.md') mds.push(full);
    }
  }
  walk(skillDir);
  return mds;
}

function run() {
  const groundTruthData = JSON.parse(
    readFileSync(join(ROOT, 'data', 'ground-truth.json'), 'utf-8')
  );
  const weights = JSON.parse(
    readFileSync(join(ROOT, 'data', 'weights.json'), 'utf-8')
  );

  console.log('='.repeat(70));
  console.log('🔍 Auto-Scorer Validation: auto vs human scores');
  console.log('='.repeat(70));

  const autoLabels = [];
  const humanLabels = [];

  for (const gt of groundTruthData.labels) {
    const mapping = SKILL_MAP[gt.slug];

    if (!mapping) {
      // Not installed — use human scores as-is
      console.log(`\n⏭️  ${gt.slug}: not installed locally (using human scores)`);
      autoLabels.push(gt.scores);
      humanLabels.push(gt);
      continue;
    }

    const skillDir = join(SKILLS_DIR, mapping.dir);
    const skillMds = findSkillMds(skillDir);

    // Concatenate all SKILL.md content for this repo
    let allContent = '';
    for (const md of skillMds) {
      allContent += readFileSync(md, 'utf-8') + '\n\n';
    }

    // Auto-score content
    const contentResult = scoreContent(allContent, { referenceFileCount: skillMds.length });

    // Auto-score engineering
    const engResult = scoreEngineering({
      testFileCount: mapping.testFileCount,
      hasCI: mapping.hasCI,
      hasLicense: mapping.hasLicense,
      skillCount: mapping.skillCount,
      installCountWeekly: mapping.installCountWeekly,
    });

    // Auto-score ecosystem
    const ecoResult = scoreEcosystem({
      stars: mapping.stars,
      creatorTierScore: mapping.creatorTierScore,
      officialMarketplace: mapping.officialMarketplace,
      lastCommitDaysAgo: mapping.lastCommitDaysAgo,
    });

    const autoScores = {
      content: contentResult.score,
      engineering: engResult.score,
      ecosystem: ecoResult.score,
    };

    autoLabels.push(autoScores);
    humanLabels.push(gt);

    // Compare
    const contentDiff = (autoScores.content - gt.scores.content).toFixed(1);
    const engDiff = (autoScores.engineering - gt.scores.engineering).toFixed(1);
    const ecoDiff = (autoScores.ecosystem - gt.scores.ecosystem).toFixed(1);

    console.log(`\n📦 ${gt.slug} (${skillMds.length} SKILL.md files)`);
    console.log(`   Content:     auto=${autoScores.content.toFixed(1)} human=${gt.scores.content} (Δ${contentDiff > 0 ? '+' : ''}${contentDiff})`);
    console.log(`   Engineering: auto=${autoScores.engineering.toFixed(1)} human=${gt.scores.engineering} (Δ${engDiff > 0 ? '+' : ''}${engDiff})`);
    console.log(`   Ecosystem:   auto=${autoScores.ecosystem.toFixed(1)} human=${gt.scores.ecosystem} (Δ${ecoDiff > 0 ? '+' : ''}${ecoDiff})`);
  }

  // Now run through calibrate scoring with auto-scores
  console.log('\n' + '='.repeat(70));
  console.log('📊 Classification comparison: auto-scores vs human-scores');
  console.log('='.repeat(70));

  const humanPredictions = [];
  const autoPredictions = [];

  for (let i = 0; i < humanLabels.length; i++) {
    const gt = humanLabels[i];
    const autoS = autoLabels[i];

    const humanResult = scoreRepo(gt.scores, weights);
    const autoResult = scoreRepo(autoS, weights);

    const humanPred = classify(humanResult.total, weights);
    const autoPred = classify(autoResult.total, weights);

    humanPredictions.push(humanPred);
    autoPredictions.push(autoPred);

    const match = humanPred === autoPred ? '✅' : '⚠️';
    console.log(`  ${match} ${gt.slug}: human→${humanPred}(${humanResult.total}) auto→${autoPred}(${autoResult.total}) actual=${gt.label}`);
  }

  const humanMetrics = computeMetrics(humanPredictions, humanLabels);
  const autoMetrics = computeMetrics(autoPredictions, humanLabels);

  console.log('\n  Summary:');
  console.log(`  Human scores F1: ${(humanMetrics.combinedF1 * 100).toFixed(1)}% (accuracy: ${(humanMetrics.accuracy * 100).toFixed(1)}%)`);
  console.log(`  Auto scores F1:  ${(autoMetrics.combinedF1 * 100).toFixed(1)}% (accuracy: ${(autoMetrics.accuracy * 100).toFixed(1)}%)`);

  const agreementCount = humanPredictions.filter((p, i) => p === autoPredictions[i]).length;
  console.log(`  Agreement: ${agreementCount}/${humanLabels.length} (${(agreementCount / humanLabels.length * 100).toFixed(1)}%)`);
}

run();
