import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { scoreRepo, classify, computeMetrics, evaluateWeights, mutateWeights } from './calibrate.js';

// ============================================================
// scoreRepo
// ============================================================

describe('scoreRepo', () => {
  const weights = {
    content: { workflowStructure: 12, behavioralConstraints: 12, errorResilience: 8, theoryOfMind: 8, instructionClarity: 5, domainDepth: 5 },
    engineering: { testCoverage: 8, infrastructure: 5, crossSkillComposition: 4, crossPlatformSupport: 3 },
    ecosystem: { creatorCredibility: 15, communityValidation: 8, maintenanceActivity: 5, usageEvidence: 2 },
  };

  it('scores a perfect 10/10/10 repo', () => {
    const result = scoreRepo({ content: 10, engineering: 10, ecosystem: 10 }, weights);
    // content: 10*50/10 = 50, engineering: 10*20/10 = 20, ecosystem: 10*30/10 = 30 → total 100
    assert.equal(result.total, 100);
  });

  it('scores a zero repo', () => {
    const result = scoreRepo({ content: 0, engineering: 0, ecosystem: 0 }, weights);
    assert.equal(result.total, 0);
  });

  it('scores a mid-range repo', () => {
    const result = scoreRepo({ content: 5, engineering: 5, ecosystem: 5 }, weights);
    assert.equal(result.total, 50);
  });

  it('clamps scores above 10', () => {
    const result = scoreRepo({ content: 15, engineering: 15, ecosystem: 15 }, weights);
    assert.equal(result.total, 100); // clamped to 10
  });

  it('handles missing score fields', () => {
    const result = scoreRepo({}, weights);
    assert.equal(result.total, 0);
  });
});

// ============================================================
// classify
// ============================================================

describe('classify', () => {
  const weights = { admitThreshold: 55, rejectThreshold: 35 };

  it('classifies high scores as admit', () => {
    assert.equal(classify(70, weights), 'admit');
  });

  it('classifies at-threshold as admit', () => {
    assert.equal(classify(55, weights), 'admit');
  });

  it('classifies low scores as reject', () => {
    assert.equal(classify(20, weights), 'reject');
  });

  it('classifies mid-range as watching', () => {
    assert.equal(classify(45, weights), 'watching');
  });

  it('classifies at rejectThreshold boundary as watching', () => {
    assert.equal(classify(35, weights), 'watching');
  });
});

// ============================================================
// computeMetrics
// ============================================================

describe('computeMetrics', () => {
  it('computes perfect metrics for perfect predictions', () => {
    const predictions = ['admit', 'admit', 'reject', 'watching'];
    const labels = [
      { label: 'admit' }, { label: 'admit' },
      { label: 'reject' }, { label: 'watching' },
    ];
    const m = computeMetrics(predictions, labels);
    assert.equal(m.f1, 1.0);
    assert.equal(m.rejectF1, 1.0);
    assert.equal(m.combinedF1, 1.0);
    assert.equal(m.accuracy, 1.0);
  });

  it('computes zero F1 when all predictions are wrong', () => {
    const predictions = ['reject', 'reject'];
    const labels = [{ label: 'admit' }, { label: 'admit' }];
    const m = computeMetrics(predictions, labels);
    assert.equal(m.f1, 0); // no true positives for admit
    assert.equal(m.recall, 0);
  });

  it('handles mixed predictions correctly', () => {
    const predictions = ['admit', 'reject', 'admit'];
    const labels = [
      { label: 'admit' },
      { label: 'admit' },  // false negative
      { label: 'reject' }, // false positive
    ];
    const m = computeMetrics(predictions, labels);
    assert.equal(m.tp, 1);
    assert.equal(m.fp, 1);
    assert.equal(m.fn, 1);
    assert.ok(m.f1 > 0 && m.f1 < 1);
  });
});

// ============================================================
// mutateWeights
// ============================================================

describe('mutateWeights', () => {
  const baseWeights = {
    content: { workflowStructure: 12 },
    engineering: { testCoverage: 8 },
    ecosystem: { creatorCredibility: 15 },
    admitThreshold: 55,
    rejectThreshold: 35,
  };

  it('mutates a content weight', () => {
    const mutated = mutateWeights(baseWeights, 0, 3); // workflowStructure +3
    assert.equal(mutated.content.workflowStructure, 15);
    assert.equal(baseWeights.content.workflowStructure, 12); // original unchanged
  });

  it('clamps threshold mutations to [10, 90]', () => {
    // admitThreshold is index 14
    const mutated = mutateWeights(baseWeights, 14, 50);
    assert.equal(mutated.admitThreshold, 90); // clamped
  });

  it('prevents negative weights', () => {
    const mutated = mutateWeights(baseWeights, 0, -20);
    assert.equal(mutated.content.workflowStructure, 0); // Math.max(0, ...)
  });

  it('does not mutate original weights object', () => {
    mutateWeights(baseWeights, 0, 5);
    assert.equal(baseWeights.content.workflowStructure, 12);
  });
});

// ============================================================
// evaluateWeights (integration)
// ============================================================

describe('evaluateWeights', () => {
  it('evaluates a small ground truth set', () => {
    const weights = {
      content: { workflowStructure: 12, behavioralConstraints: 12, errorResilience: 8, theoryOfMind: 8, instructionClarity: 5, domainDepth: 5 },
      engineering: { testCoverage: 8, infrastructure: 5, crossSkillComposition: 4, crossPlatformSupport: 3 },
      ecosystem: { creatorCredibility: 15, communityValidation: 8, maintenanceActivity: 5, usageEvidence: 2 },
      admitThreshold: 55,
      rejectThreshold: 35,
    };
    const groundTruth = [
      { slug: 'good/repo', label: 'admit', scores: { content: 9, engineering: 7, ecosystem: 10 } },
      { slug: 'bad/repo', label: 'reject', scores: { content: 3, engineering: 1, ecosystem: 2 } },
    ];

    const { predictions, scores, metrics } = evaluateWeights(weights, groundTruth);
    assert.equal(predictions.length, 2);
    assert.equal(scores.length, 2);
    assert.ok(scores[0] > scores[1]); // good > bad
    assert.ok(metrics.combinedF1 >= 0);
  });
});
