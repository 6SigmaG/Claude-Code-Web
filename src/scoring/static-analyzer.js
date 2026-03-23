/**
 * Static analyzer for SKILL.md content.
 * Extracts 12 raw indicators and normalizes them to 0-10 dimension scores.
 */

// --- Raw indicator extraction ---

export function analyzeContent(content, options = {}) {
  if (!content) {
    return {
      step_count: 0,
      command_count: 0,
      conditional_count: 0,
      error_token_count: 0,
      anti_pattern_count: 0,
      table_count: 0,
      cross_skill_refs: 0,
      has_frontmatter: false,
      has_completion_protocol: false,
      has_escalation: false,
      total_word_count: 0,
      reference_file_count: options.referenceFileCount ?? 0,
    };
  }

  const lines = content.split('\n');

  // 1. step_count — ## Step or ## Phase headings
  const stepCount = lines.filter(l => /^##\s+(Step|Phase)\b/i.test(l)).length;

  // 2. command_count — ```bash or ```shell code blocks
  const commandCount = (content.match(/```(?:bash|shell)\b/g) || []).length;

  // 3. conditional_count — if/else/when/otherwise at start of line or sentence
  const conditionalPatterns = /\b(?:if|else|when|otherwise)\b/gi;
  const conditionalCount = (content.match(conditionalPatterns) || []).length;

  // 4. error_token_count — STOP, BLOCKED, escalate, never, do NOT, do not
  const errorPatterns = [
    /\bSTOP\b/g,
    /\bBLOCKED\b/g,
    /\bescalate\b/gi,
    /\bnever\b/gi,
    /\bdo\s+NOT\b/g,
    /\bdo\s+not\b/g,
  ];
  let errorTokenCount = 0;
  for (const pat of errorPatterns) {
    errorTokenCount += (content.match(pat) || []).length;
  }

  // 5. anti_pattern_count — BAD:, Anti-pattern, rationalization trap
  const antiPatterns = [
    /\bBAD:/g,
    /\bAnti-pattern\b/gi,
    /\brationalization\b/gi,
  ];
  let antiPatternCount = 0;
  for (const pat of antiPatterns) {
    antiPatternCount += (content.match(pat) || []).length;
  }

  // 6. table_count — markdown tables (header + separator rows)
  let tableCount = 0;
  for (let i = 0; i < lines.length - 1; i++) {
    if (/^\|.*\|/.test(lines[i]) && /^\|[-\s|:]+\|/.test(lines[i + 1])) {
      tableCount++;
    }
  }

  // 7. cross_skill_refs — /skillname references
  const crossSkillRefs = (content.match(/\/[a-z][\w-]*/g) || []).length;

  // 8. has_frontmatter — starts with --- YAML block
  const hasFrontmatter = /^---\n[\s\S]*?\n---/.test(content);

  // 9. has_completion_protocol — DONE/BLOCKED/NEEDS_CONTEXT
  const completionTokens = ['DONE', 'BLOCKED', 'NEEDS_CONTEXT'];
  const hasCompletionProtocol = completionTokens.filter(t =>
    content.includes(t)
  ).length >= 2;

  // 10. has_escalation — escalation/escalate in context of format/protocol
  const hasEscalation = /escalat(?:ion|e)\b/i.test(content) &&
    /(?:format|STATUS|BLOCKED|REASON)/i.test(content);

  // 11. total_word_count
  const totalWordCount = content.split(/\s+/).filter(w => w.length > 0).length;

  // 12. reference_file_count — passed via options
  const referenceFileCount = options.referenceFileCount ?? 0;

  return {
    step_count: stepCount,
    command_count: commandCount,
    conditional_count: conditionalCount,
    error_token_count: errorTokenCount,
    anti_pattern_count: antiPatternCount,
    table_count: tableCount,
    cross_skill_refs: crossSkillRefs,
    has_frontmatter: hasFrontmatter,
    has_completion_protocol: hasCompletionProtocol,
    has_escalation: hasEscalation,
    total_word_count: totalWordCount,
    reference_file_count: referenceFileCount,
  };
}

// --- Normalization: raw indicators → 0-10 dimension scores ---

function clamp(val, min = 0, max = 10) {
  return Math.min(max, Math.max(min, val));
}

function lerp(value, low, high) {
  if (value <= low) return 0;
  if (value >= high) return 10;
  return ((value - low) / (high - low)) * 10;
}

export function normalizeIndicators(raw) {
  // workflowStructure: step_count + conditional_count + table_count
  const stepScore = lerp(raw.step_count, 0, 8);
  const condScore = lerp(raw.conditional_count, 0, 10);
  const tableScore = lerp(raw.table_count, 0, 8);
  let workflowStructure = clamp(stepScore * 0.5 + condScore * 0.25 + tableScore * 0.25);

  // behavioralConstraints: error_token_count + anti_pattern_count
  const errorScore = lerp(raw.error_token_count, 0, 15);
  const antiScore = lerp(raw.anti_pattern_count, 0, 5);
  let behavioralConstraints = clamp(errorScore * 0.6 + antiScore * 0.4);

  // errorResilience: has_completion_protocol + has_escalation + error_token_count
  let errorResilience = 0;
  if (raw.has_completion_protocol) errorResilience += 4;
  if (raw.has_escalation) errorResilience += 3;
  errorResilience += lerp(raw.error_token_count, 0, 15) * 0.3;
  errorResilience = clamp(errorResilience);

  // theoryOfMind: LLM-only
  const theoryOfMind = null;

  // instructionClarity: LLM-only
  const instructionClarity = null;

  // domainDepth: total_word_count + reference_file_count + command_count
  const wordScore = lerp(raw.total_word_count, 0, 3000);
  const refScore = raw.reference_file_count > 0 ? 2 : 0;
  const cmdScore = lerp(raw.command_count, 0, 15);
  let domainDepth = clamp(wordScore * 0.5 + refScore + cmdScore * 0.3);

  // Frontmatter penalty: no frontmatter → -2 across all static dimensions
  if (!raw.has_frontmatter) {
    workflowStructure = clamp(workflowStructure - 2);
    behavioralConstraints = clamp(behavioralConstraints - 2);
    errorResilience = clamp(errorResilience - 2);
    domainDepth = clamp(domainDepth - 2);
  }

  // Cross-skill refs bonus: +0.5 per ref, max +2, applied to workflowStructure
  if (raw.cross_skill_refs > 0) {
    workflowStructure = clamp(workflowStructure + Math.min(raw.cross_skill_refs * 0.5, 2));
  }

  return {
    workflowStructure,
    behavioralConstraints,
    errorResilience,
    theoryOfMind,
    instructionClarity,
    domainDepth,
  };
}
