const logger = require('../utils/logger');
const {
  getBestPolicyFallback,
  retrievePublicPolicy,
  summarizePolicyMatches,
} = require('./publicPolicyRagService');

const BOT_NAME = 'Veteran Assistant';
const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';
const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-5.6-luna';
const MAX_HISTORY_MESSAGES = 6;
const MAX_REPLY_LENGTH = 1200;
const STREAM_FALLBACK_DELAY_MS = Number(process.env.AI_FALLBACK_STREAM_DELAY_MS || 0);
const VALID_AI_PROVIDERS = new Set(['auto', 'openai', 'policy']);

const getAiProvider = () => {
  const provider = String(process.env.AI_PROVIDER || 'auto').trim().toLowerCase();
  return VALID_AI_PROVIDERS.has(provider) ? provider : 'auto';
};

const isPolicyProvider = () => getAiProvider() === 'policy';

const GREETING_REPLIES = [
  'Hi! What would you like to know about LCGVAP today?',
  'Hey! What are we working on in LCGVAP today?',
  'Hi, welcome. I can help with LCGVAP registration, verification guidance, directory questions, and platform navigation.',
];

const CORE_AUTHORITY_RULES = `
Most important rule: The Veteran Assistant assists with truth. It does not establish truth.
Final verification authority must always remain with an authorized human verifier.
LCGVAP verified records are the source of truth, not the AI.
Never verify a Veteran, approve or reject an application, change verification status, create or change credentials, delete credentials, claim a document is authentic or fake, bypass human review, invent Veteran/university/degree/credential information, expose private Veteran data, access data outside user permissions, make irreversible account or admin decisions, or help anyone manipulate or falsely obtain Veteran status.
Always distinguish verified platform data from AI-generated explanations, say when information cannot be confirmed, refer verification decisions to authorized human admins, use authorized backend tools/APIs rather than unrestricted database access, and respect authentication, authorization, privacy, and audit controls.
The assistant may explain the verification process, guide correct submissions, identify missing information, summarize submitted information for authorized reviewers, flag unusual information for human review, answer approved platform-knowledge questions, recommend public verified profiles where permissions allow, help users navigate the platform, and assist admins with advisory analysis only.
This public chat endpoint has no authenticated account context, so it must not confirm a private user's current status or submitted information here.
`;

const buildSystemInstructions = (policyContext) => `
You are ${BOT_NAME}, the public help bot for the VCLGC Alumni Portal.
Core authority rules:
${CORE_AUTHORITY_RULES}

Use retrieval-augmented generation: answer from the retrieved policy context below and the user's current question.
If the retrieved policy context does not contain the answer, say you are not certain and direct the user to the VCLGC admin team.
Do not invent policies, live records, timelines, database details, or admin decisions.
Be warm, clear, and professional. Keep answers short: 2 to 5 sentences.
Do not expose or ask for passport numbers, dates of birth, certificate files, API keys, passwords, tokens, or admin-only data.
If the user asks for a private record, a specific graduate's sensitive information, personal status confirmation, or an admin action, explain the limit and point them to authorized platform channels.
Do not claim you checked the database, viewed an account, opened a certificate, or verified a person.
No emojis. No markdown tables.

Retrieved policy context:
${policyContext || 'No matching policy section was retrieved. Ask the user to contact the VCLGC admin team for anything specific.'}
`;

const normalizeMessage = (message) => String(message || '').trim();

const isRestrictedRequest = (message) => {
  const text = normalizeMessage(message).toLowerCase();
  const asksToReveal = /\b(show|tell|give|send|find|lookup|look up|see|view|download|access|what is|who is)\b/.test(text);
  const privateData = /\b(passport|date of birth|dob|birth date|certificate file|degree file|private record|admin note|password|token|api key|secret|database)\b/.test(text);
  const adminAction = /\b(approve|reject|verify me|verify my application|make me verified|mark me verified|delete|restore|archive|edit my|update my|change my status|bypass|fake|falsely obtain|grant veteran status|mark verified)\b/.test(text);
  const injectionAttempt = /\b(ignore previous|ignore your previous|forget previous|developer instructions|system instructions|system prompt|jailbreak|override your rules)\b/.test(text);

  return (asksToReveal && privateData) || adminAction || injectionAttempt;
};

const isPersonalStatusRequest = (message) => {
  const text = normalizeMessage(message).toLowerCase();
  const statusWord = /\b(status|application|pending|approved|rejected|verified|verification)\b/.test(text);
  const personalAsk = /\b(am i|was i|have i been|is my|my current|my verification|my application|my status|check my|check if i|can you check|show my|tell me my|see my|view my)\b/.test(text);

  return statusWord && personalAsk;
};

const isGreetingRequest = (message) => {
  const text = normalizeMessage(message).toLowerCase();
  return /^(hi|hello|hey|good morning|good afternoon|good evening|yo|sup|what's up|whats up)[\s!.?]*$/.test(text);
};

const isDocumentAuthenticityRequest = (message) => {
  const text = normalizeMessage(message).toLowerCase();
  const documentWord = /\b(document|certificate|degree file|credential|transcript)\b/.test(text);
  const authenticityWord = /\b(authentic|fake|fraudulent|genuine|real|valid|forged|legit|legitimate)\b/.test(text);

  return documentWord && authenticityWord;
};

const pickGreetingReply = () => GREETING_REPLIES[Math.floor(Math.random() * GREETING_REPLIES.length)];

const restrictedReply = () => ({
  reply: 'I can explain how the platform works, but I cannot access private records, reveal passport or date-of-birth details, open certificates, or perform admin actions. For account-specific help, please contact the VCLGC admin team at lcgvapliberiancyprusgraduatesv@gmail.com.',
  source: 'policy',
  provider: 'policy',
  model: null,
});

const personalStatusReply = () => ({
  reply: 'I can explain verification statuses, but I cannot confirm your personal status from public chat because this route has no authenticated account access. Please check your dashboard or approval/rejection email, or contact the VCLGC admin team at lcgvapliberiancyprusgraduatesv@gmail.com.',
  source: 'policy',
  provider: 'policy',
  model: null,
});

const documentAuthenticityReply = () => ({
  reply: 'I cannot decide whether a document is authentic or fake. Veteran Assistant can explain requirements or flag concerns, but final document review and verification must remain with an authorized human verifier using LCGVAP records.',
  source: 'policy',
  provider: 'policy',
  model: null,
});

const greetingReply = () => ({
  reply: pickGreetingReply(),
  source: 'policy',
  provider: 'policy',
  model: null,
});

const buildPolicyResult = ({ message, history = [] }) => {
  const cleanMessage = normalizeMessage(message);
  return {
    cleanMessage,
    policyResult: retrievePublicPolicy({ message: cleanMessage, history }),
  };
};

const getImmediatePolicyResult = (message, policyResult) => {
  if (isDocumentAuthenticityRequest(message)) {
    return {
      ...documentAuthenticityReply(),
      policy: summarizePolicyMatches(policyResult),
    };
  }

  if (isRestrictedRequest(message)) {
    return {
      ...restrictedReply(),
      policy: summarizePolicyMatches(policyResult),
    };
  }

  if (isPersonalStatusRequest(message)) {
    return {
      ...personalStatusReply(),
      policy: summarizePolicyMatches(policyResult),
    };
  }

  if (isGreetingRequest(message)) {
    return {
      ...greetingReply(),
      policy: summarizePolicyMatches(policyResult),
    };
  }

  return null;
};

const fallbackReply = (message, policyResult) => {
  const text = normalizeMessage(message).toLowerCase();
  const policyAnswer = getIntentPolicyFallback(text, policyResult) || getBestPolicyFallback(policyResult);

  if (policyAnswer) {
    return policyAnswer;
  }

  if (/\b(register|registration|sign up|signup|apply)\b/.test(text)) {
    return 'To register, complete the public registration form with your personal details, academic information, and degree certificate file. Registration is submitted for admin review, so approval is not automatic.';
  }

  if (/\b(login|log in|sign in|password)\b/.test(text)) {
    return 'If you cannot log in, your graduate account may still be pending admin verification. After approval, you should receive confirmation by email when email service is configured.';
  }

  if (/\b(pending|verify|verification|approved|approval|rejected)\b/.test(text)) {
    return 'Verification is handled by the admin team after they review your submitted graduate record and academic document. Veteran Assistant can explain the process, but only admins can approve or reject records.';
  }

  if (/\b(directory|search|graduate|alumni|profile)\b/.test(text)) {
    return 'The public directory shows active graduates who have already been verified by the admin team. Archived records and private verification details are not shown publicly.';
  }

  if (/\b(private|privacy|passport|birth|dob|certificate|document)\b/.test(text)) {
    return 'Passport numbers, dates of birth, certificate files, and internal admin records are private. They are used for verification and are not displayed in the public directory.';
  }

  if (/\b(contact|email|support|help|admin)\b/.test(text)) {
    return 'For account-specific help, corrections, or verification concerns, contact the VCLGC admin team at lcgvapliberiancyprusgraduatesv@gmail.com.';
  }

  return 'I can help with registration, verification, login, directory, privacy, and contact questions for the VCLGC Alumni Portal. For account-specific issues, please contact the VCLGC admin team at lcgvapliberiancyprusgraduatesv@gmail.com.';
};

const findPolicyFallback = (policyResult, ids) => {
  const chunks = policyResult?.chunks || [];
  return chunks.find((chunk) => ids.includes(chunk.id))?.fallbackAnswer || null;
};

const getIntentPolicyFallback = (text, policyResult) => {
  if (/\b(register|registration|sign up|signup|apply)\b/.test(text)) {
    return findPolicyFallback(policyResult, ['registration-required-fields', 'registration-eligibility']);
  }

  if (/\b(status|application|pending|approved|rejected|verified)\b/.test(text)) {
    return findPolicyFallback(policyResult, ['status-permissions', 'verification-review', 'approval-rejection']);
  }

  if (/\b(authentic|fake|truth|authority|source of truth|bypass|falsely obtain)\b/.test(text)) {
    return findPolicyFallback(policyResult, ['assistant-truth-authority']);
  }

  if (/\b(private|privacy|passport|birth|dob|certificate|document)\b/.test(text)) {
    return findPolicyFallback(policyResult, ['privacy-sensitive-data']);
  }

  if (/\b(directory|search|profile|profiles|find graduate|verified graduate)\b/.test(text)) {
    return findPolicyFallback(policyResult, ['directory-visibility']);
  }

  return null;
};

const getFallbackResult = (message, policyResult, debug = null) => ({
  reply: fallbackReply(message, policyResult),
  source: 'fallback',
  provider: 'openai',
  model: null,
  policy: summarizePolicyMatches(policyResult),
  debug,
});

const getPolicyResult = (message, policyResult, debug = null) => ({
  reply: fallbackReply(message, policyResult),
  source: 'policy',
  provider: 'policy',
  model: null,
  policy: summarizePolicyMatches(policyResult),
  debug,
});

const sleep = (delayMs) => new Promise((resolve) => setTimeout(resolve, delayMs));

const splitTextForStreaming = (text) => String(text || '').match(/\S+\s*/g) || [];

const emitTextDeltas = async (text, onDelta, delayMs = 0) => {
  if (typeof onDelta !== 'function') return;

  const chunks = splitTextForStreaming(text);

  for (const chunk of chunks) {
    onDelta(chunk);

    if (delayMs > 0) {
      await sleep(delayMs);
    }
  }
};

const getStreamingFallbackResult = async (message, policyResult, onDelta, debug = null) => {
  const result = getFallbackResult(message, policyResult, debug);
  await emitTextDeltas(result.reply, onDelta, STREAM_FALLBACK_DELAY_MS);
  return result;
};

const getStreamingPolicyResult = async (message, policyResult, onDelta, debug = null) => {
  const result = getPolicyResult(message, policyResult, debug);
  await emitTextDeltas(result.reply, onDelta, STREAM_FALLBACK_DELAY_MS);
  return result;
};

const readOpenAIError = async (response) => {
  try {
    const payload = await response.json();
    return payload?.error?.message || payload?.message || JSON.stringify(payload).slice(0, 500);
  } catch (_) {
    try {
      return (await response.text()).slice(0, 500);
    } catch (__) {
      return 'Unable to read OpenAI error response.';
    }
  }
};

const toResponseInput = (message, history = []) => {
  const safeHistory = Array.isArray(history) ? history.slice(-MAX_HISTORY_MESSAGES) : [];

  return [
    ...safeHistory.map((item) => ({
      role: item.role === 'assistant' ? 'assistant' : 'user',
      content: normalizeMessage(item.content).slice(0, 800),
    })),
    {
      role: 'user',
      content: normalizeMessage(message),
    },
  ];
};

const extractOutputText = (payload) => {
  if (typeof payload?.output_text === 'string' && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  const parts = Array.isArray(payload?.output) ? payload.output : [];
  const text = parts
    .flatMap((item) => Array.isArray(item.content) ? item.content : [])
    .map((item) => item.text)
    .filter(Boolean)
    .join('\n')
    .trim();

  return text;
};

const splitSseEvents = (buffer) => {
  const parts = buffer.split(/\r?\n\r?\n/);
  const remaining = parts.pop() || '';
  return {
    events: parts,
    remaining,
  };
};

const parseSseEvent = (rawEvent) => {
  const lines = String(rawEvent || '').split(/\r?\n/);
  const dataLines = [];
  let eventName = 'message';

  lines.forEach((line) => {
    if (line.startsWith('event:')) {
      eventName = line.slice(6).trim();
    }

    if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trimStart());
    }
  });

  const dataText = dataLines.join('\n').trim();

  if (!dataText || dataText === '[DONE]') {
    return null;
  }

  try {
    return {
      eventName,
      payload: JSON.parse(dataText),
    };
  } catch (error) {
    logger.warn('Veteran Assistant ignored malformed OpenAI stream event.', {
      error: error.message,
    });
    return null;
  }
};

const getStreamFailureMessage = (payload) => payload?.response?.error?.message
  || payload?.error?.message
  || payload?.message
  || 'OpenAI stream failed.';

const getOpenAIVectorStoreIds = () => String(process.env.OPENAI_VECTOR_STORE_IDS || process.env.OPENAI_VECTOR_STORE_ID || '')
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);

const buildOpenAITools = () => {
  const vectorStoreIds = getOpenAIVectorStoreIds();

  if (vectorStoreIds.length === 0) {
    return undefined;
  }

  return [
    {
      type: 'file_search',
      vector_store_ids: vectorStoreIds,
      max_num_results: Number(process.env.OPENAI_FILE_SEARCH_MAX_RESULTS || 5),
    },
  ];
};

const callOpenAI = async ({ message, history, policyResult }) => {
  if (!process.env.OPENAI_API_KEY) {
    logger.warn('Veteran Assistant using fallback: OPENAI_API_KEY is not configured.');
    return getFallbackResult(message, policyResult, {
      reason: 'missing_openai_api_key',
    });
  }

  if (typeof fetch !== 'function') {
    logger.warn('Veteran Assistant using fallback: global fetch is not available in this Node runtime.');
    return getFallbackResult(message, policyResult, {
      reason: 'fetch_unavailable',
    });
  }

  const timeoutMs = Number(process.env.AI_REQUEST_TIMEOUT_MS || 12000);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const tools = buildOpenAITools();

  try {
    const response = await fetch(OPENAI_RESPONSES_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        instructions: buildSystemInstructions(policyResult.contextText),
        input: toResponseInput(message, history),
        ...(tools ? { tools } : {}),
        max_output_tokens: 450,
        store: false,
      }),
    });

    if (!response.ok) {
      const details = await readOpenAIError(response);
      logger.warn('Veteran Assistant OpenAI request failed; using fallback.', {
        status: response.status,
        model: DEFAULT_MODEL,
        details,
      });
      return getFallbackResult(message, policyResult, {
        reason: 'openai_request_failed',
        status: response.status,
        model: DEFAULT_MODEL,
        details,
      });
    }

    const payload = await response.json();
    const reply = extractOutputText(payload);

    if (!reply) {
      logger.warn('Veteran Assistant OpenAI response had no text; using fallback.', {
        model: payload.model || DEFAULT_MODEL,
      });
      return getFallbackResult(message, policyResult, {
        reason: 'openai_empty_response',
        model: payload.model || DEFAULT_MODEL,
      });
    }

    return {
      reply: reply.slice(0, MAX_REPLY_LENGTH),
      source: 'openai',
      provider: 'openai',
      model: payload.model || DEFAULT_MODEL,
      policy: summarizePolicyMatches(policyResult),
    };
  } catch (error) {
    logger.warn('Veteran Assistant OpenAI request errored; using fallback.', {
      model: DEFAULT_MODEL,
      error: error.name === 'AbortError' ? 'Request timed out' : error.message,
    });
    return getFallbackResult(message, policyResult, {
      reason: 'openai_request_error',
      model: DEFAULT_MODEL,
      error: error.name === 'AbortError' ? 'Request timed out' : error.message,
    });
  } finally {
    clearTimeout(timeout);
  }
};

const callOpenAIStream = async ({ message, history, policyResult, onDelta, signal }) => {
  if (!process.env.OPENAI_API_KEY) {
    logger.warn('Veteran Assistant streaming fallback: OPENAI_API_KEY is not configured.');
    return getStreamingFallbackResult(message, policyResult, onDelta, {
      reason: 'missing_openai_api_key',
    });
  }

  if (typeof fetch !== 'function') {
    logger.warn('Veteran Assistant streaming fallback: global fetch is not available in this Node runtime.');
    return getStreamingFallbackResult(message, policyResult, onDelta, {
      reason: 'fetch_unavailable',
    });
  }

  const timeoutMs = Number(process.env.AI_REQUEST_TIMEOUT_MS || 12000);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const abortFromClient = () => controller.abort();
  const tools = buildOpenAITools();
  let outputText = '';
  let model = DEFAULT_MODEL;

  if (signal) {
    if (signal.aborted) {
      controller.abort();
    } else {
      signal.addEventListener('abort', abortFromClient, { once: true });
    }
  }

  try {
    const response = await fetch(OPENAI_RESPONSES_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        instructions: buildSystemInstructions(policyResult.contextText),
        input: toResponseInput(message, history),
        ...(tools ? { tools } : {}),
        max_output_tokens: 450,
        store: false,
        stream: true,
      }),
    });

    if (!response.ok) {
      const details = await readOpenAIError(response);
      logger.warn('Veteran Assistant OpenAI stream failed; using fallback.', {
        status: response.status,
        model: DEFAULT_MODEL,
        details,
      });
      return getStreamingFallbackResult(message, policyResult, onDelta, {
        reason: 'openai_stream_failed',
        status: response.status,
        model: DEFAULT_MODEL,
        details,
      });
    }

    if (!response.body?.getReader) {
      logger.warn('Veteran Assistant OpenAI stream had no readable body; using fallback.', {
        model: DEFAULT_MODEL,
      });
      return getStreamingFallbackResult(message, policyResult, onDelta, {
        reason: 'openai_stream_body_unavailable',
        model: DEFAULT_MODEL,
      });
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const { events, remaining } = splitSseEvents(buffer);
      buffer = remaining;

      for (const rawEvent of events) {
        const event = parseSseEvent(rawEvent);
        if (!event) continue;

        const { payload } = event;

        if (payload.type === 'response.output_text.delta' && payload.delta) {
          const remainingLength = MAX_REPLY_LENGTH - outputText.length;
          const nextDelta = payload.delta.slice(0, Math.max(0, remainingLength));

          if (nextDelta) {
            outputText += nextDelta;
            onDelta?.(nextDelta);
          }
        }

        if (payload.type === 'response.completed') {
          model = payload.response?.model || model;
        }

        if (payload.type === 'response.failed' || payload.type === 'error') {
          throw new Error(getStreamFailureMessage(payload));
        }
      }
    }

    buffer += decoder.decode();
    const { events } = splitSseEvents(`${buffer}\n\n`);

    for (const rawEvent of events) {
      const event = parseSseEvent(rawEvent);
      if (!event) continue;

      const { payload } = event;

      if (payload.type === 'response.output_text.delta' && payload.delta) {
        const remainingLength = MAX_REPLY_LENGTH - outputText.length;
        const nextDelta = payload.delta.slice(0, Math.max(0, remainingLength));

        if (nextDelta) {
          outputText += nextDelta;
          onDelta?.(nextDelta);
        }
      }

      if (payload.type === 'response.completed') {
        model = payload.response?.model || model;
      }
    }

    if (!outputText.trim()) {
      logger.warn('Veteran Assistant OpenAI stream returned no text; using fallback.', {
        model,
      });
      return getStreamingFallbackResult(message, policyResult, onDelta, {
        reason: 'openai_stream_empty',
        model,
      });
    }

    return {
      reply: outputText.trim().slice(0, MAX_REPLY_LENGTH),
      source: 'openai',
      provider: 'openai',
      model,
      policy: summarizePolicyMatches(policyResult),
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error;
    }

    logger.warn('Veteran Assistant OpenAI stream errored; using fallback.', {
      model: DEFAULT_MODEL,
      error: error.message,
    });
    return getStreamingFallbackResult(message, policyResult, onDelta, {
      reason: 'openai_stream_error',
      model: DEFAULT_MODEL,
      error: error.message,
    });
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener?.('abort', abortFromClient);
  }
};

const getPublicAssistantReply = async ({ message, history = [] }) => {
  const { cleanMessage, policyResult } = buildPolicyResult({ message, history });
  const immediateResult = getImmediatePolicyResult(cleanMessage, policyResult);

  if (immediateResult) {
    return immediateResult;
  }

  if (isPolicyProvider()) {
    return getPolicyResult(cleanMessage, policyResult, {
      reason: 'policy_provider_enabled',
    });
  }

  return callOpenAI({ message: cleanMessage, history, policyResult });
};

const streamPublicAssistantReply = async ({
  message,
  history = [],
  onDelta,
  signal,
}) => {
  const { cleanMessage, policyResult } = buildPolicyResult({ message, history });
  const immediateResult = getImmediatePolicyResult(cleanMessage, policyResult);

  if (immediateResult) {
    await emitTextDeltas(immediateResult.reply, onDelta, STREAM_FALLBACK_DELAY_MS);
    return immediateResult;
  }

  if (isPolicyProvider()) {
    return getStreamingPolicyResult(cleanMessage, policyResult, onDelta, {
      reason: 'policy_provider_enabled',
    });
  }

  return callOpenAIStream({
    message: cleanMessage,
    history,
    policyResult,
    onDelta,
    signal,
  });
};

module.exports = {
  BOT_NAME,
  getPublicAssistantReply,
  streamPublicAssistantReply,
};
