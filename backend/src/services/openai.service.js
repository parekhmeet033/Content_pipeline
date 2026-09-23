const OpenAI = require('openai');
const { env } = require('../config/env');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

// Cached per API key, since different tasks can be configured with different keys
// (e.g. a separate OpenRouter account/key dedicated to the suggestions task).
const clients = new Map();
function getClient(apiKey) {
  if (!apiKey) {
    throw new ApiError(503, 'AI features are not configured. Set OPENAI_API_KEY in the backend .env file.');
  }
  if (!clients.has(apiKey)) {
    clients.set(
      apiKey,
      new OpenAI({
        apiKey,
        baseURL: env.openaiBaseUrl || undefined,
        defaultHeaders: env.openaiBaseUrl?.includes('openrouter.ai')
          ? { 'HTTP-Referer': 'http://localhost:5173', 'X-Title': 'ContentNova' }
          : undefined,
      })
    );
  }
  return clients.get(apiKey);
}

const LENGTH_GUIDE = {
  SHORT: { words: '150-300 words', maxTokens: 1000 },
  MEDIUM: { words: '400-700 words', maxTokens: 2000 },
  LONG: { words: '900-1300 words', maxTokens: 3400 },
};

function extractJson(raw) {
  if (!raw) return null;

  let text = raw.trim();
  // Some models wrap JSON in a markdown code fence even when asked not to.
  const fenceMatch = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fenceMatch) text = fenceMatch[1].trim();

  try {
    return JSON.parse(text);
  } catch {
    // Fall back to the outermost {...} in case there's stray text around the JSON.
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

async function callChatJSON({
  system,
  user,
  temperature = 0.7,
  maxTokens = 900,
  model = env.openaiModel,
  apiKey = env.openaiApiKey,
}) {
  const openai = getClient(apiKey);
  let completion;
  try {
    completion = await openai.chat.completions.create({
      model,
      temperature,
      max_tokens: maxTokens,
      // Reasoning models (e.g. gpt-5-nano) can silently spend the entire max_tokens budget on
      // hidden reasoning before writing any visible output, truncating the JSON. Non-reasoning
      // models ignore this field harmlessly, so it's safe to send unconditionally.
      reasoning_effort: 'low',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    });
  } catch (err) {
    if (err?.status === 429) {
      throw new ApiError(503, 'The AI service is currently rate-limited. Please try again shortly.');
    }
    if (err?.status === 402) {
      throw new ApiError(503, 'The AI provider account has insufficient credits to complete this request.');
    }
    if (err?.status === 401) {
      throw new ApiError(503, 'The AI provider rejected the configured API key. Check OPENAI_API_KEY.');
    }
    throw new ApiError(502, 'The AI service is currently unavailable. Please try again.');
  }

  const choice = completion.choices?.[0];
  const raw = choice?.message?.content;
  const parsed = extractJson(raw);

  if (!parsed) {
    logger.error(
      `AI JSON parse failed (finish_reason=${choice?.finish_reason}, length=${raw?.length || 0}): ${(raw || '').slice(0, 300)}`
    );
    if (choice?.finish_reason === 'length') {
      throw new ApiError(502, 'The generated content was too long and got cut off. Try a shorter length and generate again.');
    }
    throw new ApiError(502, 'The AI service returned an unexpected response format. Please try again.');
  }

  return parsed;
}

async function generateContent({ topic, contentType, targetAudience, tone, keywords = [], length = 'MEDIUM' }) {
  const guide = LENGTH_GUIDE[length] || LENGTH_GUIDE.MEDIUM;
  const system =
    'You are an expert content marketing writer. Always respond with strict JSON matching this shape: ' +
    '{"title": string, "excerpt": string, "body": string, "suggestedKeywords": string[]}. ' +
    'The body may use "## " markdown-style subheadings to organize sections. Do not include any text outside the JSON object.';
  const user = [
    `Write a piece of content of type "${contentType}" about: "${topic}".`,
    `Target audience: ${targetAudience || 'general audience'}.`,
    `Tone: ${tone}.`,
    `Target length: ${guide.words}.`,
    `Naturally incorporate these keywords where relevant: ${keywords.length ? keywords.join(', ') : 'none specified'}.`,
    'Also suggest 3-6 additional relevant SEO keywords in "suggestedKeywords".',
  ].join('\n');

  return callChatJSON({
    system,
    user,
    maxTokens: guide.maxTokens,
    model: env.openaiModelGenerate,
    apiKey: env.openaiApiKeyGenerate,
  });
}

async function generateSuggestions({ mode, topic, industry, currentBody }) {
  const system =
    'You are a content marketing strategist. Always respond with strict JSON matching this shape: ' +
    '{"suggestions": [{"title": string, "detail": string}]}. Do not include any text outside the JSON object.';

  const truncatedBody = (currentBody || '').slice(0, 1500);
  const prompts = {
    topics: `Suggest 6 content topic ideas for the "${industry || 'general'}" industry that would perform well for a content marketing audience. Keep each "detail" under 200 characters.`,
    titles: `Suggest 6 compelling, click-worthy titles for a piece of content about: "${topic || 'this topic'}". Keep each "detail" under 200 characters.`,
    improve: `Suggest 5 concrete improvements (covering clarity, SEO, structure, call-to-action, and tone) for the following content. Keep each "detail" under 200 characters.\n\n${truncatedBody}`,
  };

  return callChatJSON({
    system,
    user: prompts[mode] || prompts.topics,
    temperature: 0.8,
    maxTokens: 1500,
    model: env.openaiModelSuggestions,
    apiKey: env.openaiApiKeySuggestions,
  });
}

const VALID_ISSUE_CATEGORIES = ['SEO', 'Readability', 'Structure', 'Tone', 'Grammar'];

function clampScore(value) {
  const n = Math.round(Number(value));
  if (Number.isNaN(n)) return 0;
  return Math.min(100, Math.max(0, n));
}

function normalizeAnalysis(raw) {
  const scores = raw?.scores || {};
  const issues = Array.isArray(raw?.issues)
    ? raw.issues
        .filter((i) => i && typeof i.detail === 'string')
        .slice(0, 12)
        .map((i) => ({
          category: VALID_ISSUE_CATEGORIES.includes(i.category) ? i.category : 'Structure',
          detail: String(i.detail).slice(0, 300),
          recommendation:
            typeof i.recommendation === 'string' && i.recommendation.trim()
              ? i.recommendation.slice(0, 300)
              : 'Review this section and revise based on the issue described.',
        }))
    : [];
  const strengths = Array.isArray(raw?.strengths)
    ? raw.strengths.filter((s) => typeof s === 'string').slice(0, 8).map((s) => s.slice(0, 200))
    : [];

  return {
    overallScore: clampScore(raw?.overallScore),
    needsCorrection: Boolean(raw?.needsCorrection),
    seoScore: clampScore(scores.seo),
    readabilityScore: clampScore(scores.readability),
    structureScore: clampScore(scores.structure),
    toneScore: clampScore(scores.toneMatch),
    grammarScore: clampScore(scores.grammar),
    summary: typeof raw?.summary === 'string' ? raw.summary.slice(0, 600) : '',
    issues,
    strengths,
  };
}

async function analyzeContent({ title, body, type, tone, targetAudience }) {
  const system = [
    'You are a rigorous, consistent content quality auditor for a content marketing platform.',
    'You must be deterministic: given the same content twice, you must return the same findings and near-identical',
    'scores both times. Do not vary your judgment between runs, and do not soften or inflate scores out of politeness.',
    '',
    'Scoring rubric (apply strictly and literally):',
    '- Every sub-score and the overallScore start at 100 and are REDUCED for each concrete issue you find.',
    '- A score of 95-100 is reserved ONLY for content with zero identifiable issues in that dimension.',
    '- Each issue you list must reduce its related sub-score: minor issues by 5-10 points, moderate issues by',
    '  10-20 points, serious issues by 20-40 points. The overallScore is a weighted reflection of the sub-scores',
    '  and must go down whenever you report an issue — never report issues while also giving a 90+ overallScore.',
    '- needsCorrection must be true whenever the issues array is non-empty, and false only when it is empty.',
    '- Do not invent issues that are not genuinely present, and do not omit real issues to be generous.',
    '',
    'Evaluate the given content and return strict JSON matching exactly this shape:',
    '{',
    '  "overallScore": number (0-100, an overall "perfection score"),',
    '  "needsCorrection": boolean (true if there are issues a human should fix before publishing),',
    '  "scores": {',
    '    "seo": number (0-100, keyword usage, headings, discoverability),',
    '    "readability": number (0-100, sentence clarity, flow, reading ease),',
    '    "structure": number (0-100, organization, headings, logical flow),',
    '    "toneMatch": number (0-100, how well it matches the requested tone),',
    '    "grammar": number (0-100, grammar and spelling correctness)',
    '  },',
    '  "summary": string (1-2 sentence overall assessment),',
    '  "issues": [{',
    '    "category": "SEO"|"Readability"|"Structure"|"Tone"|"Grammar",',
    '    "detail": string (what exactly is wrong, quoting or pointing to the specific part of the content),',
    '    "recommendation": string (a concrete, actionable fix the writer can apply immediately — not generic advice)',
    '  }] (empty array only if there are truly zero issues),',
    '  "strengths": string[] (specific things done well, empty array if none)',
    '}',
    'Do not include any text outside the JSON object.',
  ].join('\n');

  const user = [
    `Content type: ${type}. Target tone: ${tone}. Target audience: ${targetAudience || 'general audience'}.`,
    `Title: ${title}`,
    '',
    'Body:',
    (body || '').slice(0, 6000),
  ].join('\n');

  const raw = await callChatJSON({
    system,
    user,
    temperature: 0,
    maxTokens: 2200,
    model: env.openaiModelAnalyze,
    apiKey: env.openaiApiKeyAnalyze,
  });

  return normalizeAnalysis(raw);
}

async function improveContent({ title, body, type, tone, targetAudience, keywords = [], issues = [] }) {
  const system = [
    'You are an expert content editor. You will be given a piece of content and a specific list of quality issues',
    'found during a review. Rewrite the content to resolve every listed issue while preserving its core message,',
    'topic, keywords, and roughly the same length. Do not introduce new issues, and do not remove parts that were',
    'not flagged as problems. Respond with strict JSON matching exactly this shape:',
    '{ "title": string, "body": string }',
    'The body may use "## " markdown-style subheadings. Do not include any text outside the JSON object.',
  ].join('\n');

  const issuesText = issues.length
    ? issues.map((i) => `- [${i.category}] ${i.detail} -> Fix: ${i.recommendation}`).join('\n')
    : 'No specific issues provided — polish the content generally for clarity, SEO, structure, tone, and grammar.';

  const user = [
    `Content type: ${type}. Target tone: ${tone}. Target audience: ${targetAudience || 'general audience'}.`,
    `Keywords to keep/incorporate: ${keywords.length ? keywords.join(', ') : 'none specified'}.`,
    '',
    `Current title: ${title}`,
    '',
    'Current body:',
    (body || '').slice(0, 6000),
    '',
    'Issues to fix:',
    issuesText,
  ].join('\n');

  return callChatJSON({
    system,
    user,
    temperature: 0.4,
    maxTokens: 3400,
    model: env.openaiModelGenerate,
    apiKey: env.openaiApiKeyGenerate,
  });
}

module.exports = { generateContent, generateSuggestions, analyzeContent, improveContent };
