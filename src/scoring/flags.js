/**
 * Quality Signal Detection — Green Flags + Red Flags
 *
 * Content-quality + engineering + ecosystem signal detection.
 */

export function checkGreenFlags(repo) {
  const flags = [];

  // Content quality signals
  if (repo.hasIronLaws) flags.push('has-iron-laws');
  if (repo.hasCompletionProtocol) flags.push('has-completion-protocol');
  if (repo.hasEscalation) flags.push('has-escalation');
  if (repo.hasAntiPatterns) flags.push('has-anti-rationalization');
  if ((repo.stepCount || 0) >= 5) flags.push('multi-step-workflow');
  if ((repo.crossSkillRefs || 0) >= 1) flags.push('cross-skill-refs');

  // Engineering signals
  if ((repo.testCount || 0) >= 100) flags.push('comprehensive-tests');
  if ((repo.lastCommitDaysAgo || Infinity) <= 30) flags.push('active-maintenance');
  if (repo.hasSkillMd && repo.hasProperFrontmatter) flags.push('proper-skill-format');
  if ((repo.supportedAgents || []).length >= 2) flags.push('cross-agent-support');

  // Ecosystem signals
  if (repo.listedInMarketplace) flags.push('marketplace-listed');
  if (repo.listedInAwesomeList) flags.push('awesome-list-listed');
  if (repo.hasDocumentation) flags.push('has-documentation');

  return flags;
}

export function checkRedFlags(repo) {
  const flags = [];

  // Content red flags
  if (repo.hasSkillMd === false) flags.push('no-skill-md');
  if (repo.hasProperFrontmatter === false && repo.hasSkillMd) flags.push('missing-frontmatter');

  // Engineering red flags
  if ((repo.testCount || 0) === 0) flags.push('no-tests');
  if (repo.hasDocumentation === false) flags.push('no-documentation');
  if ((repo.lastCommitDaysAgo || 0) >= 120) flags.push('abandoned');
  if ((repo.commitCount || 0) <= 1) flags.push('single-commit');
  if (repo.isFork && !repo.hasAttribution) flags.push('unattributed-fork');

  // Inflated claims
  const claimed = repo.claimedSkillCount || 0;
  const actual = repo.actualSkillCount || 0;
  if (claimed > 0 && actual > 0 && claimed / actual >= 5) flags.push('inflated-claims');

  return flags;
}
