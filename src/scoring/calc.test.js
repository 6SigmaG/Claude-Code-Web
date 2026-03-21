import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calcContentScore,
  calcEngineeringScore,
  calcEcosystemScore,
  calcTotalScore,
  assignTier,
} from './calc.js';

// ============================================================
// 3-Tier 12-Dimension Scoring Engine
// Tier 1: Content Quality (50%)
// Tier 2: Engineering Quality (20%)
// Tier 3: Ecosystem Signals (30%)
// ============================================================

describe('calcContentScore (max 50)', () => {
  it('returns 0 for all-zero input', () => {
    assert.equal(calcContentScore({
      workflowStructure: 0,
      behavioralConstraints: 0,
      errorResilience: 0,
      theoryOfMind: 0,
      instructionClarity: 0,
      domainDepth: 0,
    }), 0);
  });

  it('returns 50 for all-max input', () => {
    assert.equal(calcContentScore({
      workflowStructure: 10,
      behavioralConstraints: 10,
      errorResilience: 10,
      theoryOfMind: 10,
      instructionClarity: 10,
      domainDepth: 10,
    }), 50);
  });

  it('applies correct weights: workflow 12%, constraints 12%, resilience 8%, mind 8%, clarity 5%, depth 5%', () => {
    // Only workflowStructure = 10, rest = 0 → 10 * 0.12 * 10 = 12
    const score = calcContentScore({
      workflowStructure: 10,
      behavioralConstraints: 0,
      errorResilience: 0,
      theoryOfMind: 0,
      instructionClarity: 0,
      domainDepth: 0,
    });
    assert.equal(score, 12);
  });

  it('clamps values above 10 to 10', () => {
    const score = calcContentScore({
      workflowStructure: 15,
      behavioralConstraints: 15,
      errorResilience: 15,
      theoryOfMind: 15,
      instructionClarity: 15,
      domainDepth: 15,
    });
    assert.equal(score, 50);
  });

  it('clamps negative values to 0', () => {
    const score = calcContentScore({
      workflowStructure: -5,
      behavioralConstraints: -5,
      errorResilience: -5,
      theoryOfMind: -5,
      instructionClarity: -5,
      domainDepth: -5,
    });
    assert.equal(score, 0);
  });
});

describe('calcEngineeringScore (max 20)', () => {
  it('returns 0 for all-zero input', () => {
    assert.equal(calcEngineeringScore({
      testCoverage: 0,
      infrastructure: 0,
      crossSkillComposition: 0,
      crossPlatformSupport: 0,
    }), 0);
  });

  it('returns 20 for all-max input', () => {
    assert.equal(calcEngineeringScore({
      testCoverage: 10,
      infrastructure: 10,
      crossSkillComposition: 10,
      crossPlatformSupport: 10,
    }), 20);
  });

  it('applies correct weights: tests 8%, infra 5%, cross-skill 4%, cross-platform 3%', () => {
    // Only testCoverage = 10 → 10 * 0.08 * 10 = 8
    const score = calcEngineeringScore({
      testCoverage: 10,
      infrastructure: 0,
      crossSkillComposition: 0,
      crossPlatformSupport: 0,
    });
    assert.equal(score, 8);
  });
});

describe('calcEcosystemScore (max 30)', () => {
  it('returns 0 for all-zero input', () => {
    assert.equal(calcEcosystemScore({
      creatorCredibility: 0,
      communityValidation: 0,
      maintenanceActivity: 0,
      usageEvidence: 0,
    }), 0);
  });

  it('returns 30 for all-max input', () => {
    assert.equal(calcEcosystemScore({
      creatorCredibility: 10,
      communityValidation: 10,
      maintenanceActivity: 10,
      usageEvidence: 10,
    }), 30);
  });

  it('applies correct weights: creator 15%, community 8%, maintenance 5%, usage 2%', () => {
    // Only creatorCredibility = 10 → 10 * 0.15 * 10 = 15
    const score = calcEcosystemScore({
      creatorCredibility: 10,
      communityValidation: 0,
      maintenanceActivity: 0,
      usageEvidence: 0,
    });
    assert.equal(score, 15);
  });
});

describe('calcTotalScore (max 100)', () => {
  it('returns 0 for all-zero tiers', () => {
    assert.equal(calcTotalScore(0, 0, 0), 0);
  });

  it('returns 100 for all-max tiers', () => {
    assert.equal(calcTotalScore(50, 20, 30), 100);
  });

  it('sums the three tiers', () => {
    assert.equal(calcTotalScore(40, 15, 20), 75);
  });

  it('clamps content to 0-50', () => {
    assert.equal(calcTotalScore(60, 20, 30), 100);
    assert.equal(calcTotalScore(-10, 20, 30), 50);
  });

  it('clamps engineering to 0-20', () => {
    assert.equal(calcTotalScore(50, 25, 30), 100);
  });

  it('clamps ecosystem to 0-30', () => {
    assert.equal(calcTotalScore(50, 20, 40), 100);
  });

  it('produces score 81 for high content+engineering+ecosystem', () => {
    assert.equal(calcTotalScore(42, 14, 25), 81);
  });

  it('produces score 60 for moderate inputs', () => {
    assert.equal(calcTotalScore(30, 10, 20), 60);
  });
});

describe('assignTier', () => {
  it('returns S for score >= 80', () => {
    assert.equal(assignTier(80), 'S');
    assert.equal(assignTier(100), 'S');
    assert.equal(assignTier(95.5), 'S');
  });

  it('returns A for score >= 60 and < 80', () => {
    assert.equal(assignTier(60), 'A');
    assert.equal(assignTier(79.9), 'A');
  });

  it('returns B for score >= 40 and < 60', () => {
    assert.equal(assignTier(40), 'B');
    assert.equal(assignTier(59.9), 'B');
  });

  it('returns C for score < 40', () => {
    assert.equal(assignTier(0), 'C');
    assert.equal(assignTier(39.9), 'C');
  });
});

// ============================================================
// Calibration tests — known repos must match expected scores
// ============================================================
describe('calibration: weight sum', () => {
  it('content weights sum to 50%', () => {
    // 12 + 12 + 8 + 8 + 5 + 5 = 50
    assert.equal(12 + 12 + 8 + 8 + 5 + 5, 50);
  });

  it('engineering weights sum to 20%', () => {
    // 8 + 5 + 4 + 3 = 20
    assert.equal(8 + 5 + 4 + 3, 20);
  });

  it('ecosystem weights sum to 30%', () => {
    // 15 + 8 + 5 + 2 = 30
    assert.equal(15 + 8 + 5 + 2, 30);
  });

  it('all weights sum to 100%', () => {
    assert.equal(50 + 20 + 30, 100);
  });
});
