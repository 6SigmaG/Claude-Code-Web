/**
 * LLM-as-Judge: evaluates SKILL.md content quality via OpenRouter API.
 * Model: minimax/minimax-m2.7 (configurable)
 *
 * Returns 6 dimension scores (0-10) matching the fuseScores() interface.
 * Requires OPENROUTER_API_KEY env var.
 */

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'minimax/minimax-m2.7';
const MAX_CONTENT_CHARS = 12000; // ~4K tokens

const SYSTEM_PROMPT = `You are a SKILL.md quality evaluator for Claude Code agent skills.

Score the given SKILL.md content on these 6 dimensions (1-10 scale):

1. workflowStructure — Does it have clear phases/steps? Does it cover startup → happy path → error path → escalation → completion? (1=no structure, 10=full lifecycle)
2. behavioralConstraints — Does it have Iron Laws, Red Flags, anti-rationalization defenses, guardrails? (1=none, 10=comprehensive constraints)
3. errorResilience — Does it define escalation paths, BLOCKED/NEEDS_CONTEXT protocols, fallback strategies? (1=no error handling, 10=robust error paths)
4. theoryOfMind — Does it anticipate agent shortcuts, user confusion, edge cases? Does it model what the agent might do wrong? (1=no anticipation, 10=deep mental modeling)
5. instructionClarity — Is each instruction unambiguous, executable, and correctly ordered? No vague language? (1=vague/ambiguous, 10=crystal clear)
6. domainDepth — Are technical claims accurate? Are code examples correct and usable? Domain expertise evident? (1=shallow/generic, 10=deep expertise)

Reference baseline: A top-tier skill like gstack /review scores approximately 8-9 on most dimensions.

IMPORTANT: Respond with ONLY a valid JSON object, no markdown, no explanation:
{"workflowStructure":N,"behavioralConstraints":N,"errorResilience":N,"theoryOfMind":N,"instructionClarity":N,"domainDepth":N}`;

/**
 * Call OpenRouter API to score SKILL.md content.
 * @param {string} content - Raw SKILL.md text
 * @param {object} [opts]
 * @param {string} [opts.model] - OpenRouter model ID
 * @param {string} [opts.apiKey] - Override OPENROUTER_API_KEY env var
 * @param {number} [opts.temperature] - LLM temperature (default 0)
 * @returns {Promise<{workflowStructure:number, behavioralConstraints:number, errorResilience:number, theoryOfMind:number, instructionClarity:number, domainDepth:number}>}
 */
export async function judgeSkillMd(content, opts = {}) {
  const apiKey = opts.apiKey || process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY not set. Export it or pass opts.apiKey.');
  }

  const model = opts.model || process.env.OPENROUTER_MODEL || DEFAULT_MODEL;
  const temperature = opts.temperature ?? 0;

  const truncated = content.length > MAX_CONTENT_CHARS
    ? content.slice(0, MAX_CONTENT_CHARS) + '\n\n[... truncated ...]'
    : content;

  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://github.com/6SigmaG/Claude-Code-Web',
      'X-Title': 'Skill Scout LLM Judge',
    },
    body: JSON.stringify({
      model,
      temperature,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Score this SKILL.md:\n\n${truncated}` },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`OpenRouter API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content;
  if (!raw) {
    throw new Error('OpenRouter returned empty response');
  }

  return parseScores(raw);
}

/**
 * Parse LLM response into validated dimension scores.
 * Handles JSON wrapped in markdown code blocks.
 */
export function parseScores(raw) {
  // Strip markdown code fences if present
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
  }

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`Failed to parse LLM response as JSON: ${raw.slice(0, 200)}`);
  }

  const KEYS = ['workflowStructure', 'behavioralConstraints', 'errorResilience', 'theoryOfMind', 'instructionClarity', 'domainDepth'];
  const result = {};

  for (const key of KEYS) {
    const val = parsed[key];
    if (typeof val !== 'number' || val < 0 || val > 10) {
      throw new Error(`Invalid score for ${key}: ${val} (expected 0-10)`);
    }
    result[key] = Math.round(val * 10) / 10; // round to 1 decimal
  }

  return result;
}

/**
 * Score multiple SKILL.md contents concurrently, returning null for failures (graceful degradation).
 * @param {Array<{name: string, content: string}>} skills
 * @param {object} [opts] - Same as judgeSkillMd opts
 * @param {number} [opts.concurrency=4] - Max concurrent API calls
 * @returns {Promise<Map<string, object|null>>} Map of name → scores or null
 */
export async function judgeAll(skills, opts = {}) {
  const concurrency = opts.concurrency ?? 4;
  const results = new Map();

  // Process in batches of `concurrency`
  for (let i = 0; i < skills.length; i += concurrency) {
    const batch = skills.slice(i, i + concurrency);
    const settled = await Promise.allSettled(
      batch.map(({ name, content }) =>
        judgeSkillMd(content, opts).then(scores => ({ name, scores }))
      )
    );
    for (const result of settled) {
      if (result.status === 'fulfilled') {
        results.set(result.value.name, result.value.scores);
      } else {
        // Find which skill failed (match by batch index)
        const idx = settled.indexOf(result);
        const name = batch[idx].name;
        console.error(`  ⚠ LLM judge failed for ${name}: ${result.reason?.message}`);
        results.set(name, null);
      }
    }
  }

  return results;
}
