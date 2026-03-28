#!/usr/bin/env node

/**
 * AutoResearch Calibration Loop
 *
 * Karpathy's three-file contract:
 *   FIXED evaluator  = calc.js scoring math (NEVER modified)
 *   Agent sandbox    = data/weights.json (ONLY file that changes)
 *   Human strategy   = data/ground-truth.json (NEVER modified)
 *   Single metric    = F1-score on admit/reject classification
 *
 * Loop:
 *   1. Score all ground-truth repos with current weights
 *   2. Classify: score >= admitThreshold → "admit", < rejectThreshold → "reject", else "watching"
 *   3. Compare with human labels → compute F1
 *   4. Mutate ONE weight dimension
 *   5. If F1 improves → keep; else → revert
 *   6. Repeat until convergence or max iterations
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');

// ============================================================
// Core scoring function (uses weights from file, NOT hardcoded)
// ============================================================

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const clamp10 = v => clamp(v, 0, 10);

function scoreRepo(humanScores, weights) {
  // Content score (max = sum of content weights)
  let content = 0;
  for (const [key, weight] of Object.entries(weights.content)) {
    content += clamp10(humanScores.content || 0) * weight / 10;
  }

  // Engineering score
  let engineering = 0;
  for (const [key, weight] of Object.entries(weights.engineering)) {
    engineering += clamp10(humanScores.engineering || 0) * weight / 10;
  }

  // Ecosystem score
  let ecosystem = 0;
  for (const [key, weight] of Object.entries(weights.ecosystem)) {
    ecosystem += clamp10(humanScores.ecosystem || 0) * weight / 10;
  }

  const total = Math.round((content + engineering + ecosystem) * 10) / 10;
  return { content, engineering, ecosystem, total };
}

// ============================================================
// Classification + F1 computation
// ============================================================

function classify(score, weights) {
  if (score >= weights.admitThreshold) return 'admit';
  if (score < weights.rejectThreshold) return 'reject';
  return 'watching';
}

function computeMetrics(predictions, labels) {
  // Binary classification: admit vs non-admit
  let tp = 0, fp = 0, fn = 0, tn = 0;
  let correctAll = 0;

  for (let i = 0; i < labels.length; i++) {
    const actual = labels[i].label;
    const predicted = predictions[i];

    if (actual === predicted) correctAll++;

    // Binary: admit is positive
    if (actual === 'admit' && predicted === 'admit') tp++;
    else if (actual !== 'admit' && predicted === 'admit') fp++;
    else if (actual === 'admit' && predicted !== 'admit') fn++;
    else tn++;
  }

  const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
  const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
  const f1 = precision + recall > 0 ? 2 * precision * recall / (precision + recall) : 0;
  const accuracy = correctAll / labels.length;

  // Also compute reject F1
  let rtp = 0, rfp = 0, rfn = 0;
  for (let i = 0; i < labels.length; i++) {
    if (labels[i].label === 'reject' && predictions[i] === 'reject') rtp++;
    else if (labels[i].label !== 'reject' && predictions[i] === 'reject') rfp++;
    else if (labels[i].label === 'reject' && predictions[i] !== 'reject') rfn++;
  }
  const rPrec = rtp + rfp > 0 ? rtp / (rtp + rfp) : 0;
  const rRec = rtp + rfn > 0 ? rtp / (rtp + rfn) : 0;
  const rejectF1 = rPrec + rRec > 0 ? 2 * rPrec * rRec / (rPrec + rRec) : 0;

  // Combined F1 (macro average of admit + reject)
  const combinedF1 = (f1 + rejectF1) / 2;

  return { f1, rejectF1, combinedF1, precision, recall, accuracy, tp, fp, fn, tn };
}

function evaluateWeights(weights, groundTruth) {
  const predictions = [];
  const scores = [];

  for (const entry of groundTruth) {
    const result = scoreRepo(entry.scores, weights);
    scores.push(result.total);
    predictions.push(classify(result.total, weights));
  }

  const metrics = computeMetrics(predictions, groundTruth);
  return { predictions, scores, metrics };
}

// ============================================================
// Mutation operators (atomic, one change at a time)
// ============================================================

const MUTABLE_PARAMS = [
  // Content weights
  { tier: 'content', key: 'workflowStructure' },
  { tier: 'content', key: 'behavioralConstraints' },
  { tier: 'content', key: 'errorResilience' },
  { tier: 'content', key: 'theoryOfMind' },
  { tier: 'content', key: 'instructionClarity' },
  { tier: 'content', key: 'domainDepth' },
  // Engineering weights
  { tier: 'engineering', key: 'testCoverage' },
  { tier: 'engineering', key: 'infrastructure' },
  { tier: 'engineering', key: 'crossSkillComposition' },
  { tier: 'engineering', key: 'crossPlatformSupport' },
  // Ecosystem weights
  { tier: 'ecosystem', key: 'creatorCredibility' },
  { tier: 'ecosystem', key: 'communityValidation' },
  { tier: 'ecosystem', key: 'maintenanceActivity' },
  { tier: 'ecosystem', key: 'usageEvidence' },
  // Thresholds
  { tier: '_threshold', key: 'admitThreshold' },
  { tier: '_threshold', key: 'rejectThreshold' },
];

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function mutateWeights(weights, paramIdx, delta) {
  const mutated = deepClone(weights);
  const param = MUTABLE_PARAMS[paramIdx];

  if (param.tier === '_threshold') {
    mutated[param.key] = clamp(mutated[param.key] + delta, 10, 90);
  } else {
    mutated[param.tier][param.key] = Math.max(0, mutated[param.tier][param.key] + delta);
  }

  return mutated;
}

// ============================================================
// The Loop
// ============================================================

function runCalibrationLoop(maxIterations = 200, verbose = true) {
  // Load ground truth (FIXED — never modified)
  const groundTruthData = JSON.parse(
    readFileSync(join(ROOT, 'data', 'ground-truth.json'), 'utf-8')
  );
  const groundTruth = groundTruthData.labels;

  // Load current weights (Agent sandbox — the only mutable file)
  let weights = JSON.parse(
    readFileSync(join(ROOT, 'data', 'weights.json'), 'utf-8')
  );

  // Initial evaluation
  let { metrics: bestMetrics, predictions: bestPredictions, scores: bestScores } = evaluateWeights(weights, groundTruth);
  let bestF1 = bestMetrics.combinedF1;

  if (verbose) {
    console.log('='.repeat(70));
    console.log('🔬 AutoResearch Calibration Loop');
    console.log('='.repeat(70));
    console.log(`\n📊 Initial state:`);
    console.log(`   Combined F1: ${(bestF1 * 100).toFixed(1)}%`);
    console.log(`   Admit F1:    ${(bestMetrics.f1 * 100).toFixed(1)}%`);
    console.log(`   Reject F1:   ${(bestMetrics.rejectF1 * 100).toFixed(1)}%`);
    console.log(`   Accuracy:    ${(bestMetrics.accuracy * 100).toFixed(1)}%`);
    printMisclassifications(groundTruth, bestPredictions, bestScores);
  }

  // Deltas to try (from aggressive to subtle)
  const DELTAS = [10, 8, 6, 5, 3, 2, 1, -1, -2, -3, -5, -6, -8, -10];

  let improvements = 0;
  let totalTried = 0;
  let staleStreak = 0;
  const history = [{ iteration: 0, f1: bestF1, change: 'initial' }];

  for (let iter = 1; iter <= maxIterations; iter++) {
    let improved = false;

    // Try each mutable parameter
    for (let pIdx = 0; pIdx < MUTABLE_PARAMS.length; pIdx++) {
      for (const delta of DELTAS) {
        totalTried++;
        const candidate = mutateWeights(weights, pIdx, delta);
        const { metrics } = evaluateWeights(candidate, groundTruth);

        if (metrics.combinedF1 > bestF1 ||
            (metrics.combinedF1 === bestF1 && metrics.accuracy > bestMetrics.accuracy)) {
          const param = MUTABLE_PARAMS[pIdx];
          const paramName = param.tier === '_threshold' ? param.key : `${param.tier}.${param.key}`;
          const oldVal = param.tier === '_threshold'
            ? weights[param.key]
            : weights[param.tier][param.key];
          const newVal = param.tier === '_threshold'
            ? candidate[param.key]
            : candidate[param.tier][param.key];

          weights = candidate;
          bestF1 = metrics.combinedF1;
          bestMetrics = metrics;
          improvements++;
          improved = true;
          staleStreak = 0;

          const change = `${paramName}: ${oldVal} → ${newVal} (δ${delta > 0 ? '+' : ''}${delta})`;
          history.push({ iteration: iter, f1: bestF1, change });

          if (verbose) {
            console.log(`\n✅ Iter ${iter} | F1: ${(bestF1 * 100).toFixed(1)}% | ${change}`);
          }

          // Re-evaluate for misclassification tracking
          const { predictions, scores } = evaluateWeights(weights, groundTruth);
          bestPredictions = predictions;
          bestScores = scores;

          break; // Move to next parameter after finding improvement
        }
      }
      if (improved) break; // Restart parameter scan after improvement
    }

    if (!improved) {
      staleStreak++;
      if (verbose && staleStreak === 1) {
        console.log(`\n⏸️  Iter ${iter}: No improvement found, scanning more...`);
      }
      if (staleStreak >= 3) {
        if (verbose) {
          console.log(`\n🛑 Converged after ${iter} iterations (${staleStreak} stale rounds)`);
        }
        break;
      }
    }

    // Perfect score — stop early
    if (bestF1 >= 1.0) {
      if (verbose) console.log(`\n🎯 Perfect F1 reached at iteration ${iter}!`);
      break;
    }
  }

  // Save optimized weights
  weights._meta.lastCalibratedAt = new Date().toISOString();
  weights._meta.calibrationIterations = (weights._meta.calibrationIterations || 0) + improvements;
  weights._meta.version = (weights._meta.version || 1) + 1;
  writeFileSync(join(ROOT, 'data', 'weights.json'), JSON.stringify(weights, null, 2), 'utf-8');

  // Print final report
  if (verbose) {
    console.log('\n' + '='.repeat(70));
    console.log('📋 Calibration Report');
    console.log('='.repeat(70));
    console.log(`\n  Iterations:      ${history.length - 1}`);
    console.log(`  Mutations tried: ${totalTried}`);
    console.log(`  Improvements:    ${improvements}`);
    console.log(`  Initial F1:      ${(history[0].f1 * 100).toFixed(1)}%`);
    console.log(`  Final F1:        ${(bestF1 * 100).toFixed(1)}%`);
    console.log(`  Admit F1:        ${(bestMetrics.f1 * 100).toFixed(1)}%`);
    console.log(`  Reject F1:       ${(bestMetrics.rejectF1 * 100).toFixed(1)}%`);
    console.log(`  Accuracy:        ${(bestMetrics.accuracy * 100).toFixed(1)}%`);
    console.log(`  TP=${bestMetrics.tp} FP=${bestMetrics.fp} FN=${bestMetrics.fn} TN=${bestMetrics.tn}`);

    console.log('\n📈 Improvement history:');
    for (const h of history) {
      console.log(`  [${h.iteration}] F1=${(h.f1 * 100).toFixed(1)}% | ${h.change}`);
    }

    printMisclassifications(groundTruth, bestPredictions, bestScores);

    console.log('\n📝 Final weights saved to data/weights.json');
    console.log('\n🔑 Key weight changes:');
    const origWeights = {
      content: { workflowStructure: 12, behavioralConstraints: 12, errorResilience: 8, theoryOfMind: 8, instructionClarity: 5, domainDepth: 5 },
      engineering: { testCoverage: 8, infrastructure: 5, crossSkillComposition: 4, crossPlatformSupport: 3 },
      ecosystem: { creatorCredibility: 15, communityValidation: 8, maintenanceActivity: 5, usageEvidence: 2 },
      admitThreshold: 55, rejectThreshold: 35,
    };
    for (const tier of ['content', 'engineering', 'ecosystem']) {
      for (const [k, origV] of Object.entries(origWeights[tier])) {
        const newV = weights[tier][k];
        if (origV !== newV) {
          console.log(`  ${tier}.${k}: ${origV} → ${newV}`);
        }
      }
    }
    if (origWeights.admitThreshold !== weights.admitThreshold) {
      console.log(`  admitThreshold: ${origWeights.admitThreshold} → ${weights.admitThreshold}`);
    }
    if (origWeights.rejectThreshold !== weights.rejectThreshold) {
      console.log(`  rejectThreshold: ${origWeights.rejectThreshold} → ${weights.rejectThreshold}`);
    }
  }

  return { weights, metrics: bestMetrics, history, improvements };
}

function printMisclassifications(groundTruth, predictions, scores) {
  console.log('\n  Misclassifications:');
  let hasMiss = false;
  for (let i = 0; i < groundTruth.length; i++) {
    if (groundTruth[i].label !== predictions[i]) {
      hasMiss = true;
      console.log(`    ❌ ${groundTruth[i].slug}: actual=${groundTruth[i].label}, predicted=${predictions[i]}, score=${scores[i].toFixed(1)}`);
    }
  }
  if (!hasMiss) console.log('    ✅ None — perfect classification!');
}

// ============================================================
// Leave-One-Out Cross-Validation
// ============================================================

function runLOOCV(verbose = true) {
  const groundTruthData = JSON.parse(
    readFileSync(join(ROOT, 'data', 'ground-truth.json'), 'utf-8')
  );
  const allLabels = groundTruthData.labels;

  const initialWeights = JSON.parse(
    readFileSync(join(ROOT, 'data', 'weights.json'), 'utf-8')
  );

  const results = [];

  for (let i = 0; i < allLabels.length; i++) {
    const heldOut = allLabels[i];
    const trainSet = allLabels.filter((_, idx) => idx !== i);

    // Reset weights to initial for each fold
    let weights = deepClone(initialWeights);

    // Mini calibration on train set (max 100 iterations, silent)
    const DELTAS = [10, 8, 6, 5, 3, 2, 1, -1, -2, -3, -5, -6, -8, -10];
    let bestF1 = evaluateWeights(weights, trainSet).metrics.combinedF1;
    let staleStreak = 0;

    for (let iter = 0; iter < 100; iter++) {
      let improved = false;
      for (let pIdx = 0; pIdx < MUTABLE_PARAMS.length; pIdx++) {
        for (const delta of DELTAS) {
          const candidate = mutateWeights(weights, pIdx, delta);
          const { metrics } = evaluateWeights(candidate, trainSet);
          if (metrics.combinedF1 > bestF1 ||
              (metrics.combinedF1 === bestF1 && metrics.accuracy > evaluateWeights(weights, trainSet).metrics.accuracy)) {
            weights = candidate;
            bestF1 = metrics.combinedF1;
            improved = true;
            staleStreak = 0;
            break;
          }
        }
        if (improved) break;
      }
      if (!improved) {
        staleStreak++;
        if (staleStreak >= 3) break;
      }
      if (bestF1 >= 1.0) break;
    }

    // Predict held-out sample
    const heldOutResult = scoreRepo(heldOut.scores, weights);
    const predicted = classify(heldOutResult.total, weights);
    const correct = predicted === heldOut.label;

    results.push({
      slug: heldOut.slug,
      actual: heldOut.label,
      predicted,
      score: heldOutResult.total,
      correct,
      trainF1: bestF1,
      admitThreshold: weights.admitThreshold,
      rejectThreshold: weights.rejectThreshold,
    });
  }

  const correctCount = results.filter(r => r.correct).length;
  const looAccuracy = correctCount / results.length;

  // Compute LOO F1
  const looPredictions = results.map(r => r.predicted);
  const looLabels = results.map(r => ({ label: r.actual }));
  const looMetrics = computeMetrics(looPredictions, looLabels);

  if (verbose) {
    console.log('='.repeat(70));
    console.log('🔄 Leave-One-Out Cross-Validation');
    console.log('='.repeat(70));
    console.log(`\n  Samples: ${results.length}`);
    console.log(`  LOO Accuracy: ${(looAccuracy * 100).toFixed(1)}% (${correctCount}/${results.length})`);
    console.log(`  LOO Combined F1: ${(looMetrics.combinedF1 * 100).toFixed(1)}%`);
    console.log(`  LOO Admit F1:    ${(looMetrics.f1 * 100).toFixed(1)}%`);
    console.log(`  LOO Reject F1:   ${(looMetrics.rejectF1 * 100).toFixed(1)}%`);

    console.log('\n  Per-sample results:');
    for (const r of results) {
      const icon = r.correct ? '✅' : '❌';
      console.log(`    ${icon} ${r.slug}: actual=${r.actual}, predicted=${r.predicted}, score=${r.score.toFixed(1)} (train F1=${(r.trainF1 * 100).toFixed(1)}%, thresh=${r.admitThreshold}/${r.rejectThreshold})`);
    }

    const misses = results.filter(r => !r.correct);
    if (misses.length > 0) {
      console.log(`\n  ⚠️  Fragile samples (${misses.length}):`);
      for (const m of misses) {
        const gap = m.actual === 'admit'
          ? `score ${m.score.toFixed(1)} < admitThreshold ${m.admitThreshold}`
          : m.actual === 'reject'
            ? `score ${m.score.toFixed(1)} >= rejectThreshold ${m.rejectThreshold}`
            : `score ${m.score.toFixed(1)} in watching zone`;
        console.log(`    ${m.slug}: ${gap}`);
      }
    } else {
      console.log('\n  🎯 Perfect LOO — weights generalize well!');
    }
  }

  return { results, accuracy: looAccuracy, metrics: looMetrics };
}

// ============================================================
// Export for testing + CLI
// ============================================================

export { scoreRepo, classify, computeMetrics, evaluateWeights, mutateWeights, runCalibrationLoop, runLOOCV };

// CLI mode
const isMain = process.argv[1] && (
  process.argv[1].endsWith('calibrate.js') &&
  !process.argv[1].includes('test')
);

if (isMain) {
  const cmd = process.argv[2];
  if (cmd === 'loo') {
    runLOOCV();
  } else {
    const maxIter = parseInt(cmd || '200', 10);
    runCalibrationLoop(maxIter);
  }
}
