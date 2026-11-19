const {
  PUBLIC_POLICY_KNOWLEDGE,
  PUBLIC_POLICY_VERSION,
} = require('../constants/publicPolicyKnowledge');

const DEFAULT_MAX_CHUNKS = 4;
const MIN_SCORE = 2;
const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'been',
  'but',
  'by',
  'can',
  'do',
  'does',
  'for',
  'from',
  'has',
  'have',
  'how',
  'i',
  'if',
  'in',
  'is',
  'it',
  'its',
  'let',
  'man',
  'me',
  'my',
  'of',
  'on',
  'or',
  'should',
  'so',
  'that',
  'the',
  'their',
  'them',
  'there',
  'this',
  'to',
  'we',
  'what',
  'when',
  'where',
  'will',
  'with',
  'you',
  'your',
]);

const normalizeText = (value) => String(value || '').toLowerCase().trim();

const tokenize = (value) => normalizeText(value)
  .replace(/[^a-z0-9\s-]/g, ' ')
  .split(/\s+/)
  .map((token) => token.trim())
  .filter((token) => token.length > 2 && !STOP_WORDS.has(token));

const getSearchText = (message, history = []) => {
  const safeHistory = Array.isArray(history) ? history.slice(-3) : [];
  const recentUserText = safeHistory
    .filter((item) => item?.role === 'user')
    .map((item) => item.content)
    .join(' ');

  return `${recentUserText} ${message}`.trim();
};

const scorePolicyChunk = (chunk, queryText, queryTokens) => {
  const title = normalizeText(chunk.title);
  const body = normalizeText(chunk.text);
  const keywordText = (chunk.keywords || []).map(normalizeText).join(' ');

  let score = 0;

  queryTokens.forEach((token) => {
    if (title.includes(token)) score += 4;
    if (keywordText.includes(token)) score += 5;
    if (body.includes(token)) score += 1;
  });

  (chunk.keywords || []).forEach((keyword) => {
    const normalizedKeyword = normalizeText(keyword);
    if (normalizedKeyword && queryText.includes(normalizedKeyword)) {
      score += normalizedKeyword.includes(' ') ? 8 : 4;
    }
  });

  return score;
};

const retrievePublicPolicy = ({ message, history = [], maxChunks } = {}) => {
  const queryText = normalizeText(getSearchText(message, history));
  const queryTokens = tokenize(queryText);
  const requestedChunkLimit = Number(maxChunks || process.env.AI_POLICY_RAG_MAX_CHUNKS || DEFAULT_MAX_CHUNKS);
  const chunkLimit = Number.isFinite(requestedChunkLimit) ? requestedChunkLimit : DEFAULT_MAX_CHUNKS;

  if (!queryText || queryTokens.length === 0) {
    return {
      version: PUBLIC_POLICY_VERSION,
      chunks: [],
      contextText: '',
    };
  }

  const chunks = PUBLIC_POLICY_KNOWLEDGE
    .map((chunk) => ({
      ...chunk,
      score: scorePolicyChunk(chunk, queryText, queryTokens),
    }))
    .filter((chunk) => chunk.score >= MIN_SCORE)
    .sort((left, right) => right.score - left.score)
    .slice(0, Math.max(1, Math.min(8, chunkLimit)));

  return {
    version: PUBLIC_POLICY_VERSION,
    chunks,
    contextText: formatPolicyContext(chunks),
  };
};

const formatPolicyContext = (chunks = []) => chunks
  .map((chunk) => `[${chunk.id}] ${chunk.title}\n${chunk.text}`)
  .join('\n\n');

const getBestPolicyFallback = (policyResult) => {
  const bestChunk = policyResult?.chunks?.[0];
  return bestChunk?.fallbackAnswer || null;
};

const summarizePolicyMatches = (policyResult) => ({
  version: policyResult.version,
  matches: policyResult.chunks.map((chunk) => ({
    id: chunk.id,
    title: chunk.title,
    score: chunk.score,
  })),
});

module.exports = {
  retrievePublicPolicy,
  getBestPolicyFallback,
  summarizePolicyMatches,
};
