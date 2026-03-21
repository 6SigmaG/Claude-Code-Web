/**
 * 3-Tier 12-Dimension Scoring Calculator
 *
 * Architecture (from docs/scoring-framework-design.md):
 *   Tier 1: Content Quality  — 50% (workflow, constraints, resilience, mind, clarity, depth)
 *   Tier 2: Engineering       — 20% (tests, infra, cross-skill, cross-platform)
 *   Tier 3: Ecosystem         — 30% (creator, community, maintenance, usage)
 *
 * All dimension inputs are 0-10 scale. Output is 0-100.
 * Can be called from CLI: echo '{"content":{...},"engineering":{...},"ecosystem":{...}}' | node calc.js
 */

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const clamp10 = v => clamp(v, 0, 10);

// Weights as percentages (must sum to 50)
const CONTENT_WEIGHTS = {
  workflowStructure: 12,
  behavioralConstraints: 12,
  errorResilience: 8,
  theoryOfMind: 8,
  instructionClarity: 5,
  domainDepth: 5,
};

// Weights must sum to 20
const ENGINEERING_WEIGHTS = {
  testCoverage: 8,
  infrastructure: 5,
  crossSkillComposition: 4,
  crossPlatformSupport: 3,
};

// Weights must sum to 30
const ECOSYSTEM_WEIGHTS = {
  creatorCredibility: 15,
  communityValidation: 8,
  maintenanceActivity: 5,
  usageEvidence: 2,
};

function calcTierScore(dims, weights) {
  let score = 0;
  for (const [key, weight] of Object.entries(weights)) {
    score += clamp10(dims[key] || 0) * weight / 10;
  }
  return Math.round(score * 10) / 10;
}

export function calcContentScore(dims) {
  return calcTierScore(dims, CONTENT_WEIGHTS);
}

export function calcEngineeringScore(dims) {
  return calcTierScore(dims, ENGINEERING_WEIGHTS);
}

export function calcEcosystemScore(dims) {
  return calcTierScore(dims, ECOSYSTEM_WEIGHTS);
}

export function calcTotalScore(content, engineering, ecosystem) {
  const c = clamp(content, 0, 50);
  const e = clamp(engineering, 0, 20);
  const s = clamp(ecosystem, 0, 30);
  return Math.round((c + e + s) * 10) / 10;
}

export function assignTier(score) {
  if (score >= 80) return 'S';
  if (score >= 60) return 'A';
  if (score >= 40) return 'B';
  return 'C';
}

// CLI mode: read JSON from stdin
if (process.argv[1] && process.argv[1].endsWith('calc.js') && !process.argv[1].includes('test')) {
  let input = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', chunk => { input += chunk; });
  process.stdin.on('end', () => {
    try {
      const data = JSON.parse(input);
      const content = calcContentScore(data.content || {});
      const engineering = calcEngineeringScore(data.engineering || {});
      const ecosystem = calcEcosystemScore(data.ecosystem || {});
      const total = calcTotalScore(content, engineering, ecosystem);
      const tier = assignTier(total);
      console.log(JSON.stringify({ content, engineering, ecosystem, total, tier }));
    } catch (e) {
      console.error(JSON.stringify({ error: e.message }));
      process.exit(1);
    }
  });
}
